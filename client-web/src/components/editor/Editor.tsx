"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useMotionStore, EDITOR_WIDTHS } from "@/store";
import { useThemeStore } from "@/store/theme";
import { FrontmatterPanel } from "./FrontmatterPanel";
import { AgentView } from "./AgentView";

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
  const [editorReady, setEditorReady] = useState(false);

  const editor = useCreateBlockNote();

  // Mark editor as ready after first render
  useEffect(() => {
    setEditorReady(true);
  }, [editor]);

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
    if (!currentDoc || !editorReady) return;

    const docPath = currentDoc.path;
    const docContent = currentDoc.content;

    // Skip if same path and we already loaded
    if (prevPathRef.current === docPath && loadingRef.current === false) return;

    prevPathRef.current = docPath;
    loadingRef.current = true;

    async function loadContent() {
      try {
        if (!docContent) {
          editor.replaceBlocks(editor.document, []);
        } else {
          const blocks = await editor.tryParseMarkdownToBlocks(docContent);
          // Check if user already switched to another file
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
  }, [currentDoc?.path, currentDoc?.content, editorReady, editor]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const handleEditorChange = useCallback(async () => {
    // Don't trigger during content loading
    if (loadingRef.current) return;

    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
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
      <div className="mx-auto px-6 py-10 md:px-12" style={{ maxWidth }}>
        <input
          key={currentDoc.path}
          defaultValue={currentDoc.title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="mb-4 w-full border-none bg-transparent text-4xl font-bold text-[var(--foreground)] placeholder:text-[var(--neutral-300)] focus:outline-none"
        />
        <div className="motion-editor">
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme={themeResolved}
          />
        </div>
      </div>
    </div>
  );
}
