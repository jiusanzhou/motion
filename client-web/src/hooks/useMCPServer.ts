"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useMotionStore } from "@/store";
import { useSearchStore } from "@/store/search";
import { useMCPStore } from "@/store/mcp";
import {
  createBrowserMCPHandler,
  type BrowserMCPHandler,
} from "@/lib/mcp/browser-handler";

const SESSION_KEY = "motion:mcp-session-id";

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getStoredSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useMCPServer() {
  const [sessionId] = useState(getStoredSessionId);
  const handlerRef = useRef<BrowserMCPHandler | null>(null);
  const provider = useMotionStore((s) => s.provider);
  const mcpStore = useMCPStore;

  // Set sessionId in store
  useEffect(() => {
    mcpStore.getState().setSessionId(sessionId);
  }, [sessionId, mcpStore]);

  const connect = useCallback(() => {
    handlerRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    handlerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const handler = createBrowserMCPHandler({
      sessionId,
      getProvider: () => useMotionStore.getState().provider,
      getFileTree: () => useMotionStore.getState().fileTree,
      getSearchFn: () => {
        const searchStore = useSearchStore.getState();
        return (query: string) => searchStore.search(query);
      },
      onStatusChange: (status) => mcpStore.getState().setStatus(status),
      onAgentCountChange: (count) => mcpStore.getState().setAgentCount(count),
      onLog: (entry) => mcpStore.getState().addLog(entry),
    });

    handlerRef.current = handler;

    return () => {
      handler.disconnect();
      handlerRef.current = null;
    };
  }, [sessionId, mcpStore]);

  // Auto-connect when provider becomes available
  useEffect(() => {
    if (provider && handlerRef.current) {
      handlerRef.current.connect();
    }
  }, [provider]);

  return { connect, disconnect };
}
