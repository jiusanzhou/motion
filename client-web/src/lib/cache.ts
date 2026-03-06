import type { MotionDocument, TreeNode } from "@/types";

const DB_NAME = "motion-cache";
const DB_VERSION = 1;
const FILES_STORE = "files";
const TREES_STORE = "trees";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedFile {
  key: string; // repoKey/path
  path: string;
  content: string;
  sha?: string;
  frontmatter: Record<string, unknown>;
  title: string;
  cachedAt: number;
}

export interface CachedTree {
  repoKey: string;
  tree: TreeNode[];
  treeSha: string;
  cachedAt: number;
}

export interface CacheInfo {
  fileCount: number;
  treeCount: number;
}

function makeRepoKey(owner: string, repo: string, branch: string): string {
  return `${owner}/${repo}/${branch}`;
}

function isExpired(cachedAt: number): boolean {
  return Date.now() - cachedAt > CACHE_TTL;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          db.createObjectStore(FILES_STORE, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(TREES_STORE)) {
          db.createObjectStore(TREES_STORE, { keyPath: "repoKey" });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        dbInstance.onclose = () => {
          dbInstance = null;
          dbPromise = null;
        };
        resolve(dbInstance);
      };

      request.onerror = () => {
        dbPromise = null;
        resolve(null);
      };
    } catch {
      dbPromise = null;
      resolve(null);
    }
  });

  return dbPromise;
}

function tx(
  storeName: string,
  mode: IDBTransactionMode
): Promise<IDBObjectStore | null> {
  return openDB().then((db) => {
    if (!db) return null;
    try {
      const transaction = db.transaction(storeName, mode);
      return transaction.objectStore(storeName);
    } catch {
      return null;
    }
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Tree operations
export async function getTree(
  repoKey: string
): Promise<CachedTree | null> {
  const store = await tx(TREES_STORE, "readonly");
  if (!store) return null;
  const result = await idbRequest<CachedTree | undefined>(store.get(repoKey));
  if (!result) return null;
  if (isExpired(result.cachedAt)) return null;
  return result;
}

export async function setTree(
  repoKey: string,
  tree: TreeNode[],
  treeSha: string
): Promise<void> {
  const store = await tx(TREES_STORE, "readwrite");
  if (!store) return;
  const entry: CachedTree = { repoKey, tree, treeSha, cachedAt: Date.now() };
  await idbRequest(store.put(entry));
}

// File operations
export async function getFile(
  repoKey: string,
  path: string
): Promise<CachedFile | null> {
  const store = await tx(FILES_STORE, "readonly");
  if (!store) return null;
  const key = `${repoKey}/${path}`;
  const result = await idbRequest<CachedFile | undefined>(store.get(key));
  if (!result) return null;
  if (isExpired(result.cachedAt)) return null;
  return result;
}

export async function setFile(
  repoKey: string,
  path: string,
  doc: MotionDocument
): Promise<void> {
  const store = await tx(FILES_STORE, "readwrite");
  if (!store) return;
  const entry: CachedFile = {
    key: `${repoKey}/${path}`,
    path,
    content: doc.content,
    sha: doc.sha,
    frontmatter: doc.frontmatter,
    title: doc.title,
    cachedAt: Date.now(),
  };
  await idbRequest(store.put(entry));
}

export async function removeFile(
  repoKey: string,
  path: string
): Promise<void> {
  const store = await tx(FILES_STORE, "readwrite");
  if (!store) return;
  const key = `${repoKey}/${path}`;
  await idbRequest(store.delete(key));
}

export async function clearRepo(repoKey: string): Promise<void> {
  // Clear tree
  const treeStore = await tx(TREES_STORE, "readwrite");
  if (treeStore) {
    await idbRequest(treeStore.delete(repoKey));
  }
  // Clear all files with this repoKey prefix
  const fileStore = await tx(FILES_STORE, "readwrite");
  if (!fileStore) return;
  const allKeys = await idbRequest<IDBValidKey[]>(fileStore.getAllKeys());
  const prefix = `${repoKey}/`;
  for (const key of allKeys) {
    if (typeof key === "string" && key.startsWith(prefix)) {
      await idbRequest(fileStore.delete(key));
    }
  }
}

export async function clearAll(): Promise<void> {
  const db = await openDB();
  if (!db) return;
  const transaction = db.transaction([FILES_STORE, TREES_STORE], "readwrite");
  transaction.objectStore(FILES_STORE).clear();
  transaction.objectStore(TREES_STORE).clear();
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getCacheInfo(repoKey: string): Promise<CacheInfo> {
  const db = await openDB();
  if (!db) return { fileCount: 0, treeCount: 0 };

  let fileCount = 0;
  const fileStore = await tx(FILES_STORE, "readonly");
  if (fileStore) {
    const allKeys = await idbRequest<IDBValidKey[]>(fileStore.getAllKeys());
    const prefix = `${repoKey}/`;
    fileCount = allKeys.filter(
      (k) => typeof k === "string" && k.startsWith(prefix)
    ).length;
  }

  let treeCount = 0;
  const treeStore = await tx(TREES_STORE, "readonly");
  if (treeStore) {
    const tree = await idbRequest<CachedTree | undefined>(
      treeStore.get(repoKey)
    );
    treeCount = tree ? 1 : 0;
  }

  return { fileCount, treeCount };
}

export { makeRepoKey };
