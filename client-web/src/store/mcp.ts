"use client";

import { create } from "zustand";
import type { MCPConnectionStatus, MCPLogEntry } from "@/lib/mcp/browser-handler";

interface MCPState {
  status: MCPConnectionStatus;
  agentCount: number;
  logs: MCPLogEntry[];
  sessionId: string;

  setStatus: (status: MCPConnectionStatus) => void;
  setAgentCount: (count: number) => void;
  addLog: (entry: MCPLogEntry) => void;
  setSessionId: (id: string) => void;
}

export const useMCPStore = create<MCPState>((set) => ({
  status: "disconnected",
  agentCount: 0,
  logs: [],
  sessionId: "",

  setStatus: (status) => set({ status }),
  setAgentCount: (agentCount) => set({ agentCount }),
  addLog: (entry) =>
    set((s) => {
      const logs = [...s.logs, entry];
      return { logs: logs.length > 10 ? logs.slice(-10) : logs };
    }),
  setSessionId: (sessionId) => set({ sessionId }),
}));
