# Show HN: Motion

> **Title:** `Show HN: Motion – Notion-style editor where notes live in your GitHub repo`

Secondary channel (after Product Hunt). The HN audience is interested in the **technical** angle: pure-frontend, MCP server, BlockNote, GitHub-as-DB trade-offs.

## Body

Hi HN — I'm Zoe. I've been building [**Motion**](https://github.com/jiusanzhou/motion) for the past few months and it's at the point where I'd love feedback from this crowd.

**The problem.** I want a Notion-style block editor I can trust with my long-term notes. Cloud editors lock you in. Local-only editors (Obsidian, Logseq) are great but device sync is a separate (paid) problem, and none of them let an AI agent actually read and write my notes without ad-hoc plugin gymnastics.

**Motion is a pure-frontend Notion alternative.** Notes are markdown files in your own GitHub repo. The browser is the runtime. GitHub is the database, version control, sync layer, and access control all at once.

**The bits HN might find interesting:**

1. **No backend.** It's a Next.js static site. Your OAuth token never leaves the browser; the only network calls are Octokit → GitHub API. Deploy is a Vercel one-click.
2. **Built-in MCP server (WebSocket).** Any agent that speaks the Model Context Protocol can connect and perform `list_pages`, `read_page`, `write_page`, `search`, `traverse_links`. The relay worker (Cloudflare-friendly) terminates the WebSocket; agent traffic to GitHub still goes through the user's browser-held token via a postMessage bridge, so the server never sees note contents.
3. **BlockNote editor.** Slash commands, drag-and-drop blocks, markdown shortcuts. Extending it with new block types is a single React component plus a markdown serializer.
4. **Bidirectional links + force-directed graph.** `[[wiki-links]]` indexed in IndexedDB, rendered via d3-force. Click any node to navigate.
5. **Every save is a Git commit.** Diff preview, one-click rollback. Branching for "what-if" knowledge bases is a feature, not a hack.
6. **PWA + offline-capable.** IndexedDB cache so you can edit without network and sync when reconnected.

**Trade-offs (explicit):**
- ❌ No real-time multiplayer editing (Notion's killer feature). Git collaboration via PRs is the model — works great for async, not for two cursors on one page.
- ❌ GitHub API rate limits are real if you save every keystroke. Motion batches saves with a 2s debounce + on-blur.
- ❌ Files larger than ~1 MB hit GitHub Contents API limits; Motion currently warns and skips.

**What works today** (try it: https://motion.wencai.app):
- ✅ Full editor with all block types, slash commands, markdown shortcuts
- ✅ GitHub OAuth + repo connection + read/write
- ✅ MCP server (WebSocket) — connect via `ws://your-host/mcp`
- ✅ Search (Fuse.js), tags, frontmatter, TOC
- ✅ Knowledge graph
- ✅ Version history with diff
- ✅ Dark mode, command palette, multi-tab editing
- ✅ PDF/HTML export with theme support (incl. a Kami-inspired Paper theme)

Repo: https://github.com/jiusanzhou/motion (MIT)

**What I'd love HN feedback on:**

1. Is the GitHub-as-DB trade-off (great for ownership, weaker for real-time multiplayer) the right call for your use case? Or would IPFS / Solid / a Pi-hosted CouchDB feel better?
2. The MCP integration — what would your agent want to do with your notes that the current tools (list/read/write/search/traverse) don't cover?
3. PWA UX on iOS — Safari's PWA story is rough; anyone shipping a serious one with workarounds I should steal?

Happy to dig into the architecture, the MCP server implementation, the BlockNote integration, the GitHub-storage rate-limiting strategy, or anything else.

## Response playbook

Same as Prism. Pre-rehearsed objection responses:

1. *"Why GitHub and not Git directly?"* — GitHub's Contents API gives us per-file access with web-friendly auth (OAuth). Raw Git over HTTPS in the browser would need a service worker proxy and is much heavier. Plus everyone already has a GitHub account.
2. *"Why not just Obsidian + Sync?"* — Two reasons: (a) Obsidian sync costs money and is closed; Motion's "sync" is free and is just your GitHub repo. (b) Obsidian's plugin model is the opposite of agent-native — you'd need to build an integration per agent. MCP standardizes that.
3. *"What about real-time collab?"* — Genuine trade-off. We're not solving multiplayer; we're betting most knowledge work is async and PR-based collab fits better. If your use case is two people on one page simultaneously, Notion is still the answer.
4. *"Privacy of OAuth tokens?"* — Token is in browser localStorage scoped to the Motion origin. Same security model as any SPA that uses OAuth. If you're paranoid, fine-grained PATs with repo scope only.
