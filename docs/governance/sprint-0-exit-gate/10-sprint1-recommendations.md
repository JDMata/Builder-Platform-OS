# 10. Sprint 1 Recommendations

Ordered by dependency and risk, not by ticket number.

## First (before or alongside the first feature story)

1. **Authorize and complete the push to GitHub, then watch the first real `ci.yml` run.** This closes the single largest verified-vs-proven gap this audit found (Technical Debt item 9). Everything downstream of CI (branch protection requiring green checks, the `deploy-dev` placeholder becoming real) depends on this having actually happened once, not just being expected to work.
2. **`drizzle-orm` dependency bump (0.36.4 → 0.45.2 or later), as its own dedicated story.** Full re-verification of every `persistence-postgres/*` package's migration + repository behavior, `tools/sprint0-demo`'s migration calls, and the `migrationsTable` fix from SAF-15 specifically (confirm the newer version's `migrate()` API still accepts the same options). Do this before building new persistence-backed contexts on top of the current version, not after.
3. **Resolve the `Notification` context's fate.** A short ADR (or a "Notification" section added to `13-principal-architect-self-review.md`'s style of explicit resolution) either commissioning a real `context-notification` package or formally retiring the concept from `02-domain-model.md`/`06-event-model.md`. Cheap to resolve now; will cost a confused engineer real time later if left ambiguous.

## Early Sprint 1 (sequencing matters, but not blocking day one)

4. **SAF-24 (Temporal spike)** before any workflow feature grows real complexity — the in-memory adapter's honesty about being a skeleton depends on this comparison happening before more is built on top of it.
5. **SAF-25 (plugin isolation)** before the first plugin ships real (non-placeholder) generation logic — not before Sprint 1 starts, but definitely before that specific milestone.
6. **A real `CapabilityResolverPort` adapter**, built alongside whichever Sprint 1 story first needs a second capability provider type (agent, human, or external-service) — don't build it speculatively ahead of that need, consistent with this platform's own "extract on second occurrence" discipline.
7. **A real `SecretsVaultPort` dev adapter** (`packages/config`, as originally sketched in `08-authentication-and-rbac.md`), built alongside whichever Sprint 1 story first needs secret rotation or a non-`.env` backend.

## Process, not code

8. **Adopt a lighter-weight, more frequent version of this exit gate.** Not a full 10-report audit every sprint, but a periodic "does onboarding still work, is the backlog file still accurate, has any written-ahead doc drifted from what actually got built" check — this audit's single highest-value finding (`CONTRIBUTING.md`'s drift) came from exactly that kind of check, done for the first time only at the very end of a long sprint.
9. **Close the backlog-bookkeeping loop in the same PR a story incidentally satisfies a different backlog item**, rather than relying on an end-of-sprint audit to notice (SAF-23's gap).
10. **Rename `adapter-llm-anthropic`/`adapter-mcp-stdio`** (Technical Debt item 10) the next time either package is touched for an unrelated reason — genuinely cosmetic, not worth a dedicated story, but cheap to fix opportunistically.

## What not to do

Do not attempt to retrofit process/container isolation, a real `CapabilityResolverPort` adapter, or tenancy-tier decisions speculatively "to be safe" before Sprint 1 has a real story that needs them. This sprint's single most consistent success pattern was building the abstraction exactly when the second real consumer appeared, never before — Sprint 1 should keep that discipline, not abandon it under the pressure of a fresh sprint's optimism.
