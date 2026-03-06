"use client";

import { create } from "zustand";
import Fuse from "fuse.js";

interface SearchDocument {
  path: string;
  title: string;
  content: string;
}

interface SearchState {
  documents: SearchDocument[];
  fuse: Fuse<SearchDocument> | null;
  indexBuilt: boolean;

  buildIndex: (docs: SearchDocument[]) => void;
  search: (query: string) => SearchResult[];
  clearIndex: () => void;
}

export interface SearchResult {
  path: string;
  title: string;
  matches: { key: string; value: string; indices: [number, number][] }[];
}

export const useSearchStore = create<SearchState>((set, get) => ({
  documents: [],
  fuse: null,
  indexBuilt: false,

  buildIndex: (docs) => {
    const fuse = new Fuse(docs, {
      keys: [
        { name: "title", weight: 2 },
        { name: "content", weight: 1 },
        { name: "path", weight: 0.5 },
      ],
      includeMatches: true,
      threshold: 0.4,
      minMatchCharLength: 2,
    });
    set({ documents: docs, fuse, indexBuilt: true });
  },

  search: (query) => {
    const { fuse } = get();
    if (!fuse || !query.trim()) return [];
    const results = fuse.search(query, { limit: 20 });
    return results.map((r) => ({
      path: r.item.path,
      title: r.item.title,
      matches: (r.matches ?? []).map((m) => ({
        key: m.key ?? "",
        value: m.value ?? "",
        indices: m.indices as [number, number][],
      })),
    }));
  },

  clearIndex: () => {
    set({ documents: [], fuse: null, indexBuilt: false });
  },
}));
