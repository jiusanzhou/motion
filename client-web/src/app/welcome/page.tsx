import Link from "next/link";

function Logo() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
      <path
        d="M14 46 C22 10, 38 10, 44 36 C48 52, 56 44, 54 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.2"
      />
      <circle cx="18" cy="40" r="6.5" fill="currentColor" />
      <circle cx="38" cy="24" r="6.5" fill="currentColor" />
      <circle cx="54" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="23.5" y1="37" x2="32.5" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="43.5" y1="26" x2="49.5" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5v1l3 2.5M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5v1l-3 2.5" />
        <circle cx="12" cy="18" r="4" />
      </svg>
    ),
    title: "Agent-Friendly",
    description: "Built-in MCP Server. AI agents read and write your knowledge base via WebSocket in real time.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Privacy First",
    description: "Pure frontend — tokens never leave the browser. Your data stays entirely under your control.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84.84-2.873a2 2 0 0 1 .506-.852z" />
      </svg>
    ),
    title: "Block Editor",
    description: "Notion-style BlockNote editor with slash commands, drag & drop blocks, and full Markdown support.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    title: "GitHub Storage",
    description: "Your GitHub repo is your database. Standard Markdown files synced via Octokit with offline caching.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <line x1="8.5" y1="7.5" x2="10.5" y2="16" />
        <line x1="15.5" y1="7.5" x2="13.5" y2="16" />
        <line x1="9" y1="6" x2="15" y2="6" />
      </svg>
    ),
    title: "Knowledge Graph",
    description: "Bidirectional [[wiki-links]] with a force-directed graph to visualize connections between pages.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    title: "Dark Mode",
    description: "Light, dark, and system themes. Cmd+K command palette for fast navigation and actions.",
  },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Motion</span>
        </div>
        <a
          href="https://github.com/jiusanzhou/motion"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--neutral-500)] transition-colors hover:text-[var(--foreground)]"
        >
          GitHub
        </a>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-1.5 text-xs font-medium text-[var(--neutral-600)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Open Source &middot; MIT License
        </div>
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Agent-Friendly
          <br />
          <span className="text-[var(--neutral-400)]">Knowledge Base</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[var(--neutral-500)] md:text-lg">
          A pure-frontend knowledge editor where AI agents and humans collaborate.
          Your data lives in GitHub — private, versioned, and always under your control.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/api/auth/signin/github"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Get Started
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </a>
          <a
            href="https://github.com/jiusanzhou/motion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--neutral-200)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--neutral-50)]"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="overflow-hidden rounded-xl border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-6 md:p-8">
          <pre className="overflow-x-auto text-center text-xs leading-relaxed text-[var(--neutral-600)] md:text-sm">
{`     ┌──────────────────────────────┐
     │          Browser             │
     │                              │
     │   Editor ←→ Store ←→ MCP    │◄── AI Agent (WebSocket)
     │              │               │
     │        StorageProvider       │
     │              │               │
     │        IndexedDB Cache      │
     └──────────────┼───────────────┘
                    │
             GitHub API (HTTPS)`}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">
          Everything you need
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-6 transition-colors hover:border-[var(--neutral-300)]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--neutral-100)] text-[var(--neutral-600)]">
                {feature.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--neutral-500)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--neutral-200)] bg-[var(--neutral-50)]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mb-8 text-[var(--neutral-500)]">
            Sign in with GitHub and connect a repo to start building your knowledge base.
          </p>
          <a
            href="/api/auth/signin/github"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Launch Motion
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--neutral-200)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-[var(--neutral-400)]">
          <span>MIT License</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jiusanzhou/motion"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              GitHub
            </a>
            <Link href="/welcome" className="transition-colors hover:text-[var(--foreground)]">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
