"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMotionStore } from "@/store";

interface TocItem {
  text: string;
  level: number;
  element: HTMLElement;
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const currentDocPath = useMotionStore((s) => s.currentDoc?.path);

  const extractHeadings = useCallback(() => {
    const editor = document.querySelector(".motion-editor");
    if (!editor) return;

    const headings = editor.querySelectorAll("h1, h2, h3");
    const tocItems: TocItem[] = [];

    headings.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;
      tocItems.push({
        text,
        level: parseInt(el.tagName[1]),
        element: el as HTMLElement,
      });
    });

    setItems(tocItems);
  }, []);

  useEffect(() => {
    if (!currentDocPath) {
      setItems([]);
      return;
    }

    const timers = [
      setTimeout(extractHeadings, 300),
      setTimeout(extractHeadings, 800),
      setTimeout(extractHeadings, 2000),
    ];

    const editor = document.querySelector(".motion-editor");
    let mo: MutationObserver | null = null;
    if (editor) {
      mo = new MutationObserver(() => {
        setTimeout(extractHeadings, 300);
      });
      mo.observe(editor, { childList: true, subtree: true });
    }

    return () => {
      timers.forEach(clearTimeout);
      mo?.disconnect();
    };
  }, [currentDocPath, extractHeadings]);

  // Track active heading via scroll position
  useEffect(() => {
    if (items.length === 0) return;

    const container = document.getElementById("motion-scroll-container");
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let active = -1;
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].element.getBoundingClientRect();
        if (rect.top - containerTop <= 80) {
          active = i;
        }
      }
      setActiveIndex(active);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollTo = useCallback((index: number) => {
    const item = items[index];
    if (!item) return;
    const container = document.getElementById("motion-scroll-container");
    if (!container) return;

    const containerTop = container.getBoundingClientRect().top;
    const elTop = item.element.getBoundingClientRect().top;
    container.scrollTo({
      top: container.scrollTop + elTop - containerTop - 20,
      behavior: "smooth",
    });
  }, [items]);

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
          {items.map((item, i) => (
            <button
              key={`${item.text}-${i}`}
              onClick={() => scrollTo(i)}
              className={`text-left text-xs transition-colors truncate ${
                activeIndex === i
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
