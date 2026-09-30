// Build-time data access for the site. Reads ../data with the same loaders the scripts use.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Marked, type Tokens } from "marked";
import { featureIndex, loadAreas, loadProducts, loadVerdicts, type Product } from "../../../scripts/lib/data.ts";
import { coverage } from "../../../scripts/lib/rules.ts";
import { extractDisclosure, headingId, rewriteRepoHref } from "../../../scripts/lib/site.ts";

declare const __REPO_ROOT__: string;
/** COMPARISON_ROOT lets a build read another copy of the data (used to preview fixtures). */
export const REPO_ROOT: string = process.env.COMPARISON_ROOT || __REPO_ROOT__;

/** Date used for "stale" badges: the build date. */
export const TODAY = new Date();

export const areas = loadAreas(REPO_ROOT);
export const features = featureIndex(areas);
export const products: Product[] = loadProducts(REPO_ROOT).map((p) => p.data);
export const verdicts = loadVerdicts(REPO_ROOT);
export const bySlug = new Map(products.map((p) => [p.slug, p]));

export function productCoverage(p: Product) {
  return coverage(p, areas);
}

export interface Health {
  source: string;
  fetched_at: string;
  stars: number | null;
  last_push: string | null;
  latest_release: { tag: string; date: string } | null;
  license_spdx: string | null;
  open_issues: number | null;
  archived: boolean | null;
}

export function loadHealth(slug: string): Health | null {
  const path = join(REPO_ROOT, "data", "health", `${slug}.json`);
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as Health) : null;
}

/** Joins a path onto the site base: url("products/moodle/") -> "/exam-assessment-software-comparison/products/moodle/". */
export function url(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return base + path.replace(/^\//, "");
}

/** Absolute URL for canonical links and JSON-LD. */
export function absUrl(path = ""): string {
  return new URL(url(path), import.meta.env.SITE).href;
}

function markdown(): Marked {
  const md = new Marked();
  md.use({
    walkTokens(token) {
      if (token.type === "link") (token as Tokens.Link).href = rewriteRepoHref((token as Tokens.Link).href, url);
    },
    renderer: {
      heading({ tokens, depth, text }) {
        return `<h${depth} id="${headingId(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
  });
  return md;
}

export function renderRepoMarkdown(file: string): string {
  return markdown().parse(readFileSync(join(REPO_ROOT, file), "utf8")) as string;
}

/** Disclosure line from README.md, rendered as inline HTML. The Next Exams link is a normal followed link. */
export const disclosureHtml = markdown().parseInline(
  extractDisclosure(readFileSync(join(REPO_ROOT, "README.md"), "utf8")),
) as string;
