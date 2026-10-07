export interface ProseHit {
  line: number;
  match: string;
  rule: string;
}

export function parseBannedList(text: string): RegExp[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((entry) => {
      if (entry.startsWith("re:")) return new RegExp(entry.slice(3), "gi");
      const escaped = entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]");
      return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "gi");
    });
}

/** Removes fenced code, inline code, URLs and HTML comments so they are not linted. */
export function stripNonProse(text: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  return text
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/\]\([^)]*\)/g, blank)
    .replace(/https?:\/\/\S+/g, blank);
}

/** Blanks <style> and <script> blocks of an .astro/HTML file, keeping line numbers. */
export function stripCodeBlocks(text: string): string {
  return text.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/g, (m) => m.replace(/[^\n]/g, " "));
}

export function lintProse(text: string, rules: RegExp[]): ProseHit[] {
  const hits: ProseHit[] = [];
  stripNonProse(text).split("\n").forEach((line, i) => {
    for (const rule of rules) {
      rule.lastIndex = 0;
      for (const m of line.matchAll(rule)) {
        hits.push({ line: i + 1, match: m[0], rule: rule.source });
      }
    }
  });
  return hits;
}
