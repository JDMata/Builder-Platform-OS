# 13. Sprint 1 Handoff

Everything needed to begin Sprint 1 immediately, in one place.

## Start here

1. Read [12-final-decision.md](12-final-decision.md) — Sprint 0 is baselined at tag `sprint0-baseline-v1.0`. Any architectural change from this point needs an ADR + review + impact analysis first, no exceptions for familiarity or urgency.
2. Read [10-sprint1-recommendations.md](10-sprint1-recommendations.md) — the ordered list of what to do first.
3. Read [docs/backlog/sprint-0-backlog.md](../../backlog/sprint-0-backlog.md)'s "Sprint 1/2 carry-forward" section — every item there has a named ADR and a stated trigger condition; none should be built ahead of its trigger.

## The three open items from this exit gate, restated

| Item | Who unblocks it | What "done" looks like |
|---|---|---|
| `drizzle-orm` High-severity CVE (GHSA-gpj5-g38j-94v9) | A dedicated Sprint 1 story | `0.36.4` → `0.45.2`+, every `persistence-postgres/*` package's migration + repository behavior re-verified, `tools/sprint0-demo`'s migration calls re-verified, the `migrationsTable` fix re-confirmed compatible with the new version |
| `ci.yml` never executed on a real GitHub Actions runner | The user, by authorizing the push | First real green run on `github.com/JDMata/SAP-App-Fiori-Factory`, watched, not assumed |
| `CapabilityResolverPort`/`SecretsVaultPort` have no adapters | Whichever Sprint 1 story first needs a second capability-provider type, or secret rotation | A real adapter built in the same story that first needs it — not speculatively ahead of that need |

## What's proven and stable to build on

- Every port in `packages/ports` has at least one real, contract-tested adapter, except the two named above.
- The full local dev loop (`pnpm install` → `pnpm run infra:up` → `pnpm run build` → `pnpm run test`) is verified fresh as of this exit gate.
- `pnpm run demo:sprint0` is the fastest way to prove "did I break the vertical slice" after any cross-cutting change — run it before and after a risky change, not just the unit tests.
- CI's stage ordering (Build → Lint → Typecheck → Unit/contract tests → Architecture fitness → Integration → Security) is real and mirrors `11-git-and-cicd-strategy.md` exactly — any new CI stage should slot into this ordering, not bypass it.
- The banned-keyword guard, the README-required check, and `plugin-import-boundary` all run on every PR (once CI is live) — new packages need a real README with Purpose + Ports from the first commit, not added later.

## What Sprint 1 should not do

- Build a dynamic plugin loader, real process isolation, a real `CapabilityResolverPort` adapter, or a tenancy-tier decision *speculatively* — every one of these has a stated trigger condition; wait for it.
- Skip the ADR step for a "small" architectural change. The freeze in [12-final-decision.md](12-final-decision.md) has no informal-change exception.
- Treat `ci.yml`'s local verification as equivalent to a real run. Watch the first real GitHub Actions execution before relying on it as a merge gate.

## Where to find everything else

`README.md`'s "Start here" table is still the canonical reading path for architecture; nothing in this exit gate changes it, except that `PROJECT_STRUCTURE.md` now includes `context-notification` (SAF-38) where it was previously and confusingly absent.
