<div align="right">

[English](/README.md) | [中文](/docs/README_ZH.md)

</div>

<div align="center">

<img src="client-web/public/logo.svg" alt="Motion" width="240" />

<br />

**Agent-friendly knowledge base editor. Pure frontend. Your data, your control.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/nicepkg/motion/pulls)

---

</div>

## What is Motion?

Motion is a **pure-frontend** Notion-style knowledge base editor. Data never touches a server — it's persisted through pluggable storage backends (GitHub first). AI agents can read and write your knowledge base directly via WebSocket using the built-in MCP Server.

<!-- Screenshot placeholder -->
<!-- ![Motion Screenshot](docs/assets/screenshot.png) -->

## Features

- 🧠 **Agent-Friendly** — Built-in MCP Server lets AI agents read/write your knowledge base via WebSocket
- 🔒 **Privacy First** — Tokens never leave the browser; data stays entirely under your control
- 📝 **Block Editor** — Notion-style BlockNote editor with slash commands, drag & drop, and markdown
- 🔗 **Bidirectional Links** — `[[wiki-links]]` with a force-directed knowledge graph
- 🏷️ **Tags & Metadata** — Structured frontmatter, tag cloud, and semantic organization
- 🌗 **Dark Mode** — Light / Dark / System theme with Cmd+K command palette
- 📂 **GitHub Storage** — Read/write directly to GitHub repos via Octokit — your repo is your database
- 🕰️ **Version History** — Full commit history with preview and rollback
- 🔍 **Full-Text Search** — Fuzzy search across files with Fuse.js
- 📑 **Multi-Tab Editing** — Tabs with unsaved indicators, drag reorder, and keyboard shortcuts

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────┐    │
│  │ BlockNote │  │  Zustand   │  │  MCP Server (WS)  │◄───── AI Agent
│  │  Editor   │  │   Store    │  │  read/write docs  │    │
│  └────┬─────┘  └─────┬─────┘  └────────┬──────────┘    │
│       │              │                  │               │
│       └──────────────┼──────────────────┘               │
│                      │                                  │
│            ┌─────────▼──────────┐                       │
│            │  StorageProvider    │                       │
│            │  (pluggable)       │                       │
│            └─────────┬──────────┘                       │
│                      │                                  │
│            ┌─────────▼──────────┐                       │
│            │  IndexedDB Cache   │                       │
│            └─────────┬──────────┘                       │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTPS (Octokit)
              ┌────────▼────────┐
              │   GitHub API    │
              │  (repos/files)  │
              └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- A [GitHub OAuth App](https://github.com/settings/developers)

### 1. Clone & Install

```bash
git clone https://github.com/nicepkg/motion.git
cd motion/client-web
pnpm install
```

### 2. Configure GitHub OAuth

Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers):

- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3000/api/auth/callback/github`

Then create `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_random_secret   # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in with GitHub, connect a repo, and start writing.

## Storage Backends

Motion uses a **pluggable StorageProvider** interface. Currently supported:

| Backend | Status | Description |
|---------|--------|-------------|
| **GitHub** | ✅ Stable | Read/write markdown files to any GitHub repo via Octokit |
| **Local/IndexedDB** | ✅ Cache | Offline-first caching layer with incremental sync |
| **S3 / WebDAV** | 🗓️ Planned | Community contributions welcome |

Your GitHub repo **is** your database — standard markdown files with YAML frontmatter, organized however you like.

## Agent / MCP Integration

Motion runs an **MCP (Model Context Protocol) Server** inside the browser, exposed via WebSocket:

```
ws://localhost:3000/mcp
```

AI agents can:
- **List** all documents in the knowledge base
- **Read** document content (markdown + frontmatter)
- **Create / Update / Delete** documents
- **Search** by tags, full-text, or graph traversal
- **Query** the knowledge graph (backlinks, related pages)

This turns your browser into a live knowledge API that any MCP-compatible agent can connect to.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19 |
| Editor | BlockNote |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Auth | NextAuth (GitHub OAuth) |
| Storage | Octokit (GitHub API) |
| Search | Fuse.js |
| Graph | d3-force, react-force-graph-2d |
| WebSocket | ws (MCP relay) |

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full development plan and progress.

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)
