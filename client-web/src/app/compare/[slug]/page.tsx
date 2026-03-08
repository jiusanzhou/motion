import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Slug = "notion-alternative" | "obsidian-alternative" | "logseq-alternative";

interface CompareRow {
  feature: string;
  motion: string;
  other: string;
  note?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface PageData {
  slug: Slug;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  subheading: string;
  intro: string;
  competitor: string;
  rows: CompareRow[];
  benefits: { title: string; description: string }[];
  faqs: FAQ[];
  keywords: string[];
}

const pages: Record<Slug, PageData> = {
  "notion-alternative": {
    slug: "notion-alternative",
    seoTitle: "motion vs Notion — Free Notion Alternative with GitHub Storage",
    metaDescription:
      "Looking for a free Notion alternative? motion stores your notes in your own GitHub repo — no vendor lock-in, no subscription, no server. Open-source and MIT licensed.",
    h1: "The Notion Alternative That Gives You Back Your Data",
    subheading: "Free, open-source, GitHub-backed. Your knowledge base, your rules.",
    intro:
      "Notion is a powerful workspace tool — but your data lives on Notion's servers. When you stop paying, or if Notion changes pricing, your years of notes are at risk. motion takes the opposite approach: every file is a plain Markdown document stored in a GitHub repository you own. No subscriptions, no vendor lock-in, no proprietary format. Just clean Markdown that lives forever in your repo.",
    competitor: "Notion",
    rows: [
      {
        feature: "Data ownership",
        motion: "Your GitHub repo",
        other: "Notion servers",
        note: "motion has zero vendor lock-in",
      },
      {
        feature: "Price",
        motion: "Completely free (MIT)",
        other: "Free tier + paid plans",
        note: "motion is free forever",
      },
      {
        feature: "Backend required",
        motion: "None — pure frontend",
        other: "Notion servers",
        note: "motion runs 100% in the browser",
      },
      {
        feature: "File format",
        motion: "Standard Markdown (.md)",
        other: "Proprietary Notion format",
        note: "motion files work with any editor",
      },
      {
        feature: "AI features",
        motion: "Built-in RAG + MCP server",
        other: "Paid Notion AI add-on",
        note: "motion AI works with your own API key",
      },
      {
        feature: "Open source",
        motion: "✅ MIT License",
        other: "❌ Closed source",
        note: "",
      },
      {
        feature: "Offline support",
        motion: "✅ PWA + IndexedDB cache",
        other: "Limited",
        note: "",
      },
      {
        feature: "Self-hostable",
        motion: "✅ Deploy anywhere",
        other: "❌ SaaS only",
        note: "",
      },
      {
        feature: "Version history",
        motion: "Full Git history",
        other: "Paid tier only",
        note: "Every save is a git commit",
      },
      {
        feature: "Agent collaboration",
        motion: "✅ Built-in MCP server",
        other: "API (paid)",
        note: "AI agents write directly to your repo",
      },
    ],
    benefits: [
      {
        title: "Your data in Git — forever",
        description:
          "Every note is a Markdown file committed to your GitHub repository. You can switch editors, clone it locally, run grep on your entire knowledge base, or back it up with a single git clone. No export, no migration, no format conversion needed.",
      },
      {
        title: "No subscription, no lock-in",
        description:
          "motion is free and MIT licensed. There is no premium tier, no per-seat pricing, and no feature that requires a credit card. Open-source means the software is yours even if the hosted version disappears.",
      },
      {
        title: "AI agents collaborate in real time",
        description:
          "motion ships with a built-in MCP (Model Context Protocol) server. Claude, GPT-4, and other agents can connect via WebSocket and read or write your notes alongside you — without any copy-paste or context window juggling.",
      },
      {
        title: "Block editor, clean Markdown output",
        description:
          "The editor looks and feels like Notion — slash commands, drag-and-drop blocks, inline formatting — but every block renders to standard Markdown. Open any file in VS Code, Obsidian, or any text editor and it looks exactly as expected.",
      },
    ],
    faqs: [
      {
        question: "Is motion really free?",
        answer:
          "Yes. motion is MIT-licensed open-source software. There is no paid tier. You can self-host it or use the hosted version at motion.wencai.app at no cost.",
      },
      {
        question: "Can I import my Notion pages into motion?",
        answer:
          "You can export your Notion workspace as Markdown (Notion Settings → Export → Markdown & CSV), then commit those files to a GitHub repository and connect motion to it. Most Notion content translates well to Markdown.",
      },
      {
        question: "Does motion support databases like Notion?",
        answer:
          "motion is a document editor built around the knowledge graph model — wiki-links, backlinks, and a graph view. It does not replicate Notion's database/table features. If you rely heavily on Notion databases, motion may not be a full replacement yet.",
      },
      {
        question: "What happens to my data if the motion website goes down?",
        answer:
          "Your data is in your GitHub repo, not on motion's servers. You can always access your files directly through GitHub, clone them locally, or use any other Markdown editor. Nothing is lost if the hosted app is unavailable.",
      },
      {
        question: "Does motion work without an internet connection?",
        answer:
          "motion is a Progressive Web App (PWA) with IndexedDB caching. Previously loaded files are available offline, and changes are queued for sync when connectivity returns.",
      },
    ],
    keywords: ["free notion alternative", "notion alternative self-hosted", "open source notion", "notion alternative github"],
  },

  "obsidian-alternative": {
    slug: "obsidian-alternative",
    seoTitle: "motion vs Obsidian — Browser-Based Knowledge Base",
    metaDescription:
      "Need Obsidian in the browser? motion is an online Obsidian alternative with GitHub sync, built-in AI, and real-time collaboration — no desktop app required.",
    h1: "Obsidian Without the Sync Headache",
    subheading: "A browser-based knowledge base with wiki-links, graph view, and AI — all backed by your GitHub repo.",
    intro:
      "Obsidian is beloved for local-first Markdown editing and its powerful graph view. But syncing across devices costs $8/month, sharing with others is cumbersome, and you need a desktop or mobile app installed everywhere. motion gives you the same Markdown-native, wiki-link, knowledge-graph experience — entirely in the browser, synced through GitHub, with built-in AI that works across all your devices without installing anything.",
    competitor: "Obsidian",
    rows: [
      {
        feature: "Access",
        motion: "Any browser, any device",
        other: "Desktop & mobile app required",
        note: "motion is a PWA — works on any OS",
      },
      {
        feature: "Sync",
        motion: "Free via GitHub",
        other: "$8/month Obsidian Sync",
        note: "motion uses Git as the sync layer",
      },
      {
        feature: "Collaboration",
        motion: "GitHub-based, multi-user",
        other: "Limited without Sync",
        note: "Standard pull requests for review",
      },
      {
        feature: "AI integration",
        motion: "Built-in RAG + MCP server",
        other: "Third-party plugins only",
        note: "motion AI agents write directly to notes",
      },
      {
        feature: "Installation",
        motion: "None — open in browser",
        other: "Desktop & mobile apps",
        note: "",
      },
      {
        feature: "File format",
        motion: "Standard Markdown (.md)",
        other: "Standard Markdown (.md)",
        note: "Both use standard Markdown",
      },
      {
        feature: "Wiki-links & backlinks",
        motion: "✅ Full [[wiki-link]] support",
        other: "✅ Full [[wiki-link]] support",
        note: "",
      },
      {
        feature: "Knowledge graph",
        motion: "✅ Force-directed graph",
        other: "✅ Built-in graph view",
        note: "",
      },
      {
        feature: "Price",
        motion: "Free (MIT)",
        other: "Free app, paid sync",
        note: "Obsidian Sync $8/month",
      },
      {
        feature: "Open source",
        motion: "✅ MIT License",
        other: "❌ Closed source",
        note: "",
      },
    ],
    benefits: [
      {
        title: "Browser-native — no install required",
        description:
          "Open motion.wencai.app in any browser and you have a full-featured knowledge base editor. No desktop app download, no mobile app installation, no platform restrictions. Works on Windows, Mac, Linux, iPad, and Android out of the box.",
      },
      {
        title: "Free sync via GitHub",
        description:
          "Obsidian Sync costs $8/month to keep your vault in sync across devices. motion uses your GitHub repo as the sync layer — it is free, versioned, and gives you a full git history of every change. Every save is a commit.",
      },
      {
        title: "AI agents that actually write",
        description:
          "motion ships with a built-in MCP server so AI agents (Claude, GPT-4, etc.) can connect and write directly into your knowledge base. No copy-pasting from chat windows — your AI collaborator edits notes like a teammate.",
      },
      {
        title: "Same Markdown, same wiki-links",
        description:
          "If you already use Obsidian, your vault is already compatible with motion. Connect motion to the same GitHub repo, and your [[wiki-links]], backlinks, and graph view all work exactly as before.",
      },
    ],
    faqs: [
      {
        question: "Can I use my existing Obsidian vault with motion?",
        answer:
          "Yes. Push your Obsidian vault to a GitHub repository, then connect motion to that repo. Your Markdown files, [[wiki-links]], and folder structure are all preserved. motion reads and writes standard Markdown.",
      },
      {
        question: "Does motion support Obsidian plugins?",
        answer:
          "motion does not support the Obsidian plugin ecosystem. It has its own built-in features: MCP server for AI, block editor, graph view, and backlinks. If you rely on specific Obsidian plugins, check whether those features are built into motion first.",
      },
      {
        question: "Is motion good for daily notes and journaling?",
        answer:
          "Yes. motion supports creating new Markdown files for any date or topic, with backlinks and graph connections forming automatically as you write [[links]] to other notes.",
      },
      {
        question: "Does motion work on mobile?",
        answer:
          "motion is a Progressive Web App (PWA). You can add it to your home screen on iOS and Android for a near-native experience. It is optimized for keyboard-centric use on desktop but works on mobile browsers.",
      },
      {
        question: "Can I use motion without GitHub?",
        answer:
          "Currently motion uses GitHub as the storage and sync backend. Support for other Git providers (GitLab, Gitea) and local filesystem (via File System Access API) is on the roadmap.",
      },
    ],
    keywords: ["obsidian web", "obsidian alternative online", "obsidian browser", "obsidian alternative free"],
  },

  "logseq-alternative": {
    slug: "logseq-alternative",
    seoTitle: "motion vs Logseq — Web-Based Logseq Alternative",
    metaDescription:
      "Looking for a Logseq alternative that works in the browser? motion is a free, open-source knowledge base with GitHub storage, wiki-links, and built-in AI. No Electron, no sync issues.",
    h1: "The Logseq Alternative Built for the Web",
    subheading: "Block editor, wiki-links, GitHub-backed. No Electron app required.",
    intro:
      "Logseq is a powerful outliner-style PKM tool — but it's primarily a desktop Electron app with complex sync setup. motion takes the browser-first approach: everything runs in your browser tab, your notes live in a GitHub repo you own, and there's no app to install or sync plugin to configure.",
    competitor: "Logseq",
    rows: [
      { feature: "Platform", motion: "Browser-based (PWA)", other: "Electron desktop app", note: "motion works on any device with a browser" },
      { feature: "Sync", motion: "GitHub repo (built-in)", other: "Git plugin required", note: "motion sync is zero-config" },
      { feature: "Data format", motion: "Standard Markdown", other: "Custom EDN/Markdown", note: "motion files portable to any editor" },
      { feature: "Wiki-links", motion: "✅ [[page links]] + graph", other: "✅ Core feature", note: "" },
      { feature: "AI integration", motion: "✅ Built-in RAG + MCP", other: "⚠️ Plugin only", note: "" },
      { feature: "Price", motion: "Free (MIT)", other: "Free (source-available)", note: "" },
      { feature: "Open source", motion: "✅ MIT", other: "⚠️ Source-available", note: "" },
      { feature: "Mobile support", motion: "✅ Responsive PWA", other: "⚠️ Limited", note: "" },
    ],
    benefits: [
      { title: "No app to install", description: "motion runs entirely in your browser. Open a tab, start writing. Works on any device — laptop, tablet, phone." },
      { title: "Zero-config sync", description: "Your notes sync to a GitHub repo automatically. No sync plugin, no iCloud setup, no Dropbox." },
      { title: "Built-in AI", description: "Ask questions across all your notes with motion's built-in RAG. No plugin installation required." },
      { title: "Standard Markdown", description: "motion uses plain .md files. Your notes are readable by any editor, forever." },
    ],
    faqs: [
      { question: "Can motion replace Logseq for daily note-taking?", answer: "Yes. motion supports block editing, wiki-links [[like this]], tags, and a knowledge graph — the core workflows Logseq users rely on." },
      { question: "Does motion support bidirectional links like Logseq?", answer: "Yes, motion supports [[wiki-links]] with backlinks and a visual graph view of your knowledge base." },
      { question: "Is motion free like Logseq?", answer: "Yes, motion is completely free and MIT-licensed open source. There are no paid tiers or subscriptions." },
      { question: "How does motion sync notes without a Logseq-style git plugin?", answer: "motion stores all notes directly in a GitHub repository you specify. Sync is handled automatically via the GitHub API — no plugin or git client needed." },
    ],
    keywords: ["logseq alternative", "logseq web", "logseq online", "logseq browser", "logseq replacement", "logseq free alternative"],
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = pages[slug as Slug];
  if (!data) return {};

  const canonicalUrl = `https://motion.wencai.app/compare/${slug}`;

  return {
    title: data.seoTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.seoTitle,
      description: data.metaDescription,
      url: canonicalUrl,
      siteName: "Motion",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.seoTitle,
      description: data.metaDescription,
    },
  };
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-500">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
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

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = pages[slug as Slug];
  if (!data) notFound();

  const canonicalUrl = `https://motion.wencai.app/compare/${slug}`;

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Motion",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A pure-frontend knowledge editor where AI agents and humans collaborate. Your data lives in GitHub — private, versioned, and always under your control.",
    url: "https://motion.wencai.app",
    license: "https://opensource.org/licenses/MIT",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Logo />
          <span className="text-base font-semibold tracking-tight">Motion</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-[var(--neutral-500)] transition-colors hover:text-[var(--foreground)]"
          >
            Home
          </Link>
          <Link
            href="/welcome"
            className="rounded-lg bg-[var(--foreground)] px-4 py-1.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-5xl px-6 py-2">
        <nav aria-label="breadcrumb" className="text-xs text-[var(--neutral-400)]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/compare" className="hover:text-[var(--foreground)]">Compare</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--neutral-600)]">{data.competitor} Alternative</li>
          </ol>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, var(--neutral-100) 0%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-14 text-center md:pt-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-1.5 text-xs font-medium text-[var(--neutral-600)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            motion vs {data.competitor}
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            {data.h1}
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-[var(--neutral-500)]">
            {data.subheading}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/welcome"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
            >
              Try motion Free
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="https://github.com/jiusanzhou/motion"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--neutral-200)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--neutral-100)]"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 pb-12">
        <p className="text-base leading-relaxed text-[var(--neutral-600)]">{data.intro}</p>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-center md:text-3xl">
          motion vs {data.competitor}: Side-by-Side Comparison
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--neutral-200)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--neutral-200)] bg-[var(--neutral-50)]">
                  <th className="px-5 py-3.5 text-left font-semibold text-[var(--neutral-600)]">
                    Feature
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      motion
                    </span>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-[var(--neutral-500)]">
                    {data.competitor}
                  </th>
                  <th className="hidden px-5 py-3.5 text-left font-semibold text-[var(--neutral-400)] md:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[var(--neutral-200)] transition-colors hover:bg-[var(--neutral-50)] ${
                      i === data.rows.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 font-medium text-[var(--neutral-700)]">
                      {row.feature}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--foreground)]">{row.motion}</td>
                    <td className="px-5 py-3.5 text-[var(--neutral-500)]">{row.other}</td>
                    <td className="hidden px-5 py-3.5 text-xs text-[var(--neutral-400)] md:table-cell">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-[var(--neutral-200)] bg-[var(--neutral-50)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-4 text-center text-2xl font-bold tracking-tight md:text-3xl">
            Why choose motion over {data.competitor}?
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-[var(--neutral-500)]">
            Built for developers and AI agents who think in Markdown
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {data.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-[var(--neutral-200)] bg-[var(--background)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--neutral-300)] hover:shadow-md hover:shadow-black/5"
              >
                <div className="mb-2 flex items-start gap-2">
                  <CheckIcon />
                  <h3 className="text-sm font-semibold leading-snug">{benefit.title}</h3>
                </div>
                <p className="pl-6 text-sm leading-relaxed text-[var(--neutral-500)]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-10 text-center text-2xl font-bold tracking-tight md:text-3xl">
          Frequently Asked Questions
        </h2>
        <dl className="space-y-8">
          {data.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="mb-2 text-base font-semibold">{faq.question}</dt>
              <dd className="text-sm leading-relaxed text-[var(--neutral-500)]">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--neutral-200)] bg-[var(--neutral-50)]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
            Ready to try the {data.competitor} alternative?
          </h2>
          <p className="mb-8 text-[var(--neutral-500)]">
            motion is free and open-source. Sign in with GitHub, connect a repo, and your knowledge base is live in seconds.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/welcome"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
            >
              Get Started Free
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--neutral-200)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--neutral-100)]"
            >
              Learn more about motion
            </Link>
          </div>
        </div>
      </section>

      {/* Internal links footer */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--neutral-400)]">
          <Link href="/" className="transition-colors hover:text-[var(--foreground)]">motion Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/welcome" className="transition-colors hover:text-[var(--foreground)]">Features</Link>
          <span aria-hidden="true">·</span>
          {slug !== "notion-alternative" && (
            <Link href="/compare/notion-alternative" className="transition-colors hover:text-[var(--foreground)]">
              motion vs Notion
            </Link>
          )}
          {slug !== "obsidian-alternative" && (
            <Link href="/compare/obsidian-alternative" className="transition-colors hover:text-[var(--foreground)]">
              motion vs Obsidian
            </Link>
          )}
          {slug !== "logseq-alternative" && (
            <Link href="/compare/logseq-alternative" className="transition-colors hover:text-[var(--foreground)]">
              motion vs Logseq
            </Link>
          )}
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/jiusanzhou/motion"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--neutral-200)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-[var(--neutral-400)]">
          <span>MIT License · motion</span>
          <Link href="/" className="transition-colors hover:text-[var(--foreground)]">
            motion.wencai.app
          </Link>
        </div>
      </footer>
    </div>
  );
}
