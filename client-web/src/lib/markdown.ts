import type { MotionDocument } from "@/types";

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    if (value === "true") result[key] = true;
    else if (value === "false") result[key] = false;
    else if (/^\d+$/.test(value)) result[key] = Number(value);
    else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return result;
}

function serializeFrontmatter(meta: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(meta)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => `"${v}"`).join(", ")}]`);
    } else if (typeof value === "string") {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  return lines.join("\n");
}

export function parseDocument(
  path: string,
  raw: string
): Omit<MotionDocument, "sha"> {
  const match = raw.match(FRONTMATTER_RE);
  if (match) {
    const frontmatter = parseFrontmatter(match[1]);
    const content = match[2];
    const title =
      typeof frontmatter.title === "string"
        ? frontmatter.title
        : extractTitle(path, content);
    return { path, title, content, frontmatter };
  }
  return {
    path,
    title: extractTitle(path, raw),
    content: raw,
    frontmatter: {},
  };
}

function extractTitle(path: string, content: string): string {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1];
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(/\.md$/, "");
}

export function serializeDocument(doc: MotionDocument): string {
  const hasFrontmatter = Object.keys(doc.frontmatter).length > 0;
  const meta = { ...doc.frontmatter, title: doc.title };
  if (hasFrontmatter || doc.title) {
    return `---\n${serializeFrontmatter(meta)}\n---\n${doc.content}`;
  }
  return doc.content;
}
