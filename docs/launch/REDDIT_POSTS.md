# Reddit Posts

Motion's audience is **PKM-shaped**, not infra-shaped. The high-value subs are r/PKMS, r/ObsidianMD, r/Notion. r/LocalLLaMA is the technical second wave.

## r/PKMS  (largest PKM community)

**Title:** `Motion – an open-source Notion alternative where your notes live in your own GitHub repo`

**Body:**

Hi r/PKMS — I built this because I bounced between Notion (data lock-in) and Obsidian (great, but sync was a separate subscription) and never quite settled. [**Motion**](https://github.com/jiusanzhou/motion) is my attempt at "what if your notes were just markdown files in a GitHub repo, but you got a Notion-style block editor on top of them?"

What you get:
- 🟢 **Block editor** — slash commands, drag-and-drop blocks, markdown shortcuts (BlockNote-based)
- 🟢 **Your data, in your repo** — every save is a Git commit, full version history, no vendor backend
- 🟢 **Bidirectional links + knowledge graph** — `[[wiki-links]]` with force-directed visualization
- 🟢 **AI agent integration** — built-in MCP server lets any agent read/write your notes (more about this in a separate post for r/LocalLLaMA)
- 🟢 **PWA + offline** — install as an app, edit without network, sync when reconnected
- 🟢 **Free, MIT, no signup** — try it without an account at [motion.wencai.app](https://motion.wencai.app)

What it's *not* trying to be:
- ❌ A real-time multiplayer editor (Git PR workflow is the model)
- ❌ A graph-first thinking tool like Roam / Logseq (graph is a view, not the source of truth)
- ❌ A sync-everything-across-devices product (GitHub is the sync — that's the point)

I'd love feedback specifically from r/PKMS on:
- Does the "every save is a commit" workflow match how you actually edit, or is it noisy?
- What's the workflow you'd want for daily/weekly notes? (currently it's just files; could be smarter)
- Anything you miss from Obsidian/Logseq that I should prioritize?

Live demo (no account needed): https://motion.wencai.app
Repo (MIT): https://github.com/jiusanzhou/motion

---

## r/ObsidianMD

**Title:** `Built a web-based Notion-style editor that uses your GitHub repo as the vault — would love Obsidian users' feedback`

**Body:**

Hi r/ObsidianMD — long-time Obsidian user, just open-sourced [**Motion**](https://github.com/jiusanzhou/motion). Not trying to replace Obsidian (the desktop-first, plugin-rich UX is hard to beat), but I'm curious what Obsidian users think about this trade-off:

Motion uses **GitHub** instead of a local vault. Every save commits to your repo. You get version history "for free", sync "for free" (just push/pull), and AI agents can talk to your notes via a built-in MCP server.

The trade-offs vs Obsidian:
- ❌ Browser-based, so you depend on your browser working (mitigated by PWA + IndexedDB cache for offline)
- ❌ Plugin ecosystem doesn't exist (yet — though MCP integration is a different shape of extensibility)
- ❌ Performance on huge vaults (10k+ notes) is untested — Obsidian is rock solid here
- ✅ Sync is just `git pull` — no Obsidian Sync subscription
- ✅ Version history is the entire commit log, not a paid plugin
- ✅ Sharing a note is "make this folder public on GitHub Pages"
- ✅ An LLM agent can read/write your vault out of the box (MCP WebSocket)

Specifically interested in feedback from people who tried Obsidian → Notion → back, or who paid for Obsidian Sync and weren't thrilled with it. What would make this a real alternative for your workflow?

Live demo: https://motion.wencai.app
Repo (MIT): https://github.com/jiusanzhou/motion

---

## r/Notion

**Title:** `Open-source Notion alternative for people who want to own their data`

**Body:**

Hi r/Notion — heavy Notion user for years, recently built [**Motion**](https://github.com/jiusanzhou/motion) because I wanted the Notion UX but with my data in **my own GitHub repo** instead of Notion's cloud.

What's there:
- ✅ Block editor that feels like Notion's (slash commands, drag-and-drop blocks, etc.)
- ✅ Page hierarchy, tags, search, dark mode, command palette
- ✅ PWA — installable, offline-capable
- ✅ AI integration via MCP (so an LLM can actually read/write your notes)
- ✅ Free + MIT-licensed

What's *not* there (yet):
- ❌ Real-time multiplayer (Git PR-style collab works, simultaneous-cursor doesn't)
- ❌ Databases / linked tables (on the roadmap)
- ❌ Notion Calendar / Notion AI integration

If you've been on the fence about Notion's data ownership story, give Motion a try (no signup needed for the local-only store): https://motion.wencai.app

Would love feedback from r/Notion specifically on: what's the *one Notion feature* you'd need before Motion could become your daily driver?

Repo: https://github.com/jiusanzhou/motion

---

## r/LocalLLaMA

**Title:** `[Project] Motion – a Notion-style editor with a built-in MCP server, so your LLM can read/write your notes`

**Body:**

Cross-posting from r/PKMS with the MCP/LLM angle specifically.

[**Motion**](https://github.com/jiusanzhou/motion) is a pure-frontend Notion alternative I built. The thing that might interest r/LocalLLaMA: it has a **built-in MCP server (WebSocket)** so any agent that speaks the Model Context Protocol can:

- `list_pages` — get the page tree
- `read_page(path)` — read markdown + frontmatter
- `write_page(path, content)` — create or update a page (commits to GitHub)
- `search(query)` — fuzzy search across the vault
- `traverse_links(page)` — follow `[[wiki-links]]` and backlinks

So you can plug it into Claude Desktop, Cursor, Cline, or any home-grown agent. The agent gets a real, persistent, version-controlled knowledge base. Use cases I've personally validated:
- Daily journaling agent that writes notes for me as we converse
- Research agent that pulls quotes from existing notes and writes new ones
- Code-context agent that maintains a personal "engineering wiki" alongside my codebases

The relay worker terminates the WebSocket; agent → GitHub traffic goes through the user's browser-held token via postMessage, so the server never sees note contents.

Repo (MIT): https://github.com/jiusanzhou/motion
Live demo: https://motion.wencai.app

Looking specifically for r/LocalLLaMA feedback on:
- Which agent did you connect first? What MCP tool was missing?
- For local-only models, what's the lowest-friction way you'd want to wire this up?
- Would you want the agent to be able to traverse the knowledge graph (already there) or do more semantic search (not there yet)?

---

## r/selfhosted

**Title:** `Motion – self-hosted Notion alternative with zero backend (notes live in your GitHub repo)`

**Body:**

For r/selfhosted: [Motion](https://github.com/jiusanzhou/motion) is interesting because it's "self-hostable" but there's almost nothing to host. Architecture is:

- **Editor:** Next.js static site → deploy anywhere (Vercel, Cloudflare Pages, Netlify, an Nginx + S3 bucket, etc.)
- **Data:** Your GitHub repo (or self-hosted Gitea with a small storage-backend PR)
- **Optional: MCP server** for AI integration — a single Cloudflare Worker or Node process

No database to back up. No server to update. No "did I rotate the secret rotation script". Your "backup" is your Git remote.

Self-hosting checklist:
- ✅ Frontend: one-click Vercel, or Docker (`docker run -p 3000:3000 ghcr.io/jiusanzhou/motion`)
- ✅ Storage: GitHub (free for unlimited private repos)
- ✅ MCP relay: Cloudflare Worker (free tier sufficient for personal use), or Node
- ✅ TLS, auth, backup: all delegated to GitHub
- ⚠️ DNS / custom domain: standard reverse-proxy setup

Anyone here hosting a knowledge base + AI agent integration and would consider switching? What's your current stack? Always curious what r/selfhosted is running.

Repo: https://github.com/jiusanzhou/motion
