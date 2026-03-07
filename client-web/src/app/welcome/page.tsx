"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

function handleGitHubSignIn() {
  trackEvent("github_login_click");
  signIn("github", { callbackUrl: "/" });
}

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

/* ── Icons ── */
function GitHubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
    </svg>
  );
}

/* ── Editor Mockup ── */
function EditorMockup() {
  return (
    <div className="mx-auto mt-12 max-w-3xl px-4 md:mt-16">
      <div className="overflow-hidden rounded-xl border border-[var(--neutral-200)] bg-[var(--neutral-50)] shadow-lg shadow-black/5 dark:shadow-black/20">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-[var(--neutral-200)] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-3 flex gap-0.5">
            <span className="rounded-t-md border border-b-0 border-[var(--neutral-200)] bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
              README.md
            </span>
            <span className="rounded-t-md border border-b-0 border-transparent px-3 py-1 text-xs text-[var(--neutral-400)]">
              notes.md
            </span>
          </div>
        </div>
        {/* Body */}
        <div className="flex min-h-[220px] md:min-h-[280px]">
          {/* Sidebar */}
          <div className="hidden w-44 shrink-0 border-r border-[var(--neutral-200)] bg-[var(--neutral-50)] p-3 text-xs text-[var(--neutral-500)] sm:block">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-400)]">
              Files
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 rounded px-1.5 py-1 bg-[var(--neutral-100)] font-medium text-[var(--foreground)]">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
                </svg>
                README.md
              </div>
              <div className="flex items-center gap-1.5 rounded px-1.5 py-1">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
                </svg>
                notes.md
              </div>
              <div className="flex items-center gap-1.5 rounded px-1.5 py-1">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
                </svg>
                ideas/
              </div>
              <div className="flex items-center gap-1.5 rounded px-1.5 py-1 pl-5">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]">
                  <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25z" />
                </svg>
                project.md
              </div>
            </div>
          </div>
          {/* Editor area */}
          <div className="flex-1 p-4 md:p-6">
            <div className="space-y-3 font-mono text-sm leading-relaxed">
              <div className="text-xl font-bold text-[var(--foreground)]">
                # My Knowledge Base
              </div>
              <div className="text-[var(--neutral-500)]">
                Welcome to my personal wiki powered by <span className="rounded bg-[var(--neutral-100)] px-1 py-0.5 text-[var(--foreground)]">Motion</span>.
              </div>
              <div className="text-base font-semibold text-[var(--foreground)]">
                ## Quick Links
              </div>
              <div className="text-[var(--neutral-500)]">
                - <span className="text-emerald-600 dark:text-emerald-400">[[Project Notes]]</span> — Current projects
              </div>
              <div className="text-[var(--neutral-500)]">
                - <span className="text-emerald-600 dark:text-emerald-400">[[Reading List]]</span> — Books and articles
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--neutral-400)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Synced with GitHub &middot; 2 seconds ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature Data ── */
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

const steps = [
  {
    number: "1",
    title: "Connect",
    description: "Sign in with GitHub and pick a repository",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Edit",
    description: "Write in a Notion-style block editor, your Markdown stays clean",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84.84-2.873a2 2 0 0 1 .506-.852z" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Collaborate",
    description: "AI agents connect via MCP to read and write alongside you",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const stats = [
  { value: "100%", label: "Frontend", description: "No server, no vendor lock-in" },
  { value: "< 200KB", label: "Bundle", description: "Lightweight & fast" },
  { value: "MIT", label: "Licensed", description: "Free forever" },
];

/* ── Page ── */
export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Motion</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/jiusanzhou/motion"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--neutral-500)] transition-colors hover:text-[var(--foreground)]"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          <button
            onClick={handleGitHubSignIn}
            className="rounded-lg bg-[var(--foreground)] px-4 py-1.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Grid pattern background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, var(--neutral-100) 0%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6 pb-8 pt-16 text-center md:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-1.5 text-xs font-medium text-[var(--neutral-600)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open Source &middot; MIT License
          </div>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Agent-Friendly
            <br />
            <span className="text-[var(--neutral-400)]">Knowledge Base</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[var(--neutral-500)] md:text-lg">
            A pure-frontend knowledge editor where AI agents and humans collaborate.
            Your data lives in GitHub — private, versioned, and always under your control.
          </p>

          {/* Sign-in card */}
          <div className="relative mx-auto inline-block">
            {/* Glow effect behind card */}
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 blur-xl" />
            <div className="relative rounded-xl border border-[var(--neutral-200)] bg-[var(--background)] p-6 shadow-sm">
              <p className="mb-4 text-sm font-medium text-[var(--neutral-600)]">
                Get started in seconds
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <button
                  onClick={handleGitHubSignIn}
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
                >
                  <GitHubIcon className="h-4.5 w-4.5" />
                  Continue with GitHub
                  <ArrowRightIcon />
                </button>
                <div className="relative">
                  <button
                    disabled
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-6 py-2.5 text-sm font-medium text-[var(--neutral-400)] opacity-60 cursor-not-allowed sm:w-auto"
                  >
                    <GoogleIcon className="h-4.5 w-4.5 grayscale" />
                    Continue with Google
                  </button>
                  <span className="absolute -right-2 -top-2 rounded-full bg-[var(--neutral-200)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--neutral-500)]">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Mockup */}
        <EditorMockup />

        {/* Bottom fade */}
        <div className="h-16" />
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--neutral-200)] bg-[var(--neutral-50)]">
        <div className="mx-auto grid max-w-4xl grid-cols-1 divide-y divide-[var(--neutral-200)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{stat.label}</div>
              <div className="mt-1 text-xs text-[var(--neutral-500)]">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight md:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mb-14 max-w-lg text-center text-[var(--neutral-500)]">
          Three steps to your AI-powered knowledge base
        </p>
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {/* Connector line (hidden on mobile & last item) */}
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute right-0 top-10 hidden h-px w-6 bg-[var(--neutral-200)] sm:block translate-x-full" />
              )}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--neutral-100)] text-[var(--neutral-600)]">
                {step.icon}
              </div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Step {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-[var(--neutral-500)]">
                {step.description}
              </p>
            </div>
          ))}
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
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight md:text-3xl">
          Everything you need
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-[var(--neutral-500)]">
          Built for developers and AI agents who think in Markdown
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--neutral-300)] hover:shadow-md hover:shadow-black/5"
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
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">Ready to get started?</h2>
          <p className="mb-8 text-[var(--neutral-500)]">
            Sign in with GitHub and connect a repo to start building your knowledge base.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={handleGitHubSignIn}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
            >
              <GitHubIcon className="h-4 w-4" />
              Launch Motion
              <ArrowRightIcon />
            </button>
            <a
              href="https://github.com/jiusanzhou/motion"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--neutral-200)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--neutral-100)]"
            >
              <GitHubIcon className="h-4 w-4" />
              View Source
            </a>
          </div>
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
