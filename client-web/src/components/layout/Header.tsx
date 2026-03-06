"use client";

import { useMotionStore, type EditorWidth, type ViewMode } from "@/store";
import { useThemeStore } from "@/store/theme";
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
  } = useMotionStore();
  const { theme, setTheme } = useThemeStore();

  const breadcrumbs = currentDoc?.path.split("/") ?? [];

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--neutral-100)] px-4 bg-[var(--background)]">
      <div className="flex items-center gap-1 text-sm text-[var(--neutral-500)]">
        {/* Sidebar toggle */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mr-2 rounded-md p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)]"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {breadcrumbs.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            <span
              className={cn(
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
      </div>
      <div className="flex items-center gap-1">
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
