# 7. Sprint 0 Known Risks

The full risk register (R1–R33) lives in [12-risks-and-technical-debt.md](../../architecture/12-risks-and-technical-debt.md) and is not reproduced here. This document highlights what's most relevant to closing Sprint 0 and opening Sprint 1, plus what this audit found new.

## Highest-relevance carried-forward risks for Sprint 1 entry

| Risk | Status entering Sprint 1 |
|---|---|
| R16 — in-house workflow engine underestimates durable-execution difficulty | Mitigation (SAF-24, timeboxed Temporal spike) is scheduled, not yet run. The in-memory adapter is a genuine skeleton, not a sunk-cost trap — confirmed by this audit: no persistence/dispatch logic was added beyond what SAF-8b originally scoped. |
| R17 — plugin isolation deferred past the point real plugins run untrusted input | Live risk the moment Sprint 1 ships any plugin with real generation logic (not the Fiori placeholder). SAF-25 must land *before* that, not alongside it. |
| R12 — per-replica resilience/circuit-breaker state inconsistent at multi-replica scale | Not yet triggered — Sprint 0 never runs more than one `orchestrator`/`worker` replica. Becomes real the moment Sprint 1 needs horizontal scaling. |
| R11 — single pooled Postgres instance is a blast-radius/noisy-neighbor risk at scale | Partitioning exists (`audit_events`); tiering (SAF-30) doesn't. Not urgent at Sprint 0's data volume, worth revisiting once a real customer commitment needs Silo/Dedicated. |
| R1 — SAP logic leaking into core | Actively mitigated and verified (SAF-19's banned-keyword guard + `plugin-import-boundary`, both tested against real injected violations). Lowest-likelihood risk in the register at this point, precisely because it's now mechanically enforced rather than relying on review discipline alone. |

## New risks this audit found

1. **CI has never run for real.** Every stage of `ci.yml` has been verified by running its underlying commands locally and validating the YAML with `actionlint` — but GitHub Actions has never actually executed the workflow. There is a non-zero chance something environment-specific to a GitHub-hosted runner (network egress rules, a missing system package `actionlint` doesn't check for, secrets configuration) surfaces only on first real execution. **Mitigation:** treat the first real push + first real Actions run as its own verification gate, not an afterthought — don't assume `ci.yml` is proven until it has gone green on GitHub's own infrastructure at least once.
2. **Two ports (`CapabilityResolverPort`, `SecretsVaultPort`) exist with zero adapters.** Low risk today (nothing calls either through the port yet — both are bypassed by direct domain-function composition or `process.env`), but if Sprint 1 work starts depending on either port's *interface* without first building a real adapter, that's a design-time decision made against an unproven abstraction. **Mitigation:** the first real consumer of either port should build (or at least prototype) a real adapter in the same story, not assume the existing interface is already validated.
3. **The `Notification` bounded context's ambiguous status could silently resurface as confusion.** Two architecture docs describe it as if it exists; no package does. **Mitigation:** resolve with an explicit decision (build it, or formally retire it from the docs) early in Sprint 1, before a new contributor stumbles on the inconsistency and loses time to it.
4. **Dependency vulnerability exposure was accurately triaged, but the triage depended on this audit's own risk-context reasoning (where esbuild/postcss are actually invoked) rather than reading the full GHSA advisory text** (no internet access in this environment to fetch it). **Mitigation:** the Sprint 5 `drizzle-orm` bump story should independently re-confirm the exploitability reasoning here, not just trust this document's conclusion.

## Risks explicitly retired by this audit

None. Every risk in the register remains open at its stated likelihood/impact — Sprint 0 built mitigations for several (R1, R7, R10, R11 partial), but "mitigated" is not "retired": the underlying risk (SAP logic leaking, schema drift, audit gaps, single-instance blast radius) remains a permanent property of the system's shape, not a one-time fix. The register's own quarterly-review cadence, not this exit gate, is the right place to formally retire a risk.
