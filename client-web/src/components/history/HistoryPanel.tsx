"use client";

import { useState, useEffect, useCallback } from "react";
import { useMotionStore } from "@/store";
import { useToastStore } from "@/store/toast";
import type { CommitInfo } from "@/types";
import { Clock, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HistoryPanel() {
  const { provider, currentDoc, openFile } = useMotionStore();
  const [open, setOpen] = useState(false);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !provider?.getHistory || !currentDoc) return;
    setLoading(true);
    provider
      .getHistory(currentDoc.path)
      .then((h) => {
        setCommits(h);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [open, provider, currentDoc]);

  const handlePreview = useCallback(
    async (sha: string) => {
      if (!provider?.getFileAtCommit || !currentDoc) return;
      setSelectedCommit(sha);
      try {
        const content = await provider.getFileAtCommit(currentDoc.path, sha);
        setPreviewContent(content);
      } catch {
        setPreviewContent("Failed to load this version.");
      }
    },
    [provider, currentDoc]
  );

  const handleRestore = useCallback(
    async (sha: string) => {
      if (!provider?.getFileAtCommit || !currentDoc) return;
      try {
        const content = await provider.getFileAtCommit(currentDoc.path, sha);
        await provider.writeFile(currentDoc.path, content, currentDoc.sha);
        await openFile(currentDoc.path);
        useToastStore.getState().addToast("Version restored", "success");
        setOpen(false);
      } catch {
        useToastStore.getState().addToast("Failed to restore version", "error");
      }
    },
    [provider, currentDoc, openFile]
  );

  if (!currentDoc) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Version history"
      >
        <Clock className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => {
              setOpen(false);
              setSelectedCommit(null);
              setPreviewContent(null);
            }}
          />
          <div className="flex h-full w-80 flex-col border-l border-[var(--neutral-200)] bg-[var(--background)]">
            <div className="flex h-12 items-center justify-between border-b border-[var(--neutral-100)] px-4">
              <span className="text-sm font-medium text-[var(--foreground)]">
                Version History
              </span>
              <button
                onClick={() => {
                  setOpen(false);
                  setSelectedCommit(null);
                  setPreviewContent(null);
                }}
                className="rounded p-1 text-[var(--neutral-400)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-sm text-[var(--neutral-400)]">
                  Loading history...
                </div>
              ) : commits.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-[var(--neutral-400)]">
                  No history available.
                </div>
              ) : (
                <div className="flex flex-col">
                  {commits.map((commit) => (
                    <div
                      key={commit.sha}
                      className={`border-b border-[var(--neutral-100)] p-3 ${
                        selectedCommit === commit.sha
                          ? "bg-[var(--neutral-100)]"
                          : ""
                      }`}
                    >
                      <div className="text-xs text-[var(--neutral-500)]">
                        {new Date(commit.date).toLocaleString()}
                      </div>
                      <div className="mt-0.5 text-sm text-[var(--foreground)] line-clamp-2">
                        {commit.message}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--neutral-400)]">
                        {commit.author}
                      </div>
                      <div className="mt-1.5 flex gap-2">
                        <button
                          onClick={() => handlePreview(commit.sha)}
                          className="text-xs text-[var(--neutral-500)] hover:text-[var(--foreground)]"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleRestore(commit.sha)}
                          className="flex items-center gap-1 text-xs text-[var(--neutral-500)] hover:text-[var(--foreground)]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {previewContent && (
              <div className="border-t border-[var(--neutral-200)]">
                <div className="px-4 py-2 text-xs font-medium text-[var(--neutral-500)]">
                  Preview
                </div>
                <pre className="max-h-48 overflow-auto px-4 pb-3 text-xs text-[var(--neutral-600)] whitespace-pre-wrap font-mono">
                  {previewContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
