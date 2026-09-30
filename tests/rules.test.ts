import { describe, expect, it } from "vitest";
import type { Area, Product } from "../scripts/lib/data.ts";
import { checkProduct, checkVerdicts, coverage } from "../scripts/lib/rules.ts";

const areas: Area[] = [
  {
    id: "grading",
    label: "Grading",
    features: [
      { id: "auto_grading", label: "Auto", type: "support", definition: "d" },
      { id: "type_count", label: "Count", type: "number", definition: "d" },
      { id: "keyboard", label: "Keyboard", type: "support", definition: "d", requires: "hands-on" },
    ],
  },
];

const sourced = { source_url: "https://example.org/docs", verified_at: "2026-09-01", method: "docs" as const };

function product(features: Product["features"]): Product {
  return {
    slug: "demo",
    name: "Demo",
    platform: "joomla",
    homepage: "https://example.org",
    version_tested: "1.0",
    affiliated: false,
    summary: "A demo product used only in tests.",
    features,
  };
}

const ctx = { today: new Date("2026-09-30T00:00:00Z"), fileSlug: "demo", fileExists: () => true };
const errors = (p: Product, c = ctx) => checkProduct(p, areas, c).filter((i) => i.level === "error");
const warnings = (p: Product, c = ctx) => checkProduct(p, areas, c).filter((i) => i.level === "warning");

describe("checkProduct", () => {
  it("accepts a sourced claim", () => {
    expect(errors(product({ "grading.auto_grading": { value: "yes", ...sourced } }))).toEqual([]);
  });

  it("rejects a claim without a source", () => {
    const e = errors(product({ "grading.auto_grading": { value: "yes", verified_at: "2026-09-01", method: "docs" } }));
    expect(e.map((i) => i.message)).toContain("claim has no source_url and no evidence");
  });

  it("allows 'unverified' without a source", () => {
    expect(errors(product({ "grading.auto_grading": { value: "unverified" } }))).toEqual([]);
  });

  it("requires a note on partial and add-on values", () => {
    expect(errors(product({ "grading.auto_grading": { value: "partial", ...sourced } }))).toHaveLength(1);
    expect(errors(product({ "grading.auto_grading": { value: "addon-paid", ...sourced } }))).toHaveLength(1);
    expect(errors(product({ "grading.auto_grading": { value: "partial", note: "only MCQ", ...sourced } }))).toEqual([]);
  });

  it("checks value types", () => {
    expect(errors(product({ "grading.auto_grading": { value: "maybe", ...sourced } }))).toHaveLength(1);
    expect(errors(product({ "grading.type_count": { value: "nine", ...sourced } }))).toHaveLength(1);
    expect(errors(product({ "grading.type_count": { value: 9, ...sourced } }))).toEqual([]);
  });

  it("rejects unknown features", () => {
    expect(errors(product({ "grading.nope": { value: "yes", ...sourced } }))).toHaveLength(1);
  });

  it("enforces hands-on-only features", () => {
    expect(errors(product({ "grading.keyboard": { value: "yes", ...sourced } }))).toHaveLength(1);
    const handsOn = { value: "yes", ...sourced, method: "hands-on" as const, evidence: "evidence/demo/1.0/kb.png" };
    expect(errors(product({ "grading.keyboard": handsOn }))).toEqual([]);
  });

  it("errors when the evidence file is missing", () => {
    const cell = { value: "yes", ...sourced, evidence: "evidence/demo/missing.png" };
    expect(errors(product({ "grading.auto_grading": cell }), { ...ctx, fileExists: () => false })).toHaveLength(1);
  });

  it("flags stale and future dates", () => {
    expect(warnings(product({ "grading.auto_grading": { value: "yes", ...sourced, verified_at: "2025-01-01" } }))[0].message).toMatch(/^stale/);
    expect(errors(product({ "grading.auto_grading": { value: "yes", ...sourced, verified_at: "2027-01-01" } }))).toHaveLength(1);
  });

  it("requires the slug to match the file name", () => {
    expect(errors(product({}), { ...ctx, fileSlug: "other" })).toHaveLength(1);
  });
});

describe("coverage", () => {
  it("counts only assessed features", () => {
    const p = product({ "grading.auto_grading": { value: "yes", ...sourced }, "grading.type_count": { value: "unverified" } });
    expect(coverage(p, areas)).toEqual({ assessed: 1, total: 3 });
  });
});

describe("checkVerdicts", () => {
  const slugs = new Set(["a", "b"]);
  const base = { rationale: "x".repeat(40), decided_at: "2026-09-30" };

  it("accepts known winners", () => {
    expect(checkVerdicts([{ area: "grading", winners: ["a"], runner_up: "b", ...base }], areas, slugs)).toEqual([]);
  });

  it("rejects unknown areas, unknown winners and duplicate areas", () => {
    const issues = checkVerdicts(
      [
        { area: "nope", winners: ["zzz"], ...base },
        { area: "grading", winners: ["a"], ...base },
        { area: "grading", winners: ["a"], runner_up: "a", ...base },
      ],
      areas,
      slugs,
    );
    expect(issues.map((i) => i.message)).toEqual([
      "unknown area",
      'winner "zzz" is not a known product',
      "duplicate verdict for area",
      "runner_up is also a winner",
    ]);
  });
});
