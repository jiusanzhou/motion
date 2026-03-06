import { Octokit } from "@octokit/rest";
import { parseDocument } from "@/lib/markdown";
import type {
  GitHubConfig,
  MotionDocument,
  StorageProvider,
  TreeNode,
  CommitInfo,
} from "@/types";

export class GitHubStorageProvider implements StorageProvider {
  readonly id = "github";
  readonly name = "GitHub";

  private octokit: Octokit | null = null;
  private config: GitHubConfig;
  private connected = false;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.octokit = new Octokit({ auth: this.config.token });
    await this.octokit.repos.get({
      owner: this.config.owner,
      repo: this.config.repo,
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.octokit = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private getOctokit(): Octokit {
    if (!this.octokit) throw new Error("Not connected to GitHub");
    return this.octokit;
  }

  private fullPath(path: string): string {
    if (this.config.basePath) {
      return `${this.config.basePath}/${path}`.replace(/\/+/g, "/");
    }
    return path;
  }

  async listFiles(): Promise<TreeNode[]> {
    const octokit = this.getOctokit();
    const { data } = await octokit.git.getTree({
      owner: this.config.owner,
      repo: this.config.repo,
      tree_sha: this.config.branch,
      recursive: "true",
    });

    const basePath = this.config.basePath ?? "";
    const items = data.tree.filter((item) => {
      if (!item.path) return false;
      if (basePath && !item.path.startsWith(basePath)) return false;
      return item.path.endsWith(".md");
    });

    const root: TreeNode[] = [];
    const dirs = new Map<string, TreeNode>();

    for (const item of items) {
      let itemPath = item.path!;
      if (basePath) {
        itemPath = itemPath.slice(basePath.length).replace(/^\//, "");
      }
      const parts = itemPath.split("/");
      let currentLevel = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const currentPath = parts.slice(0, i + 1).join("/");
        const isFile = i === parts.length - 1 && item.type === "blob";

        if (isFile) {
          currentLevel.push({ name: part, path: currentPath, type: "file" });
        } else {
          let dir = dirs.get(currentPath);
          if (!dir) {
            dir = {
              name: part,
              path: currentPath,
              type: "directory",
              children: [],
            };
            dirs.set(currentPath, dir);
            currentLevel.push(dir);
          }
          currentLevel = dir.children!;
        }
      }
    }

    return root;
  }

  async readFile(path: string): Promise<MotionDocument> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path: this.fullPath(path),
      ref: this.config.branch,
    });

    if (Array.isArray(data) || data.type !== "file") {
      throw new Error(`Path is not a file: ${path}`);
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const doc = parseDocument(path, content);
    return { ...doc, sha: data.sha };
  }

  async writeFile(
    path: string,
    content: string,
    sha?: string
  ): Promise<MotionDocument> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: this.config.owner,
      repo: this.config.repo,
      path: this.fullPath(path),
      message: `Update ${path}`,
      content: Buffer.from(content).toString("base64"),
      branch: this.config.branch,
      ...(sha ? { sha } : {}),
    });

    const doc = parseDocument(path, content);
    return { ...doc, sha: data.content?.sha };
  }

  async deleteFile(path: string, sha?: string): Promise<void> {
    const octokit = this.getOctokit();
    if (!sha) {
      const existing = await this.readFile(path);
      sha = existing.sha;
    }
    await octokit.repos.deleteFile({
      owner: this.config.owner,
      repo: this.config.repo,
      path: this.fullPath(path),
      message: `Delete ${path}`,
      sha: sha!,
      branch: this.config.branch,
    });
  }

  async moveFile(oldPath: string, newPath: string): Promise<MotionDocument> {
    const existing = await this.readFile(oldPath);
    const content = existing.content;
    await this.deleteFile(oldPath, existing.sha);
    return this.writeFile(newPath, content);
  }

  async getHistory(path: string): Promise<CommitInfo[]> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.listCommits({
      owner: this.config.owner,
      repo: this.config.repo,
      sha: this.config.branch,
      path: this.fullPath(path),
      per_page: 30,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.committer?.date ?? commit.commit.author?.date ?? "",
      author: commit.commit.author?.name ?? "Unknown",
    }));
  }

  async getFileAtCommit(path: string, sha: string): Promise<string> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path: this.fullPath(path),
      ref: sha,
    });

    if (Array.isArray(data) || data.type !== "file") {
      throw new Error(`Path is not a file: ${path}`);
    }

    return Buffer.from(data.content, "base64").toString("utf-8");
  }
}
