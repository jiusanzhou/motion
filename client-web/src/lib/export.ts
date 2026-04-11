/**
 * Export utilities for Motion documents.
 * Supports: Markdown, HTML, PDF, Word (.docx), PNG, JSON, Plain Text.
 */

import type { MotionDocument } from "@/types";
import { serializeDocument } from "@/lib/markdown";

/** Trigger a file download in the browser */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Safe filename from document title */
function safeFilename(title: string): string {
  return title.replace(/[/\\?%*:|"<>]/g, "-").trim() || "untitled";
}

// ---- Markdown Export ----

export function exportAsMarkdown(doc: MotionDocument) {
  const content = serializeDocument(doc);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(doc.title)}.md`);
}

// ---- HTML Export ----

/**
 * Build a standalone HTML string from the .motion-editor container.
 * Inlines computed styles for a faithful offline snapshot.
 */
function buildHTMLFromEditor(doc: MotionDocument): string {
  const editorEl = document.querySelector(".motion-editor");
  if (!editorEl) throw new Error("Editor element not found");

  // Clone the editor DOM
  const clone = editorEl.cloneNode(true) as HTMLElement;

  // Remove interactive / non-printable elements from clone
  clone
    .querySelectorAll(
      "[data-drag-handle], .bn-side-menu, .bn-drag-handle, .bn-drag-handle-menu"
    )
    .forEach((el) => el.remove());

  // Collect all stylesheets
  const styleSheets: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      styleSheets.push(rules.map((r) => r.cssText).join("\n"));
    } catch {
      // Cross-origin sheets — skip
    }
  }

  // Get computed CSS custom properties from :root
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVars = [
    "--background",
    "--foreground",
    "--neutral-50",
    "--neutral-100",
    "--neutral-200",
    "--neutral-300",
    "--neutral-400",
    "--neutral-500",
    "--neutral-600",
    "--neutral-700",
    "--neutral-800",
    "--neutral-900",
  ]
    .map((v) => `${v}: ${rootStyles.getPropertyValue(v)}`)
    .join(";\n    ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(doc.title)}</title>
  <style>
    :root {
      ${cssVars};
    }
    ${styleSheets.join("\n")}
    body {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--background, #fff);
      color: var(--foreground, #1f1f1f);
      line-height: 1.7;
    }
    h1 { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; }
    h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; }
    h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; }
    img { max-width: 100%; height: auto; }
    pre { overflow-x: auto; padding: 1rem; background: #f5f5f5; border-radius: 6px; }
    code { font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  ${clone.innerHTML}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportAsHTML(doc: MotionDocument) {
  const html = buildHTMLFromEditor(doc);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(doc.title)}.html`);
}

// ---- PDF Export (via browser print) ----

/**
 * Opens a print dialog for the .motion-editor content.
 * The user can choose "Save as PDF" from the browser print dialog.
 */
export function exportAsPDF(doc: MotionDocument) {
  const html = buildHTMLFromEditor(doc);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Fallback: just trigger window.print() which uses our @media print CSS
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then trigger print
  printWindow.addEventListener("load", () => {
    printWindow.focus();
    printWindow.print();
  });

  // Fallback if load event already fired
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
}

// ---- Word (.docx) Export ----

/**
 * Convert markdown-ish content into a .docx file using the `docx` library.
 * Parses headings, paragraphs, lists, code blocks, and bold/italic.
 */
