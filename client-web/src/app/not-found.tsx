"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/welcome");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background)]">
      <div className="text-sm text-[var(--neutral-400)]">Redirecting...</div>
    </div>
  );
}
