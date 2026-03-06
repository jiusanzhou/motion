"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMotionStore } from "@/store";
import { FileTreeItem } from "./FileTreeItem";
import type { TreeNode } from "@/types";

function flattenSortable(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.path);
    if (node.children) ids.push(...flattenSortable(node.children));
  }
  return ids;
}

function findNode(nodes: TreeNode[], path: string): TreeNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function FileTree() {
  const { fileTree, renameFile } = useMotionStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const sortableIds = flattenSortable(fileTree);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activePath = active.id as string;
      const overPath = over.id as string;

      // Find target - if over a directory, move file into it
      const overNode = findNode(fileTree, overPath);
      if (overNode?.type === "directory") {
        const fileName = activePath.split("/").pop() ?? "";
        const newPath = `${overPath}/${fileName}`;
        if (newPath !== activePath) {
          renameFile(activePath, newPath);
        }
      }
    },
    [fileTree, renameFile]
  );

  const activeNode = activeId ? findNode(fileTree, activeId) : null;

  if (fileTree.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-[var(--neutral-400)]">
        No files yet. Connect a GitHub repo to get started.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-0.5 px-2 py-1">
          {fileTree.map((node) => (
            <FileTreeItem key={node.path} node={node} depth={0} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeNode && (
          <div className="rounded-md bg-[var(--neutral-100)] px-3 py-1.5 text-sm text-[var(--foreground)] shadow-lg opacity-90">
            {activeNode.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
