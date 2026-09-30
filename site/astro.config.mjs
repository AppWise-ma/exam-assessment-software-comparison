import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Repository root, so pages can read ../data with the same loaders as the scripts.
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  site: "https://appwise-ma.github.io",
  base: "/exam-assessment-software-comparison",
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
  vite: {
    define: { __REPO_ROOT__: JSON.stringify(repoRoot) },
  },
});
