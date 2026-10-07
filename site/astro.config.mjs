import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { parse } from "yaml";

// Repository root, so pages can read ../data with the same loaders as the scripts.
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const dataRoot = process.env.COMPARISON_ROOT || repoRoot;

// Platform pages with fewer products than this are noindex (see site/src/lib/data.ts),
// so they are left out of the sitemap too.
const MIN_PRODUCTS_TO_INDEX_PLATFORM = 2;
const productsDir = join(dataRoot, "data", "products");
const platformCounts = {};
for (const file of readdirSync(productsDir).filter((f) => f.endsWith(".yaml") && !f.startsWith("_"))) {
  const { platform } = parse(readFileSync(join(productsDir, file), "utf8"));
  platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;
}
const thinPlatforms = Object.keys(platformCounts).filter((p) => platformCounts[p] < MIN_PRODUCTS_TO_INDEX_PLATFORM);

export default defineConfig({
  site: "https://appwise-ma.github.io",
  base: "/exam-assessment-software-comparison",
  trailingSlash: "always",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/404") && !thinPlatforms.some((p) => page.endsWith(`/platform/${p}/`)),
    }),
  ],
  vite: {
    define: { __REPO_ROOT__: JSON.stringify(repoRoot) },
  },
});
