"use client";

import { create } from "zustand";
import {
  embed,
  cosineSimilarity,
  extractPlainText,
  onEmbeddingProgress,
  getInitProgress,
} from "@/lib/embedder";

export interface SimilarDoc {
  path: string;
  title: string;
  score: number;
  snippet: string;
}

interface EmbeddingEntry {
  vec: Float32Array;
  title: string;
  snippet: string;
}

interface EmbeddingState {
  embeddings: Map<string, EmbeddingEntry>;
  modelProgress: number; // 0-100, 100 = ready
  isEmbedding: boolean;

  embedDocument: (path: string, title: string, content: string) => Promise<void>;
  findSimilar: (path: string, k?: number) => SimilarDoc[];
  semanticSearch: (query: string, k?: number) => Promise<SimilarDoc[]>;
  setModelProgress: (p: number) => void;
}

export const useEmbeddingStore = create<EmbeddingState>((set, get) => {
  // Subscribe to global model load progress
  if (typeof window !== "undefined") {
    onEmbeddingProgress((p) => {
      get().setModelProgress(p);
    });
  }

  return {
    embeddings: new Map(),
    modelProgress: getInitProgress(),
    isEmbedding: false,

    setModelProgress: (p) => set({ modelProgress: p }),

    embedDocument: async (path, title, content) => {
      const text = extractPlainText(content);
      if (!text) return;
      set({ isEmbedding: true });
      try {
        const vec = await embed(text);
        const snippet = text.slice(0, 500);
        set((s) => {
          const next = new Map(s.embeddings);
          next.set(path, { vec, title, snippet });
          return { embeddings: next, isEmbedding: false };
        });
      } catch {
        set({ isEmbedding: false });
      }
    },

    findSimilar: (path, k = 5) => {
      const { embeddings } = get();
      const entry = embeddings.get(path);
      if (!entry) return [];
      const results: SimilarDoc[] = [];
      for (const [p, e] of embeddings) {
        if (p === path) continue;
        results.push({
          path: p,
          title: e.title,
          score: cosineSimilarity(entry.vec, e.vec),
          snippet: e.snippet,
        });
      }
      return results.sort((a, b) => b.score - a.score).slice(0, k);
    },

    semanticSearch: async (query, k = 8) => {
      const text = query.trim();
      if (!text) return [];
      set({ isEmbedding: true });
      try {
        const queryVec = await embed(text);
        const { embeddings } = get();
        const results: SimilarDoc[] = [];
        for (const [p, e] of embeddings) {
          results.push({
            path: p,
            title: e.title,
            score: cosineSimilarity(queryVec, e.vec),
            snippet: e.snippet,
          });
        }
        set({ isEmbedding: false });
        return results.sort((a, b) => b.score - a.score).slice(0, k);
      } catch {
        set({ isEmbedding: false });
        return [];
      }
    },
  };
});
