// Plausible analytics — production-only, no-ops when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is unset.

declare global {
  interface Window {
    plausible?: ((
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void) & { q?: unknown[] };
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return;
  window.plausible?.(event, props ? { props } : undefined);
}
