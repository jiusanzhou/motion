"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

  // Extract headings from the DOM (BlockNote renders them)
  const extractHeadings = useCallback(() => {
    const editor = document.querySelector(".motion-editor");
    if (!editor) return;

    const headings = editor.querySelectorAll("h1, h2, h3");
    const tocItems: TocItem[] = [];

    headings.forEach((el, i) => {
      const id = `toc-heading-${i}`;
      el.id = id;
      tocItems.push({
        id,
        text: el.textContent ?? "",
        level: parseInt(el.tagName[1]),
      });
    });

    setItems(tocItems);
  }, []);

  useEffect(() => {
    // Run after content loads
    const timer = setTimeout(extractHeadings, 500);

    // Re-run on mutations
    const editor = document.querySelector(".motion-editor");
    if (editor) {
      const mo = new MutationObserver(() => {
        setTimeout(extractHeadings, 200);
      });
      mo.observe(editor, { childList: true, subtree: true });
      return () => {
        clearTimeout(timer);
        mo.disconnect();
      };
    }

    return () => clearTimeout(timer);
  }, [extractHeadings]);

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
      { root: document.querySelector("main"), rootMargin: "-20% 0% -60% 0%" }
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
    // Find the scrollable main container
    const scrollContainer = document.querySelector("main");
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.top - containerRect.top + scrollContainer.scrollTop - 20;
      scrollContainer.scrollTo({ top: offset, behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed right-4 top-14 z-30">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mb-1 text-xs text-[var(--neutral-400)] hover:text-[var(--foreground)] transition-colors"
      >
        {collapsed ? "TOC" : "Contents"}
      </button>
      {!collapsed && (
        <nav className="flex w-48 flex-col gap-0.5 border-l border-[var(--neutral-200)] pl-3">
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
