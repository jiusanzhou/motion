/**
 * Export themes for Motion documents.
 *
 * A theme is a self-contained CSS string injected into exported HTML/PDF.
 * Themes only affect HTML and PDF exports — Markdown / Word / PNG / JSON
 * stay neutral so structured/raw exports remain portable.
 *
 * Inspired by tw93/Kami's design constraints (warm parchment + ink-blue
 * accent + serif-led hierarchy), but uses freely-licensed system fonts
 * and Noto Serif CJK rather than Kami's commercial fonts.
 */

export type ExportTheme = "default" | "paper";

export interface ThemeMeta {
  id: ExportTheme;
  label: string;
  description: string;
}

export const EXPORT_THEMES: ThemeMeta[] = [
  {
    id: "default",
    label: "Default",
    description: "Editor look — clean sans-serif",
  },
  {
    id: "paper",
    label: "Paper",
    description: "Warm parchment, ink-blue, serif — print-ready",
  },
];

/**
 * Build the body wrapper class for a theme. The exported HTML applies this
 * class to <body> so theme CSS can scope cleanly.
 */
export function themeBodyClass(theme: ExportTheme): string {
  return theme === "paper" ? "kami-paper" : "default-export";
}

/**
 * CSS for the default theme — keeps the original editor appearance.
 * Returns the same look exportAsHTML used to ship before themes existed.
 */
function defaultThemeCSS(): string {
  return `
    body.default-export {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--background, #fff);
      color: var(--foreground, #1f1f1f);
      line-height: 1.7;
    }
    body.default-export h1 { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; }
    body.default-export h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; }
    body.default-export h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; }
    body.default-export img { max-width: 100%; height: auto; }
    body.default-export pre { overflow-x: auto; padding: 1rem; background: #f5f5f5; border-radius: 6px; }
    body.default-export code { font-size: 0.9em; }
  `;
}

/**
 * "Paper" theme — Kami-inspired, freely licensed.
 *
 * Constraints (mirroring Kami/references/design.md):
 *   • Canvas: #f5f4ed warm parchment, never pure white
 *   • Accent: #1B365D ink blue — sole chromatic accent
 *   • Neutrals: warm yellow-brown undertones, no cool blue-grays
 *   • Serif body 400, headings 500. No synthetic bold.
 *   • Line-height: tight titles 1.15, dense body 1.45, reading body 1.55
 *   • Shadows: ring/whisper only, no hard drops
 *   • Tags: solid hex backgrounds (rgba breaks WeasyPrint; harmless here but kept)
 *
 * Fonts (free / system):
 *   • Latin: Charter (macOS/iOS), Iowan Old Style, Cambria, Georgia → fallback serif
 *   • CJK: Noto Serif CJK SC/TC/JP/KR (system on most platforms),
 *           PingFang SC fallback for missing-font systems.
 */
