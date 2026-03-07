import type { StorageProvider, TreeNode } from "@/types";
import { serializeDocument } from "@/lib/markdown";

// ---- Export ----

function collectFilePaths(nodes: TreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      paths.push(node.path);
    } else if (node.children) {
      paths.push(...collectFilePaths(node.children));
    }
  }
  return paths;
}

export async function exportRepoAsZip(
  provider: StorageProvider,
  fileTree: TreeNode[],
  repoName: string
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const paths = collectFilePaths(fileTree);

  await Promise.all(
    paths.map(async (path) => {
      const doc = await provider.readFile(path);
      const serialized = serializeDocument(doc);
      zip.file(path, serialized);
    })
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${repoName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Import ----

export interface ImportedFile {
  path: string;
  content: string;
}

/** Read all .md files from a DataTransfer (supports folder drag-drop) */
export async function readDroppedFiles(
  dataTransfer: DataTransfer
): Promise<ImportedFile[]> {
  const results: ImportedFile[] = [];

  async function readEntry(
    entry: FileSystemEntry,
    basePath: string
  ): Promise<void> {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) =>
        fileEntry.file(resolve, reject)
      );
      if (!file.name.endsWith(".md")) return;
      const content = await file.text();
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      results.push({ path: relativePath, content });
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const reader = dirEntry.createReader();
      const entries = await new Promise<FileSystemEntry[]>(
        (resolve, reject) => {
          const all: FileSystemEntry[] = [];
          function readBatch() {
            reader.readEntries((batch) => {
              if (batch.length === 0) {
                resolve(all);
              } else {
                all.push(...batch);
                readBatch();
              }
            }, reject);
          }
          readBatch();
        }
      );
      const dirPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      await Promise.all(entries.map((e) => readEntry(e, dirPath)));
    }
  }

  const items = Array.from(dataTransfer.items);
  await Promise.all(
    items.map((item) => {
      const entry = item.webkitGetAsEntry();
      if (entry) return readEntry(entry, "");
    })
  );

  return results;
}

/** Read .md files from a standard file <input> (no folder support) */
export async function readInputFiles(
  fileList: FileList
): Promise<ImportedFile[]> {
  const results: ImportedFile[] = [];
  await Promise.all(
    Array.from(fileList)
      .filter((f) => f.name.endsWith(".md"))
      .map(async (file) => {
        const content = await file.text();
        // webkitRelativePath gives path when a folder is selected via input
        const path = file.webkitRelativePath || file.name;
        results.push({ path, content });
      })
  );
  return results;
}
