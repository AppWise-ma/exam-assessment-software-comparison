// Validates every product and verdict file against the schema and the
// sourcing rules in METHODOLOGY.md. Exits 1 on any error.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";
import formatsPlugin from "ajv-formats";
import { ROOT, loadAreas, loadProducts, loadVerdicts, slugFromFile, readYaml } from "./lib/data.ts";
import { checkProduct, checkVerdicts, coverage, type Issue } from "./lib/rules.ts";

// ajv-formats is CommonJS; under NodeNext its default import is typed as the namespace.
const addFormats = formatsPlugin as unknown as typeof formatsPlugin.default;
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const loadSchema = (name: string) => JSON.parse(readFileSync(join(ROOT, "schema", name), "utf8"));
const validateProductSchema = ajv.compile(loadSchema("product.schema.json"));
const validateVerdictSchema = ajv.compile(loadSchema("verdicts.schema.json"));

const today = new Date();
const areas = loadAreas();
const products = loadProducts();
let errors = 0;
let warnings = 0;

function report(label: string, issues: Issue[]) {
  for (const i of issues) {
    const tag = i.level === "error" ? "ERROR" : "warn ";
    console.log(`  ${tag} ${label} ${i.where}: ${i.message}`);
    if (i.level === "error") errors++;
    else warnings++;
  }
}

for (const { file, data } of products) {
  const slug = slugFromFile(file);
  if (!validateProductSchema(data)) {
    report(slug, (validateProductSchema.errors ?? []).map((e: ErrorObject) => ({
      level: "error" as const,
      where: e.instancePath || "/",
      message: `schema: ${e.message}`,
    })));
    continue;
  }
  report(slug, checkProduct(data, areas, {
    today,
    fileSlug: slug,
    fileExists: (rel) => existsSync(join(ROOT, rel)),
  }));
  const { assessed, total } = coverage(data, areas);
  console.log(`  ${slug}: ${assessed}/${total} features assessed`);
}

const verdictsPath = join(ROOT, "data", "verdicts.yaml");
if (existsSync(verdictsPath)) {
  const raw = readYaml<unknown>(verdictsPath);
  if (!validateVerdictSchema(raw)) {
    report("verdicts", (validateVerdictSchema.errors ?? []).map((e: ErrorObject) => ({
      level: "error" as const,
      where: e.instancePath || "/",
      message: `schema: ${e.message}`,
    })));
  } else {
    report("verdicts", checkVerdicts(loadVerdicts(), areas, new Set(products.map((p) => p.data.slug))));
  }
}

console.log(`\n${products.length} products, ${errors} errors, ${warnings} warnings`);
process.exit(errors > 0 ? 1 : 0);
