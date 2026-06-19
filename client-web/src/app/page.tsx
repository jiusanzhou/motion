import type { Metadata } from "next";
import { LandingView } from "@/components/landing/LandingView";
import { EditorBoot } from "@/components/landing/EditorBoot";

const title = "Motion — Agent-Friendly Knowledge Base, Backed by GitHub";
const description =
  "Motion is a pure-frontend knowledge editor where AI agents and humans collaborate. Your notes live in a GitHub repo you own — Markdown-native, MIT-licensed, no server, no vendor lock-in.";
const url = "https://motion.wencai.app";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "agent friendly knowledge base",
    "github knowledge base",
    "notion alternative",
    "obsidian alternative",
    "markdown editor",
    "MCP server",
    "open source wiki",
  ],
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "Motion",
    type: "website",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "Motion — Agent-Friendly Knowledge Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/logo-512.png"],
  },
};

export default function Home() {
  return (
    <>
      {/* Server-rendered landing page — always present in the HTML for SEO. */}
      <LandingView />
      {/* Client-side gate that overlays the editor for authenticated/returning users. */}
      <EditorBoot />
    </>
  );
}
