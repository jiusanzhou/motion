"use client";

import { useMotionStore } from "@/store";
import { serializeDocument } from "@/lib/markdown";
import { toAgentMeta } from "@/lib/agent-schema";

export function AgentView() {
  const { currentDoc } = useMotionStore();

  if (!currentDoc) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[var(--neutral-400)]">No file selected</p>
      </div>
    );
  }

  const agentMeta = toAgentMeta(currentDoc.frontmatter);
  const rawContent = serializeDocument(currentDoc);

  return (
    <div className="mx-auto max-w-3xl px-12 py-10">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
        Agent View
      </h2>

      <div className="mb-6 rounded-lg border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-[var(--neutral-500)]">
          Frontmatter (Structured)
        </h3>
        <pre className="overflow-auto text-sm font-mono text-[var(--foreground)] whitespace-pre-wrap">
          {JSON.stringify(
            { title: currentDoc.title, ...agentMeta },
            null,
            2
          )}
        </pre>
      </div>

      <div className="rounded-lg border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-[var(--neutral-500)]">
          Raw Markdown
        </h3>
        <pre className="overflow-auto text-sm font-mono text-[var(--foreground)] whitespace-pre-wrap">
          {rawContent}
        </pre>
      </div>
    </div>
  );
}
