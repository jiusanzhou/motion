"use client";

/**
 * EditorBoot — client-side gate that decides whether to render the editor
 * SPA on top of the SSR landing page.
 *
 * Rendering rules:
 *   - Authenticated session         → mount editor
 *   - Has localStorage repo config  → mount editor (returning user)
 *   - Otherwise                     → render nothing, leave SSR landing visible
 *
 * The landing markup stays in the DOM until this component mounts the editor,
 * so search engines and first-time visitors always see the SEO content.
 */

import { useEffect, useRef, useState } from "react";
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

export function EditorBoot() {
  const { status } = useSession();
  const [shouldRenderEditor, setShouldRenderEditor] = useState(false);
  const loginTrackedRef = useRef(false);

  // Track GitHub login success once per browser session
  useEffect(() => {
    if (status === "authenticated" && !loginTrackedRef.current) {
      loginTrackedRef.current = true;
      const key = "motion:login-tracked";
      if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
        trackEvent("github_login_success");
        sessionStorage.setItem(key, "1");
      }
    }
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasRepoConfig = !!localStorage.getItem("motion:repo-config");

    // Returning users with local config get the editor immediately,
    // even before NextAuth finishes resolving the session.
    if (hasRepoConfig) {
      setShouldRenderEditor(true);
      return;
    }

    if (status === "loading") {
      return;
    }

    if (status === "authenticated") {
      setShouldRenderEditor(true);
    }
    // Unauthenticated visitors see the SSR landing page (rendered by parent).
  }, [status]);

  if (!shouldRenderEditor) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)]">
      <AppShell>
        <Editor />
      </AppShell>
    </div>
  );
}
