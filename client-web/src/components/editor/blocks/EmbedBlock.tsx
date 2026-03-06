"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState } from "react";

function parseEmbedUrl(url: string): {
  type: "youtube" | "twitter" | "figma" | "codesandbox" | "iframe";
  embedUrl: string;
} {
  try {
    const u = new URL(url);

    // YouTube
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "youtu.be"
    ) {
      let videoId = "";
      if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1);
      } else {
        videoId = u.searchParams.get("v") || "";
      }
      if (videoId) {
        return {
          type: "youtube",
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        };
      }
    }

    // Twitter / X
    if (
      u.hostname === "twitter.com" ||
      u.hostname === "www.twitter.com" ||
      u.hostname === "x.com" ||
      u.hostname === "www.x.com"
    ) {
      return {
        type: "twitter",
        embedUrl: url,
      };
    }

    // Figma
    if (u.hostname === "www.figma.com" || u.hostname === "figma.com") {
      return {
        type: "figma",
        embedUrl: `https://www.figma.com/embed?embed_host=motion&url=${encodeURIComponent(url)}`,
      };
    }

    // CodeSandbox
    if (u.hostname === "codesandbox.io") {
      const embedUrl = url.replace("/s/", "/embed/");
      return { type: "codesandbox", embedUrl };
    }
  } catch {
    // invalid URL
  }

  return { type: "iframe", embedUrl: url };
}

function TwitterEmbed({ url }: { url: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "12px" }}>
      <blockquote
        style={{
          border: "1px solid var(--neutral-200)",
          borderRadius: "12px",
          padding: "16px",
          maxWidth: "550px",
          width: "100%",
          color: "var(--neutral-400)",
          fontSize: "14px",
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent, #3b82f6)" }}
        >
          View Tweet/Post on X
        </a>
      </blockquote>
    </div>
  );
}

export const EmbedBlock = createReactBlockSpec(
  {
    type: "embed" as const,
    propSchema: {
      ...defaultProps,
      url: { default: "" },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const [inputUrl, setInputUrl] = useState("");
      const url = props.block.props.url;

      if (!url) {
        return (
          <div
            style={{
              padding: "16px",
              border: "1px dashed var(--neutral-200)",
              borderRadius: "8px",
              backgroundColor: "var(--neutral-50, #fafafa)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--neutral-400)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Embed
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputUrl.trim()) {
                    props.editor.updateBlock(props.block, {
                      props: { url: inputUrl.trim() },
                    });
                  }
                }}
                placeholder="Paste YouTube, Twitter, Figma, or any URL..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--neutral-200)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "var(--bg, white)",
                  color: "var(--text, black)",
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  if (inputUrl.trim()) {
                    props.editor.updateBlock(props.block, {
                      props: { url: inputUrl.trim() },
                    });
                  }
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--accent, #3b82f6)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Embed
              </button>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--neutral-400)",
                marginTop: "6px",
              }}
            >
              Supports: YouTube, Twitter/X, Figma, CodeSandbox, or any URL
            </div>
          </div>
        );
      }

      const parsed = parseEmbedUrl(url);

      if (parsed.type === "twitter") {
        return <TwitterEmbed url={parsed.embedUrl} />;
      }

      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid var(--neutral-200)",
          }}
        >
          <div
            style={{
              position: "relative",
              paddingBottom:
                parsed.type === "youtube" ? "56.25%" : "450px",
              height: parsed.type === "youtube" ? 0 : undefined,
            }}
          >
            <iframe
              src={parsed.embedUrl}
              style={{
                position: parsed.type === "youtube" ? "absolute" : undefined,
                top: 0,
                left: 0,
                width: "100%",
                height: parsed.type === "youtube" ? "100%" : "450px",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
          <div
            style={{
              padding: "6px 10px",
              fontSize: "11px",
              color: "var(--neutral-400)",
              backgroundColor: "var(--neutral-50, #fafafa)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
              {url}
            </span>
            <button
              onClick={() =>
                props.editor.updateBlock(props.block, {
                  props: { url: "" },
                })
              }
              style={{
                background: "none",
                border: "none",
                color: "var(--neutral-400)",
                cursor: "pointer",
                fontSize: "11px",
                textDecoration: "underline",
              }}
            >
              Change
            </button>
          </div>
        </div>
      );
    },
  }
);
