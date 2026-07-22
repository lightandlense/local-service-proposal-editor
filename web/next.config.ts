import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (pdfjs-dist) and mammoth don't survive being bundled into the
  // server chunk - keep them as real Node requires at runtime.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
