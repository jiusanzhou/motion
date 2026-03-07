"use client";

import { create } from "zustand";
import type {
  MotionDocument,
  RepoConfig,
  StorageProvider,
  TreeNode,
  Tab,
  SidebarView,
} from "@/types";
import { useToastStore } from "@/store/toast";
import { useSearchStore } from "@/store/search";
import type { CacheInfo } from "@/lib/cache";
import type { CachedGitHubStorageProvider } from "@/lib/storage/cached-github";

const REPO_CONFIG_KEY = "motion:repo-config";
const REPOS_KEY = "motion:repos";
const EDITOR_WIDTH_KEY = "motion:editor-width";

export type EditorWidth = "compact" | "standard" | "wide" | "full";

export const EDITOR_WIDTHS: Record<EditorWidth, string> = {
  compact: "720px",
  standard: "900px",
  wide: "1100px",
  full: "100%",
};

function loadRepoConfig(): RepoConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REPO_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRepoConfig(config: RepoConfig) {
  localStorage.setItem(REPO_CONFIG_KEY, JSON.stringify(config));
}

function clearRepoConfig() {
  localStorage.removeItem(REPO_CONFIG_KEY);
}

function loadEditorWidth(): EditorWidth {
  if (typeof window === "undefined") return "standard";
  const v = localStorage.getItem(EDITOR_WIDTH_KEY);
  if (v && v in EDITOR_WIDTHS) return v as EditorWidth;
  return "standard";
}

function saveEditorWidth(w: EditorWidth) {
  localStorage.setItem(EDITOR_WIDTH_KEY, w);
}

