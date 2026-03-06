"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TabBar } from "@/components/tabs/TabBar";
import { ConnectDialog } from "@/components/connect/ConnectDialog";
import { CommandPalette } from "@/components/command/CommandPalette";
import { ToastContainer } from "@/components/ui/Toast";
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <TabBar />
        <main className="relative flex-1 overflow-y-auto">{children}</main>
        <TableOfContents />
      </div>
      <ConnectDialog />
      <CommandPalette />
      <ToastContainer />

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
