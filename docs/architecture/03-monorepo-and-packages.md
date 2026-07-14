# 03 — Monorepo Strategy & Package Strategy

## Monorepo strategy

**Decision:** pnpm workspaces for dependency management + Turborepo for task orchestration/caching. TypeScript project references mirror the workspace graph so `tsc -b` and IDE go-to-definition respect package boundaries. See [ADR-0001](../adr/0001-pnpm-turborepo-monorepo.md).

Why a monorepo at all: the platform's core value is the *seams* between domain, ports, adapters, and plugins staying consistent as dozens of packages evolve together. A polyrepo would require versioned publishing and cross-repo coordination for every port/adapter change, which is exactly the friction that causes teams to quietly bypass the abstraction ("just import the SDK directly, it's faster"). A monorepo with workspace-protocol dependencies (`workspace:*`) makes the correct path the easy path.

Why not a single flat `src/`: without package boundaries, "no core → adapter" and "no core → plugin" rules have no enforcement surface. Packages are the unit that `dependency-cruiser` and `pnpm`'s dependency graph can actually check.

### Tooling choices

| Concern | Choice | Rationale |
|---|---|---|
| Package manager | pnpm | Strict node_modules (no phantom deps), fast, native workspace support |
| Task runner / cache | Turborepo | Affected-only builds/tests, remote caching, simple `turbo.json` config, no vendor lock-in (output is just build artifacts) |
| Versioning/release | Changesets | Per-package semver + changelogs inside a monorepo, decoupled from CI tool |
| TS project graph | TS project references | Enforces build order, enables incremental builds, catches illegal imports at the type-check level |
| Boundary enforcement | dependency-cruiser | Encodes the Clean/Hexagonal layering rules ([01](01-high-level-architecture.md)) as a CI-failing check, not a code review reminder |
| Internal scaffolding | Plop/Hygen templates (`tools/generators`) | New packages/plugins are generated from a template that already has the right `package.json`, tsconfig, lint config, and test scaffold — consistency by default, not by memory |

## Package strategy

### Naming
All internal packages are scoped `@sap-app-factory/<layer>-<context-or-vendor>`, e.g.:
- `@sap-app-factory/domain-workflow`
- `@sap-app-factory/application-requirements`
- `@sap-app-factory/ports`
- `@sap-app-factory/adapter-llm-anthropic`
- `@sap-app-factory/plugin-fiori-generator`

### Dependency rules (enforced by dependency-cruiser, see [10](10-coding-standards-and-naming.md))
1. `domain/*` depends on nothing internal except other `domain/*` modules within the *same* context, and zero third-party runtime deps (types-only allowed).
2. `application/*` depends only on `domain/*` and `ports/*`.
3. `*-adapters/*` and `plugins/*` may depend on `ports/*`, `plugin-sdk`, third-party SDKs, and `testing-kit` (dev only) — never on `application/*` or another vendor's adapter.
4. `apps/*` are the only packages allowed to depend on concrete adapters and wire them to ports (composition root / dependency injection at the edge).
5. No package may depend on `plugins/*` except `apps/orchestrator` and `apps/worker`, and only through `plugin-sdk`'s loader interface — never a direct import of a specific plugin.

### Publishing
Everything stays internal (`"private": true` at workspace root) in Sprint 0. `plugin-sdk` is designed so that, later, third-party or partner-authored plugins could be published as independent npm packages and installed at runtime without a monorepo checkout — this is why the plugin contract lives in its own minimal package rather than being folded into `ports`.

### Versioning
Changesets tracks per-package version bumps. Even though nothing is published externally yet, this habit from day one means `plugin-sdk` and `ports` — the two packages external/partner code will eventually depend on — already have a disciplined changelog and semver history before anyone outside the core team consumes them.
