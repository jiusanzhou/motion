import { Octokit } from "@octokit/rest";
import { GitHubStorageProvider } from "./github";
import {
  getTree,
  setTree,
  getFile,
  setFile,
  removeFile,
  clearRepo,
  clearAll,
  getCacheInfo,
  makeRepoKey,
  addPendingWrite,
  getPendingWrites,
  removePendingWrite,
  getPendingWriteCount,
  type CacheInfo,
} from "@/lib/cache";
import type {
  GitHubConfig,
  MotionDocument,
  StorageProvider,
  TreeNode,
  CommitInfo,
} from "@/types";

export class CachedGitHubStorageProvider implements StorageProvider {
  readonly id = "github-cached";
  readonly name = "GitHub (Cached)";

  private inner: GitHubStorageProvider;
  private config: GitHubConfig;
  private octokit: Octokit | null = null;
  private repoKey: string;
  private _lastTreeSha: string | null = null;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.inner = new GitHubStorageProvider(config);
    this.repoKey = makeRepoKey(config.owner, config.repo, config.branch);
  }

  async connect(): Promise<void> {
    await this.inner.connect();
    this.octokit = new Octokit({ auth: this.config.token });
  }

  async disconnect(): Promise<void> {
    await this.inner.disconnect();
    this.octokit = null;
  }

  isConnected(): boolean {
    return this.inner.isConnected();
  }

  private getOctokit(): Octokit {
    if (!this.octokit) throw new Error("Not connected");
    return this.octokit;
  }

  /** Get the current commit SHA for the branch */
  private async getBranchSha(): Promise<string> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.getBranch({
      owner: this.config.owner,
      repo: this.config.repo,
      branch: this.config.branch,
    });
    return data.commit.sha;
  }

  async listFiles(): Promise<TreeNode[]> {
    const cached = await getTree(this.repoKey);
    if (cached) {
      try {
        const currentSha = await this.getBranchSha();
        if (currentSha === cached.treeSha) {
          this._lastTreeSha = currentSha;
          return cached.tree;
        }
      } catch {
        // Network error — return cached data
        this._lastTreeSha = cached.treeSha;
        return cached.tree;
      }
    }

    // Fetch fresh tree
    const tree = await this.inner.listFiles();
    try {
      const sha = await this.getBranchSha();
      this._lastTreeSha = sha;
      await setTree(this.repoKey, tree, sha);
    } catch {
      // Cache write failed, continue without caching
    }
    return tree;
  }

  async readFile(path: string): Promise<MotionDocument> {
    const cached = await getFile(this.repoKey, path);
    if (cached && cached.sha) {
      try {
        // Check if file has changed using GitHub API
        const octokit = this.getOctokit();
        const fullPath = this.config.basePath
          ? `${this.config.basePath}/${path}`.replace(/\/+/g, "/")
          : path;

        const { data } = await octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: fullPath,
          ref: this.config.branch,
        });

        if (!Array.isArray(data) && data.type === "file") {
          if (data.sha === cached.sha) {
            // File hasn't changed, return cached
            return {
              path: cached.path,
              title: cached.title,
              content: cached.content,
              frontmatter: cached.frontmatter,
              sha: cached.sha,
            };
          }
          // File changed — decode new content
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          const { parseDocument } = await import("@/lib/markdown");
          const doc: MotionDocument = {
            ...parseDocument(path, content),
            sha: data.sha,
          };
          await setFile(this.repoKey, path, doc);
          return doc;
        }
      } catch {
        // Network error — return cached data
        return {
          path: cached.path,
          title: cached.title,
          content: cached.content,
          frontmatter: cached.frontmatter,
          sha: cached.sha,
        };
      }
    }

    // No cache — fetch fresh
    const doc = await this.inner.readFile(path);
    await setFile(this.repoKey, path, doc);
    return doc;
  }

  async writeFile(
    path: string,
    content: string,
    sha?: string
  ): Promise<MotionDocument> {
    try {
      const doc = await this.inner.writeFile(path, content, sha);
      await setFile(this.repoKey, path, doc);

      // Refresh tree cache
      try {
        const tree = await this.inner.listFiles();
        const branchSha = await this.getBranchSha();
        this._lastTreeSha = branchSha;
        await setTree(this.repoKey, tree, branchSha);
      } catch {
        // Best-effort tree refresh
      }

      return doc;
    } catch (err) {
      if (isNetworkError(err)) {
        // Offline: queue write and update local cache
        await addPendingWrite(this.repoKey, path, content, sha);
        const { parseDocument } = await import("@/lib/markdown");
        const doc: MotionDocument = {
          ...parseDocument(path, content),
          sha: sha, // keep old sha; will be updated on sync
        };
        await setFile(this.repoKey, path, doc);
        return doc;
      }
      throw err;
    }
  }

  async deleteFile(path: string, sha?: string): Promise<void> {
    await this.inner.deleteFile(path, sha);
    await removeFile(this.repoKey, path);

    // Refresh tree cache
    try {
      const tree = await this.inner.listFiles();
      const branchSha = await this.getBranchSha();
      this._lastTreeSha = branchSha;
      await setTree(this.repoKey, tree, branchSha);
    } catch {
      // Best-effort
    }
  }

  async moveFile(oldPath: string, newPath: string): Promise<MotionDocument> {
    const doc = await this.inner.moveFile(oldPath, newPath);
    await removeFile(this.repoKey, oldPath);
    await setFile(this.repoKey, newPath, doc);

    // Refresh tree cache
    try {
      const tree = await this.inner.listFiles();
      const branchSha = await this.getBranchSha();
      this._lastTreeSha = branchSha;
      await setTree(this.repoKey, tree, branchSha);
    } catch {
      // Best-effort
    }

    return doc;
  }

  async getHistory(path: string): Promise<CommitInfo[]> {
    return this.inner.getHistory(path);
  }

  async getFileAtCommit(path: string, sha: string): Promise<string> {
    return this.inner.getFileAtCommit(path, sha);
  }

  // Cache management methods
  async clearCache(): Promise<void> {
    await clearRepo(this.repoKey);
  }

  async clearAllCaches(): Promise<void> {
    await clearAll();
  }

  async getCacheInfo(): Promise<CacheInfo> {
    return getCacheInfo(this.repoKey);
  }

  /** Check for remote updates and return changed file paths */
  async checkForUpdates(): Promise<string[]> {
    const cached = await getTree(this.repoKey);
    if (!cached) return [];

    try {
      const currentSha = await this.getBranchSha();
      if (currentSha === cached.treeSha) return [];

      // Tree has changed — fetch new tree and diff
      const newTree = await this.inner.listFiles();
      const oldFiles = flattenPaths(cached.tree);
      const newFiles = flattenPaths(newTree);

      // Find changed/added/removed files
      const changed: string[] = [];
      for (const path of newFiles) {
        if (!oldFiles.has(path)) {
          changed.push(path);
        }
      }
      for (const path of oldFiles) {
        if (!newFiles.has(path)) {
          changed.push(path);
        }
      }

      // Also check SHA differences for existing files by reading them
      // We compare by checking cached file SHAs against current
      // This is done lazily — just report tree-level changes here

      // Update cache
      this._lastTreeSha = currentSha;
      await setTree(this.repoKey, newTree, currentSha);

      // Invalidate cached files that may have changed
      // We can't know which files changed content without checking each one
      // So we invalidate files not in the new tree
      for (const path of oldFiles) {
        if (!newFiles.has(path)) {
          await removeFile(this.repoKey, path);
        }
      }

      return changed;
    } catch {
      return [];
    }
  }

  get lastTreeSha(): string | null {
    return this._lastTreeSha;
  }

  /** Sync all pending offline writes to GitHub */
  async syncPendingWrites(): Promise<{
    synced: number;
    conflicts: number;
    failed: number;
  }> {
    const pending = await getPendingWrites(this.repoKey);
    let synced = 0;
    let conflicts = 0;
    let failed = 0;

    for (const write of pending) {
      try {
        // Re-read current sha from cache (may have been updated)
        const cached = await getFile(this.repoKey, write.path);
        const currentSha = cached?.sha ?? write.sha;
        const doc = await this.inner.writeFile(
          write.path,
          write.content,
          currentSha
        );
        await setFile(this.repoKey, write.path, doc);
        await removePendingWrite(write.key);
        synced++;
      } catch (err) {
        const is409 =
          err instanceof Error &&
          (err.message.includes("409") || err.message.includes("Conflict"));
        if (is409) {
          conflicts++;
          // Leave in queue — user must resolve
        } else if (isNetworkError(err)) {
          failed++;
          // Still offline — keep in queue
        } else {
          failed++;
        }
      }
    }

    // Refresh tree cache if anything synced
    if (synced > 0) {
      try {
        const tree = await this.inner.listFiles();
        const branchSha = await this.getBranchSha();
        this._lastTreeSha = branchSha;
        await setTree(this.repoKey, tree, branchSha);
      } catch {
        // Best-effort
      }
    }

    return { synced, conflicts, failed };
  }

  /** Get count of pending offline writes */
  async getPendingCount(): Promise<number> {
    return getPendingWriteCount(this.repoKey);
  }
}

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed")
  );
}

function flattenPaths(tree: TreeNode[]): Set<string> {
  const paths = new Set<string>();
  function walk(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.type === "file") {
        paths.add(node.path);
      } else if (node.children) {
        walk(node.children);
      }
    }
  }
  walk(tree);
  return paths;
}
