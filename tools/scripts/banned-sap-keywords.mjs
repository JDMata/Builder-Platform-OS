#!/usr/bin/env node
/**
 * SAF-19 fitness function (docs/architecture/12-risks-and-technical-debt.md,
 * R1: "SAP-specific logic leaks into core"). Scans domain/application layers
 * of every context package, every adapter-family package (`*-adapters/*`,
 * `persistence-postgres/*`, `llm-adapters/*`), and every app's composition-
 * root source, for a banned SAP-keyword list. Adapter packages were added to
 * this scan per the VS-1 Engineering Retrospective's `CIP-003` — defense in
 * depth, not a discovered violation (none was found). `plugins/*` is
 * deliberately out of scope — that's exactly where SAP-specific logic is
 * supposed to live.
 *
 * Comments are stripped before matching: a comment merely mentioning a
 * keyword as an illustrative example (e.g. artifact.ts's "fiori-elements-app"
 * showing that artifactType is an opaque string the core never interprets)
 * is not the risk this guard exists to catch — real SAP-specific *logic*
 * is. Short/ambiguous keywords (rap, cds, btp) are matched on word
 * boundaries only, found necessary by hand: a naive substring match flags
 * "resilience-wrapped" (contains "rap") as a false positive.
 *
 * Two files are explicitly allowlisted, not silently excluded by a broad
 * pattern: apps/orchestrator/src/build-dependencies.ts and
 * apps/worker/src/build-dependencies.ts each construct the one first-party
 * plugin Sprint 0 has (`new FioriGeneratorPlugin()`) — the composition
 * root's job is exactly to construct concrete adapters by name (every other
 * adapter in this codebase is wired the same way), and no dynamic,
 * manifest-driven plugin loader exists yet to do this any other way. This is
 * a known, tracked gap against 12-risks-and-technical-debt.md's more
 * restrictive "never a named plugin import, only via plugin-sdk's loader
 * type" wording — see the SAF-19 backlog entry.
 */
import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";

const BANNED_KEYWORDS = [
  { pattern: /fiori/i, name: "fiori" },
  { pattern: /sapui5/i, name: "sapui5" },
  { pattern: /abap/i, name: "abap" },
  { pattern: /\brap\b/i, name: "rap" },
  { pattern: /\bcds\b/i, name: "cds" },
  { pattern: /odata/i, name: "odata" },
  { pattern: /\bbtp\b/i, name: "btp" },
  { pattern: /cloudfoundry/i, name: "cloudfoundry" },
  { pattern: /kyma/i, name: "kyma" },
];

const ALLOWLISTED_FILES = new Set([
  "apps/orchestrator/src/build-dependencies.ts",
  "apps/worker/src/build-dependencies.ts",
]);

const SCAN_GLOBS = [
  "packages/context-*/src/domain/**/*.ts",
  "packages/context-*/src/application/**/*.ts",
  "packages/*-adapters/*/src/**/*.ts",
  "packages/persistence-postgres/*/src/**/*.ts",
  "packages/llm-adapters/*/src/**/*.ts",
  "apps/*/src/**/*.ts",
];

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

async function collectFiles() {
  const files = new Set();
  for (const pattern of SCAN_GLOBS) {
    for await (const file of glob(pattern)) {
      if (!file.endsWith(".spec.ts")) {
        files.add(file);
      }
    }
  }
  return [...files].sort();
}

async function main() {
  const files = await collectFiles();
  const violations = [];

  for (const file of files) {
    if (ALLOWLISTED_FILES.has(file)) {
      continue;
    }
    const source = readFileSync(file, "utf-8");
    const code = stripComments(source);
    const lines = code.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      for (const keyword of BANNED_KEYWORDS) {
        if (keyword.pattern.test(lines[i])) {
          violations.push({ file, line: i + 1, keyword: keyword.name, text: lines[i].trim() });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      "Banned SAP-keyword guard failed — SAP-specific logic must live in plugins/*, never core:\n",
    );
    for (const violation of violations) {
      console.error(
        `  ${violation.file}:${violation.line} — "${violation.keyword}" in: ${violation.text}`,
      );
    }
    console.error(
      `\n${violations.length} violation(s) found across ${files.length} scanned file(s).`,
    );
    process.exit(1);
  }

  console.log(`Banned SAP-keyword guard passed — ${files.length} file(s) scanned, 0 violations.`);
}

await main();