export async function exportAsWord(doc: MotionDocument) {
  const docx = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
  } = docx;

  /** Parse inline **bold**, *italic*, `code`, and ~~strikethrough~~ */
  function parseInline(text: string): InstanceType<typeof TextRun>[] {
    const runs: InstanceType<typeof TextRun>[] = [];
    const re =
      /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIndex) {
        runs.push(new TextRun({ text: text.slice(lastIndex, m.index) }));
      }
      if (m[2]) runs.push(new TextRun({ text: m[2], bold: true, italics: true }));
      else if (m[3]) runs.push(new TextRun({ text: m[3], bold: true }));
      else if (m[4]) runs.push(new TextRun({ text: m[4], italics: true }));
      else if (m[5]) runs.push(new TextRun({ text: m[5], font: "Consolas" }));
      else if (m[6]) runs.push(new TextRun({ text: m[6], strike: true }));
      lastIndex = m.index + m[0].length;
    }

    if (lastIndex < text.length) {
      runs.push(new TextRun({ text: text.slice(lastIndex) }));
    }
    if (runs.length === 0) {
      runs.push(new TextRun({ text }));
    }
    return runs;
  }

  const content = doc.content ?? "";
  const lines = content.split("\n");
  const paragraphs: InstanceType<typeof Paragraph>[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    // Code block fence
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeBuffer.join("\n"),
                font: "Consolas",
                size: 20,
              }),
            ],
            spacing: { before: 100, after: 100 },
          })
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        })
      );
    } else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240 },
        })
      );
    } else if (line.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300 },
        })
      );
    }
    // Unordered list
    else if (/^[-*+]\s/.test(line)) {
      paragraphs.push(
        new Paragraph({
          children: parseInline(line.replace(/^[-*+]\s/, "")),
          bullet: { level: 0 },
        })
      );
    }
    // Ordered list
    else if (/^\d+\.\s/.test(line)) {
      paragraphs.push(
        new Paragraph({
          children: parseInline(line.replace(/^\d+\.\s/, "")),
          numbering: { reference: "default-numbering", level: 0 },
        })
      );
    }
    // Horizontal rule
    else if (/^[-*_]{3,}$/.test(line.trim())) {
      paragraphs.push(
        new Paragraph({
          text: "",
          border: {
            bottom: { style: "single" as any, size: 6, color: "CCCCCC" },
          },
          spacing: { before: 200, after: 200 },
        })
      );
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      paragraphs.push(
        new Paragraph({
          children: parseInline(line.slice(2)),
          indent: { left: 720 },
          spacing: { before: 60, after: 60 },
        })
      );
    }
    // Empty line
    else if (line.trim() === "") {
      paragraphs.push(new Paragraph({ text: "" }));
    }
    // Normal paragraph
    else {
      paragraphs.push(
        new Paragraph({
          children: parseInline(line),
          spacing: { after: 120 },
        })
      );
    }
  }

  const document = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal" as any,
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBlob(document);
  downloadBlob(buffer, `${safeFilename(doc.title)}.docx`);
}

// ---- PNG Export ----

/**
 * Capture the .motion-editor container as a PNG image.
 */
export async function exportAsPNG(doc: MotionDocument) {
  const html2canvas = (await import("html2canvas")).default;

  const editorEl = document.querySelector(".motion-editor") as HTMLElement;
  if (!editorEl) throw new Error("Editor element not found");

  const canvas = await html2canvas(editorEl, {
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim() || "#ffffff",
    scale: 2, // 2x for retina quality
    useCORS: true,
    logging: false,
  });

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `${safeFilename(doc.title)}.png`);
    }
  }, "image/png");
}

// ---- JSON Export ----

/**
 * Export the document as a JSON file containing:
 * - title, path, frontmatter, content (raw markdown)
 * - exportedAt timestamp
 */
export function exportAsJSON(doc: MotionDocument) {
  const data = {
    title: doc.title,
    path: doc.path,
    frontmatter: doc.frontmatter,
    content: doc.content,
    exportedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(doc.title)}.json`);
}

// ---- Plain Text Export ----

/**
 * Export the document as plain text, stripping all markdown formatting.
 */
export function exportAsPlainText(doc: MotionDocument) {
  const content = doc.content ?? "";

  const plain = content
    // Remove code fences
    .replace(/```[\s\S]*?```/g, (block) => {
      const lines = block.split("\n").slice(1, -1);
      return lines.join("\n");
    })
    // Remove headings markers
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, "$1")
    // Remove inline code
    .replace(/`(.+?)`/g, "$1")
    // Remove links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images, keep alt text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, "")
    // Remove blockquote markers
    .replace(/^>\s?/gm, "")
    // Remove list markers
    .replace(/^[-*+]\s/gm, "")
    .replace(/^\d+\.\s/gm, "")
    // Clean up extra blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const fullText = `${doc.title}\n${"=".repeat(doc.title.length)}\n\n${plain}`;
  const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(doc.title)}.txt`);
}

// ---- Print current page (uses @media print CSS) ----

export function printDocument() {
  window.print();
}
