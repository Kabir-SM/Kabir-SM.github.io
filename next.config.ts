import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // GitHub Pages only serves static files. The normal Sites build keeps using
  // vinext, while the Pages workflow opts into a static export.
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: isGitHubPages,
  },
  typescript: {
    tsconfigPath: isGitHubPages ? "./tsconfig.pages.json" : "./tsconfig.json",
  },
};

export default nextConfig;
