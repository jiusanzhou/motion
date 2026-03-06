"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const REPO_CONFIG_KEY = "motion:repo-config";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const config = localStorage.getItem(REPO_CONFIG_KEY);
    if (!config) {
      router.replace("/welcome");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--neutral-400)]">Loading...</div>
      </div>
    );
  }

  return (
    <AppShell>
      <Editor />
    </AppShell>
  );
}
