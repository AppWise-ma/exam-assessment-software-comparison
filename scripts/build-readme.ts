// Regenerates the data tables in README.md. With --check, fails if README.md is out of date.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadAreas, loadProducts, loadVerdicts } from "./lib/data.ts";
import { renderGenerated, replaceGenerated } from "./lib/readme.ts";

const path = join(ROOT, "README.md");
const current = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const next = replaceGenerated(current, renderGenerated(loadProducts(), loadAreas(), loadVerdicts()));

if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error("README.md is out of date. Run: npm run readme");
    process.exit(1);
  }
  console.log("README.md is up to date.");
} else {
  writeFileSync(path, next);
  console.log("README.md updated.");
}
