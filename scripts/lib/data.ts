import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export type SupportValue = "yes" | "partial" | "addon-paid" | "addon-free" | "no" | "unverified";
export const SUPPORT_VALUES: SupportValue[] = ["yes", "partial", "addon-paid", "addon-free", "no", "unverified"];

export interface FeatureDef {
  id: string;
  label: string;
  type: "support" | "number" | "text";
  definition: string;
  requires?: "hands-on";
}

export interface Area {
  id: string;
  label: string;
  features: FeatureDef[];
}

export interface Cell {
  value: string | number;
  note?: string;
  method?: "hands-on" | "docs" | "changelog" | "source-code";
  source_url?: string;
  evidence?: string;
  verified_at?: string;
  version?: string;
}

export interface Product {
  slug: string;
  name: string;
  platform: string;
  homepage: string;
  repository?: string;
  version_tested: string;
  affiliated: boolean;
  summary: string;
  features: Record<string, Cell>;
}

export interface Verdict {
  area: string;
  winners: string[];
  rationale: string;
  runner_up?: string;
  decided_at: string;
}

export interface LoadedProduct {
  file: string;
  data: Product;
}

export function readYaml<T>(path: string): T {
  return parse(readFileSync(path, "utf8")) as T;
}

export function loadAreas(root = ROOT): Area[] {
  return readYaml<{ areas: Area[] }>(join(root, "data", "features.yaml")).areas;
}

/** Map of "area.feature" -> definition. */
export function featureIndex(areas: Area[]): Map<string, FeatureDef & { area: string }> {
  const index = new Map<string, FeatureDef & { area: string }>();
  for (const area of areas) {
    for (const f of area.features) index.set(`${area.id}.${f.id}`, { ...f, area: area.id });
  }
  return index;
}

export function loadProducts(root = ROOT): LoadedProduct[] {
  const dir = join(root, "data", "products");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") && !f.startsWith("_"))
    .sort()
    .map((f) => ({ file: join(dir, f), data: readYaml<Product>(join(dir, f)) }));
}

export function loadVerdicts(root = ROOT): Verdict[] {
  const path = join(root, "data", "verdicts.yaml");
  if (!existsSync(path)) return [];
  return readYaml<{ verdicts: Verdict[] | null }>(path).verdicts ?? [];
}

export function slugFromFile(file: string): string {
  return basename(file).replace(/\.yaml$/, "");
}
