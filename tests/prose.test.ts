import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT } from "../scripts/lib/data.ts";
import { lintProse, parseBannedList } from "../scripts/lib/prose.ts";

const rules = parseBannedList(readFileSync(join(ROOT, "style", "banned-phrases.txt"), "utf8"));
const matches = (text: string) => lintProse(text, rules).map((h) => h.match.toLowerCase());

describe("lintProse", () => {
  it("flags marketing words", () => {
    expect(matches("A seamless and robust exam tool.")).toEqual(["seamless", "robust"]);
  });

  it("flags filler constructions", () => {
    expect(matches("It's not just a quiz tool, it's a platform.")).toHaveLength(1);
    expect(matches("Whether you're a teacher or a school")).toEqual(["whether you're"]);
  });

  it("does not flag substrings of other words", () => {
    expect(matches("The landscaped garden has robustness issues.")).toEqual([]);
  });

  it("ignores code, URLs and link targets", () => {
    expect(matches("Run `seamless --flag` and see https://x.org/robust or [docs](https://x.org/powerful).")).toEqual([]);
  });

  it("reports line numbers", () => {
    expect(lintProse("fine line\nthis is powerful", rules)[0].line).toBe(2);
  });

  it("passes plain factual text", () => {
    expect(matches("Product X 1.0 has 9 question types in a default install.")).toEqual([]);
  });
});
