"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMotionStore } from "@/store";
import { FileTree } from "@/components/file-tree/FileTree";
import { GraphView } from "@/components/graph/GraphView";
import { TagView } from "@/components/tags/TagView";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { templates } from "@/lib/templates";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  PanelLeftClose,
  PanelLeft,
  Github,
  Plus,
  LogOut,
  RefreshCw,
  FilePlus,
  FolderPlus,
  FolderTree,
  Share2,
  Tag,
  ChevronDown,
  FileText,
  Database,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarView } from "@/types";
import { MCPStatusIndicator } from "@/components/mcp/MCPStatus";
import { useMCPStore } from "@/store/mcp";

const viewIcons: Record<SidebarView, React.ReactNode> = {
  files: <FolderTree className="h-4 w-4" />,
  graph: <Share2 className="h-4 w-4" />,
  tags: <Tag className="h-4 w-4" />,
};

const viewLabels: Record<SidebarView, string> = {
  files: "Files",
  graph: "Graph",
  tags: "Tags",
};

export function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    provider,
    repoConfig,
    setConnectDialogOpen,
    disconnectRepo,
    createFile,
    sidebarView,
    setSidebarView,
    savedRepos,
    removeSavedRepo,
    connectRepo,
    cacheInfo,
    clearCache,
  } = useMotionStore();
  const { data: session } = useSession();

  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("motion:sidebar-width");
      return saved ? parseInt(saved, 10) : 240;
    }
    return 240;
  });
  const resizingRef = useRef(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMove = (me: MouseEvent) => {
      if (!resizingRef.current) return;
      const newWidth = Math.min(Math.max(startWidth + me.clientX - startX, 180), 480);
      setSidebarWidth(newWidth);
    };

    const handleUp = () => {
      resizingRef.current = false;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem("motion:sidebar-width", String(sidebarWidth));
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [sidebarWidth]);

  useEffect(() => {
    if (sidebarWidth) {
      localStorage.setItem("motion:sidebar-width", String(sidebarWidth));
    }
  }, [sidebarWidth]);

  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const mcpStatus = useMCPStore((s) => s.status);
  const mcpSessionId = useMCPStore((s) => s.sessionId);
  const mcpAgentCount = useMCPStore((s) => s.agentCount);
  const mcpLogs = useMCPStore((s) => s.logs);

  const workspaceName = repoConfig
    ? `${repoConfig.owner}/${repoConfig.repo}`
    : "Motion";

  const handleNewFile = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const path = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
    createFile(path);
    setNewFileDialogOpen(false);
    setNewName("");
  }, [newName, createFile]);

  const handleNewFolder = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const path = `${trimmed}/.gitkeep`;
    createFile(path);
    setNewFolderDialogOpen(false);
    setNewName("");
  }, [newName, createFile]);

  const handleTemplateFile = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;
      const name = prompt("File name:", templateId === "daily" ? `${new Date().toISOString().split("T")[0]}.md` : "untitled.md");
      if (!name?.trim()) return;
      const path = name.endsWith(".md") ? name : `${name}.md`;
      createFile(path, template.generate());
      setShowTemplates(false);
    },
    [createFile]
  );

  const menuItemClass =
    "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--neutral-700)] outline-none hover:bg-[var(--neutral-100)]";

  return (
    <>

      <aside
        className={cn(
          "relative flex h-screen shrink-0 flex-col border-r border-[var(--neutral-100)] bg-[var(--neutral-50)] transition-all duration-200",
          "max-md:fixed max-md:left-0 max-md:top-0 max-md:z-30",
          !sidebarOpen && "max-md:-translate-x-full md:w-0 md:overflow-hidden md:border-r-0"
        )}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : undefined }}
      >
        {/* Workspace header with multi-repo dropdown */}
        <div className="flex h-12 items-center justify-between px-4">
          {savedRepos.length > 1 ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 text-sm font-semibold text-[var(--neutral-800)] truncate hover:text-[var(--foreground)]">
                  <span className="truncate">{workspaceName}</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[200px] rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-1 shadow-lg"
                  side="bottom"
                  align="start"
                  sideOffset={4}
                >
                  {savedRepos.map((repo) => (
                    <DropdownMenu.Item
                      key={`${repo.owner}/${repo.repo}`}
                      className={cn(
                        menuItemClass,
                        repoConfig?.owner === repo.owner &&
                          repoConfig?.repo === repo.repo &&
                          "font-medium text-[var(--foreground)]"
                      )}
                      onSelect={() => {
                        if (session?.accessToken) {
                          disconnectRepo();
                          connectRepo(repo, session.accessToken).catch(() => {});
                        }
                      }}
                    >
                      <span className="truncate">
                        {repo.owner}/{repo.repo}
                      </span>
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="my-1 h-px bg-[var(--neutral-200)]" />
                  <DropdownMenu.Item
                    className={menuItemClass}
                    onSelect={() => {
                      disconnectRepo();
                      setConnectDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Repository
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <span className="text-sm font-semibold text-[var(--neutral-800)] truncate">
              {workspaceName}
            </span>
          )}
          <div className="flex items-center gap-0.5">
            {provider && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="rounded-md p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-600)] transition-colors"
                    title="New..."
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[160px] rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-1 shadow-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenu.Item
                      className={menuItemClass}
                      onSelect={() => {
                        setNewName("");
                        setNewFileDialogOpen(true);
                      }}
                    >
                      <FilePlus className="h-4 w-4" />
                      New File
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className={menuItemClass}
                      onSelect={() => setShowTemplates(true)}
                    >
                      <FileText className="h-4 w-4" />
                      From Template
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className={menuItemClass}
                      onSelect={() => {
                        setNewName("");
                        setNewFolderDialogOpen(true);
                      }}
                    >
                      <FolderPlus className="h-4 w-4" />
                      New Folder
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-600)] transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View switcher */}
        {provider && (
          <div className="flex items-center gap-0.5 border-b border-[var(--neutral-100)] px-3 pb-1.5">
            {(["files", "graph", "tags"] as SidebarView[]).map((view) => (
              <button
                key={view}
                onClick={() => setSidebarView(view)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                  sidebarView === view
                    ? "bg-[var(--neutral-200)] text-[var(--foreground)]"
                    : "text-[var(--neutral-500)] hover:text-[var(--foreground)]"
                )}
                title={viewLabels[view]}
              >
                {viewIcons[view]}
                <span className="hidden sm:inline">{viewLabels[view]}</span>
              </button>
            ))}
          </div>
        )}

        {/* View content */}
        <div className="flex-1 overflow-y-auto">
          {sidebarView === "files" && <FileTree />}
          {sidebarView === "graph" && <GraphView />}
          {sidebarView === "tags" && <TagView />}
        </div>

        {/* Bottom: MCP status + auth */}
        <div className="flex flex-col gap-1 border-t border-[var(--neutral-100)] p-2">
          {provider && (
            <MCPStatusIndicator
              status={mcpStatus}
              sessionId={mcpSessionId}
              agentCount={mcpAgentCount}
              logs={mcpLogs}
            />
          )}

          {provider && cacheInfo && (
            <div className="flex items-center justify-between rounded-md px-2 py-1 text-xs text-[var(--neutral-500)]">
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {cacheInfo.fileCount} cached
              </span>
              <button
                onClick={() => clearCache()}
                className="rounded p-0.5 hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-700)] transition-colors"
                title="Clear cache"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}

          {!session && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-[var(--neutral-600)]"
              onClick={() => signIn("github")}
            >
              <Github className="h-4 w-4" />
              Sign in with GitHub
            </Button>
          )}

          {session && !provider && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-[var(--neutral-600)]"
              onClick={() => setConnectDialogOpen(true)}
            >
              <Github className="h-4 w-4" />
              Select Repository
            </Button>
          )}

          {session && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] transition-colors">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <Github className="h-4 w-4" />
                  )}
                  <span className="truncate">
                    {session.user?.name ?? session.user?.email ?? "GitHub"}
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[180px] rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-1 shadow-lg"
                  side="top"
                  align="start"
                  sideOffset={4}
                >
                  {provider && (
                    <DropdownMenu.Item
                      className={menuItemClass}
                      onSelect={() => {
                        disconnectRepo();
                        setConnectDialogOpen(true);
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Switch Repository
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item
                    className={menuItemClass}
                    onSelect={() => {
                      disconnectRepo();
                      signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
        {/* Resize handle */}
        {sidebarOpen && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[var(--neutral-300)] active:bg-[var(--neutral-400)] transition-colors z-10"
          />
        )}
      </aside>

      {/* New file dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New File</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNewFile();
            }}
            className="mt-3 flex flex-col gap-3"
          >
            <Input
              placeholder="path/to/filename.md"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewFileDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newName.trim()}>
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New folder dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNewFolder();
            }}
            className="mt-3 flex flex-col gap-3"
          >
            <Input
              placeholder="folder-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewFolderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newName.trim()}>
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New from Template</DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex flex-col gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateFile(t.id)}
                className="flex flex-col items-start rounded-lg border border-[var(--neutral-200)] p-3 text-left transition-colors hover:bg-[var(--neutral-100)]"
              >
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.name}
                </span>
                <span className="text-xs text-[var(--neutral-500)]">
                  {t.description}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
