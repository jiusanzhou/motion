import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "motion vs Notion / Obsidian / Logseq — Free GitHub-Backed Alternative";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const competitors: Record<string, { name: string; tagline: string; accent: string }> = {
  "notion-alternative": {
    name: "Notion",
    tagline: "Own your data. Free forever.",
    accent: "#000000",
  },
  "obsidian-alternative": {
    name: "Obsidian",
    tagline: "Same Markdown power, with built-in cloud sync.",
    accent: "#7c3aed",
  },
  "logseq-alternative": {
    name: "Logseq",
    tagline: "Block editing meets GitHub-native storage.",
    accent: "#85c8c8",
  },
  "outline-alternative": {
    name: "Outline",
    tagline: "No subscription. No team-tier upsell.",
    accent: "#0366d6",
  },
  "anytype-alternative": {
    name: "Anytype",
    tagline: "Plain Markdown over proprietary blocks.",
    accent: "#fbbf24",
  },
};

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const c = competitors[params.slug] ?? {
    name: "Other Tools",
    tagline: "Switch to GitHub-backed Markdown.",
    accent: "#6366f1",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #1e1b4b 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${c.accent}55 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div style={{ fontSize: "30px", fontWeight: 600 }}>motion</div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              padding: "8px 18px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              borderRadius: "999px",
              fontSize: "20px",
              color: "#c7d2fe",
              display: "flex",
            }}
          >
            Free Alternative
          </div>
        </div>

        {/* big VS layout */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            zIndex: 1,
            marginTop: "-20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              minWidth: "320px",
            }}
          >
            <div
              style={{
                fontSize: "92px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                background:
                  "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              motion
            </div>
            <div style={{ fontSize: "22px", color: "#94a3b8", display: "flex" }}>
              GitHub-backed · Open Source
            </div>
          </div>

          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#475569",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            VS
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              minWidth: "320px",
            }}
          >
            <div
              style={{
                fontSize: "92px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#cbd5e1",
              }}
            >
              {c.name}
            </div>
            <div style={{ fontSize: "22px", color: "#64748b", display: "flex" }}>
              Closed-source · Vendor lock-in
            </div>
          </div>
        </div>

        {/* tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            zIndex: 1,
            marginTop: "10px",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              color: "#e2e8f0",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {c.tagline}
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
            marginTop: "auto",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: "20px", color: "#64748b", display: "flex" }}>
            motion.wencai.app/compare/{params.slug}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#94a3b8",
              display: "flex",
              gap: "16px",
            }}
          >
            <span>MIT License</span>
            <span>·</span>
            <span>Markdown-first</span>
            <span>·</span>
            <span>MCP-native</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