function loadSavedRepos(): RepoConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedRepos(repos: RepoConfig[]) {
  localStorage.setItem(REPOS_KEY, JSON.stringify(repos));
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ViewMode = "edit" | "agent";

interface MotionState {
  provider: StorageProvider | null;
  repoConfig: RepoConfig | null;
  savedRepos: RepoConfig[];
  fileTree: TreeNode[];
  currentDoc: MotionDocument | null;
  lastSavedContent: string | null;
  sidebarOpen: boolean;
  sidebarView: SidebarView;
  saveStatus: SaveStatus;
  connectDialogOpen: boolean;
  editorWidth: EditorWidth;
  dirty: boolean;
  tabs: Tab[];
  viewMode: ViewMode;
  cacheInfo: CacheInfo | null;

  setProvider: (provider: StorageProvider | null) => void;
  setFileTree: (tree: TreeNode[]) => void;
  setCurrentDoc: (doc: MotionDocument | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarView: (view: SidebarView) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setConnectDialogOpen: (open: boolean) => void;
  setEditorWidth: (w: EditorWidth) => void;
  setViewMode: (mode: ViewMode) => void;

  connectRepo: (config: RepoConfig, token: string) => Promise<void>;
  disconnectRepo: () => void;
  getSavedRepoConfig: () => RepoConfig | null;

  addSavedRepo: (config: RepoConfig) => void;
  removeSavedRepo: (owner: string, repo: string) => void;

  loadFileTree: () => Promise<void>;
  openFile: (path: string) => Promise<void>;
  saveCurrentDoc: () => Promise<void>;
  updateDocContent: (content: string) => void;
  updateDocTitle: (title: string) => void;
  updateDocFrontmatter: (frontmatter: Record<string, unknown>) => void;
  createFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string, sha?: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;

  closeTab: (path: string) => void;
  switchTab: (path: string) => void;

  importFiles: (
    files: Array<{ path: string; content: string }>
  ) => Promise<{ succeeded: number; failed: number }>;

  clearCache: () => Promise<void>;
  refreshCacheInfo: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

export const useMotionStore = create<MotionState>((set, get) => ({
  provider: null,
  repoConfig: null,
  savedRepos: loadSavedRepos(),
  fileTree: [],
  currentDoc: null,
  lastSavedContent: null,
  sidebarOpen: true,
  sidebarView: "files",
  saveStatus: "idle",
  connectDialogOpen: false,
  editorWidth: loadEditorWidth(),
  dirty: false,
  tabs: [],
  viewMode: "edit",
  cacheInfo: null,

  setProvider: (provider) => set({ provider }),
  setFileTree: (fileTree) => set({ fileTree }),
  setCurrentDoc: (doc) =>
    set({
      currentDoc: doc,
      lastSavedContent: doc ? doc.content : null,
      saveStatus: "idle",
      dirty: false,
    }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarView: (sidebarView) => set({ sidebarView }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setConnectDialogOpen: (connectDialogOpen) => set({ connectDialogOpen }),
  setEditorWidth: (w) => {
    saveEditorWidth(w);
    set({ editorWidth: w });
  },
  setViewMode: (viewMode) => set({ viewMode }),

  connectRepo: async (config, token) => {
    const { CachedGitHubStorageProvider } = await import(
      "@/lib/storage/cached-github"
    );
    const provider = new CachedGitHubStorageProvider({ ...config, token });
    try {
      await provider.connect();
    } catch (err) {
      useToastStore
        .getState()
        .addToast(
          `Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
      throw err;
    }
    saveRepoConfig(config);
    get().addSavedRepo(config);
    set({
      provider,
      repoConfig: config,
      tabs: [],
      currentDoc: null,
      lastSavedContent: null,
      dirty: false,
    });
    await get().loadFileTree();
    get().refreshCacheInfo();
  },

  disconnectRepo: () => {
    const { provider } = get();
    if (provider) provider.disconnect();
    clearRepoConfig();
    set({
      provider: null,
      repoConfig: null,
      fileTree: [],
      currentDoc: null,
      lastSavedContent: null,
      dirty: false,
      tabs: [],
    });
  },

  getSavedRepoConfig: () => loadRepoConfig(),

  addSavedRepo: (config) => {
    const { savedRepos } = get();
    const exists = savedRepos.some(
      (r) => r.owner === config.owner && r.repo === config.repo
    );
    if (!exists) {
      const updated = [...savedRepos, config];
      saveSavedRepos(updated);
      set({ savedRepos: updated });
    }
  },

  removeSavedRepo: (owner, repo) => {
    const { savedRepos } = get();
    const updated = savedRepos.filter(
      (r) => !(r.owner === owner && r.repo === repo)
    );
    saveSavedRepos(updated);
    set({ savedRepos: updated });
  },

  loadFileTree: async () => {
    const { provider } = get();
    if (!provider) return;
    try {
      const tree = await provider.listFiles();
      set({ fileTree: tree });
      get().refreshCacheInfo();
    } catch (err) {
      useToastStore
        .getState()
        .addToast(
          `Failed to load files: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
    }
  },

  openFile: async (path) => {
    const { provider, tabs } = get();
    if (!provider) return;
    try {
      const doc = await provider.readFile(path);
      const tabExists = tabs.some((t) => t.path === path);
      const newTabs = tabExists
        ? tabs
        : [...tabs, { path, title: doc.title, dirty: false }];

      set({
        currentDoc: doc,
        lastSavedContent: doc.content,
        saveStatus: "idle",
        dirty: false,
        tabs: newTabs,
      });

      // Index opened file content for search
      useSearchStore.getState().addDocument({
        path: doc.path,
        title: doc.title,
        content: doc.content ?? "",
      });
    } catch (err) {
      useToastStore
        .getState()
        .addToast(
          `Failed to open file: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
    }
  },

  saveCurrentDoc: async () => {
    const { provider, currentDoc, tabs } = get();
    if (!provider || !currentDoc) return;
    set({ saveStatus: "saving" });
    try {
      const { serializeDocument } = await import("@/lib/markdown");
      const content = serializeDocument(currentDoc);
      const updated = await provider.writeFile(
        currentDoc.path,
        content,
        currentDoc.sha
      );
      const newTabs = tabs.map((t) =>
        t.path === currentDoc.path
          ? { ...t, dirty: false, title: updated.title }
          : t
      );
      set({
        currentDoc: updated,
        lastSavedContent: updated.content,
        saveStatus: "saved",
        dirty: false,
        tabs: newTabs,
      });
      setTimeout(() => {
        if (get().saveStatus === "saved") {
          set({ saveStatus: "idle" });
        }
      }, 2000);
    } catch (err) {
      set({ saveStatus: "error" });
      const is409 =
        err instanceof Error &&
        (err.message.includes("409") || err.message.includes("Conflict"));
      if (is409) {
        useToastStore
          .getState()
          .addToast(
            "File has been modified elsewhere. Refresh to get latest version.",
            "error"
          );
      } else {
        useToastStore
          .getState()
          .addToast(
            `Save failed: ${err instanceof Error ? err.message : "Unknown error"}`,
            "error"
          );
      }
    }
  },

  updateDocContent: (content) => {
    const { currentDoc, lastSavedContent, tabs } = get();
    if (!currentDoc) return;
    const dirty = content !== lastSavedContent;
    const newTabs = tabs.map((t) =>
      t.path === currentDoc.path ? { ...t, dirty } : t
    );
    set({
      currentDoc: { ...currentDoc, content },
      dirty,
      tabs: newTabs,
    });
  },

  updateDocTitle: (title) => {
    const { currentDoc, tabs } = get();
    if (!currentDoc) return;
    const newTabs = tabs.map((t) =>
      t.path === currentDoc.path ? { ...t, title, dirty: true } : t
    );
    set({
      currentDoc: { ...currentDoc, title },
      dirty: true,
      tabs: newTabs,
    });
  },

  updateDocFrontmatter: (frontmatter) => {
    const { currentDoc } = get();
    if (!currentDoc) return;
    set({
      currentDoc: { ...currentDoc, frontmatter },
      dirty: true,
    });
  },

  createFile: async (path, content?) => {
    const { provider } = get();
    if (!provider) return;
    try {
      const defaultContent =
        content ??
        `# ${path.split("/").pop()?.replace(/\.md$/, "") ?? "Untitled"}\n`;
      const doc = await provider.writeFile(path, defaultContent);
      const newTab: Tab = { path, title: doc.title, dirty: false };
      set({
        currentDoc: doc,
        lastSavedContent: doc.content,
        dirty: false,
        saveStatus: "idle",
        tabs: [...get().tabs, newTab],
      });
      await get().loadFileTree();
    } catch (err) {
      useToastStore
        .getState()
        .addToast(
          `Failed to create file: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
    }
  },

  deleteFile: async (path, sha?) => {
    const { provider, currentDoc, tabs } = get();
    if (!provider) return;
    try {
      await provider.deleteFile(path, sha);
      const newTabs = tabs.filter((t) => t.path !== path);
      if (currentDoc?.path === path) {
        const nextTab = newTabs[newTabs.length - 1];
        if (nextTab) {
          set({ tabs: newTabs });
          await get().openFile(nextTab.path);
        } else {
          set({
            currentDoc: null,
            lastSavedContent: null,
            dirty: false,
            tabs: newTabs,
          });
        }
      } else {
        set({ tabs: newTabs });
      }
      await get().loadFileTree();
    } catch (err) {
      useToastStore
        .getState()
        .addToast(
          `Failed to delete file: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
    }
  },

  renameFile: async (oldPath, newPath) => {
    const { provider, currentDoc, tabs } = get();
    if (!provider) return;
    try {
      const updated = await provider.moveFile(oldPath, newPath);
      const newTabs = tabs.map((t) =>
        t.path === oldPath
          ? { ...t, path: newPath, title: updated.title }
          : t
      );
      if (currentDoc?.path === oldPath) {
        set({
          currentDoc: updated,
          lastSavedContent: updated.content,
          dirty: false,
          tabs: newTabs,
        });
      } else {
        set({ tabs: newTabs });
      }
      await get().loadFileTree();
    } catch (err) {
      useToastStore
        .getState()
        .addToast(
          `Failed to rename file: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
    }
  },

  closeTab: (path) => {
    const { tabs, currentDoc } = get();
    const newTabs = tabs.filter((t) => t.path !== path);
    set({ tabs: newTabs });
    if (currentDoc?.path === path) {
      const nextTab = newTabs[newTabs.length - 1];
      if (nextTab) {
        get().openFile(nextTab.path);
      } else {
        set({ currentDoc: null, lastSavedContent: null, dirty: false });
      }
    }
  },

  switchTab: (path) => {
    const { currentDoc } = get();
    if (currentDoc?.path === path) return;
    get().openFile(path);
  },

  clearCache: async () => {
    const { provider } = get();
    if (!provider || !("clearCache" in provider)) return;
    await (provider as CachedGitHubStorageProvider).clearCache();
    set({ cacheInfo: null });
    useToastStore.getState().addToast("Cache cleared", "success");
  },

  refreshCacheInfo: async () => {
    const { provider } = get();
    if (!provider || !("getCacheInfo" in provider)) return;
    const info = await (provider as CachedGitHubStorageProvider).getCacheInfo();
    set({ cacheInfo: info });
  },

  checkForUpdates: async () => {
    const { provider } = get();
    if (!provider || !("checkForUpdates" in provider)) return;
    try {
      const changed = await (
        provider as CachedGitHubStorageProvider
      ).checkForUpdates();
      if (changed.length > 0) {
        // Reload tree
        const tree = await provider.listFiles();
        set({ fileTree: tree });
        get().refreshCacheInfo();
        useToastStore
          .getState()
          .addToast(
            `${changed.length} file${changed.length === 1 ? "" : "s"} updated from remote`,
            "info"
          );
      }
    } catch {
      // Silent failure for background checks
    }
  },

  importFiles: async (files) => {
    const { provider } = get();
    if (!provider) return { succeeded: 0, failed: 0 };
    let succeeded = 0;
    let failed = 0;
    for (const file of files) {
      try {
        await provider.writeFile(file.path, file.content);
        succeeded++;
      } catch {
        failed++;
      }
    }
    await get().loadFileTree();
    return { succeeded, failed };
  },
}));
