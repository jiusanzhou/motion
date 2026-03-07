/**
 * Lazy singleton for local embedding via @huggingface/transformers.
 * Model: Xenova/all-MiniLM-L6-v2 (384-dim, ~23MB quantized)
 * Only runs in browser (client-side).
 */

type FeatureExtractionPipeline = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (text: string | string[], options?: Record<string, unknown>): Promise<any>;
};

let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;
let initProgress = 0;
const progressListeners: Array<(p: number) => void> = [];

export function onEmbeddingProgress(cb: (progress: number) => void) {
  progressListeners.push(cb);
  return () => {
    const i = progressListeners.indexOf(cb);
    if (i >= 0) progressListeners.splice(i, 1);
  };
}

function notifyProgress(p: number) {
  initProgress = p;
  for (const cb of progressListeners) cb(p);
}

function getInitProgress() {
  return initProgress;
}
export { getInitProgress };

export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (typeof window === "undefined") throw new Error("embedder: browser only");
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // Allow WASM backend from CDN
      env.allowLocalModels = false;
      notifyProgress(0);
      const pipe = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        {
          progress_callback: (info: { progress?: number; status?: string }) => {
            if (info.progress != null) {
              notifyProgress(Math.round(info.progress));
            }
          },
        }
      );
      notifyProgress(100);
      return pipe as unknown as FeatureExtractionPipeline;
    })();
    pipelinePromise.catch(() => {
      pipelinePromise = null;
    });
  }
  return pipelinePromise;
}

/** Strip markdown syntax and return plain text for embedding */
export function extractPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // links → text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1") // bold/italic
    .replace(/^\s*[-*>|+]\s*/gm, "") // bullets, quotes
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 512); // limit input size
}

/** Compute a normalized 384-dim embedding for the given text */
export async function embed(text: string): Promise<Float32Array> {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  // output.data is a flat Float32Array for a single input
  return output.data instanceof Float32Array
    ? output.data
    : new Float32Array(output.data);
}

/** Cosine similarity between two normalized vectors (= dot product) */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
