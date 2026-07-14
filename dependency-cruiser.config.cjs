/**
 * Encodes the Clean/Hexagonal layering rules from ADR-0002 and
 * ARCHITECTURE_PRINCIPLES.md "Dependency rules". This is the sole authority
 * for import-boundary enforcement on this platform — ESLint (eslint.config.mjs)
 * deliberately does not duplicate any of these rules.
 *
 * Scope for SAF-2: the domain/application/ports/adapters layering rule only.
 * The plugin-import-boundary rule and the banned-SAP-keyword guard are SAF-19.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */

// Test files (*.spec.ts) are dev-time-only and never ship — they legitimately
// need to import a test framework (vitest) and are exempt from the
// production-code layering rules below. Found while scaffolding SAF-8's first
// real domain unit tests: without this exclusion, every domain *.spec.ts
// importing `vitest` was flagged as a "runtime third-party dependency"
// violation, which conflated "what the shipped module depends on" with
// "what its test suite depends on to run."
const NOT_A_TEST_FILE = "(?<!\\.spec\\.ts)$";

module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment:
        "Circular dependencies make the dependency graph impossible to reason about layer-by-layer.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "domain-no-application",
      comment:
        "A context's domain layer must not depend on any application layer (its own or another context's) — domain has zero framework/use-case dependencies. See ARCHITECTURE_PRINCIPLES.md § Dependency rules.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/domain/.+" + NOT_A_TEST_FILE },
      to: { path: "^packages/context-[^/]+/src/application/" },
    },
    {
      name: "domain-no-adapters-or-apps-or-plugins",
      comment: "Domain must not depend on adapters, apps, or plugins.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/domain/.+" + NOT_A_TEST_FILE },
      to: {
        path: "^(packages/.*-adapters/|packages/persistence-postgres/|packages/object-storage-minio/|packages/graph-adapters/|packages/search-adapters/|apps/|plugins/)",
      },
    },
    {
      name: "domain-no-ports",
      comment:
        "Domain depends on nothing outside its own context's domain folder — not even packages/ports, which is layer 3 (application depends on it, domain does not). Found while scaffolding SAF-8's first real domain code.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/domain/.+" + NOT_A_TEST_FILE },
      to: { path: "^packages/ports/" },
    },
    {
      name: "domain-no-runtime-third-party-deps",
      comment:
        "Domain may only use third-party packages as type-only imports (e.g. utility types) — never a runtime dependency. See ARCHITECTURE_PRINCIPLES.md § Dependency rules. Test files are exempt — see NOT_A_TEST_FILE above.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/domain/.+" + NOT_A_TEST_FILE },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
          "npm-no-pkg",
          "npm-unknown",
          "core",
          "deprecated",
        ],
        dependencyTypesNot: ["type-only"],
      },
    },
    {
      name: "application-no-cross-context",
      comment:
        "A context's application layer may depend only on its OWN context's domain, never another context's domain or application layer. Cross-context communication is event-only (ADR-0007) or via ports, never a direct import.",
      severity: "error",
      from: { path: "^packages/context-([^/]+)/src/application/.+" + NOT_A_TEST_FILE },
      to: {
        path: "^packages/context-(?!$1/)[^/]+/src/(domain|application)/",
      },
    },
    {
      name: "application-no-adapters-or-apps-or-plugins",
      comment:
        "Application depends only on its own domain and packages/ports — never a concrete adapter, an app, or a plugin directly.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/application/.+" + NOT_A_TEST_FILE },
      to: {
        path: "^(packages/.*-adapters/|packages/persistence-postgres/|packages/object-storage-minio/|packages/graph-adapters/|packages/search-adapters/|apps/|plugins/)",
      },
    },
    {
      name: "application-no-npm-deps-except-ports",
      comment:
        "Application depends only on its own domain and packages/ports — never an arbitrary third-party npm package directly. Confirmed via SAF-7 fixture testing that a workspace-linked `@sap-app-factory/ports` import resolves with dependencyType 'undetermined' pointing at packages/ports/dist, not 'npm' — so this rule's pathNot exception is what actually allows it through, not the dependencyTypes filter.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/application/.+" + NOT_A_TEST_FILE },
      to: {
        pathNot: "^packages/ports/",
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
          "npm-no-pkg",
          "npm-unknown",
          "core",
          "deprecated",
        ],
        dependencyTypesNot: ["type-only"],
      },
    },
    {
      name: "adapters-no-application",
      comment:
        "Adapters may depend on packages/ports, plugin-sdk, third-party SDKs, and testing-kit (dev) — never on any context's application layer directly.",
      severity: "error",
      from: {
        path:
          "^(packages/.*-adapters/|packages/persistence-postgres/|packages/object-storage-minio/|packages/graph-adapters/|packages/search-adapters/).+" +
          NOT_A_TEST_FILE,
      },
      to: { path: "^packages/context-[^/]+/src/application/" },
    },
  ],
  options: {
    // Deliberately no `includeOnly` here: it restricts the whole analysis
    // universe, which would silently drop edges pointing AT an npm package
    // (e.g. domain importing a third-party runtime dependency) from being
    // evaluated at all — exactly the violation domain-no-runtime-third-party-deps
    // exists to catch. Scanning `.` (rather than literal `apps packages plugins
    // tools` arguments) also means this doesn't hard-error before those
    // directories exist yet.
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    // No `tsConfig` reference yet: tsconfig.base.json has no "include" matching
    // any real file until SAF-7 adds the first package, and building a full TS
    // Program would error on zero root files. Not needed for path-alias
    // resolution (none configured) or type-only detection (syntactic, not
    // Program-dependent) — revisit once per-package tsconfig.json files exist.
  },
};