function paperThemeCSS(): string {
  return `
    @page {
      size: A4;
      margin: 18mm 18mm 20mm 18mm;
    }

    body.kami-paper {
      max-width: 760px;
      margin: 2.5rem auto;
      padding: 0 2rem;
      background: #f5f4ed;
      color: #2a2724;
      font-family:
        "Charter", "Iowan Old Style", "Cambria", "Georgia",
        "Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC",
        "Songti SC", "STSong", "SimSun", serif;
      font-weight: 400;
      font-size: 16px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ---- Title (document head) ---- */
    body.kami-paper > h1:first-child {
      font-size: 2.1rem;
      font-weight: 500;
      line-height: 1.15;
      letter-spacing: -0.005em;
      color: #1B365D;
      margin: 0 0 0.4rem 0;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid #d9d4c5;
    }

    /* ---- Headings ---- */
    body.kami-paper h1,
    body.kami-paper h2,
    body.kami-paper h3,
    body.kami-paper h4 {
      font-weight: 500;
      color: #1B365D;
      line-height: 1.25;
      margin-top: 1.8em;
      margin-bottom: 0.5em;
    }
    body.kami-paper h2 {
      font-size: 1.45rem;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid #e3ddca;
    }
    body.kami-paper h3 {
      font-size: 1.18rem;
    }
    body.kami-paper h4 {
      font-size: 1.02rem;
      color: #4a3f2f;
    }

    /* ---- Body text ---- */
    body.kami-paper p,
    body.kami-paper li {
      line-height: 1.55;
      color: #2a2724;
    }
    body.kami-paper p {
      margin: 0.65em 0;
    }
    body.kami-paper strong {
      font-weight: 500;
      color: #1B365D;
    }
    body.kami-paper em {
      font-style: italic;
      color: #4a3f2f;
    }

    /* ---- Links ---- */
    body.kami-paper a {
      color: #1B365D;
      text-decoration: none;
      border-bottom: 1px solid #c8bea6;
    }
    body.kami-paper a:hover {
      border-bottom-color: #1B365D;
    }

    /* ---- Lists ---- */
    body.kami-paper ul,
    body.kami-paper ol {
      padding-left: 1.4em;
      margin: 0.6em 0;
    }
    body.kami-paper li {
      margin: 0.25em 0;
    }
    body.kami-paper ul > li::marker {
      color: #8a7d62;
    }
    body.kami-paper ol > li::marker {
      color: #8a7d62;
      font-variant-numeric: tabular-nums;
    }

    /* ---- Quotes ---- */
    body.kami-paper blockquote {
      margin: 1em 0;
      padding: 0.4em 1em;
      border-left: 3px solid #1B365D;
      background: #ebe5d2;
      color: #4a3f2f;
      font-style: italic;
    }

    /* ---- Code ---- */
    body.kami-paper code {
      font-family: "SF Mono", "JetBrains Mono", "Menlo", "Consolas", monospace;
      font-size: 0.88em;
      background: #ebe5d2;
      color: #4a3f2f;
      padding: 0.08em 0.35em;
      border-radius: 3px;
    }
    body.kami-paper pre {
      font-family: "SF Mono", "JetBrains Mono", "Menlo", "Consolas", monospace;
      font-size: 0.86em;
      line-height: 1.5;
      background: #ebe5d2;
      color: #2a2724;
      padding: 0.9em 1.1em;
      border-radius: 4px;
      border: 1px solid #d9d4c5;
      overflow-x: auto;
      margin: 1em 0;
    }
    body.kami-paper pre code {
      background: transparent;
      padding: 0;
      border-radius: 0;
      color: inherit;
    }

    /* ---- Tables ---- */
    body.kami-paper table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.95em;
    }
    body.kami-paper th,
    body.kami-paper td {
      padding: 0.55em 0.85em;
      text-align: left;
      border-bottom: 1px solid #d9d4c5;
    }
    body.kami-paper th {
      font-weight: 500;
      color: #1B365D;
      border-bottom: 2px solid #1B365D;
      background: transparent;
    }
    body.kami-paper tr:hover td {
      background: rgba(27, 54, 93, 0.03);
    }

    /* ---- Images / figures ---- */
    body.kami-paper img {
      max-width: 100%;
      height: auto;
      border-radius: 2px;
    }
    body.kami-paper figure {
      margin: 1.2em 0;
    }
    body.kami-paper figcaption {
      font-size: 0.88em;
      color: #6a5f48;
      text-align: center;
      margin-top: 0.4em;
      font-style: italic;
    }

    /* ---- Horizontal rule ---- */
    body.kami-paper hr {
      border: none;
      border-top: 1px solid #d9d4c5;
      margin: 2em 0;
    }

    /* ---- Tags / badges (solid hex backgrounds — no rgba) ---- */
    body.kami-paper .tag,
    body.kami-paper [data-tag] {
      display: inline-block;
      background: #1B365D;
      color: #f5f4ed;
      padding: 0.1em 0.55em;
      border-radius: 3px;
      font-size: 0.82em;
      font-weight: 500;
    }

    /* ---- Print tuning ---- */
    @media print {
      body.kami-paper {
        margin: 0;
        max-width: none;
        padding: 0;
        background: #f5f4ed;
      }
      body.kami-paper a {
        border-bottom: none;
      }
      body.kami-paper h1,
      body.kami-paper h2,
      body.kami-paper h3 {
        page-break-after: avoid;
      }
      body.kami-paper pre,
      body.kami-paper blockquote,
      body.kami-paper figure,
      body.kami-paper table {
        page-break-inside: avoid;
      }
    }
  `;
}

/**
 * Resolve theme CSS by id. Unknown ids fall back to the default theme.
 */
export function themeCSS(theme: ExportTheme): string {
  switch (theme) {
    case "paper":
      return paperThemeCSS();
    case "default":
    default:
      return defaultThemeCSS();
  }
}
