# Contributing to Motion

Thanks for considering a contribution. Motion is a community-driven editor — every Issue, PR, and screenshot of your knowledge base makes it better.

## TL;DR

- **Bug?** → [Open an issue](https://github.com/jiusanzhou/motion/issues/new?template=bug_report.md) with reproduction steps + browser console output.
- **Feature idea?** → [Start a discussion](https://github.com/jiusanzhou/motion/discussions/categories/ideas) first.
- **First-time contributor?** → Look for issues tagged [`good first issue`](https://github.com/jiusanzhou/motion/labels/good%20first%20issue).
- **Maintainer response SLA:** Initial reply within **24 hours**.

---

## Ways to Contribute

| Type | Effort | Where to start |
|---|---|---|
| 🐛 Bug report | 5 min | [Bug template](.github/ISSUE_TEMPLATE/bug_report.md) |
| 📝 Docs fix (typo, clarification) | 10 min | Edit on GitHub → PR directly |
| 🎨 Screenshot of your knowledge base | 5 min | Post in [Show and Tell](https://github.com/jiusanzhou/motion/discussions/categories/show-and-tell) |
| 🌐 Translation (i18n) | 1 h | See `client-web/messages/` |
| 🔌 New storage backend (GitLab / Gitea / S3) | half day | See `client-web/lib/storage/` |
| 🤖 MCP tool / agent integration | half day | See `mcp-server/` + `docs/MCP_PROTOCOL.md` |
| ✨ New BlockNote block | half day | See `client-web/components/editor/blocks/` |
| 🎨 Theme / export theme | half day | See `client-web/lib/export/` and `client-web/lib/themes/` |

---

## Development Setup

```bash
# Prerequisites: Node 20+ and pnpm 9+

git clone https://github.com/jiusanzhou/motion.git
cd motion

# Install all workspaces (client-web + mcp-server + relay-worker)
pnpm install

# Start the editor in dev mode (port 3000)
cd client-web
pnpm dev

# Start the MCP server (separate terminal, port 8787)
cd mcp-server
pnpm dev
```

Open http://localhost:3000 — you can use the in-browser IndexedDB store without configuring GitHub.

### Connecting to GitHub

1. Create a fine-grained Personal Access Token with read/write access to a private repo
2. In the Motion UI: Settings → Storage → GitHub
3. Paste token + repo name; the first save creates the directory layout

### Running tests

```bash
cd client-web
pnpm typecheck      # TypeScript type-check
pnpm lint           # ESLint
pnpm build          # Production build (catches more than typecheck)
```

---

## Submitting a Pull Request

1. **Fork** the repo and create a topic branch off `main`:
   ```bash
   git checkout -b feat/your-feature-name      # or fix/, docs/, ui/
   ```
2. **Write the smallest reproduction** — Motion is a UI app; a 5-line repro is worth more than a paragraph of description.
3. **Keep PRs focused.** One concern per PR.
4. **Conventional commits** preferred:
   - `feat(editor): add callout block`
   - `fix(github): retry on 502 from PUT contents`
   - `ui: tighten sidebar spacing on narrow viewports`
   - `docs: clarify how to connect a private repo`
   - `i18n(zh-CN): translate settings page`
5. **Open the PR** with:
   - What the change does (1 paragraph)
   - Before/after screenshot for UI changes (please!)
   - How you verified it
6. **For UI changes:** include a **before/after screenshot** or screen recording. The reviewer will love you.

---

## Code Style

- **TypeScript:** strict mode. `any` is a code smell — comment why if you must.
- **React:** function components only. Hooks for state.
- **CSS:** Tailwind utilities. New design tokens go in `client-web/tailwind.config.ts`.
- **State:** Zustand for app-level, React local state for component-level. No Redux.
- **Editor:** BlockNote-based — read their docs before extending block types.

---

## Architecture Pointers

| You want to change... | Look here |
|---|---|
| Editor blocks / block UI | `client-web/components/editor/` |
| Sidebar / navigation | `client-web/components/sidebar/` |
| GitHub storage layer | `client-web/lib/storage/github.ts` |
| Other storage backends | `client-web/lib/storage/` |
| Search / indexing | `client-web/lib/search/` |
| MCP server (WebSocket) | `mcp-server/` |
| Export themes (HTML/PDF) | `client-web/lib/export/` and `client-web/lib/themes/` |
| Relay worker (Cloudflare) | `relay-worker/` |
| i18n strings | `client-web/messages/{en,zh-CN}.json` |

---

## Reporting Security Issues

**Do not open public issues for security vulnerabilities.** Email `security@zoe.im` with details, and we'll respond within 48 hours.

For privacy-sensitive bugs (data leakage between users, token exposure in client logs, etc.), this matters extra — Motion's value proposition is data ownership.

---

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating you agree to uphold it.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE) that covers the project.
