import type { Area, Cell, FeatureDef, Product, Verdict } from "./data.ts";
import { SUPPORT_VALUES, featureIndex } from "./data.ts";

/** A cell older than this is flagged as stale. */
export const STALE_AFTER_DAYS = 180;

export interface Issue {
  level: "error" | "warning";
  where: string;
  message: string;
}

export interface ProductContext {
  today: Date;
  fileSlug: string;
  fileExists: (relPath: string) => boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function checkValueType(def: FeatureDef, value: Cell["value"]): string | null {
  if (value === "unverified") return null;
  switch (def.type) {
    case "support":
      return SUPPORT_VALUES.includes(value as never)
        ? null
        : `expected one of ${SUPPORT_VALUES.join(", ")}, got "${value}"`;
    case "number":
      return Number.isInteger(value) ? null : `expected an integer, got "${value}"`;
    case "text":
      return typeof value === "string" ? null : `expected text, got ${typeof value}`;
  }
}

export function checkCell(key: string, def: FeatureDef, cell: Cell, ctx: ProductContext): Issue[] {
  const issues: Issue[] = [];
  const err = (message: string) => issues.push({ level: "error", where: key, message });
  const warn = (message: string) => issues.push({ level: "warning", where: key, message });

  const typeError = checkValueType(def, cell.value);
  if (typeError) err(typeError);

  if (cell.value === "unverified") return issues;

  // Every claim needs a source someone else can check.
  if (!cell.source_url && !cell.evidence) err("claim has no source_url and no evidence");
  if (!cell.verified_at) err("claim has no verified_at date");
  if (!cell.method) err("claim has no method (hands-on, docs, changelog, source-code)");

  if ((cell.value === "partial" || String(cell.value).startsWith("addon-")) && !cell.note) {
    err(`"${cell.value}" needs a note explaining what is missing or which add-on`);
  }

  if (def.requires === "hands-on" && cell.method !== "hands-on") {
    err(`this feature only counts when observed hands-on (method is "${cell.method}")`);
  }
  if (cell.method === "hands-on" && !cell.evidence) {
    warn("hands-on claim without an evidence screenshot");
  }
  if (cell.evidence && !ctx.fileExists(cell.evidence)) {
    err(`evidence file not found: ${cell.evidence}`);
  }

  if (cell.verified_at) {
    const date = new Date(`${cell.verified_at}T00:00:00Z`);
    const ageDays = Math.floor((ctx.today.getTime() - date.getTime()) / DAY_MS);
    if (Number.isNaN(ageDays)) err(`invalid verified_at "${cell.verified_at}"`);
    else if (ageDays < 0) err(`verified_at ${cell.verified_at} is in the future`);
    else if (ageDays > STALE_AFTER_DAYS) warn(`stale: verified ${ageDays} days ago`);
  }
  return issues;
}

export function checkProduct(product: Product, areas: Area[], ctx: ProductContext): Issue[] {
  const issues: Issue[] = [];
  const index = featureIndex(areas);

  if (product.slug !== ctx.fileSlug) {
    issues.push({ level: "error", where: "slug", message: `slug "${product.slug}" does not match file name "${ctx.fileSlug}"` });
  }

  for (const [key, cell] of Object.entries(product.features ?? {})) {
    const def = index.get(key);
    if (!def) {
      issues.push({ level: "error", where: key, message: "unknown feature (not in data/features.yaml)" });
      continue;
    }
    issues.push(...checkCell(key, def, cell, ctx));
  }
  return issues;
}

/** Share of taxonomy features that have a non-"unverified" value. */
export function coverage(product: Product, areas: Area[]): { assessed: number; total: number } {
  const keys = [...featureIndex(areas).keys()];
  const assessed = keys.filter((k) => {
    const cell = product.features?.[k];
    return cell && cell.value !== "unverified";
  }).length;
  return { assessed, total: keys.length };
}

export function checkVerdicts(verdicts: Verdict[], areas: Area[], slugs: Set<string>): Issue[] {
  const issues: Issue[] = [];
  const areaIds = new Set(areas.map((a) => a.id));
  const seen = new Set<string>();
  for (const v of verdicts) {
    const where = `verdict:${v.area}`;
    if (!areaIds.has(v.area)) issues.push({ level: "error", where, message: "unknown area" });
    if (seen.has(v.area)) issues.push({ level: "error", where, message: "duplicate verdict for area" });
    seen.add(v.area);
    for (const w of v.winners) {
      if (!slugs.has(w)) issues.push({ level: "error", where, message: `winner "${w}" is not a known product` });
    }
    if (v.runner_up) {
      if (!slugs.has(v.runner_up)) issues.push({ level: "error", where, message: `runner_up "${v.runner_up}" is not a known product` });
      if (v.winners.includes(v.runner_up)) issues.push({ level: "error", where, message: "runner_up is also a winner" });
    }
  }
  return issues;
}
