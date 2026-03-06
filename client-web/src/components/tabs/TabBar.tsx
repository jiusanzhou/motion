"use client";

import { useMotionStore } from "@/store";
import { X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TabBar() {
  const { tabs, currentDoc, switchTab, closeTab } = useMotionStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex h-9 shrink-0 items-center gap-0 overflow-x-auto border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
      {tabs.map((tab) => {
        const isActive = currentDoc?.path === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => switchTab(tab.path)}
            className={cn(
              "group flex h-full shrink-0 items-center gap-1.5 border-r border-[var(--neutral-100)] px-3 text-xs transition-colors",
              isActive
                ? "bg-[var(--background)] text-[var(--foreground)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
            )}
          >
            <span className="max-w-[120px] truncate">{tab.title}</span>
            {tab.dirty && (
              <Circle className="h-2 w-2 shrink-0 fill-[var(--neutral-400)] text-[var(--neutral-400)]" />
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.path);
              }}
              className="shrink-0 rounded p-0.5 opacity-0 hover:bg-[var(--neutral-200)] group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
