// Fetches project-health numbers (stars, last push, latest release, license)
// from the GitHub or GitLab API into data/health/<slug>.json.
// These are machine-collected facts, kept apart from the hand-verified feature cells.
// Set GITHUB_TOKEN to avoid the 60 requests/hour anonymous limit.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadProducts } from "./lib/data.ts";

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

async function getJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": "exam-software-comparison", ...headers } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function github(owner: string, repo: string): Promise<Health> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const r = await getJson(base, headers);
  if (!r) throw new Error(`GitHub repo not found: ${owner}/${repo}`);
  const rel = await getJson(`${base}/releases/latest`, headers);
  return {
    source: r.html_url,
    fetched_at: new Date().toISOString(),
    stars: r.stargazers_count,
    last_push: r.pushed_at,
    latest_release: rel ? { tag: rel.tag_name, date: rel.published_at } : null,
    license_spdx: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
    open_issues: r.open_issues_count,
    archived: r.archived,
  };
}

async function gitlab(host: string, path: string): Promise<Health> {
  const id = encodeURIComponent(path);
  const r = await getJson(`https://${host}/api/v4/projects/${id}?license=true`);
  if (!r) throw new Error(`GitLab project not found: ${host}/${path}`);
  const rels = await getJson(`https://${host}/api/v4/projects/${id}/releases?per_page=1`);
  const rel = Array.isArray(rels) && rels[0];
  return {
    source: r.web_url,
    fetched_at: new Date().toISOString(),
    stars: r.star_count ?? null,
    last_push: r.last_activity_at ?? null,
    latest_release: rel ? { tag: rel.tag_name, date: rel.released_at } : null,
    license_spdx: r.license?.key ? String(r.license.key).toUpperCase() : null,
    open_issues: r.open_issues_count ?? null,
    archived: r.archived ?? null,
  };
}

export async function fetchHealth(repository: string): Promise<Health | null> {
  const url = new URL(repository);
  const parts = url.pathname.replace(/^\/|\/$|\.git$/g, "").split("/");
  if (url.hostname === "github.com") return github(parts[0], parts[1]);
  if (url.hostname.includes("gitlab")) return gitlab(url.hostname, parts.join("/"));
  return null;
}

const outDir = join(ROOT, "data", "health");
mkdirSync(outDir, { recursive: true });
let failed = 0;
for (const { data } of loadProducts()) {
  if (!data.repository) {
    console.log(`skip ${data.slug}: no public repository`);
    continue;
  }
  try {
    const health = await fetchHealth(data.repository);
    if (!health) {
      console.log(`skip ${data.slug}: unsupported host ${data.repository}`);
      continue;
    }
    writeFileSync(join(outDir, `${data.slug}.json`), JSON.stringify(health, null, 2) + "\n");
    console.log(`ok   ${data.slug}: ${health.stars ?? "?"} stars, last push ${health.last_push ?? "?"}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${data.slug}: ${(e as Error).message}`);
  }
}
process.exit(failed ? 1 : 0);
