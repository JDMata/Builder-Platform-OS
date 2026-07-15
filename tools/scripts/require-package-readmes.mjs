#!/usr/bin/env node
/**
 * SAF-19 fitness function (docs/architecture/12-risks-and-technical-debt.md,
 * "Documentation-as-code"): every real workspace package under packages/,
 * plugins/, and apps/ must have a README.md with both a "## Purpose" and a
 * "## Ports" section (the "## Ports" prefix match, not an exact string,
 * accommodates a legitimate variant like testing-kit's "## Ports
 * (dependency)"). A package is "real" if it has its own package.json —
 * generated/build directories (apps/web/.next, any dist/, node_modules)
 * are not packages and are excluded.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { glob } from "node:fs/promises";

const PACKAGE_JSON_GLOBS = [
  "packages/**/package.json",
  "apps/*/package.json",
  "plugins/*/package.json",
];

const EXCLUDED_PATH_SEGMENTS = ["/node_modules/", "/dist/", "/.next/"];

async function findPackageDirs() {
  const dirs = new Set();
  for (const pattern of PACKAGE_JSON_GLOBS) {
    for await (const file of glob(pattern)) {
      if (EXCLUDED_PATH_SEGMENTS.some((segment) => `/${file}/`.includes(segment))) {
        continue;
      }
      dirs.add(dirname(file));
    }
  }
  return [...dirs].sort();
}

function hasHeading(content, prefix) {
  return content.split("\n").some((line) => line.trim().startsWith(prefix));
}

async function main() {
  const dirs = await findPackageDirs();
  const violations = [];

  for (const dir of dirs) {
    const readmePath = `${dir}/README.md`;
    if (!existsSync(readmePath)) {
      violations.push({ dir, reason: "missing README.md" });
      continue;
    }
    const content = readFileSync(readmePath, "utf-8");
    if (!hasHeading(content, "## Purpose")) {
      violations.push({ dir, reason: "README.md has no '## Purpose' section" });
    }
    if (!hasHeading(content, "## Ports")) {
      violations.push({ dir, reason: "README.md has no '## Ports' section" });
    }
  }

  if (violations.length > 0) {
    console.error("Package-README-required check failed:\n");
    for (const violation of violations) {
      console.error(`  ${violation.dir} — ${violation.reason}`);
    }
    console.error(`\n${violations.length} violation(s) found across ${dirs.length} package(s).`);
    process.exit(1);
  }

  console.log(`Package-README-required check passed — ${dirs.length} package(s) checked.`);
}

await main();
