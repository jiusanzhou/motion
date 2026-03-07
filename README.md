<div align="right">

[English](/README.md) | [中文](/docs/README_ZH.md)

</div>

<div align="center">

<img src="client-web/public/logo.svg" alt="Motion" width="200" />

<br />
<br />

**Agent-friendly knowledge base editor. Pure frontend. Your data, your control.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/jiusanzhou/motion?style=flat&color=yellow)](https://github.com/jiusanzhou/motion/stargazers)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jiusanzhou/motion/pulls)

🌐 **Live Demo: [motion.wencai.app](https://motion.wencai.app)**

---

</div>

## What is Motion?

Motion is a **pure-frontend** Notion-style knowledge base editor with a built-in AI agent interface. Your data is stored in a GitHub repo as plain markdown — no backend, no vendor lock-in, no data leaving your browser.

Unlike cloud-based tools, Motion gives you:
- **Full data ownership** — your GitHub repo is your database
- **AI-native architecture** — a built-in MCP Server lets any AI agent read and write your knowledge base via WebSocket
- **Zero infra** — deploy to Vercel in one click, or just run locally

## Screenshots

> Screenshots below show the main editor, AI Chat panel, knowledge graph, and version history.

| Editor | AI Chat |
|--------|---------|
| ![Editor](docs/assets/screenshot-editor.png) | ![AI Chat](docs/assets/screenshot-ai-chat.png) |

| Knowledge Graph | Version History |
|-----------------|-----------------|
| ![Graph](docs/assets/screenshot-graph.png) | ![History](docs/assets/screenshot-history.png) |

<!-- To update screenshots: take them at 1280×800, save to docs/assets/ -->

## Why Motion?

| | Motion | Notion | Obsidian |
|--|--------|--------|----------|
| Data ownership | ✅ GitHub repo | ❌ Cloud | ✅ Local files |
| AI agent access | ✅ MCP WebSocket | ❌ | ❌ |
| Zero backend | ✅ | ❌ | ✅ |
| Collaborative | ✅ via Git | ✅ | ❌ |
| Self-hosted | ✅ | ❌ | N/A |
| Free | ✅ | Freemium | Freemium |

## Features

- 🧠 **Agent-Friendly MCP Server** — AI agents connect via WebSocket and can list, read, write, search, and traverse your knowledge graph
- 🔒 **Privacy First** — OAuth tokens never leave the browser; data stored in your own GitHub repo
- 📝 **Block Editor** — Notion-style BlockNote editor: slash commands, drag & drop blocks, markdown shortcuts
- 🔗 **Bidirectional Links** — `[[wiki-links]]` with automatic backlink indexing and a force-directed knowledge graph
- 🏷️ **Tags & Frontmatter** — Structured YAML frontmatter, tag cloud, and semantic organization
- 🌗 **Dark Mode** — Light / Dark / System with `Cmd+K` command palette
- 📂 **GitHub Storage** — Read/write to any GitHub repo via Octokit — commits are your version history
- 🕰️ **Version History** — Full commit history with diff preview and one-click rollback
- 🔍 **Full-Text Search** — Fuzzy search across all files with Fuse.js
- 📑 **Multi-Tab Editing** — Tabs with unsaved indicators, drag-to-reorder, and keyboard shortcuts
- 🗂️ **Table of Contents** — Auto-generated sticky TOC with scroll-position highlighting
- 📱 **PWA + Mobile** — Installable, offline-capable, responsive layout

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
git clone https://github.com/jiusanzhou/motion.git
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

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjiusanzhou%2Fmotion&env=GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,NEXTAUTH_SECRET,NEXTAUTH_URL)

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

## Storage Backends

Motion uses a **pluggable StorageProvider** interface. Currently supported:

| Backend | Status | Description |
|---------|--------|-------------|
| **GitHub** | ✅ Stable | Read/write markdown files to any GitHub repo via Octokit |
| **Local/IndexedDB** | ✅ Cache | Offline-first caching layer with incremental sync |
| **S3 / WebDAV** | 🗓️ Planned | Community contributions welcome |

Your GitHub repo **is** your database — standard markdown files with YAML frontmatter, organized however you like.

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
