# 0001 — pnpm workspaces + Turborepo for the monorepo
Status: Proposed
Date: 2026-07-14

## Context
The platform will grow into dozens of packages (domain, application, ports, multiple adapter families, multiple plugins, multiple apps) that must evolve together while keeping strict dependency boundaries. A polyrepo would require versioned publishing for every port/adapter change, creating friction that encourages bypassing abstractions.

## Decision
Use a single monorepo managed with pnpm workspaces (strict node_modules, no phantom dependencies) and Turborepo for task orchestration (affected-only builds/tests, local + remote caching). TypeScript project references mirror the workspace graph. Changesets manages per-package semver and changelogs.

## Consequences
- Cross-package refactors (e.g., changing a port signature) are single PRs, reviewable as one unit.
- CI must be structured around "affected packages" to stay fast as the repo grows — an explicit Turborepo pipeline requirement, not optional.
- Requires discipline: `workspace:*` protocol dependencies must not be bypassed with published-version pins "for convenience."

## Alternatives considered
- **Polyrepo per package/service**: rejected — versioning overhead across ~15+ interdependent packages from day one, and it removes the single-PR refactor property that keeps the port/adapter boundary healthy.
- **Nx**: comparable capability to Turborepo; Turborepo chosen for a simpler config surface and because it doesn't impose its own generator/plugin ecosystem, keeping `tools/generators` fully ours and swappable.
- **Yarn/npm workspaces without a task runner**: rejected — no affected-only build/test story at monorepo scale, full rebuilds become a CI time sink quickly.
