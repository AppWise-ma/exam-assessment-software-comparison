import { copyFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
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

// Also publish the sitemap at the usual /sitemap.xml address. While every URL fits in one
// sitemap-0.xml, that file is copied as is; with more chunks the index is copied instead.
function sitemapXml() {
  return {
    name: "sitemap-xml",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const out = fileURLToPath(dir);
        const chunks = readdirSync(out).filter((f) => /^sitemap-\d+\.xml$/.test(f));
        const source = chunks.length === 1 ? chunks[0] : "sitemap-index.xml";
        if (existsSync(join(out, source))) copyFileSync(join(out, source), join(out, "sitemap.xml"));
      },
    },
  };
}

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
    sitemapXml(),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: { __REPO_ROOT__: JSON.stringify(repoRoot) },
  },
});
