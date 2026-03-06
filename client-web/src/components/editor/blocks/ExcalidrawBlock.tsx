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

const exportToSvgDynamic = () =>
  import("@excalidraw/excalidraw").then((mod) => mod.exportToSvg);

// Global state to track which block is being edited (only one at a time)
let activeExcalidrawBlockId: string | null = null;
const listeners = new Set<() => void>();
function setActiveBlock(id: string | null) {
  activeExcalidrawBlockId = id;
  listeners.forEach((fn) => fn());
}
function useActiveBlock(blockId: string) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const listener = () => {
      setIsOpen(activeExcalidrawBlockId === blockId);
    };
    listeners.add(listener);
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
  onSave: (json: string, preview: string) => void;
  onClose: () => void;
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const initialData = data
    ? (() => {
        try {
          return JSON.parse(data);
        } catch {
          return undefined;
        }
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

    let preview = "";
    try {
      const exportToSvg = await exportToSvgDynamic();
      const svg = await exportToSvg({
        elements,
        appState: { ...appState, exportWithDarkMode: false },
        files,
      });
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute(
        "viewBox",
        svg.getAttribute("viewBox") || "0 0 100 100"
      );
      preview = new XMLSerializer().serializeToString(svg);
    } catch {
      // preview generation failed
    }

    onSave(json, preview);
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

function sanitizeSvg(raw: string): string {
  return raw.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export const ExcalidrawBlock = createReactBlockSpec(
  {
    type: "excalidraw" as const,
    propSchema: {
      ...defaultProps,
      data: { default: "" },
      preview: { default: "" },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const blockId = props.block.id;
      const isOpen = useActiveBlock(blockId);
      const data = props.block.props.data;
      const preview = props.block.props.preview;

      const handleOpen = useCallback(() => {
        setActiveBlock(blockId);
      }, [blockId]);

      const handleClose = useCallback(() => {
        setActiveBlock(null);
      }, []);

      const handleSave = useCallback(
        (json: string, svgPreview: string) => {
          props.editor.updateBlock(props.block, {
            props: { data: json, preview: svgPreview },
          });
          setActiveBlock(null);
        },
        [props.editor, props.block]
      );

      // Empty state
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
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--neutral-500, #6b7280)",
                }}
              >
                Click to create a drawing
              </div>
            </div>
            {isOpen && (
              <ExcalidrawOverlay
                data={data}
                onSave={handleSave}
                onClose={handleClose}
              />
            )}
          </div>
        );
      }

      // Has drawing
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
            {preview ? (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxHeight: "200px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    maxWidth: "100%",
                    maxHeight: "180px",
                    overflow: "hidden",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeSvg(preview),
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--neutral-400)",
                  fontSize: "13px",
                }}
              >
                🎨 Drawing (click to edit)
              </div>
            )}
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
            <ExcalidrawOverlay
              data={data}
              onSave={handleSave}
              onClose={handleClose}
            />
          )}
        </div>
      );
    },
  }
);
