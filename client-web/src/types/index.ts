export interface MotionDocument {
  path: string;
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
  sha?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

export interface StorageProvider {
  id: string;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  listFiles(): Promise<TreeNode[]>;
  readFile(path: string): Promise<MotionDocument>;
  writeFile(
    path: string,
    content: string,
    sha?: string
  ): Promise<MotionDocument>;
  deleteFile(path: string, sha?: string): Promise<void>;
  moveFile(oldPath: string, newPath: string): Promise<MotionDocument>;
  getHistory?(path: string): Promise<CommitInfo[]>;
  getFileAtCommit?(path: string, sha: string): Promise<string>;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  basePath?: string;
}

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  basePath?: string;
}

export interface AgentMeta {
  tags?: string[];
  summary?: string;
  links?: string[];
  data?: Record<string, unknown>;
  access?: "public" | "private" | "agent";
}

export interface Tab {
  path: string;
  title: string;
  dirty: boolean;
}

export interface CommitInfo {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export type SidebarView = "files" | "graph" | "tags";
