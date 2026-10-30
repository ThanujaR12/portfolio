// Mobile Lighthouse audit with a 90-point gate per category (constitution Principle III).
// Usage: npm run build && npm start -- -p 3001, then: npm run lighthouse [baseUrl]
// Runs Lighthouse through npx so it isn't a project dependency; uses the installed Chrome.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3001";
const routes = ["/", "/projects/paletteboard", "/resume"];
const MIN = 90;
const out = mkdtempSync(path.join(tmpdir(), "lighthouse-"));
let failed = false;

for (const route of routes) {
  const file = path.join(out, `${route.replace(/\W+/g, "_") || "home"}.json`);
  execFileSync(
    "npx",
    [
      "--yes",
      "lighthouse@13.6.0",
      base + route,
      "--quiet",
      "--chrome-flags=--headless=new",
      "--form-factor=mobile",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${file}`,
    ],
    { stdio: "ignore", shell: process.platform === "win32" },
  );
  const report = JSON.parse(readFileSync(file, "utf8"));
  const scores = Object.values(report.categories).map((c) => [c.id, Math.round(c.score * 100)]);
  const low = scores.filter(([, s]) => s < MIN);
  if (low.length) failed = true;
  console.log(`${low.length ? "✗" : "✓"} ${route.padEnd(24)} ${scores.map(([id, s]) => `${id} ${s}`).join("  ")}`);
}

if (failed) {
  console.error(`\nSome scores are below ${MIN}. Reports: ${out}`);
  process.exit(1);
}
