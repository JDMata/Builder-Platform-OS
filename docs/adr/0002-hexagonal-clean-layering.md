# 0002 — Hexagonal/Clean layering enforced by dependency-cruiser
Status: Accepted
Date: 2026-07-14

## Context
Clean/Hexagonal Architecture is a stated principle, but principles stated only in documentation erode under deadline pressure — a developer under pressure will import an SDK directly into a use case "just this once." The platform needs the layering rule to be unbreakable by accident, not just documented.

## Decision
Encode the four-layer rule (domain → application → ports → adapters, see [01-high-level-architecture.md](../architecture/01-high-level-architecture.md)) as `dependency-cruiser.config.cjs` rules that run in CI's lint stage and fail the build on violation. Package boundaries in the pnpm workspace are the unit these rules check.

## Consequences
- A PR that makes `domain/*` import an adapter or a third-party SDK fails CI immediately, with a clear error pointing at the offending import — no reliance on reviewer vigilance.
- New layers or exceptions require an explicit config change, which itself is visible in PR review — the boundary can't silently drift.
- Slight upfront cost: every new package needs to be correctly placed in the dependency-cruiser config's layer groups.

## Alternatives considered
- **Convention + code review only**: rejected — this is exactly the mechanism that fails under deadline pressure; the whole point of this ADR is to remove reliance on it.
- **ESLint import-boundary rules only**: viable but weaker for cross-package (not just cross-folder) checks; used in addition for intra-package conventions, not as the sole mechanism for the cross-package layering rule.
- **TypeScript path-mapping restrictions alone**: insufficient — doesn't stop a package from declaring a forbidden dependency in `package.json` and importing it; dependency-cruiser inspects the actual dependency graph.
