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
    },
  },
  {
    // Tooling config files (root-level, and per-package vitest.config.ts etc.)
    // are build/test-runner configuration, not application code — the rules
    // above (no-console, type-checked linting) don't apply to them. Excluded
    // from typed linting specifically so a package's own tsconfig.json
    // (which only "include"s src/) doesn't need to also cover its config files.
    files: ["*.config.{js,cjs,mjs}", "eslint.config.mjs", "**/*.config.{ts,mts,cts}"],
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
