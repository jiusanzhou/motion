"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAIStore } from "@/store/ai";
import { useEmbeddingStore } from "@/store/embedding";
import { streamChat, type ChatMessage } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatPanel() {
  const { config, chatOpen, setChatOpen } = useAIStore();
  const { semanticSearch, embeddings } = useEmbeddingStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  // Cmd+Shift+A toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "a") {
        e.preventDefault();
        setChatOpen(!chatOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatOpen, setChatOpen]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreaming("");

    // RAG: retrieve relevant document context
    let systemContent: string = SYSTEM_PROMPTS.chat;
    if (embeddings.size > 0) {
      const results = await semanticSearch(text, 3);
      const relevant = results.filter((r) => r.score > 0.35);
      if (relevant.length > 0) {
        const ctx = relevant
          .map((r) => `### ${r.title}\n${r.snippet}`)
          .join("\n\n");
        systemContent = `${SYSTEM_PROMPTS.chat}\n\n---\nRelevant context from your knowledge base:\n\n${ctx}`;
      }
    }

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...newMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let full = "";
      await streamChat(config, chatMessages, (chunk) => {
        full += chunk;
        setStreaming(full);
      }, controller.signal);
      setMessages([...newMessages, { role: "assistant", content: full }]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${(err as Error).message}` }]);
      }
    } finally {
      setLoading(false);
      setStreaming("");
      abortRef.current = null;
    }
  }, [input, loading, messages, config, semanticSearch, embeddings]);

  const insertToDoc = useCallback((content: string) => {
    // Extract code blocks or use full content
    const codeBlockMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
    const textToInsert = codeBlockMatch ? codeBlockMatch[1].trim() : content;
    
    // Copy to clipboard as a simple insert mechanism
    navigator.clipboard.writeText(textToInsert).then(() => {
      // Use toast if available
      const event = new CustomEvent("motion:toast", { detail: { message: "Copied to clipboard — paste into editor" } });
      window.dispatchEvent(event);
    });
  }, []);

  if (!chatOpen) return null;

  return (
    <div className="fixed right-0 top-12 bottom-0 z-40 flex w-80 flex-col border-l border-[var(--neutral-200)] bg-[var(--background)] shadow-xl lg:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--neutral-200)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--foreground)]">AI Chat</span>
        <div className="flex gap-2">
          <button
            onClick={() => setMessages([])}
            className="text-xs text-[var(--neutral-400)] hover:text-[var(--foreground)]"
          >
            Clear
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="text-[var(--neutral-400)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && !streaming && (
          <div className="flex h-full items-center justify-center text-xs text-[var(--neutral-400)]">
            Ask AI anything about your documents
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--neutral-100)] text-[var(--foreground)]"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && (
                <button
                  onClick={() => insertToDoc(msg.content)}
                  className="mt-1 text-xs text-[var(--neutral-400)] hover:text-[var(--foreground)]"
                >
                  📋 Copy to insert
                </button>
              )}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="mb-3">
            <div className="inline-block max-w-[90%] rounded-lg bg-[var(--neutral-100)] px-3 py-2 text-sm text-[var(--foreground)]">
              <div className="whitespace-pre-wrap">{streaming}</div>
            </div>
          </div>
        )}
        {loading && !streaming && embeddings.size > 0 && (
          <div className="mb-1 text-xs text-[var(--neutral-400)]">Searching knowledge base...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--neutral-200)] px-4 py-3">
        {!config.apiKey ? (
          <button
            onClick={() => useAIStore.getState().setSettingsOpen(true)}
            className="w-full rounded-md border border-[var(--neutral-200)] px-3 py-2 text-sm text-[var(--neutral-400)]"
          >
            Configure API Key to start
          </button>
        ) : (
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask AI..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--neutral-400)]"
            />
            <button
              onClick={loading ? () => abortRef.current?.abort() : send}
              className="rounded-md bg-[var(--foreground)] px-3 py-2 text-sm text-[var(--background)] hover:opacity-90"
            >
              {loading ? "Stop" : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
