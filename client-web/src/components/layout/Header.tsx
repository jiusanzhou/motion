"use client";

import { useMotionStore, type EditorWidth, type ViewMode } from "@/store";
import { useThemeStore } from "@/store/theme";
import { useAIStore } from "@/store/ai";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  ChevronRight,
  Save,
  MoreHorizontal,
  Trash2,
  Columns2,
  Circle,
  Sun,
  Moon,
  Monitor,
  Eye,
  Edit3,
  Menu,
  Bot,
  Settings2,
  Download,
  FileText,
  FileCode,
  FileType,
  Image,
  Braces,
  AlignLeft,
  Printer,
  WifiOff,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  idle: "",
  saving: "Saving...",
  saved: "Saved",
  error: "Save failed",
};

const WIDTH_OPTIONS: { value: EditorWidth; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full width" },
];

const dropdownContentClass =
  "z-50 min-w-[140px] rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-1 shadow-lg";
const dropdownItemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-[var(--neutral-100)]";

export function Header() {
  const {
    currentDoc,
    saveStatus,
    saveCurrentDoc,
    deleteFile,
    dirty,
    editorWidth,
    setEditorWidth,
    viewMode,
    setViewMode,
    sidebarOpen,
    toggleSidebar,
    isOnline,
    pendingWriteCount,
    syncPending,
  } = useMotionStore();
  const { theme, setTheme } = useThemeStore();

  const breadcrumbs = currentDoc?.path.split("/") ?? [];

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--neutral-100)] px-4 bg-[var(--background)]">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-sm text-[var(--neutral-500)]">
        {/* Sidebar toggle */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mr-2 shrink-0 rounded-md p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)]"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {breadcrumbs.map((part, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
            <span
              className={cn(
                "truncate",
                i === breadcrumbs.length - 1
                  ? "text-[var(--foreground)] font-medium"
                  : "text-[var(--neutral-400)]"
              )}
            >
              {part}
            </span>
          </span>
        ))}
        {currentDoc && dirty && (
          <Circle className="ml-1 h-2 w-2 fill-[var(--neutral-400)] text-[var(--neutral-400)]" />
        )}
        {!currentDoc && (
          <span className="text-[var(--neutral-400)]">No file selected</span>
        )}

        {/* Offline / pending sync indicator */}
        {!isOnline && (
          <span className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <WifiOff className="h-3 w-3" />
            Offline
          </span>
        )}
        {pendingWriteCount > 0 && (
          <button
            onClick={() => syncPending()}
            className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            title="Click to sync pending changes"
          >
            {isOnline ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <CloudOff className="h-3 w-3" />
            )}
            {pendingWriteCount} pending
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {saveStatus !== "idle" && (
          <span
            className={cn(
              "text-xs",
              saveStatus === "error" ? "text-red-500" : "text-[var(--neutral-400)]"
            )}
          >
            {STATUS_LABELS[saveStatus]}
          </span>
        )}

        {/* Theme toggle */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" title="Theme">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : theme === "system" ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={dropdownContentClass}
              align="end"
              sideOffset={4}
            >
              <DropdownMenu.Item
                className={cn(
                  dropdownItemClass,
                  theme === "light"
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--neutral-600)]"
                )}
                onSelect={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                Light
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={cn(
                  dropdownItemClass,
                  theme === "dark"
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--neutral-600)]"
                )}
                onSelect={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                Dark
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={cn(
                  dropdownItemClass,
                  theme === "system"
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--neutral-600)]"
                )}
                onSelect={() => setTheme("system")}
              >
                <Monitor className="h-4 w-4" />
                System
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* AI buttons */}
        <Button
          variant="ghost"
          size="icon"
          title="AI Chat (⌘⇧A)"
          onClick={() => useAIStore.getState().setChatOpen(!useAIStore.getState().chatOpen)}
        >
          <Bot style={{ width: 16, height: 16 }} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="AI Settings"
          onClick={() => useAIStore.getState().setSettingsOpen(true)}
        >
          <Settings2 style={{ width: 16, height: 16 }} />
        </Button>

        {currentDoc && (
          <>
            {/* View mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setViewMode(viewMode === "edit" ? "agent" : "edit")
              }
              title={viewMode === "edit" ? "Agent View" : "Edit View"}
            >
              {viewMode === "edit" ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
            </Button>

            {/* History */}
            <HistoryPanel />

            {/* Width toggle */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon" title="Editor width">
                  <Columns2 className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={dropdownContentClass}
                  align="end"
                  sideOffset={4}
                >
                  {WIDTH_OPTIONS.map((opt) => (
                    <DropdownMenu.Item
                      key={opt.value}
                      className={cn(
                        dropdownItemClass,
                        editorWidth === opt.value
                          ? "text-[var(--foreground)] font-medium"
                          : "text-[var(--neutral-600)]"
                      )}
                      onSelect={() => setEditorWidth(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <Button
              variant="ghost"
              size="icon"
              onClick={saveCurrentDoc}
              title="Save"
            >
              <Save className="h-4 w-4" />
            </Button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={dropdownContentClass}
                  align="end"
                  sideOffset={4}
                >
                  {/* Export submenu */}
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className={dropdownItemClass}>
                      <Download className="h-4 w-4" />
                      Export
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className={dropdownContentClass}
                        sideOffset={4}
                      >
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsMarkdown } = await import("@/lib/export");
                            exportAsMarkdown(currentDoc);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          Markdown (.md)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsHTML } = await import("@/lib/export");
                            exportAsHTML(currentDoc);
                          }}
                        >
                          <FileCode className="h-4 w-4" />
                          HTML (.html)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsPDF } = await import("@/lib/export");
                            exportAsPDF(currentDoc);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          PDF (Print to PDF)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsWord } = await import("@/lib/export");
                            exportAsWord(currentDoc);
                          }}
                        >
                          <FileType className="h-4 w-4" />
                          Word (.docx)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsPNG } = await import("@/lib/export");
                            exportAsPNG(currentDoc);
                          }}
                        >
                          <Image className="h-4 w-4" />
                          Image (.png)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsJSON } = await import("@/lib/export");
                            exportAsJSON(currentDoc);
                          }}
                        >
                          <Braces className="h-4 w-4" />
                          JSON (.json)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={dropdownItemClass}
                          onSelect={async () => {
                            if (!currentDoc) return;
                            const { exportAsPlainText } = await import("@/lib/export");
                            exportAsPlainText(currentDoc);
                          }}
                        >
                          <AlignLeft className="h-4 w-4" />
                          Plain Text (.txt)
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>

                  {/* Print */}
                  <DropdownMenu.Item
                    className={dropdownItemClass}
                    onSelect={async () => {
                      const { printDocument } = await import("@/lib/export");
                      printDocument();
                    }}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 h-px bg-[var(--neutral-200)]" />

                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:hover:bg-red-950"
                    onSelect={() => {
                      if (currentDoc) {
                        deleteFile(currentDoc.path, currentDoc.sha);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </>
        )}
      </div>
    </header>
  );
}
