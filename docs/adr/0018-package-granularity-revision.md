# 0018 — Package granularity revision: one package per context, not per layer
Status: Proposed
Date: 2026-07-14 (added in principal-architect review, see [13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §3.1, §8.1)

## Context
[03-monorepo-and-packages.md](../architecture/03-monorepo-and-packages.md) originally placed `domain/<context>` and `application/<context>` in separate packages for all ten bounded contexts — 20+ packages before counting `ports`, `*-adapters`, `plugins`, and `apps`. On self-review, no context currently needs to version or release its domain layer independently from its application layer; the split adds `package.json`/`tsconfig`/build-graph maintenance for every context with no corresponding benefit yet, which is itself a maintainability cost against the platform's 10-year horizon, not a safeguard for it.

## Decision
Each bounded context gets **one** package, `packages/context-<name>` (e.g., `packages/context-workflow`), with internal `src/domain/` and `src/application/` folders. The dependency rule from [ADR-0002](0002-hexagonal-clean-layering.md) — domain has zero internal/third-party runtime dependencies, application depends only on domain and `ports` — is now enforced by a **folder-scoped** dependency-cruiser rule (matching on path, e.g. `src/domain/**` must not import `src/application/**` or anything outside `ports`) rather than a package-scoped one. The enforced architectural property is identical; only the packaging unit changes.

## Consequences
- Roughly halves the package count contributed by bounded contexts (10 packages instead of 20+), reducing build-graph and tooling overhead without weakening the layering guarantee — dependency-cruiser catches a `src/domain` → `src/application` import exactly as before, just via a path pattern instead of a package-boundary pattern.
- A context can still be split into two packages later, the moment it actually needs independent versioning or a different release cadence for its domain vs. application layer — the same extraction-criteria discipline used for services ([ADR-0003](0003-modular-monolith-first.md)) applies here, at package granularity.
- [docs/folder-structure.md](../folder-structure.md) and [03-monorepo-and-packages.md](../architecture/03-monorepo-and-packages.md) are updated to reflect `packages/context-<name>/src/{domain,application}` in place of separate `packages/domain/<name>` and `packages/application/<name>` trees.
- `ports/*`, `*-adapters/*`, `plugin-sdk`, and `plugins/*` are unaffected — this revision is scoped only to the domain+application packaging of the ten bounded contexts.

## Alternatives considered
- **Keep domain/application split per context (status quo)**: rejected on this review — no current need justifies the overhead; revisit per-context if and when a specific context needs independent release cadence.
- **Collapse everything (ports, adapters, contexts) into a handful of mega-packages**: rejected — that would blur the boundary that actually matters (the ports/adapters seam, which enables vendor-swapping and is exercised by contract tests); this ADR only removes a split that had no corresponding architectural payoff, not the ones that do.
