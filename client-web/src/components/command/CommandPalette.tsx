"use client";

import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { Command } from "cmdk";
import { useMotionStore } from "@/store";
import { useThemeStore } from "@/store/theme";
import { useSearchStore, type SearchResult } from "@/store/search";
import { useEmbeddingStore } from "@/store/embedding";
import type { TreeNode } from "@/types";
import {
  FileText,
  Search,
  Sun,
  Moon,
  PanelLeft,
  FilePlus,
  Type,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") result.push(node);
    if (node.children) result.push(...flattenTree(node.children));
  }
  return result;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"files" | "search" | "semantic">("files");
  const { fileTree, openFile, toggleSidebar, setConnectDialogOpen } =
    useMotionStore();
  const { theme, setTheme } = useThemeStore();
  const { search, indexBuilt } = useSearchStore();
  const { semanticSearch, modelProgress, isEmbedding, embeddings } =
    useEmbeddingStore();

  const [semanticResults, setSemanticResults] = useState<
    Array<{ path: string; title: string; score: number }>
  >([]);
  const semanticDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const embeddedCount = embeddings.size;

  const files = useMemo(() => flattenTree(fileTree), [fileTree]);

  const searchResults = useMemo(() => {
    if (mode !== "search" || !query.trim()) return [];
    return search(query);
  }, [mode, query, search]);

  // Debounced semantic search
  useEffect(() => {
    if (mode !== "semantic" || !query.trim()) {
      setSemanticResults([]);
      return;
    }
    if (semanticDebounceRef.current)
      clearTimeout(semanticDebounceRef.current);
    semanticDebounceRef.current = setTimeout(async () => {
      const results = await semanticSearch(query);
      setSemanticResults(results);
    }, 400);
    return () => {
      if (semanticDebounceRef.current)
        clearTimeout(semanticDebounceRef.current);
    };
  }, [mode, query, semanticSearch]);

  // Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setMode("files");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      openFile(path);
      setOpen(false);
    },
    [openFile]
  );

  const filteredFiles = useMemo(() => {
    if (!query.trim()) return files;
    const q = query.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    );
  }, [files, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2 cmd-palette-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="rounded-xl border border-[var(--neutral-200)] bg-[var(--background)] shadow-2xl"
          shouldFilter={false}
        >
          <div className="flex items-center gap-2 border-b border-[var(--neutral-100)] px-4">
            <Search className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={
                mode === "search"
                  ? "Search content..."
                  : "Search files or type a command..."
              }
              className="h-12 w-full bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--neutral-400)] outline-none"
            />
          </div>

          <div className="flex gap-1 border-b border-[var(--neutral-100)] px-4 py-1.5">
            <button
              onClick={() => setMode("files")}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                mode === "files"
                  ? "bg-[var(--neutral-200)] text-[var(--foreground)]"
                  : "text-[var(--neutral-500)] hover:text-[var(--foreground)]"
              )}
            >
              Files
            </button>
            <button
              onClick={() => setMode("search")}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                mode === "search"
                  ? "bg-[var(--neutral-200)] text-[var(--foreground)]"
                  : "text-[var(--neutral-500)] hover:text-[var(--foreground)]"
              )}
            >
              Full-text Search
            </button>
            <button
              onClick={() => setMode("semantic")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors",
                mode === "semantic"
                  ? "bg-[var(--neutral-200)] text-[var(--foreground)]"
                  : "text-[var(--neutral-500)] hover:text-[var(--foreground)]"
              )}
            >
              <Sparkles className="h-3 w-3" />
              Semantic
            </button>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            {mode === "files" && (
              <>
                <Command.Group
                  heading={
                    <span className="px-2 text-xs text-[var(--neutral-400)]">
                      Files
                    </span>
                  }
                >
                  {filteredFiles.map((file) => (
                    <Command.Item
                      key={file.path}
                      value={file.path}
                      onSelect={() => handleSelect(file.path)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[var(--neutral-100)]"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{file.name}</div>
                        <div className="truncate text-xs text-[var(--neutral-400)]">
                          {file.path}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                  {filteredFiles.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-[var(--neutral-400)]">
                      No files found.
                    </div>
                  )}
                </Command.Group>

                {!query && (
                  <Command.Group
                    heading={
                      <span className="px-2 text-xs text-[var(--neutral-400)]">
                        Commands
                      </span>
                    }
                  >
                    <Command.Item
                      onSelect={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[var(--neutral-100)]"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                      Toggle Theme
                    </Command.Item>
                    <Command.Item
                      onSelect={() => {
                        toggleSidebar();
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[var(--neutral-100)]"
                    >
                      <PanelLeft className="h-4 w-4" />
                      Toggle Sidebar
                    </Command.Item>
                    <Command.Item
                      onSelect={() => {
                        setConnectDialogOpen(true);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[var(--neutral-100)]"
                    >
                      <FilePlus className="h-4 w-4" />
                      Connect Repository
                    </Command.Item>
                  </Command.Group>
                )}
              </>
            )}

            {mode === "search" && (
              <Command.Group>
                {!indexBuilt && (
                  <div className="px-3 py-6 text-center text-sm text-[var(--neutral-400)]">
                    Search index not built yet. Connect a repository first.
                  </div>
                )}
                {indexBuilt && searchResults.length === 0 && query && (
                  <div className="px-3 py-6 text-center text-sm text-[var(--neutral-400)]">
                    No results found.
                  </div>
                )}
                {searchResults.map((result: SearchResult) => (
                  <Command.Item
                    key={result.path}
                    value={result.path}
                    onSelect={() => handleSelect(result.path)}
                    className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[var(--neutral-100)]"
                  >
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                      <span className="font-medium">{result.title}</span>
                    </div>
                    {result.matches
                      .filter((m) => m.key === "content")
                      .slice(0, 1)
                      .map((m, i) => (
                        <div
                          key={i}
                          className="ml-6 truncate text-xs text-[var(--neutral-500)]"
                        >
                          ...{m.value.slice(
                            Math.max(0, (m.indices[0]?.[0] ?? 0) - 30),
                            (m.indices[0]?.[1] ?? 0) + 60
                          )}...
                        </div>
                      ))}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {mode === "semantic" && (
              <Command.Group>
                {embeddedCount === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-[var(--neutral-400)]">
                    No documents indexed yet. Open some files first.
                  </div>
                )}
                {embeddedCount > 0 && modelProgress < 100 && (
                  <div className="flex flex-col items-center gap-2 px-3 py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--neutral-400)]" />
                    <span className="text-xs text-[var(--neutral-400)]">
                      Loading model… {modelProgress}%
                    </span>
                  </div>
                )}
                {embeddedCount > 0 && modelProgress === 100 && (
                  <>
                    {isEmbedding && !semanticResults.length && (
                      <div className="flex items-center justify-center gap-2 px-3 py-4">
                        <Loader2 className="h-3 w-3 animate-spin text-[var(--neutral-400)]" />
                        <span className="text-xs text-[var(--neutral-400)]">Searching…</span>
                      </div>
                    )}
                    {!query && (
                      <div className="px-3 py-6 text-center text-sm text-[var(--neutral-400)]">
                        Type a query for semantic search ({embeddedCount} docs indexed)
                      </div>
                    )}
                    {semanticResults.map((result) => (
                      <Command.Item
                        key={result.path}
                        value={result.path}
                        onSelect={() => handleSelect(result.path)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[var(--neutral-100)]"
                      >
                        <Sparkles className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{result.title}</div>
                          <div className="truncate text-xs text-[var(--neutral-400)]">
                            {result.path}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-[var(--neutral-400)]">
                          {Math.round(result.score * 100)}%
                        </span>
                      </Command.Item>
                    ))}
                  </>
                )}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
