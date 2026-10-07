// Pure helpers used by the static site in site/. Kept here so they are type-checked and tested
// together with the rest of the scripts.
import type { Cell, Product } from "./data.ts";
import { STALE_AFTER_DAYS } from "./rules.ts";

export const REPO_URL = "https://github.com/AppWise-ma/exam-assessment-software-comparison";
/** Product that the compare pages are built around. */
export const OWN_SLUG = "next-exams";

export const PLATFORM_LABEL: Record<string, string> = {
  joomla: "Joomla",
  wordpress: "WordPress",
  odoo: "Odoo",
  "standalone-web": "Web app",
  desktop: "Desktop",
  mobile: "Mobile",
};

const VALUE_LABEL: Record<string, string> = {
  yes: "Yes",
  partial: "Partial",
  "addon-paid": "Paid add-on",
  "addon-free": "Free add-on",
  no: "No",
};

export function isAssessed(cell: Cell | undefined): cell is Cell {
  return !!cell && cell.value !== "unverified";
}

/** Display text for a cell value. */
export function valueLabel(cell: Cell | undefined): string {
  if (!isAssessed(cell)) return "Not checked";
  return VALUE_LABEL[String(cell.value)] ?? String(cell.value);
}

/** CSS class hint for a cell value. */
export function valueClass(cell: Cell | undefined): string {
  if (!isAssessed(cell)) return "v-unverified";
  const v = String(cell.value);
  return v in VALUE_LABEL ? `v-${v}` : "v-text";
}

export function ageInDays(verifiedAt: string, today: Date): number {
  const date = new Date(`${verifiedAt}T00:00:00Z`);
  return Math.floor((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export function isStale(cell: Cell | undefined, today: Date): boolean {
  if (!isAssessed(cell) || !cell.verified_at) return false;
  return ageInDays(cell.verified_at, today) > STALE_AFTER_DAYS;
}

/** Where a reader can check the cell: its source URL, or the evidence file in the repository. */
export function cellHref(cell: Cell | undefined): string | null {
  if (!isAssessed(cell)) return null;
  if (cell.source_url) return cell.source_url;
  if (cell.evidence) return `${REPO_URL}/blob/main/${cell.evidence}`;
  return null;
}

/** "next-exams-vs-<other>" slugs. Empty until a next-exams product file exists. */
export function comparePairs(slugs: string[]): { pair: string; a: string; b: string }[] {
  if (!slugs.includes(OWN_SLUG)) return [];
  return slugs
    .filter((s) => s !== OWN_SLUG)
    .sort()
    .map((b) => ({ pair: `${OWN_SLUG}-vs-${b}`, a: OWN_SLUG, b }));
}

/**
 * Rewrites a link found in a repository Markdown file so it works on the site:
 * METHODOLOGY.md goes to the methodology page, other repo paths go to GitHub.
 */
export function rewriteRepoHref(href: string, siteUrl: (path: string) => string): string {
  if (/^([a-z]+:|#)/i.test(href)) return href;
  const issues = href.match(/^(?:\.\.\/)+issues(.*)$/);
  if (issues) return `${REPO_URL}/issues${issues[1]}`;
  const [path, hash] = href.split("#");
  if (path.replace(/^\.\//, "") === "METHODOLOGY.md") return siteUrl("methodology/") + (hash ? `#${hash}` : "");
  const clean = path.replace(/^\.\//, "");
  const kind = clean.endsWith("/") ? "tree" : "blob";
  return `${REPO_URL}/${kind}/main/${clean}${hash ? `#${hash}` : ""}`;
}

/** Shortens text for a meta description, cutting on a word boundary. */
export function metaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.-]+$/, "") + "…";
}

/** Most recent verified_at across the given products, or null. Used as the page's modified date. */
export function lastVerified(products: Product[]): string | null {
  let latest: string | null = null;
  for (const p of products) {
    for (const cell of Object.values(p.features ?? {})) {
      if (isAssessed(cell) && cell.verified_at && (!latest || cell.verified_at > latest)) latest = cell.verified_at;
    }
  }
  return latest;
}

/** Counts for a pair: features both products have a checked value for, and how many of those differ. */
export function compareStats(a: Product, b: Product, featureKeys: string[]): { both: number; differ: number } {
  let both = 0;
  let differ = 0;
  for (const key of featureKeys) {
    const ca = a.features[key];
    const cb = b.features[key];
    if (!isAssessed(ca) || !isAssessed(cb)) continue;
    both++;
    if (valueLabel(ca) !== valueLabel(cb)) differ++;
  }
  return { both, differ };
}

/** GitHub-style heading id. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const WEB_PLATFORMS = new Set(["joomla", "wordpress", "odoo", "standalone-web"]);

/** schema.org SoftwareApplication. Only includes fields backed by an assessed cell. */
export function softwareApplicationLd(product: Product, pageUrl: string): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: product.name,
    url: pageUrl,
    sameAs: product.homepage,
    applicationCategory: "EducationalApplication",
    softwareVersion: product.version_tested,
  };
  if (WEB_PLATFORMS.has(product.platform)) ld.operatingSystem = "Web";
  const license = product.features["cost.license_spdx"];
  if (isAssessed(license) && /^[A-Za-z0-9.+-]+$/.test(String(license.value))) {
    ld.license = `https://spdx.org/licenses/${license.value}.html`;
  }
  const price = product.features["cost.price_model"];
  if (isAssessed(price) && String(price.value).toLowerCase() === "free" && price.source_url) {
    ld.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
  }
  return ld;
}

export function breadcrumbLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

/** Serializes JSON-LD for a <script> tag without allowing "</script>" to break out. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
}
