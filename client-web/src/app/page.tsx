"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";

const Editor = dynamic(() => import("@/components/editor/Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-neutral-400">Loading editor...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <AppShell>
      <Editor />
    </AppShell>
  );
}
