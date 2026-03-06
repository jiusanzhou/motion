import { Octokit } from "@octokit/rest";

interface UploadConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  basePath?: string;
}

export async function uploadImage(
  file: File,
  config: UploadConfig
): Promise<string> {
  const octokit = new Octokit({ auth: config.token });

  const ext = file.name.split(".").pop() ?? "png";
  const timestamp = Date.now();
  const fileName = `${timestamp}.${ext}`;
  const assetPath = config.basePath
    ? `${config.basePath}/assets/${fileName}`.replace(/\/+/g, "/")
    : `assets/${fileName}`;

  const buffer = await file.arrayBuffer();
  const content = btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path: assetPath,
    message: `Upload ${fileName}`,
    content,
    branch: config.branch,
  });

  // Return raw GitHub URL for the image
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${assetPath}`;
}
