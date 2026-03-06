"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useMotionStore } from "@/store";
import { extractWikiLinks, resolveWikiLinkPath } from "@/lib/wikilink";
import type { TreeNode } from "@/types";

interface GraphNode {
  id: string;
  name: string;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

function flattenPaths(nodes: TreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === "file") paths.push(node.path);
    if (node.children) paths.push(...flattenPaths(node.children));
  }
  return paths;
}

export function GraphView() {
  const { fileTree, openFile, provider, currentDoc } = useMotionStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const [ForceGraph, setForceGraph] = useState<React.ComponentType<any> | null>(
    null
  );
  const [dimensions, setDimensions] = useState({ width: 200, height: 300 });

  const allPaths = useMemo(() => flattenPaths(fileTree), [fileTree]);

  // Dynamic import of react-force-graph-2d
  useEffect(() => {
    import("react-force-graph-2d").then((mod) => {
      setForceGraph(() => mod.default);
    });
  }, []);

  const [loaded, setLoaded] = useState(false);

  // Build graph data only when user opens graph view
  useEffect(() => {
    if (!provider || allPaths.length === 0 || loaded) return;
    setLoaded(true);

    async function buildGraph() {
      const nodes: GraphNode[] = allPaths.map((p) => ({
        id: p,
        name: p
          .split("/")
          .pop()
          ?.replace(/\.md$/, "") ?? p,
        val: 1,
      }));

      const links: GraphLink[] = [];
      const nodeSet = new Set(allPaths);

      for (const path of allPaths) {
        try {
          const doc = await provider!.readFile(path);
          const wikiLinks = extractWikiLinks(doc.content);
          for (const link of wikiLinks) {
            const resolved = resolveWikiLinkPath(link.name, allPaths);
            if (resolved && nodeSet.has(resolved) && resolved !== path) {
              links.push({ source: path, target: resolved });
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Increase val for nodes with more connections
      const connectionCount = new Map<string, number>();
      for (const link of links) {
        connectionCount.set(
          link.source as string,
          (connectionCount.get(link.source as string) ?? 0) + 1
        );
        connectionCount.set(
          link.target as string,
          (connectionCount.get(link.target as string) ?? 0) + 1
        );
      }
      for (const node of nodes) {
        node.val = 1 + (connectionCount.get(node.id) ?? 0);
      }

      setGraphData({ nodes, links });
    }

    buildGraph();
  }, [provider, allPaths]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      openFile(node.id);
    },
    [openFile]
  );

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  if (!ForceGraph) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--neutral-400)]">
        Loading graph...
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--neutral-400)]">
        No documents to visualize.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: GraphNode) =>
          currentDoc?.path === node.id
            ? isDark
              ? "#60a5fa"
              : "#2563eb"
            : isDark
              ? "#666"
              : "#aaa"
        }
        linkColor={() => (isDark ? "#444" : "#ddd")}
        backgroundColor={isDark ? "#191919" : "#ffffff"}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(
          node: GraphNode & { x: number; y: number },
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px -apple-system, sans-serif`;
          const isActive = currentDoc?.path === node.id;

          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4 / globalScale, 0, 2 * Math.PI);
          ctx.fillStyle = isActive
            ? isDark
              ? "#60a5fa"
              : "#2563eb"
            : isDark
              ? "#888"
              : "#999";
          ctx.fill();

          // Label
          ctx.fillStyle = isDark ? "#ccc" : "#333";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, node.x, node.y + 6 / globalScale);
        }}
        nodePointerAreaPaint={(
          node: GraphNode & { x: number; y: number },
          color: string,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8 / globalScale, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
      />
    </div>
  );
}
