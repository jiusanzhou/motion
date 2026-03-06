"use client";

import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "motion:theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(THEME_KEY) as Theme) ?? "system";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = loadTheme();
  const resolved = initial === "system" ? getSystemTheme() : initial;

  // Listen for system theme changes
  if (typeof window !== "undefined") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      const state = useThemeStore.getState();
      if (state.theme === "system") {
        const newResolved = getSystemTheme();
        applyTheme("system");
        set({ resolved: newResolved });
      }
    });
    // Apply on init
    applyTheme(initial);
  }

  return {
    theme: initial,
    resolved,
    setTheme: (theme) => {
      localStorage.setItem(THEME_KEY, theme);
      const newResolved = theme === "system" ? getSystemTheme() : theme;
      applyTheme(theme);
      set({ theme, resolved: newResolved });
    },
  };
});
