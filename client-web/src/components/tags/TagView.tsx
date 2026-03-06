"use client";

import { useState, useEffect, useMemo } from "react";
import { useMotionStore } from "@/store";
import type { TreeNode } from "@/types";

function flattenFiles(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") result.push(node);
    if (node.children) result.push(...flattenFiles(node.children));
  }
  return result;
}

interface TagInfo {
  tag: string;
  count: number;
  paths: string[];
}

export function TagView() {
  const { fileTree, provider, openFile } = useMotionStore();
  const [tagMap, setTagMap] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const files = useMemo(() => flattenFiles(fileTree), [fileTree]);

  const [indexed, setIndexed] = useState(false);

  // Build tag index only once when tag view is first shown
  useEffect(() => {
    if (!provider || files.length === 0 || indexed) return;
    let cancelled = false;
    setIndexed(true);

    async function buildTags() {
      setLoading(true);
      const map = new Map<string, string[]>();
      for (const file of files) {
        try {
          const doc = await provider!.readFile(file.path);
          const tags = doc.frontmatter.tags;
          if (Array.isArray(tags)) {
            for (const tag of tags) {
              if (typeof tag === "string") {
                const paths = map.get(tag) ?? [];
                paths.push(file.path);
                map.set(tag, paths);
              }
            }
          }
        } catch {
          // skip
        }
      }
      if (cancelled) return;
      const result: TagInfo[] = Array.from(map.entries())
        .map(([tag, paths]) => ({ tag, count: paths.length, paths }))
        .sort((a, b) => b.count - a.count);
      setTagMap(result);
      setLoading(false);
    }

    buildTags();
    return () => {
      cancelled = true;
    };
  }, [provider, files]);

  const selectedTagInfo = tagMap.find((t) => t.tag === selectedTag);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--neutral-400)]">
        Loading tags...
      </div>
    );
  }

  if (tagMap.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-[var(--neutral-400)]">
        No tags found. Add tags to your document frontmatter.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {!selectedTag && (
        <div className="flex flex-wrap gap-1.5 px-2">
          {tagMap.map((info) => (
            <button
              key={info.tag}
              onClick={() => setSelectedTag(info.tag)}
              className="rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs text-[var(--neutral-700)] transition-colors hover:bg-[var(--neutral-200)]"
            >
              {info.tag}
              <span className="ml-1 text-[var(--neutral-400)]">
                {info.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedTag && selectedTagInfo && (
        <div>
          <button
            onClick={() => setSelectedTag(null)}
            className="mb-2 px-2 text-xs text-[var(--neutral-500)] hover:text-[var(--foreground)]"
          >
            &larr; All tags
          </button>
          <div className="px-2 pb-2 text-sm font-medium text-[var(--foreground)]">
            #{selectedTag}
          </div>
          <div className="flex flex-col gap-0.5">
            {selectedTagInfo.paths.map((path) => (
              <button
                key={path}
                onClick={() => openFile(path)}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] transition-colors"
              >
                <span className="truncate">
                  {path.split("/").pop()?.replace(/\.md$/, "")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
