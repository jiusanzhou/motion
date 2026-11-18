import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "onnxruntime-node"],
};

initOpenNextCloudflareForDev();

export default nextConfig;
