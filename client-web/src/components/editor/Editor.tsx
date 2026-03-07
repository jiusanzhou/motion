"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useMotionStore, EDITOR_WIDTHS } from "@/store";
import { useThemeStore } from "@/store/theme";
import { resolveWikiLinkPath } from "@/lib/wikilink";
import { flattenTree } from "@/lib/tree-utils";
import { uploadImage } from "@/lib/storage/upload";
import { FrontmatterPanel } from "./FrontmatterPanel";
import { AgentView } from "./AgentView";
import { MathBlock } from "./blocks/MathBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { ExcalidrawBlock } from "./blocks/ExcalidrawBlock";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: MathBlock(),
    embed: EmbedBlock(),
    excalidraw: ExcalidrawBlock(),
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

export function Editor() {
  const {
    currentDoc,
    updateDocContent,
    updateDocTitle,
    editorWidth,
    viewMode,
  } = useMotionStore();
  const { resolved: themeResolved } = useThemeStore();
  const prevPathRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  // Unescape backslash-escaped quotes inside fenced code blocks
  function unescapeCodeBlocks(md: string): string {
    return md.replace(/(```[\s\S]*?```)/g, (block) =>
      block.replace(/\\"/g, '"')
    );
  }

  // Convert math syntax to ```math code fences for BlockNote parsing.
  // Handles: $$\n...\n$$ (block), $$eq$$ (inline block), $eq$ (standalone inline on own line)
  function mathToCodeFence(md: string): string {
    // Multi-line block math: $$\n...\n$$
    let result = md.replace(/\$\$\n([\s\S]*?)\n\$\$/g, (_, eq: string) => `\`\`\`math\n${eq}\n\`\`\``);
    // Single-line block math: $$equation$$
    result = result.replace(/\$\$([^$\n]+)\$\$/g, (_, eq: string) => `\`\`\`math\n${eq.trim()}\n\`\`\``);
    // Standalone inline math: $equation$ alone on a line
    result = result.replace(/^[ \t]*\$([^$\n]+)\$[ \t]*$/gm, (_, eq: string) => `\`\`\`math\n${eq.trim()}\n\`\`\``);
    return result;
  }

  // Convert ```math code fences back to $$ math syntax.
  // Single-line equations use compact $$eq$$ format; multi-line use $$\n...\n$$
  function codeFenceToMath(md: string): string {
    return md.replace(/```math\n([\s\S]*?)\n```/g, (_, eq: string) => {
      const trimmed = eq.trim();
      return trimmed.includes("\n") ? `$$\n${trimmed}\n$$` : `$$${trimmed}$$`;
    });
  }

  // Convert [[page-name]] to [page-name](#wiki:page-name) for editor rendering
  function wikiLinksToMarkdown(md: string): string {
    return md.replace(/\[\[([^\]]+)\]\]/g, (_, name: string) => {
      const trimmed = name.trim();
      return `[${trimmed}](#wiki:${trimmed})`;
    });
  }

  // Reverse: convert [page](#wiki:page) back to [[page]] for saving
  function markdownToWikiLinks(md: string): string {
    return md.replace(/\[([^\]]+)\]\(#wiki:[^)]+\)/g, (_, name: string) => {
      return `[[${name}]]`;
    });
  }

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const state = useMotionStore.getState();
    const config = state.repoConfig;
    if (!config) throw new Error("No repository connected");

    const provider = state.provider as any;
    const token = provider?.config?.token;
    if (!token) throw new Error("No auth token available");

    return uploadImage(file, {
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      token,
      basePath: config.basePath,
    });
  }, []);

  const editor = useCreateBlockNote({
    schema,
    uploadFile,
  });
  const mountedRef = useRef(false);

  // Cmd+S / Ctrl+S save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        useMotionStore.getState().saveCurrentDoc();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // beforeunload warning for unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (useMotionStore.getState().dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Load content when currentDoc changes
  useEffect(() => {
    if (!currentDoc) return;

    const docPath = currentDoc.path;
    const docContent = currentDoc.content;

    // Skip if same path and we already loaded
    if (prevPathRef.current === docPath && loadingRef.current === false) return;

    prevPathRef.current = docPath;
    loadingRef.current = true;

    async function loadContent() {
      // Wait for editor to be mounted
      if (!mountedRef.current) {
        const checkMount = () => {
          try {
            void editor.document;
            return true;
          } catch {
            return false;
          }
        };
        for (let i = 0; i < 20; i++) {
          if (checkMount()) { mountedRef.current = true; break; }
          await new Promise(r => setTimeout(r, 100));
        }
        if (!mountedRef.current) return;
      }
      try {
        if (!docContent) {
          editor.replaceBlocks(editor.document, []);
        } else {
          const preprocessed = wikiLinksToMarkdown(unescapeCodeBlocks(mathToCodeFence(docContent)));
          const rawBlocks = await editor.tryParseMarkdownToBlocks(preprocessed);
          // Convert ```math code blocks to math blocks
          const blocks = rawBlocks.map((block: any) => {
            if (block.type === "codeBlock" && block.props?.language === "math") {
              const text = (block.content as any[])?.[0]?.text ?? "";
              return { ...block, type: "math", props: { equation: text }, content: [] };
            }
            return block;
          });
          if (prevPathRef.current !== docPath) return;
          editor.replaceBlocks(editor.document, blocks);
        }
        lastContentRef.current = docContent;
      } catch {
        if (prevPathRef.current !== docPath) return;
        editor.replaceBlocks(editor.document, [
          {
            type: "paragraph",
            content: [{ type: "text", text: docContent || "", styles: {} }],
          },
        ]);
        lastContentRef.current = docContent;
      } finally {
        loadingRef.current = false;
      }
    }

    loadContent();
  }, [currentDoc?.path, currentDoc?.content, editor]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Handle wiki link clicks in editor
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#wiki:")) return;

      e.preventDefault();
      e.stopPropagation();

      const pageName = href.slice("#wiki:".length);
      const state = useMotionStore.getState();
      const allPaths = flattenTree(state.fileTree).map((n) => n.path);
      const resolved = resolveWikiLinkPath(pageName, allPaths);
      if (resolved) {
        state.openFile(resolved);
      }
    }

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  const handleEditorChange = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      // Convert math blocks to ```math code fences for markdown serialization
      const serializableBlocks = (editor.document as any[]).map((block: any) => {
        if (block.type === "math") {
          return {
            ...block,
            type: "codeBlock",
            props: { language: "math" },
            content: [{ type: "text", text: block.props.equation ?? "", styles: {} }],
          };
        }
        return block;
      });
      let markdown = await editor.blocksToMarkdownLossy(serializableBlocks as any);
      markdown = codeFenceToMath(markdownToWikiLinks(markdown));
      if (markdown === lastContentRef.current) return;
      lastContentRef.current = markdown;
      updateDocContent(markdown);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        const state = useMotionStore.getState();
        if (state.dirty && state.currentDoc) {
          state.saveCurrentDoc();
        }
      }, 3000);
    } catch {
      // ignore
    }
  }, [editor, updateDocContent]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDocTitle(e.target.value);
    },
    [updateDocTitle]
  );

  const maxWidth = EDITOR_WIDTHS[editorWidth];

  if (!currentDoc) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[var(--neutral-300)]">Motion</h2>
          <p className="mt-2 text-sm text-[var(--neutral-400)]">
            Select a file from the sidebar or connect a GitHub repository to get
            started.
          </p>
          <p className="mt-1 text-xs text-[var(--neutral-400)]">
            Press <kbd className="rounded border border-[var(--neutral-200)] px-1.5 py-0.5 text-xs">Cmd+K</kbd> to search
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "agent") {
    return <AgentView />;
  }

  return (
    <div>
      <FrontmatterPanel />
      <div className="mx-auto px-4 py-2 sm:px-4 md:px-12 md:py-10 max-md:!max-w-full" style={{ maxWidth }}>

        <div className="motion-editor" ref={editorContainerRef}>
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme={themeResolved}
            slashMenu={false}
          >
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) => {
                const defaultItems = getDefaultReactSlashMenuItems(editor);
                const customItems = [
                  {
                    title: "Math Equation",
                    subtext: "Insert a LaTeX math equation",
                    group: "Media",
                    onItemClick: () => {
                      insertOrUpdateBlockForSlashMenu(editor, { type: "math" } as any);
                    },
                    aliases: ["math", "latex", "equation", "formula", "katex"],
                  },
                  {
                    title: "Embed",
                    subtext: "Embed YouTube, Twitter, Figma, or any URL",
                    group: "Media",
                    onItemClick: () => {
                      insertOrUpdateBlockForSlashMenu(editor, { type: "embed" } as any);
                    },
                    aliases: ["embed", "youtube", "twitter", "figma", "iframe"],
                  },
                  {
                    title: "Drawing / Whiteboard",
                    subtext: "Create an Excalidraw drawing",
                    group: "Media",
                    onItemClick: () => {
                      insertOrUpdateBlockForSlashMenu(editor, { type: "excalidraw" } as any);
                    },
                    aliases: ["draw", "drawing", "whiteboard", "excalidraw", "sketch"],
                  },
                ];

                const allItems = [...defaultItems, ...customItems];

                if (!query) return allItems;
                const q = query.toLowerCase();
                return allItems.filter(
                  (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.subtext?.toLowerCase().includes(q) ||
                    item.aliases?.some((a) => a.toLowerCase().includes(q))
                );
              }}
            />
          </BlockNoteView>
        </div>
      </div>
    </div>
  );
}
