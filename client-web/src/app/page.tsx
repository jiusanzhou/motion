"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { trackEvent } from "@/lib/analytics";

const Editor = dynamic(() => import("@/components/editor/Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-neutral-400">Loading editor...</div>
    </div>
  ),
});

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [checked, setChecked] = useState(false);
  const loginTrackedRef = useRef(false);

  // Track GitHub login success once per browser session
  useEffect(() => {
    if (status === "authenticated" && !loginTrackedRef.current) {
      loginTrackedRef.current = true;
      const key = "motion:login-tracked";
      if (!sessionStorage.getItem(key)) {
        trackEvent("github_login_success");
        sessionStorage.setItem(key, "1");
      }
    }
  }, [status]);

  useEffect(() => {
    // If user has repo config in localStorage, they've used the app before — let them in
    const hasRepoConfig = !!localStorage.getItem("motion:repo-config");

    if (status === "loading") {
      // While loading, if they have local config, show the app immediately
      if (hasRepoConfig) {
        setChecked(true);
      }
      return;
    }

    if (status === "unauthenticated" && !hasRepoConfig) {
      router.replace("/welcome");
    } else {
      setChecked(true);
    }
  }, [status, router]);

  if (!checked) {
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
