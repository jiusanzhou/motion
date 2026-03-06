"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Pencil,
  Trash2,
  FilePlus,
  FolderPlus,
  GripVertical,
} from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/types";
import { useMotionStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FileTreeItemProps {
  node: TreeNode;
  depth: number;
}

export function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const { currentDoc, openFile, deleteFile, renameFile, createFile } =
    useMotionStore();
  const isActive = currentDoc?.path === node.path;
  const isDir = node.type === "directory";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: node.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renaming]);

  const handleClick = useCallback(() => {
    if (renaming) return;
    if (isDir) {
      setExpanded((e) => !e);
    } else {
      const state = useMotionStore.getState();
      if (state.dirty && state.currentDoc && state.currentDoc.path !== node.path) {
        const choice = window.confirm(
          "You have unsaved changes. Discard and open new file?"
        );
        if (!choice) return;
      }
      openFile(node.path);
    }
  }, [isDir, renaming, node.path, openFile]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === node.name) {
      setRenaming(false);
      return;
    }
    const parentDir = node.path.includes("/")
      ? node.path.substring(0, node.path.lastIndexOf("/") + 1)
      : "";
    const newPath = parentDir + trimmed;
    renameFile(node.path, newPath);
    setRenaming(false);
  }, [renameValue, node.name, node.path, renameFile]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleRenameSubmit();
      } else if (e.key === "Escape") {
        setRenaming(false);
        setRenameValue(node.name);
      }
    },
    [handleRenameSubmit, node.name]
  );

  const handleDeleteConfirm = useCallback(() => {
    deleteFile(node.path);
    setConfirmDelete(false);
  }, [node.path, deleteFile]);

  const handleNewFile = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const fileName = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
    const path = `${node.path}/${fileName}`;
    createFile(path);
    setNewFileDialogOpen(false);
    setNewName("");
    setExpanded(true);
  }, [newName, node.path, createFile]);

  const handleNewFolder = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const path = `${node.path}/${trimmed}/.gitkeep`;
    createFile(path);
    setNewFolderDialogOpen(false);
    setNewName("");
    setExpanded(true);
  }, [newName, node.path, createFile]);

  const menuItemClass =
    "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--neutral-700)] outline-none hover:bg-[var(--neutral-100)] data-[highlighted]:bg-[var(--neutral-100)]";

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "group flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] transition-colors",
              isActive && "bg-[var(--neutral-100)] font-medium text-[var(--foreground)]",
              isOver && isDir && "ring-2 ring-blue-400 ring-inset"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {/* Drag handle */}
            <span
              {...attributes}
              {...listeners}
              className="shrink-0 cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3 w-3" />
            </span>

            {isDir ? (
              expanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]" />
              )
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            {isDir ? (
              expanded ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-[var(--neutral-500)]" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-[var(--neutral-500)]" />
              )
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
            )}
            {renaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded border border-[var(--neutral-300)] bg-[var(--background)] px-1 py-0 text-sm outline-none focus:ring-1 focus:ring-[var(--neutral-400)]"
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </button>
        </ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Content
            className="z-50 min-w-[160px] rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-1 shadow-lg"
          >
            {isDir && (
              <>
                <ContextMenu.Item
                  className={menuItemClass}
                  onSelect={() => {
                    setNewName("");
                    setNewFileDialogOpen(true);
                  }}
                >
                  <FilePlus className="h-4 w-4" />
                  New File
                </ContextMenu.Item>
                <ContextMenu.Item
                  className={menuItemClass}
                  onSelect={() => {
                    setNewName("");
                    setNewFolderDialogOpen(true);
                  }}
                >
                  <FolderPlus className="h-4 w-4" />
                  New Folder
                </ContextMenu.Item>
                <ContextMenu.Separator className="my-1 h-px bg-[var(--neutral-200)]" />
              </>
            )}
            <ContextMenu.Item
              className={menuItemClass}
              onSelect={() => {
                setRenameValue(node.name);
                setRenaming(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Rename
            </ContextMenu.Item>
            <ContextMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:hover:bg-red-950 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950"
              onSelect={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {isDir ? "folder" : "file"}</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-[var(--neutral-600)]">
            Are you sure you want to delete{" "}
            <span className="font-medium">{node.name}</span>? This action cannot
            be undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              placeholder="filename.md"
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
    </div>
  );
}
