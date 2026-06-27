# Product Hunt Launch

> **Ship date:** Tuesday (PH peak day), 12:01 AM Pacific Time.
> Submit at least **7 days in advance** for the "Coming Soon" page that builds anticipation.

## Tagline (≤60 chars)

> ✅ `An AI-native Notion alternative. Your data lives in GitHub.`

Variants tested mentally:
- `Notion-style editor, AI agents built in, no backend` — 50 chars, descriptive
- `The knowledge base that talks to AI — and you own it` — 51 chars, emotional
- `Markdown notes in GitHub. AI agents via MCP. Zero infra.` — 56 chars, technical

## Description (≤260 chars)

> Motion is a pure-frontend Notion alternative. Your notes live in your GitHub repo as markdown — no backend, no vendor lock-in. An AI agent can read and write your knowledge base via a built-in MCP WebSocket server. One-click deploy to Vercel.

## Gallery (5 images, 1280×800)

In order of importance:

1. **Hero shot** — editor with sidebar + a knowledge graph in the corner. The single most important image.
2. **AI Chat panel** — agent answering a question grounded in the user's notes. Caption: "AI agents read your knowledge base via MCP."
3. **Knowledge graph** — force-directed visualization. Caption: "Bidirectional links + auto-indexed backlinks."
4. **GitHub storage** — Settings panel showing repo connection. Caption: "Your data, your repo, your rules."
5. **Version history** — commit list with diff preview. Caption: "Every save is a commit. Roll back anything."

**Critical:** all screenshots should look *finished*, not in-progress. Crop tightly, dummy data should be realistic ("Project plans", "Meeting notes", not "lorem ipsum").

## Maker comment (post at 12:05 AM PT, right after launch)

> Hi Product Hunt! I'm Zoe, the maker of Motion.
>
> I built this because I wanted a Notion-style editor I could trust with my long-term notes. Cloud tools lock you in. Local-only tools (Obsidian, Logseq) are great but sharing between devices needs a sync layer. And none of them let an AI agent actually read and write my knowledge base.
>
> Motion is a pure-frontend app. Your notes are markdown files in your own GitHub repo — that's your version history, your sync layer, your backup, your collaboration layer. There's a built-in MCP server (WebSocket) so any agent that speaks the Model Context Protocol can list / read / write / search your notes.
>
> Try it live: **motion.wencai.app** (in-browser store, no GitHub needed to start).
>
> What I'm hoping you'll tell me:
> - Is the GitHub-as-database trade-off (great for ownership, weaker for real-time collab) the right call for your use case?
> - What's missing for it to become your daily driver?
> - Which MCP-speaking agent would you connect first?
>
> Repo: https://github.com/jiusanzhou/motion (MIT)
> Happy to answer everything.

## Hunter selection

Decide **before submitting**:
- (A) Self-hunt — simplest, full control, doesn't require asking
- (B) Get a known hunter (e.g., **Chris Messina**, **Kevin William David**, **Bram Kanstein**) — multiplies reach but is a relationship ask. Only if you've genuinely interacted with them.

Default: **self-hunt**. Don't burn social capital cold-asking strangers to hunt.

## Pre-launch (T-7 days)

- [ ] Submit "Coming Soon" page with hero image and tagline
- [ ] Share Coming Soon link on Twitter / personal channels — builds the "Notify me" list
- [ ] Set up Product Hunt notifications via Discord or email
- [ ] Polish landing page (motion.wencai.app) — first impressions die fast
- [ ] Add a "Featured on Product Hunt" badge slot in README (will fill in launch day)

## Launch day timing (Pacific Time)

| Time | Action |
|---|---|
| 12:01 AM PT | PH auto-publishes from queue |
| 12:05 AM PT | Maker comment goes up |
| 12:10 AM PT | Pin tweet about it |
| 12:30 AM PT | Share in 3-5 relevant Slack/Discord communities |
| Throughout | Respond to every comment within 30 min |
| 8 AM PT | First Reddit post if PH momentum is strong |

## Anti-patterns to avoid

- ❌ Asking friends to upvote without commenting — PH detects vote rings
- ❌ Posting from a brand-new PH account — looks like astroturfing, lower default reach
- ❌ Stuffing the gallery with marketing copy instead of UI
- ❌ Replying defensively to negative feedback — say "fair, tracking as issue #N" and move on
- ❌ Pinning the "buy now / hosted version" CTA on PH — they're skeptical of upsells in maker comments

## Realistic expectations

- **Top 5 of the day:** ambitious but possible for a polished OSS Notion alternative
- **Top 10:** realistic with the AI angle differentiating
- **100–500 upvotes:** solid signal, will drive a few thousand visitors over 48 hours
- **5–15 new GitHub stars per 100 PH upvotes:** ratio for non-developer-targeted products

The point isn't the trophy — it's the **persistent traffic** PH sends for months after launch from the product directory and from "best of" lists.
