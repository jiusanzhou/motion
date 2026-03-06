export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface MCPResponse {
  id: string;
  result?: unknown;
  error?: { code: number; message: string };
}

/** Envelope used on the relay wire */
export interface RelayMessage {
  type: "request" | "response";
  payload: MCPRequest | MCPResponse;
}

// ── Method constants ──────────────────────────────────────────────
export const MCP_METHODS = {
  DOCUMENTS_LIST: "documents.list",
  DOCUMENTS_READ: "documents.read",
  DOCUMENTS_WRITE: "documents.write",
  DOCUMENTS_DELETE: "documents.delete",
  DOCUMENTS_MOVE: "documents.move",
  SEARCH: "search",
  TAGS_LIST: "tags.list",
  GRAPH: "graph",
  BATCH: "batch",
} as const;

export type MCPMethod = (typeof MCP_METHODS)[keyof typeof MCP_METHODS];
