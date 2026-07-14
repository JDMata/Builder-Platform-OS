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
      from: { path: "^packages/context-[^/]+/src/domain/" },
      to: { path: "^packages/context-[^/]+/src/application/" },
    },
    {
      name: "domain-no-adapters-or-apps-or-plugins",
      comment: "Domain must not depend on adapters, apps, or plugins.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/domain/" },
      to: {
        path: "^(packages/.*-adapters/|packages/persistence-postgres/|packages/object-storage-minio/|packages/graph-adapters/|packages/search-adapters/|apps/|plugins/)",
      },
    },
    {
      name: "domain-no-runtime-third-party-deps",
      comment:
        "Domain may only use third-party packages as type-only imports (e.g. utility types) — never a runtime dependency. See ARCHITECTURE_PRINCIPLES.md § Dependency rules.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/domain/" },
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
      from: { path: "^packages/context-([^/]+)/src/application/" },
      to: {
        path: "^packages/context-(?!$1/)[^/]+/src/(domain|application)/",
      },
    },
    {
      name: "application-no-adapters-or-apps-or-plugins",
      comment:
        "Application depends only on its own domain and packages/ports — never a concrete adapter, an app, or a plugin directly.",
      severity: "error",
      from: { path: "^packages/context-[^/]+/src/application/" },
      to: {
        path: "^(packages/.*-adapters/|packages/persistence-postgres/|packages/object-storage-minio/|packages/graph-adapters/|packages/search-adapters/|apps/|plugins/)",
      },
    },
    {
      name: "adapters-no-application",
      comment:
        "Adapters may depend on packages/ports, plugin-sdk, third-party SDKs, and testing-kit (dev) — never on any context's application layer directly.",
      severity: "error",
      from: {
        path: "^(packages/.*-adapters/|packages/persistence-postgres/|packages/object-storage-minio/|packages/graph-adapters/|packages/search-adapters/)",
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
