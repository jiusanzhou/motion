# Pre-Launch Checklist

## 24h Before — Repo Hygiene

### Must-have files (at repo root)
- [x] `README.md` — Quick Start, Why Motion, Comparison table, Live Demo prominent
- [x] `LICENSE` (MIT) — was missing prior to this PR
- [x] `CONTRIBUTING.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `.github/ISSUE_TEMPLATE/{bug_report,feature_request,question}.md` + config
- [x] `.github/PULL_REQUEST_TEMPLATE.md` — includes screenshot ask for UI changes
- [ ] `CHANGELOG.md` — would be nice but not blocking
- [x] `ROADMAP.md` linked from README

### Live demo sanity (timed)
- [ ] motion.wencai.app loads in <2s on a cold visit
- [ ] In-browser IndexedDB store works (no GitHub needed)
- [ ] GitHub OAuth flow completes end-to-end on a fresh account
- [ ] All sample blocks (slash commands) work
- [ ] Knowledge graph renders without console errors
- [ ] Export to PDF works (Paper theme + default theme)
- [ ] PWA install works on iOS Safari, Android Chrome, desktop Chrome

### GitHub repo settings
- [x] Description: "Agent-friendly knowledge base editor. Pure frontend. Your data, your control."
- [ ] Topics (currently only `zoe-lab`): add `nextjs`, `react`, `blocknote`, `notion-alternative`, `obsidian-alternative`, `knowledge-base`, `markdown`, `mcp`, `model-context-protocol`, `github-storage`, `pwa`, `pkm`
- [ ] Homepage URL: https://motion.wencai.app (verify it's set)
- [ ] **Discussions enabled** (Announcements / Ideas / Q&A / Show and Tell)
- [ ] **Sponsor button** optional — GitHub Sponsors
- [ ] **Dependabot alerts enabled** (currently disabled per `gh api`)

### Issue triage prep
- [ ] At least **5 `good first issue`** with clear scope:
  - [ ] Add a 'callout' block type to the editor
  - [ ] Internationalize the settings page (en + zh-CN)
  - [ ] Add 'export to PDF with my own font' option
  - [ ] Show GitHub rate-limit usage in the UI
  - [ ] Add keyboard shortcut for 'jump to backlink'
- [ ] At least **3 `help wanted`** for medium effort:
  - [ ] GitLab / Gitea storage backend
  - [ ] Real-time presence (cursor positions) over WebSocket
  - [ ] iOS Safari PWA improvements
- [ ] Pin roadmap issue

### Pre-launch screenshots
- [ ] Take fresh 1280×800 screenshots (Editor / AI Chat / Graph / History) with realistic dummy data
- [ ] Save originals to `docs/assets/` for the README
- [ ] Crop variants for Product Hunt gallery (1280×800)
- [ ] Twitter share image (1200×630) — use the `og-image` API at /api/og

---

## Launch Day (Product Hunt + cross-channel)

### Pacific Time schedule (Tuesday is best)
- **12:01 AM PT** — PH auto-publishes from queued submission
- **12:05 AM PT** — Maker comment posted
- **12:10 AM PT** — Twitter announcement (pinned)
- **12:30 AM PT** — Share in 3-5 relevant communities (Discord/Slack you're in)
- **2:00 AM PT** — First check-in, reply to all comments
- **8:00 AM PT** — If PH momentum strong, r/PKMS post
- **10:00 AM PT** — Second check-in
- **2:00 PM PT** — End-of-day summary comment on PH

### Anti-patterns
- ❌ Asking friends to upvote without commenting — PH detects vote rings
- ❌ Cross-posting identical text to multiple subreddits same day
- ❌ Hype words in Reddit titles
- ❌ Defensive replies to negative feedback
- ❌ Pinning a "buy now" CTA in the PH maker comment

---

## Day 2-7

- **Day 2:** r/PKMS + r/ObsidianMD posts (different framings)
- **Day 3:** Show HN + r/LocalLLaMA (MCP angle)
- **Day 4:** r/Notion + r/selfhosted
- **Day 5:** Newsletter submissions (PKM Weekly, TLDR AI, Console)
- **Day 6:** Blogger outreach emails (5, personalized)
- **Day 7:** Retrospective post on Discussions ("Here's what we heard, here's what's next")

---

## Metrics to Track (Week 1)

| Metric | Target |
|---|---|
| PH upvotes | 200–500 (top 10 day) |
| GitHub stars | 200–800 |
| Demo site uniques | 2 000–10 000 |
| GitHub OAuth completions | 50–200 (real users connecting their repos) |
| Issues filed | 10–30 |
| Discussions started | 5–15 |
| MCP integrations announced by others | **1 = huge win** |

**Most important number:** GitHub OAuth completions. That = real users trusting Motion with their notes. Stars are vanity; OAuth is commitment.
