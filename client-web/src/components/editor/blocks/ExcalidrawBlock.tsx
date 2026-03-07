"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

const ExcalidrawComponent = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => ({
      default: mod.Excalidraw,
    })),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
        Loading Excalidraw...
      </div>
    ),
  }
);

function ExcalidrawPreview({ data }: { data: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!data || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const parsed = JSON.parse(data);
        if (!parsed.elements?.length) {
          setError(true);
          return;
        }

        const { exportToSvg } = await import("@excalidraw/excalidraw");
        const svg = await exportToSvg({
          elements: parsed.elements,
          appState: {
            exportWithDarkMode: false,
            viewBackgroundColor: "#ffffff",
            ...parsed.appState,
          },
          files: parsed.files || null,
        });

        if (cancelled) return;

        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.style.maxHeight = "220px";
        svg.style.display = "block";

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(svg);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => { cancelled = true; };
  }, [data]);

  if (error) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "var(--neutral-400)", fontSize: 13 }}>
        🎨 Drawing (click to edit)
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        padding: "8px",
        backgroundColor: "white",
        minHeight: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        maxHeight: "220px",
      }}
    />
  );
}

let activeExcalidrawBlockId: string | null = null;
const listeners = new Set<() => void>();
function setActiveBlock(id: string | null) {
  activeExcalidrawBlockId = id;
  listeners.forEach((fn) => fn());
}
function useActiveBlock(blockId: string) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const listener = () => setIsOpen(activeExcalidrawBlockId === blockId);
    listeners.add(listener);
    listener();
    return () => { listeners.delete(listener); };
  }, [blockId]);
  return isOpen;
}

function ExcalidrawOverlay({
  data,
  onSave,
  onClose,
}: {
  data: string;
  onSave: (json: string) => void;
  onClose: () => void;
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const initialData = data
    ? (() => {
        try { return JSON.parse(data); }
        catch { return undefined; }
      })()
    : undefined;

  const handleSave = useCallback(async () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const json = JSON.stringify({
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
      files,
    });

    onSave(json);
  }, [excalidrawAPI, onSave]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fafafa",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>
          Drawing / Whiteboard
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "6px 16px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#3b82f6",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ExcalidrawComponent
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          initialData={initialData}
          theme="light"
        />
      </div>
    </div>,
    document.body
  );
}

export const ExcalidrawBlock = createReactBlockSpec(
  {
    type: "excalidraw" as const,
    propSchema: {
      ...defaultProps,
      data: { default: "" },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const blockId = props.block.id;
      const isOpen = useActiveBlock(blockId);
      const data = props.block.props.data;

      const handleOpen = useCallback(() => {
        setActiveBlock(blockId);
      }, [blockId]);

      const handleClose = useCallback(() => {
        setActiveBlock(null);
      }, []);

      const handleSave = useCallback(
        (json: string) => {
          props.editor.updateBlock(props.block, {
            props: { data: json },
          });
          setActiveBlock(null);
        },
        [props.editor, props.block]
      );

      if (!data) {
        return (
          <div>
            <div
              onClick={handleOpen}
              style={{
                padding: "24px",
                border: "1px dashed var(--neutral-200)",
                borderRadius: "8px",
                backgroundColor: "var(--neutral-50, #fafafa)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>🎨</div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--neutral-500, #6b7280)" }}>
                Click to create a drawing
              </div>
            </div>
            {isOpen && (
              <ExcalidrawOverlay data={data} onSave={handleSave} onClose={handleClose} />
            )}
          </div>
        );
      }

      return (
        <div>
          <div
            onClick={handleOpen}
            style={{
              border: "1px solid var(--neutral-200)",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <ExcalidrawPreview data={data} />
            <div
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                color: "var(--neutral-400)",
                backgroundColor: "var(--neutral-50, #fafafa)",
                borderTop: "1px solid var(--neutral-200)",
                textAlign: "center",
              }}
            >
              Click to edit
            </div>
          </div>
          {isOpen && (
            <ExcalidrawOverlay data={data} onSave={handleSave} onClose={handleClose} />
          )}
        </div>
      );
    },
  }
);
