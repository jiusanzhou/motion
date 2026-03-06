#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import WebSocket from "ws";

const RELAY_URL = process.env.MOTION_RELAY_URL || "ws://localhost:3000/api/relay";
const SESSION_ID = process.env.MOTION_SESSION_ID || "claude-desktop";

// ── WebSocket bridge to Motion relay ──
let ws: WebSocket | null = null;
let connected = false;
const pendingRequests = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
let requestCounter = 0;

function connectRelay(): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = `${RELAY_URL}?role=agent&sessionId=${SESSION_ID}`;
    ws = new WebSocket(url);

    ws.on("open", () => {
      connected = true;
      resolve();
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "response" && msg.payload?.id) {
          const pending = pendingRequests.get(msg.payload.id);
          if (pending) {
            pendingRequests.delete(msg.payload.id);
            if (msg.payload.error) {
              pending.reject(new Error(msg.payload.error.message));
            } else {
              pending.resolve(msg.payload.result);
            }
          }
        }
      } catch {
        // ignore
      }
    });

    ws.on("close", () => {
      connected = false;
      // Reject all pending
      for (const [id, p] of pendingRequests) {
        p.reject(new Error("WebSocket disconnected"));
        pendingRequests.delete(id);
      }
    });

    ws.on("error", (err) => {
      if (!connected) reject(err);
    });
  });
}

function relayRequest(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  if (!ws || !connected) {
    return Promise.reject(new Error("Not connected to Motion relay. Make sure Motion is running at " + RELAY_URL));
  }
  const id = `mcp-${++requestCounter}`;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Request ${method} timed out`));
    }, 30000);

    pendingRequests.set(id, {
      resolve: (v) => { clearTimeout(timeout); resolve(v); },
      reject: (e) => { clearTimeout(timeout); reject(e); },
    });

    ws!.send(JSON.stringify({
      type: "request",
      payload: { id, method, params },
    }));
  });
}

// ── MCP Server ──
const server = new McpServer({
  name: "motion",
  version: "0.1.0",
});

// Tools
server.tool("list_documents", "List all documents in the knowledge base", {
  prefix: z.string().optional().describe("Filter by path prefix"),
}, async (params) => {
  const result = await relayRequest("documents.list", params);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("read_document", "Read a document's content", {
  path: z.string().describe("Document path (e.g. 'notes/hello.md')"),
}, async (params) => {
  const result = await relayRequest("documents.read", params) as { content?: string };
  return { content: [{ type: "text", text: result?.content || "" }] };
});

server.tool("write_document", "Create or update a document", {
  path: z.string().describe("Document path"),
  content: z.string().describe("Markdown content"),
}, async (params) => {
  const result = await relayRequest("documents.write", params);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

server.tool("delete_document", "Delete a document", {
  path: z.string().describe("Document path to delete"),
}, async (params) => {
  const result = await relayRequest("documents.delete", params);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

server.tool("move_document", "Move or rename a document", {
  oldPath: z.string().describe("Current path"),
  newPath: z.string().describe("New path"),
}, async (params) => {
  const result = await relayRequest("documents.move", params);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

server.tool("search", "Full-text search across all documents", {
  query: z.string().describe("Search query"),
}, async (params) => {
  const result = await relayRequest("search", params);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("list_tags", "List all tags used across documents", {}, async () => {
  const result = await relayRequest("tags.list");
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("get_graph", "Get knowledge graph (nodes and edges from wiki-links)", {}, async () => {
  const result = await relayRequest("graph");
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

// Resources — expose documents as readable resources
server.resource(
  "documents",
  "motion://documents",
  { description: "List all documents", mimeType: "application/json" },
  async () => {
    const result = await relayRequest("documents.list");
    return { contents: [{ uri: "motion://documents", text: JSON.stringify(result, null, 2), mimeType: "application/json" }] };
  }
);

// ── Start ──
async function main() {
  try {
    await connectRelay();
    process.stderr.write("✓ Connected to Motion relay\n");
  } catch {
    process.stderr.write("⚠ Could not connect to Motion relay — tools will fail until Motion is running\n");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
