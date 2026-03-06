# Motion MCP Server

Connects Claude Desktop (or any MCP client) to Motion's browser-based knowledge base.

## Architecture

```
Claude Desktop ←stdio→ motion-mcp ←WebSocket→ Motion Relay ←WebSocket→ Browser (MCP Handler)
```

## Setup

### 1. Start Motion locally

```bash
cd client-web && pnpm dev
```

### 2. Open Motion in browser

Go to `http://localhost:3000`, sign in, and connect a GitHub repo.

### 3. Add to Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "motion": {
      "command": "npx",
      "args": ["tsx", "/path/to/motion/mcp-server/src/index.ts"],
      "env": {
        "MOTION_RELAY_URL": "ws://localhost:3000/api/relay",
        "MOTION_SESSION_ID": "claude-desktop"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|---|---|
| `list_documents` | List all documents (optional `prefix` filter) |
| `read_document` | Read a document by path |
| `write_document` | Create or update a document |
| `delete_document` | Delete a document |
| `move_document` | Move/rename a document |
| `search` | Full-text search |
| `list_tags` | List all tags |
| `get_graph` | Get knowledge graph |

## Environment Variables

- `MOTION_RELAY_URL` — WebSocket relay URL (default: `ws://localhost:3000/api/relay`)
- `MOTION_SESSION_ID` — Session ID for relay (default: `claude-desktop`)
