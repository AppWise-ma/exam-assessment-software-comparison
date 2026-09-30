// Flags marketing and filler language in docs, data and site copy. Exits 1 on any hit.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { stringify } from "yaml";
import { ROOT, loadProducts, loadVerdicts } from "./lib/data.ts";
import { lintProse, parseBannedList, stripCodeBlocks } from "./lib/prose.ts";

const rules = parseBannedList(readFileSync(join(ROOT, "style", "banned-phrases.txt"), "utf8"));
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro", ".remember", "evidence", "style"]);

function filesMatching(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIP_DIRS.has(name) ? [] : filesMatching(path, pattern);
    return pattern.test(name) ? [path] : [];
  });
}

const targets: { label: string; text: string }[] = filesMatching(ROOT, /\.(md|mdx)$/).map((path) => ({
  label: relative(ROOT, path),
  text: readFileSync(path, "utf8"),
}));

// Hand-written text in the site: page copy, titles and descriptions in .astro and .ts files.
// <style> and <script> blocks are blanked; the rest is linted as is (code rarely contains these phrases).
for (const path of filesMatching(join(ROOT, "site", "src"), /\.(astro|ts)$/)) {
  targets.push({ label: relative(ROOT, path), text: stripCodeBlocks(readFileSync(path, "utf8")) });
}

// Only the human-written fields of the data are prose.
for (const { file, data } of loadProducts()) {
  const prose = {
    summary: data.summary,
    notes: Object.fromEntries(Object.entries(data.features ?? {}).filter(([, c]) => c.note).map(([k, c]) => [k, c.note])),
  };
  targets.push({ label: relative(ROOT, file) + " (summary/notes)", text: stringify(prose) });
}
const verdicts = loadVerdicts();
if (verdicts.length) {
  targets.push({ label: "data/verdicts.yaml (rationales)", text: verdicts.map((v) => `${v.area}: ${v.rationale}`).join("\n") });
}

let total = 0;
for (const { label, text } of targets) {
  for (const hit of lintProse(text, rules)) {
    console.log(`${label}:${hit.line}  "${hit.match}"`);
    total++;
  }
}
console.log(total ? `\n${total} banned phrase(s). Rewrite them in plain words.` : "Prose check passed.");
process.exit(total ? 1 : 0);
