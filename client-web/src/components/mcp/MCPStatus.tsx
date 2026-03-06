"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Radio } from "lucide-react";
import type { MCPConnectionStatus, MCPLogEntry } from "@/lib/mcp/browser-handler";

interface MCPStatusProps {
  status: MCPConnectionStatus;
  sessionId: string;
  agentCount: number;
  logs: MCPLogEntry[];
}

export function MCPStatusIndicator({
  status,
  sessionId,
  agentCount,
  logs,
}: MCPStatusProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] transition-colors"
        title="MCP Status"
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "connected" ? "bg-emerald-500" : "bg-[var(--neutral-300)]"
          )}
        />
        <Radio className="h-3 w-3" />
        {agentCount > 0 && (
          <span className="text-[10px] text-[var(--neutral-400)]">{agentCount}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <MCPStatusPanel
            status={status}
            sessionId={sessionId}
            agentCount={agentCount}
            logs={logs}
            onClose={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function MCPStatusPanel({
  status,
  sessionId,
  agentCount,
  logs,
  onClose,
}: MCPStatusProps & { onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const protocol = typeof window !== "undefined"
    ? (window.location.protocol === "https:" ? "wss:" : "ws:")
    : "ws:";
  const host = typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const wsUrl = `${protocol}//${host}/api/relay?role=agent&sessionId=${sessionId}`;

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--foreground)]">MCP Server</span>
        <button
          onClick={onClose}
          className="text-xs text-[var(--neutral-400)] hover:text-[var(--foreground)]"
        >
          &times;
        </button>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-[var(--neutral-500)]">Status</span>
          <span className={cn(
            "flex items-center gap-1",
            status === "connected" ? "text-emerald-500" : "text-[var(--neutral-400)]"
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "connected" ? "bg-emerald-500" : "bg-[var(--neutral-300)]"
            )} />
            {status}
          </span>
        </div>

        {/* Session ID */}
        <div className="flex items-center justify-between">
          <span className="text-[var(--neutral-500)]">Session ID</span>
          <button
            onClick={() => copyToClipboard(sessionId, "session")}
            className="flex items-center gap-1 font-mono text-[var(--foreground)] hover:text-[var(--accent)]"
          >
            {sessionId}
            {copied === "session" ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* WebSocket URL */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[var(--neutral-500)]">Agent URL</span>
            <button
              onClick={() => copyToClipboard(wsUrl, "url")}
              className="flex items-center gap-1 text-[var(--neutral-400)] hover:text-[var(--foreground)]"
            >
              {copied === "url" ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          <code className="block break-all rounded bg-[var(--neutral-100)] px-2 py-1 text-[10px] text-[var(--neutral-600)]">
            {wsUrl}
          </code>
        </div>

        {/* Agent count */}
        <div className="flex items-center justify-between">
          <span className="text-[var(--neutral-500)]">Connected agents</span>
          <span className="text-[var(--foreground)]">{agentCount}</span>
        </div>

        {/* Recent logs */}
        {logs.length > 0 && (
          <div>
            <span className="text-[var(--neutral-500)]">Recent requests</span>
            <div className="mt-1 max-h-32 overflow-y-auto rounded bg-[var(--neutral-100)] p-1.5">
              {logs.slice().reverse().map((log, i) => (
                <div
                  key={`${log.timestamp}-${i}`}
                  className="flex items-center justify-between py-0.5 text-[10px]"
                >
                  <span className="font-mono text-[var(--neutral-600)]">{log.method}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[var(--neutral-400)]">{log.durationMs}ms</span>
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      log.success ? "bg-emerald-500" : "bg-red-400"
                    )} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
