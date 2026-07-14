// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

// See CODING_STANDARDS.md "TypeScript rules" and "Logging" for the rationale
// behind each rule below. Import-boundary / layering rules (domain cannot
// import application/adapters, adapters cannot import a context's
// application layer, etc.) are NOT enforced here — that is
// dependency-cruiser.config.cjs's job (ADR-0002), so there is exactly one
// authority for the layering rule, not two systems that could disagree.
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/.next/**",
      // Next.js-generated, framework-mandated content ("This file should not
      // be edited" is Next's own comment) — not application code to lint.
      "**/next-env.d.ts",
      ".changeset/**",
      "docs/**",
      ".ai/**",
      "**/*.md",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Ban `any` outright — CODING_STANDARDS.md: use `unknown` and narrow at the boundary.
      "@typescript-eslint/no-explicit-any": "error",

      // Required by verbatimModuleSyntax (tsconfig.base.json, SAF-1) and keeps
      // type-only imports from pulling in runtime dependencies they don't need.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" },
      ],

      // CODING_STANDARDS.md "Logging": structured logging via packages/observability only.
      "no-console": "error",

      // CODING_STANDARDS.md "Error handling": no silently swallowed async errors.
      "@typescript-eslint/no-floating-promises": "error",

      // Empty catch blocks are exactly the "swallowed error, just in case" pattern
      // CODING_STANDARDS.md prohibits.
      "no-empty": ["error", { allowEmptyCatch: false }],

      // Off, not a deliberate CODING_STANDARDS.md rule — just bundled in
      // recommendedTypeChecked above. Flags every interface-conformance stub
      // whose Sprint 0 implementation has no real async work yet (an adapter
      // returning Promise.resolve(mockValue), an async generator implementing
      // AsyncIterable for streaming with nothing to await) — pure noise here,
      // and the actual risk it partially guards against (a forgotten await)
      // is already covered by no-floating-promises above. Found while
      // scaffolding SAF-9's first two adapter stubs; will recur for every
      // future one, so fixed at the config level rather than patched per file.
      "@typescript-eslint/require-await": "off",

      // Standard convention: a leading underscore marks a parameter as
      // intentionally unused (e.g. `_ctx: RequestContext` in a Sprint 0 stub
      // that must accept RequestContext to satisfy a port's signature but has
      // no use for it yet). Off by default in recommendedTypeChecked's
      // no-unused-vars; found while scaffolding SAF-10's stdio adapter, and
      // this recurs anywhere a stub implements a port method it doesn't fully
      // need yet — configuring the convention beats prefixing every call site
      // with `void _ctx;` or deleting the parameter and breaking the interface.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Tooling config files (root-level, and per-package vitest.config.ts etc.)
    // are build/test-runner configuration, not application code — the rules
    // above (no-console, type-checked linting) don't apply to them. Excluded
    // from typed linting specifically so a package's own tsconfig.json
    // (which only "include"s src/) doesn't need to also cover its config files.
    files: ["**/*.config.{js,cjs,mjs}", "eslint.config.mjs", "**/*.config.{ts,mts,cts}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "off",
    },
  },
  eslintConfigPrettier,
);
