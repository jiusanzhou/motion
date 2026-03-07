import type { StorageProvider, TreeNode } from "@/types";
import type { MCPRequest, MCPResponse, RelayMessage } from "./protocol";
import { MCP_METHODS } from "./protocol";
import { flattenTree } from "@/lib/tree-utils";
import { extractWikiLinks, resolveWikiLinkPath } from "@/lib/wikilink";
import { trackEvent } from "@/lib/analytics";

export interface MCPLogEntry {
  timestamp: number;
  method: string;
  durationMs: number;
  success: boolean;
}

export type MCPConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface BrowserMCPHandler {
  connect(): void;
  disconnect(): void;
  status: MCPConnectionStatus;
  agentCount: number;
  recentLogs: MCPLogEntry[];
  sessionId: string;
}

const MAX_LOG_ENTRIES = 10;

export function createBrowserMCPHandler(opts: {
  sessionId: string;
  getProvider: () => StorageProvider | null;
  getFileTree: () => TreeNode[];
  getSearchFn: () => (query: string) => unknown[];
  onStatusChange: (status: MCPConnectionStatus) => void;
  onAgentCountChange: (count: number) => void;
  onLog: (entry: MCPLogEntry) => void;
}): BrowserMCPHandler {
  let ws: WebSocket | null = null;
  let status: MCPConnectionStatus = "disconnected";
  let agentCount = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  const recentLogs: MCPLogEntry[] = [];
  let disposed = false;

  function setStatus(s: MCPConnectionStatus) {
    status = s;
    opts.onStatusChange(s);
  }

  function addLog(entry: MCPLogEntry) {
    recentLogs.push(entry);
    if (recentLogs.length > MAX_LOG_ENTRIES) recentLogs.shift();
    opts.onLog(entry);
  }

  async function handleRequest(req: MCPRequest): Promise<MCPResponse> {
    const provider = opts.getProvider();
    if (!provider) {
      return { id: req.id, error: { code: -1, message: "No storage provider connected" } };
    }

    const start = Date.now();
    try {
      const result = await dispatch(provider, req, opts.getFileTree, opts.getSearchFn);
      const entry: MCPLogEntry = { timestamp: start, method: req.method, durationMs: Date.now() - start, success: true };
      addLog(entry);
      return { id: req.id, result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const entry: MCPLogEntry = { timestamp: start, method: req.method, durationMs: Date.now() - start, success: false };
      addLog(entry);
      return { id: req.id, error: { code: -2, message: msg } };
    }
  }

  function connect() {
    if (disposed) return;
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;

    setStatus("connecting");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/relay?role=browser&sessionId=${opts.sessionId}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttempts = 0;
      setStatus("connected");
      trackEvent("mcp_websocket_connect");
    };

    ws.onmessage = async (event) => {
      try {
        const msg: RelayMessage = JSON.parse(event.data);

        if (msg.type === "request") {
          const response = await handleRequest(msg.payload as MCPRequest);
          const reply: RelayMessage = { type: "response", payload: response };
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(reply));
          }
        } else if ((msg as unknown as { type: string; status?: string }).type === "status") {
          const statusMsg = msg as unknown as { status: string; agentCount?: number };
          if (statusMsg.status === "agent_connected" || statusMsg.status === "agent_disconnected") {
            agentCount = statusMsg.agentCount ?? 0;
            opts.onAgentCountChange(agentCount);
          }
        }
      } catch {
        // Ignore unparseable messages
      }
    };

    ws.onclose = () => {
      ws = null;
      if (disposed) {
        setStatus("disconnected");
        return;
      }
      setStatus("disconnected");
      agentCount = 0;
      opts.onAgentCountChange(0);
      scheduleReconnect();
    };

    ws.onerror = () => {
      setStatus("error");
      // onclose will fire after this
    };
  }

  function scheduleReconnect() {
    if (disposed) return;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30_000);
    reconnectAttempts++;
    reconnectTimer = setTimeout(connect, delay);
  }

  function disconnect() {
    disposed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close(1000, "Browser disconnecting");
      ws = null;
    }
    setStatus("disconnected");
  }

  return {
    connect,
    disconnect,
    get status() { return status; },
    get agentCount() { return agentCount; },
    get recentLogs() { return [...recentLogs]; },
    sessionId: opts.sessionId,
  };
}

// ── Dispatch logic ────────────────────────────────────────────────

