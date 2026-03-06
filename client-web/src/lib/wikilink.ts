const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

export interface WikiLink {
  name: string;
  start: number;
  end: number;
}

export function extractWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  let match;
  while ((match = WIKILINK_RE.exec(content)) !== null) {
    links.push({
      name: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return links;
}

export function resolveWikiLinkPath(
  linkName: string,
  allPaths: string[]
): string | null {
  // Exact match
  const exact = allPaths.find(
    (p) =>
      p === linkName ||
      p === `${linkName}.md` ||
      p.endsWith(`/${linkName}.md`) ||
      p.endsWith(`/${linkName}`)
  );
  if (exact) return exact;

  // Case-insensitive match
  const lower = linkName.toLowerCase();
  return (
    allPaths.find((p) => {
      const name = p
        .split("/")
        .pop()
        ?.replace(/\.md$/, "")
        .toLowerCase();
      return name === lower;
    }) ?? null
  );
}
