"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState, useRef, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Detect inline formula: $...$ (single dollar, no $$)
function isInline(eq: string): boolean {
  const t = eq.trim();
  return t.startsWith("$") && t.endsWith("$") && !t.startsWith("$$");
}

// Strip inline delimiters for rendering
function getSource(eq: string): string {
  return isInline(eq) ? eq.trim().slice(1, -1) : eq;
}

function renderEquation(eq: string, container: HTMLElement) {
  try {
    katex.render(getSource(eq), container, {
      displayMode: !isInline(eq),
      throwOnError: false,
      trust: true,
    });
  } catch {
    container.textContent = eq;
  }
}

export const MathBlock = createReactBlockSpec(
  {
    type: "math" as const,
    propSchema: {
      ...defaultProps,
      equation: { default: "" },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const [editing, setEditing] = useState(!props.block.props.equation);
      const previewRef = useRef<HTMLDivElement>(null);
      const liveRef = useRef<HTMLDivElement>(null);
      const textareaRef = useRef<HTMLTextAreaElement>(null);

      const equation = props.block.props.equation;

      // Rendered preview (non-editing mode)
      useEffect(() => {
        if (!editing && previewRef.current && equation) {
          renderEquation(equation, previewRef.current);
        }
      }, [editing, equation]);

      // Live preview while editing
      useEffect(() => {
        if (editing && liveRef.current) {
          if (equation.trim()) {
            renderEquation(equation, liveRef.current);
          } else {
            liveRef.current.innerHTML = "";
          }
        }
      }, [editing, equation]);

      useEffect(() => {
        if (editing && textareaRef.current) {
          textareaRef.current.focus();
        }
      }, [editing]);

      if (editing) {
        return (
          <div
            style={{
              padding: "12px",
              border: "1px solid var(--neutral-200)",
              borderRadius: "6px",
              backgroundColor: "var(--neutral-50, #fafafa)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--neutral-400)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              LaTeX Equation
            </div>
            <textarea
              ref={textareaRef}
              value={equation}
              onChange={(e) =>
                props.editor.updateBlock(props.block, {
                  props: { equation: e.target.value },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
                  e.preventDefault();
                  if (equation.trim()) setEditing(false);
                }
              }}
              onBlur={() => {
                if (equation.trim()) setEditing(false);
              }}
              placeholder="E = mc^2  · wrap in $…$ for inline"
              rows={3}
              style={{
                width: "100%",
                fontFamily: "monospace",
                fontSize: "14px",
                padding: "8px",
                border: "1px solid var(--neutral-200)",
                borderRadius: "4px",
                backgroundColor: "var(--bg, white)",
                color: "var(--text, black)",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                color: "var(--neutral-400)",
                marginTop: "4px",
                marginBottom: equation.trim() ? "8px" : "0",
              }}
            >
              Press Enter to preview · Shift+Enter for new line · $…$ for inline
            </div>
            {equation.trim() && (
              <div
                ref={liveRef}
                style={{
                  padding: "8px 0",
                  borderTop: "1px solid var(--neutral-200)",
                  textAlign: "center",
                  opacity: 0.85,
                }}
              />
            )}
          </div>
        );
      }

      return (
        <div
          ref={previewRef}
          onClick={() => setEditing(true)}
          style={{
            padding: isInline(equation) ? "4px 8px" : "16px",
            textAlign: isInline(equation) ? "left" : "center",
            cursor: "pointer",
            minHeight: "40px",
            borderRadius: "6px",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--neutral-50, #fafafa)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          title="Click to edit equation"
        />
      );
    },
  }
);
