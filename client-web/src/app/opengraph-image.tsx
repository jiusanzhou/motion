import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Motion — Agent-Friendly Knowledge Base, Backed by GitHub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #1e1b4b 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0) 70%)",
            display: "flex",
          }}
        />

        {/* Top: brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            motion
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>Agent-Friendly Knowledge Base,</div>
            <div
              style={{
                display: "flex",
                background:
                  "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Backed by GitHub
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              color: "#94a3b8",
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: "880px",
            }}
          >
            Pure-frontend Markdown editor where AI agents and humans collaborate.
            Your notes live in a GitHub repo you own.
          </div>
        </div>

        {/* Bottom: badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            zIndex: 1,
            alignItems: "center",
          }}
        >
          {["Open Source · MIT", "GitHub-Backed", "MCP-Native", "Markdown-First"].map((t) => (
            <div
              key={t}
              style={{
                padding: "12px 22px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "999px",
                fontSize: "22px",
                color: "#e2e8f0",
                display: "flex",
              }}
            >
              {t}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div
            style={{
              fontSize: "22px",
              color: "#64748b",
              display: "flex",
            }}
          >
            motion.wencai.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
