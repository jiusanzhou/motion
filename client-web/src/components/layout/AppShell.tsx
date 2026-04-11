"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TabBar } from "@/components/tabs/TabBar";
import { ConnectDialog } from "@/components/connect/ConnectDialog";
import { CommandPalette } from "@/components/command/CommandPalette";
import { ToastContainer } from "@/components/ui/Toast";
import { AISettingsDialog } from "@/components/ai/AISettingsDialog";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { AIFloatingMenu } from "@/components/ai/AIFloatingMenu";
import { TableOfContents } from "@/components/outline/TableOfContents";
import { useMotionStore } from "@/store";
import { useThemeStore } from "@/store/theme";
import { useSearchStore } from "@/store/search";
import { flattenTree } from "@/lib/tree-utils";
import { useMCPServer } from "@/hooks/useMCPServer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { provider, connectRepo, getSavedRepoConfig, fileTree, sidebarOpen } =
    useMotionStore();

  // Initialize theme on mount
  useThemeStore();

  // Start MCP WebSocket server
  useMCPServer();

  // Auto-reconnect on page load if we have a session + saved repo config
  useEffect(() => {
    if (!session?.accessToken || provider) return;
    const saved = getSavedRepoConfig();
    if (!saved) return;
    connectRepo(saved, session.accessToken).catch(() => {});
  }, [session?.accessToken, provider, connectRepo, getSavedRepoConfig]);

  // Build search index lazily — only index file names/paths from tree
  // Full content indexing happens on-demand when search is used
  useEffect(() => {
    if (!provider || fileTree.length === 0) return;

    const files = flattenTree(fileTree);
    const docs = files.map((file) => ({
      path: file.path,
      title: file.name.replace(/\.md$/, ""),
      content: "",
    }));
    useSearchStore.getState().buildIndex(docs);
  }, [provider, fileTree]);

  // Online / offline detection + auto-sync
  useEffect(() => {
    const store = useMotionStore.getState;

    function handleOnline() {
      store().setIsOnline(true);
      // Auto-sync pending writes when coming back online
      store().syncPending();
    }

    function handleOffline() {
      store().setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <TabBar />
        <main id="motion-scroll-container" className="relative flex-1 overflow-y-auto">
          <div className="flex items-stretch min-h-full">
            <div className="flex-1 min-w-0">{children}</div>
            <TableOfContents />
          </div>
        </main>
      </div>
      <ConnectDialog />
      <CommandPalette />
      <ToastContainer />
      <AISettingsDialog />
      <AIChatPanel />
      <AIFloatingMenu />

      {/* Mobile overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => useMotionStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
