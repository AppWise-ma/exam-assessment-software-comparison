import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT, type Product } from "../scripts/lib/data.ts";
import { stripCodeBlocks } from "../scripts/lib/prose.ts";
import {
  REPO_URL,
  cellHref,
  compareStats,
  comparePairs,
  lastVerified,
  metaDescription,
  isStale,
  jsonLd,
  rewriteRepoHref,
  softwareApplicationLd,
  valueLabel,
} from "../scripts/lib/site.ts";

const today = new Date("2026-09-30T00:00:00Z");
const sourced = { method: "docs" as const, source_url: "https://example.org/docs" };

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

describe("cell display", () => {
  it("labels values and unverified cells", () => {
    expect(valueLabel({ value: "addon-paid", ...sourced, verified_at: "2026-09-01" })).toBe("Paid add-on");
    expect(valueLabel({ value: 12, ...sourced, verified_at: "2026-09-01" })).toBe("12");
    expect(valueLabel({ value: "unverified" })).toBe("Not checked");
    expect(valueLabel(undefined)).toBe("Not checked");
  });

  it("marks cells older than 180 days as stale", () => {
    expect(isStale({ value: "yes", ...sourced, verified_at: "2026-04-03" }, today)).toBe(false); // 180 days
    expect(isStale({ value: "yes", ...sourced, verified_at: "2026-04-02" }, today)).toBe(true); // 181 days
    expect(isStale({ value: "unverified" }, today)).toBe(false);
  });

  it("links to the source, or to the evidence file when there is no source", () => {
    expect(cellHref({ value: "yes", ...sourced, verified_at: "2026-09-01" })).toBe("https://example.org/docs");
    expect(cellHref({ value: "yes", method: "hands-on", evidence: "evidence/x/1/a.png", verified_at: "2026-09-01" }))
      .toBe(`${REPO_URL}/blob/main/evidence/x/1/a.png`);
    expect(cellHref({ value: "unverified" })).toBeNull();
  });
});

describe("comparePairs", () => {
  it("emits nothing without a next-exams product", () => {
    expect(comparePairs(["moodle", "tcexam"])).toEqual([]);
  });

  it("pairs next-exams with every other product", () => {
    expect(comparePairs(["tcexam", "next-exams", "moodle"]).map((p) => p.pair)).toEqual([
      "next-exams-vs-moodle",
      "next-exams-vs-tcexam",
    ]);
  });
});

describe("rewriteRepoHref", () => {
  const siteUrl = (p: string) => `/base/${p}`;
  it("maps repository links to GitHub and the methodology page", () => {
    expect(rewriteRepoHref("data/features.yaml", siteUrl)).toBe(`${REPO_URL}/blob/main/data/features.yaml`);
    expect(rewriteRepoHref("../../issues/new?template=correction.yml", siteUrl)).toBe(`${REPO_URL}/issues/new?template=correction.yml`);
    expect(rewriteRepoHref("METHODOLOGY.md#what-is-included", siteUrl)).toBe("/base/methodology/#what-is-included");
    expect(rewriteRepoHref("https://example.org/x", siteUrl)).toBe("https://example.org/x");
    expect(rewriteRepoHref("#local", siteUrl)).toBe("#local");
  });
});

describe("metaDescription", () => {
  it("keeps short text", () => {
    expect(metaDescription("Short text.")).toBe("Short text.");
  });

  it("cuts long text on a word boundary", () => {
    const d = metaDescription("word ".repeat(60));
    expect(d.length).toBeLessThanOrEqual(155);
    expect(d.endsWith("word…")).toBe(true);
  });
});

describe("lastVerified", () => {
  it("returns the newest checked date and ignores unverified cells", () => {
    const p = product({
      "a.x": { value: "yes", ...sourced, verified_at: "2026-09-01" },
      "a.y": { value: "no", ...sourced, verified_at: "2026-09-20" },
      "a.z": { value: "unverified", verified_at: "2026-09-29" },
    });
    expect(lastVerified([p])).toBe("2026-09-20");
    expect(lastVerified([product({})])).toBeNull();
  });
});

describe("compareStats", () => {
  it("counts features both checked and those that differ", () => {
    const a = product({ "a.x": { value: "yes", ...sourced }, "a.y": { value: "no", ...sourced }, "a.z": { value: "yes", ...sourced } });
    const b = product({ "a.x": { value: "yes", ...sourced }, "a.y": { value: "yes", ...sourced }, "a.z": { value: "unverified" } });
    expect(compareStats(a, b, ["a.x", "a.y", "a.z"])).toEqual({ both: 2, differ: 1 });
  });
});

describe("softwareApplicationLd", () => {
  it("adds license and a zero-price offer only from sourced cells", () => {
    const ld = softwareApplicationLd(
      product({
        "cost.license_spdx": { value: "GPL-3.0-or-later", ...sourced, verified_at: "2026-09-01" },
        "cost.price_model": { value: "free", ...sourced, verified_at: "2026-09-01" },
      }),
      "https://site/products/demo/",
    );
    expect(ld.license).toBe("https://spdx.org/licenses/GPL-3.0-or-later.html");
    expect(ld.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(ld).not.toHaveProperty("aggregateRating");
  });

  it("omits license and offers when they are not checked", () => {
    const ld = softwareApplicationLd(
      product({ "cost.license_spdx": { value: "unverified" }, "cost.price_model": { value: "freemium", ...sourced, verified_at: "2026-09-01" } }),
      "https://site/products/demo/",
    );
    expect(ld).not.toHaveProperty("license");
    expect(ld).not.toHaveProperty("offers");
  });

  it("escapes < in serialized JSON-LD", () => {
    expect(jsonLd({ name: "</script>" })).not.toContain("</script>");
  });
});

describe("stripCodeBlocks", () => {
  it("blanks style and script blocks but keeps line numbers", () => {
    const out = stripCodeBlocks("<p>Hi</p>\n<style>\n.powerful {}\n</style>\n<script>x</script>");
    expect(out).not.toContain("powerful");
    expect(out.split("\n")).toHaveLength(5);
  });
});
