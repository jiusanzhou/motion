"use client";

import { useState, useCallback } from "react";
import { useMotionStore } from "@/store";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";

export function FrontmatterPanel() {
  const { currentDoc, updateDocFrontmatter } = useMotionStore();
  const [expanded, setExpanded] = useState(false);

  const frontmatter = currentDoc?.frontmatter ?? {};

  const updateField = useCallback(
    (key: string, value: unknown) => {
      updateDocFrontmatter({ ...frontmatter, [key]: value });
    },
    [frontmatter, updateDocFrontmatter]
  );

  const removeField = useCallback(
    (key: string) => {
      const next = { ...frontmatter };
      delete next[key];
      updateDocFrontmatter(next);
    },
    [frontmatter, updateDocFrontmatter]
  );

  const tags = Array.isArray(frontmatter.tags)
    ? (frontmatter.tags as string[])
    : [];
  const summary =
    typeof frontmatter.summary === "string" ? frontmatter.summary : "";
  const access =
    typeof frontmatter.access === "string" ? frontmatter.access : "";
  const links = Array.isArray(frontmatter.links)
    ? (frontmatter.links as string[])
    : [];
  const published =
    typeof frontmatter.published === "boolean" ? frontmatter.published : false;

  if (!currentDoc) return null;

  return (
    <div className="border-b border-[var(--neutral-100)]">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-1.5 px-4 py-2 text-xs text-[var(--neutral-500)] hover:text-[var(--foreground)] transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Frontmatter
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-xs text-[var(--neutral-700)]"
                >
                  {tag}
                  <button
                    onClick={() =>
                      updateField(
                        "tags",
                        tags.filter((_, j) => j !== i)
                      )
                    }
                    className="text-[var(--neutral-400)] hover:text-[var(--foreground)]"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  const tag = prompt("Add tag:");
                  if (tag?.trim()) updateField("tags", [...tags, tag.trim()]);
                }}
                className="rounded p-0.5 text-[var(--neutral-400)] hover:text-[var(--foreground)]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Brief summary..."
              rows={2}
              className="w-full rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:ring-1 focus:ring-[var(--neutral-400)] resize-none"
            />
          </div>

          {/* Published */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--neutral-500)]">
              Published
            </label>
            <button
              onClick={() => updateField("published", !published)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                published ? "bg-[var(--foreground)]" : "bg-[var(--neutral-300)]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                  published ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Access */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
              Access
            </label>
            <select
              value={access}
              onChange={(e) =>
                updateField("access", e.target.value || undefined)
              }
              className="w-full rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--neutral-400)]"
            >
              <option value="">Not set</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          {/* Links */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
              Links
            </label>
            <div className="flex flex-col gap-1">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[i] = e.target.value;
                      updateField("links", newLinks);
                    }}
                    className="flex-1 rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--neutral-400)]"
                  />
                  <button
                    onClick={() =>
                      updateField(
                        "links",
                        links.filter((_, j) => j !== i)
                      )
                    }
                    className="text-[var(--neutral-400)] hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateField("links", [...links, ""])}
                className="flex items-center gap-1 text-xs text-[var(--neutral-500)] hover:text-[var(--foreground)]"
              >
                <Plus className="h-3 w-3" />
                Add link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
