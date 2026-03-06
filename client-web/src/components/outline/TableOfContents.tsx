"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMotionStore } from "@/store";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const currentDocPath = useMotionStore((s) => s.currentDoc?.path);

  const extractHeadings = useCallback(() => {
    const editor = document.querySelector(".motion-editor");
    if (!editor) return;

    const headings = editor.querySelectorAll("h1, h2, h3, [data-content-type='heading'] h1, [data-content-type='heading'] h2, [data-content-type='heading'] h3");
    const tocItems: TocItem[] = [];
    const seen = new Set<string>();

    headings.forEach((el, i) => {
      if (seen.has(el.textContent ?? "")) return;
      seen.add(el.textContent ?? "");

      const slug = (el.textContent ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const id = `toc-${slug || i}-${i}`;
      (el as HTMLElement).id = id;
      tocItems.push({
        id,
        text: el.textContent ?? "",
        level: parseInt(el.tagName[1]),
      });
    });

    setItems(tocItems);
  }, []);

  // Re-extract headings when doc changes or editor content mutates
  useEffect(() => {
    if (!currentDocPath) {
      setItems([]);
      return;
    }

    // Try multiple times as BlockNote renders async
    const timers = [
      setTimeout(extractHeadings, 300),
      setTimeout(extractHeadings, 800),
      setTimeout(extractHeadings, 1500),
    ];

    // Also watch for mutations
    const editor = document.querySelector(".motion-editor");
    let mo: MutationObserver | null = null;
    if (editor) {
      mo = new MutationObserver(() => {
        setTimeout(extractHeadings, 200);
      });
      mo.observe(editor, { childList: true, subtree: true });
    }

    return () => {
      timers.forEach(clearTimeout);
      mo?.disconnect();
    };
  }, [currentDocPath, extractHeadings]);

  // Intersection observer for active heading
  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0% -60% 0%" }
    );

    observerRef.current = observer;

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const container = document.getElementById("motion-scroll-container");
    if (container) {
      const elTop = el.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      container.scrollTo({
        top: container.scrollTop + elTop - containerTop - 20,
        behavior: "smooth",
      });
    }
  }, []);

  if (!currentDocPath || items.length === 0) return null;

  return (
    <div className="fixed right-4 top-14 z-30">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mb-1 text-xs text-[var(--neutral-400)] hover:text-[var(--foreground)] transition-colors"
      >
        {collapsed ? "▶ TOC" : "Contents"}
      </button>
      {!collapsed && (
        <nav className="flex w-48 max-h-[60vh] overflow-y-auto flex-col gap-0.5 border-l border-[var(--neutral-200)] pl-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-left text-xs transition-colors truncate ${
                activeId === item.id
                  ? "text-[var(--foreground)] font-medium"
                  : "text-[var(--neutral-400)] hover:text-[var(--neutral-600)]"
              }`}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              {item.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