async function dispatch(
  provider: StorageProvider,
  req: MCPRequest,
  getFileTree: () => TreeNode[],
  getSearchFn: () => (query: string) => unknown[],
): Promise<unknown> {
  switch (req.method) {
    case MCP_METHODS.DOCUMENTS_LIST:
      return documentsList(provider);

    case MCP_METHODS.DOCUMENTS_READ:
      return documentsRead(provider, req.params.path as string);

    case MCP_METHODS.DOCUMENTS_WRITE:
      return documentsWrite(provider, req.params.path as string, req.params.content as string);

    case MCP_METHODS.DOCUMENTS_DELETE:
      return documentsDelete(provider, req.params.path as string);

    case MCP_METHODS.DOCUMENTS_MOVE:
      return documentsMove(provider, req.params.oldPath as string, req.params.newPath as string);

    case MCP_METHODS.SEARCH:
      return search(getSearchFn, req.params.query as string);

    case MCP_METHODS.TAGS_LIST:
      return tagsList(provider);

    case MCP_METHODS.GRAPH:
      return graph(provider, getFileTree);

    case MCP_METHODS.BATCH:
      return batch(provider, req.params.operations as Array<{ method: string; params: Record<string, unknown> }>, getFileTree, getSearchFn);

    default:
      throw new Error(`Unknown method: ${req.method}`);
  }
}

async function documentsList(provider: StorageProvider) {
  const tree = await provider.listFiles();
  const files = flattenTree(tree);
  const docs = [];
  for (const file of files) {
    try {
      const doc = await provider.readFile(file.path);
      docs.push({
        path: doc.path,
        title: doc.title,
        frontmatter: doc.frontmatter,
      });
    } catch {
      // skip unreadable files
    }
  }
  return docs;
}

async function documentsRead(provider: StorageProvider, path: string) {
  if (!path) throw new Error("Missing path parameter");
  const doc = await provider.readFile(path);
  return { path: doc.path, title: doc.title, content: doc.content, frontmatter: doc.frontmatter };
}

async function documentsWrite(provider: StorageProvider, path: string, content: string) {
  if (!path) throw new Error("Missing path parameter");
  if (content === undefined || content === null) throw new Error("Missing content parameter");
  const doc = await provider.writeFile(path, content);
  return { path: doc.path, title: doc.title, sha: doc.sha };
}

async function documentsDelete(provider: StorageProvider, path: string) {
  if (!path) throw new Error("Missing path parameter");
  await provider.deleteFile(path);
  return { deleted: true };
}

async function documentsMove(provider: StorageProvider, oldPath: string, newPath: string) {
  if (!oldPath || !newPath) throw new Error("Missing oldPath or newPath parameter");
  const doc = await provider.moveFile(oldPath, newPath);
  return { path: doc.path, title: doc.title };
}

function search(getSearchFn: () => (query: string) => unknown[], query: string) {
  if (!query) throw new Error("Missing query parameter");
  return getSearchFn()(query);
}

async function tagsList(provider: StorageProvider) {
  const tree = await provider.listFiles();
  const files = flattenTree(tree);
  const tagMap = new Map<string, { count: number; documents: string[] }>();

  for (const file of files) {
    try {
      const doc = await provider.readFile(file.path);
      const tags = doc.frontmatter.tags;
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          const t = String(tag);
          const entry = tagMap.get(t) || { count: 0, documents: [] };
          entry.count++;
          entry.documents.push(doc.path);
          tagMap.set(t, entry);
        }
      }
    } catch {
      // skip
    }
  }

  return Array.from(tagMap.entries()).map(([tag, data]) => ({
    tag,
    count: data.count,
    documents: data.documents,
  }));
}

async function graph(provider: StorageProvider, getFileTree: () => TreeNode[]) {
  const tree = await provider.listFiles();
  const files = flattenTree(tree);
  const allPaths = files.map((f) => f.path);

  const nodes: { id: string; title: string }[] = [];
  const edges: { source: string; target: string }[] = [];

  for (const file of files) {
    try {
      const doc = await provider.readFile(file.path);
      nodes.push({ id: doc.path, title: doc.title });

      const links = extractWikiLinks(doc.content);
      for (const link of links) {
        const target = resolveWikiLinkPath(link.name, allPaths);
        if (target) {
          edges.push({ source: doc.path, target });
        }
      }
    } catch {
      // skip
    }
  }

  return { nodes, edges };
}

async function batch(
  provider: StorageProvider,
  operations: Array<{ method: string; params: Record<string, unknown> }>,
  getFileTree: () => TreeNode[],
  getSearchFn: () => (query: string) => unknown[],
) {
  if (!Array.isArray(operations)) throw new Error("Missing operations array");

  const results = [];
  for (const op of operations) {
    try {
      const result = await dispatch(provider, { id: "", method: op.method, params: op.params || {} }, getFileTree, getSearchFn);
      results.push({ status: "ok", result });
    } catch (err) {
      results.push({ status: "error", error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
  return results;
}
