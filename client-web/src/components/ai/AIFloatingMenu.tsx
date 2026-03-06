"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAIStore } from "@/store/ai";
import { streamChat } from "@/lib/ai/client";
import { SYSTEM_PROMPTS, type PromptAction } from "@/lib/ai/prompts";

const ACTIONS: { key: PromptAction; label: string; icon: string }[] = [
  { key: "rewrite", label: "Rewrite", icon: "✏️" },
  { key: "continue", label: "Continue", icon: "➡️" },
  { key: "summarize", label: "Summarize", icon: "📝" },
  { key: "translate", label: "Translate", icon: "🌐" },
  { key: "explain", label: "Explain", icon: "💡" },
];

export function AIFloatingMenu() {
  const { config } = useAIStore();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [streamResult, setStreamResult] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        // Delay hiding to allow clicking menu buttons
        setTimeout(() => {
          const active = document.activeElement;
          if (!menuRef.current?.contains(active)) {
            setVisible(false);
            setResult("");
            setStreamResult("");
          }
        }, 200);
        return;
      }

      const text = sel.toString().trim();
      if (!text || !config.apiKey) return;

      // Check if selection is within editor
      const range = sel.getRangeAt(0);
      const editor = document.querySelector(".motion-editor");
      if (!editor?.contains(range.commonAncestorContainer)) return;

      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPosition({
        top: rect.top - 44 + window.scrollY,
        left: rect.left + rect.width / 2,
      });
      setVisible(true);
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [config.apiKey]);

  const runAction = useCallback(async (action: PromptAction) => {
    if (loading || !selectedText) return;
    setLoading(true);
    setResult("");
    setStreamResult("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let full = "";
      await streamChat(
        config,
        [
          { role: "system", content: SYSTEM_PROMPTS[action] },
          { role: "user", content: selectedText },
        ],
        (chunk) => {
          full += chunk;
          setStreamResult(full);
        },
        controller.signal
      );
      setResult(full);
      setStreamResult("");

      // Copy result to clipboard
      await navigator.clipboard.writeText(full);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResult(`Error: ${(err as Error).message}`);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [loading, selectedText, config]);

  if (!visible || !config.apiKey) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 -translate-x-1/2 rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      {!result && !streamResult && !loading && (
        <div className="flex gap-0.5">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              onClick={() => runAction(action.key)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] hover:text-[var(--foreground)]"
              title={action.label}
            >
              <span>{action.icon}</span>
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      )}
      {loading && !streamResult && (
        <div className="px-3 py-1 text-xs text-[var(--neutral-400)]">Thinking...</div>
      )}
      {(streamResult || result) && (
        <div className="max-h-48 max-w-sm overflow-y-auto px-3 py-2">
          <div className="mb-1 whitespace-pre-wrap text-xs text-[var(--foreground)]">
            {streamResult || result}
          </div>
          {result && (
            <div className="text-[10px] text-[var(--neutral-400)]">✓ Copied to clipboard</div>
          )}
        </div>
      )}
    </div>
  );
}
