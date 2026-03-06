import type { AgentMeta } from "@/types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateAgentMeta(
  frontmatter: Record<string, unknown>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (frontmatter.tags !== undefined) {
    if (!Array.isArray(frontmatter.tags)) {
      errors.push({ field: "tags", message: "tags must be an array of strings" });
    } else if (frontmatter.tags.some((t: unknown) => typeof t !== "string")) {
      errors.push({ field: "tags", message: "All tags must be strings" });
    }
  }

  if (frontmatter.summary !== undefined && typeof frontmatter.summary !== "string") {
    errors.push({ field: "summary", message: "summary must be a string" });
  }

  if (frontmatter.links !== undefined) {
    if (!Array.isArray(frontmatter.links)) {
      errors.push({ field: "links", message: "links must be an array of strings" });
    } else if (frontmatter.links.some((l: unknown) => typeof l !== "string")) {
      errors.push({ field: "links", message: "All links must be strings" });
    }
  }

  if (frontmatter.access !== undefined) {
    const validAccess = ["public", "private", "agent"];
    if (!validAccess.includes(frontmatter.access as string)) {
      errors.push({
        field: "access",
        message: `access must be one of: ${validAccess.join(", ")}`,
      });
    }
  }

  return errors;
}

export function toAgentMeta(frontmatter: Record<string, unknown>): AgentMeta {
  return {
    tags: Array.isArray(frontmatter.tags)
      ? (frontmatter.tags as string[])
      : undefined,
    summary:
      typeof frontmatter.summary === "string"
        ? frontmatter.summary
        : undefined,
    links: Array.isArray(frontmatter.links)
      ? (frontmatter.links as string[])
      : undefined,
    access: ["public", "private", "agent"].includes(
      frontmatter.access as string
    )
      ? (frontmatter.access as AgentMeta["access"])
      : undefined,
    data:
      typeof frontmatter.data === "object" && frontmatter.data !== null
        ? (frontmatter.data as Record<string, unknown>)
        : undefined,
  };
}

export const agentMetaJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    links: { type: "array", items: { type: "string" } },
    access: { type: "string", enum: ["public", "private", "agent"] },
    data: { type: "object" },
  },
};
