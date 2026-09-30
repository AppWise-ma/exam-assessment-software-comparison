import type { Area, Cell, LoadedProduct, Verdict } from "./data.ts";
import { coverage } from "./rules.ts";
import { PLATFORM_LABEL } from "./site.ts";

export const START = "<!-- generated:start -->";
export const END = "<!-- generated:end -->";

export function cellText(cell: Cell | undefined): string {
  if (!cell || cell.value === "unverified") return "Not checked";
  return String(cell.value);
}

const esc = (s: string) => s.replace(/\|/g, "\\|");

export function renderGenerated(products: LoadedProduct[], areas: Area[], verdicts: Verdict[]): string {
  const lines: string[] = [];
  const bySlug = new Map(products.map((p) => [p.data.slug, p.data]));

  lines.push("### Products compared", "");
  if (!products.length) {
    lines.push("_No products published yet._", "");
  } else {
    lines.push("| Product | Platform | License | Price model | Version tested | Features checked |");
    lines.push("|---|---|---|---|---|---|");
    for (const { data: p } of products) {
      const { assessed, total } = coverage(p, areas);
      const name = p.affiliated ? `${p.name} (ours)` : p.name;
      lines.push(
        `| [${esc(name)}](${p.homepage}) | ${PLATFORM_LABEL[p.platform] ?? p.platform} | ${esc(cellText(p.features["cost.license_spdx"]))} | ${esc(cellText(p.features["cost.price_model"]))} | ${esc(p.version_tested)} | ${assessed}/${total} |`,
      );
    }
    lines.push("");
  }

  lines.push("### Best in each area", "");
  if (!verdicts.length) {
    lines.push("_Verdicts are published after hands-on testing is complete._", "");
  } else {
    const areaLabel = new Map(areas.map((a) => [a.id, a.label]));
    for (const v of verdicts) {
      const names = v.winners.map((w) => bySlug.get(w)?.name ?? w).join(", ") || "No clear winner";
      lines.push(`- **${areaLabel.get(v.area) ?? v.area}:** ${names}. ${v.rationale.trim()}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function replaceGenerated(readme: string, generated: string): string {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README.md must contain ${START} and ${END}`);
  }
  return readme.slice(0, start + START.length) + "\n" + generated + readme.slice(end);
}
