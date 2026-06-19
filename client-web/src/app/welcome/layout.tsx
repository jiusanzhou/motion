import type { Metadata } from "next";

const title = "Sign in to Motion — Agent-Friendly Knowledge Base";
const description =
  "Sign in with GitHub to start using Motion: a pure-frontend, AI-friendly knowledge editor backed by a GitHub repo you own.";
const url = "https://motion.wencai.app/welcome";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "Motion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
