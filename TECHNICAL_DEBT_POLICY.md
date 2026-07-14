# Technical Debt Policy

Technical debt is not automatically bad — but it must always be a **known, chosen, tracked** state, never an accident discovered a year later. This policy defines what counts, what's prohibited outright, and how debt gets paid down. See [12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md) for the current, live risk register this policy governs.

## What is considered technical debt

Using the standard prudent/reckless × deliberate/inadvertent framing, applied to this codebase:

| | Deliberate | Inadvertent |
|---|---|---|
| **Prudent** | "We're shipping the in-house workflow adapter now and spiking Temporal in parallel on a timebox — we know the tradeoff and have a plan to revisit it" ([ADR-0008](docs/adr/0008-workflow-engine-in-house-first.md)) | "We didn't partition `audit_event` from day one because nobody had done the volume math yet — now we know better and are fixing it" |
| **Reckless** | "We'll just hardcode the Fiori check in the orchestrator for now, we don't have time to do it properly" — **prohibited, see below** | "We didn't realize `domain/*` importing an adapter would even compile" — a process/tooling failure, not a judgment call |

Debt also includes: a workaround for a vendor bug not yet tracked anywhere, a fitness function that's disabled instead of fixed, a test that's skipped instead of repaired, a README that no longer matches the code it describes, and any ADR whose "Consequences" section describes a cost that hasn't actually been paid down yet.

**Every item of debt must be recorded** — as a backlog ticket, a `TODO` linked to that ticket (never an untracked bare `TODO`), or a line in the risk register — with an owner and, where possible, a trigger condition for when it must be resolved.

## What is prohibited

These are never acceptable, regardless of deadline pressure, and are treated as launch/merge blockers, not debt to track:

- SAP-specific logic (a Fiori/CAP/RAP/ABAP-aware conditional) anywhere in `domain/*`, `application/*`, `orchestrator`, or `worker` outside `plugins/*`. See [ADR-0006](docs/adr/0006-plugin-architecture.md).
- Bypassing a port to call a vendor SDK directly from application code "just this once."
- Disabling, weakening, or skipping a fitness function (dependency-cruiser rule, coverage floor, contract test, banned-keyword guard) instead of fixing the violation it caught. A fitness function that can be silenced by a config flag inevitably gets silenced under pressure — that is exactly the failure mode this policy exists to prevent.
- Committing with `--no-verify`, disabling a required CI check to force a merge, or merging with a failing pipeline "to unblock" without an explicit, time-boxed, documented exception approved by the reviewing architect.
- Storing a secret, an API key, or a customer credential anywhere other than behind `ports/secrets-vault.port.ts` or the `TargetSystemConnection` mechanism.
- Cross-schema foreign keys, or any direct table read across a bounded-context boundary.
- Hardcoding a tenant, environment, model, or provider assumption anywhere the corresponding principle in [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md) says it must be configurable.
- Shipping a cross-cutting or hard-to-reverse decision without a linked ADR (see ADR policy below).

## Refactoring policy

- **Boy Scout Rule for small debt**: a developer touching a file may clean up small, local debt (an unclear name, a missing type, dead code) in the same PR as their feature work, as long as the cleanup doesn't meaningfully expand the PR's review surface.
- **Dedicated tickets for large debt**: a refactor that touches more than one package, changes a public port signature, or requires coordinated migration gets its own ticket and its own PR — never bundled invisibly inside an unrelated feature PR, so it can be reviewed and reverted independently.
- **Tests before refactor**: a refactor of existing behavior is preceded by tests that pin down the current behavior, if such tests don't already exist at adequate coverage — refactoring code you can't verify is unchanged behavior is not refactoring, it's a rewrite wearing a refactor's name.
- **No opportunistic architecture changes hidden in a bug fix.** A bug fix PR fixes the bug; an architecture change gets its own PR and, if warranted, its own ADR.

## Architecture review policy

- **Quarterly architecture review**: revisit the risk register in [12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md), retire mitigated risks, and re-evaluate any ADR explicitly flagged as provisional (e.g., the workflow-engine build-vs-adopt decision) against real usage data.
- **Triggered review**: any of the following forces an off-cycle review rather than waiting for the quarterly cadence — a fitness function needs to be weakened to ship something, a new bounded context or deployable service is proposed, a vendor/provider is being added or dropped, or a security finding implicates an architectural assumption (not just an implementation bug).
- Reviews produce either a confirmation (no change needed, documented as such) or one or more ADRs — a review that produces no artifact didn't happen, for accountability purposes.

## ADR policy

- An ADR is required before implementation for any decision that is cross-cutting (affects more than one bounded context or package) or hard to reverse (a chosen database, identity provider, workflow engine, event transport, or anything that would require a customer-visible migration to undo).
- ADRs use the standard template — see [ADR_TEMPLATE.md](ADR_TEMPLATE.md).
- Every ADR starts as `Proposed` and is not implemented until moved to `Accepted`. A rejected or superseded ADR is never deleted — its status changes to `Superseded by NNNN`, preserving the reasoning trail, including why the original approach was rejected.
- A PR implementing a decision that should have had an ADR and doesn't is blocked at review (the `needs-adr` PR template checklist item) until one is written and accepted, or the reviewer determines it doesn't rise to ADR-worthy and says so explicitly.
- ADRs may be amended in place with a dated "Review update" section when new information changes a still-`Proposed` decision (see [docs/adr/0008-workflow-engine-in-house-first.md](docs/adr/0008-workflow-engine-in-house-first.md) for the pattern) — this preserves history without requiring a new ADR number for every refinement of an undecided question.

## Code review rules

- No PR merges without at least one approval from someone other than the author.
- A PR touching `ports/*` or any adapter's public interface requires review from someone familiar with every consumer of that port, not just the PR author's own team — a port is a shared contract, and its reviewers represent everyone who depends on it.
- Reviewers block merge (not just comment) on: a layering/fitness-function violation, a missing ADR where one is required, a missing or stale README/documentation update, a missing regression test for a bug fix, and any of the prohibited items listed above.
- Non-blocking review comments (style preferences, alternative approaches worth considering, questions for understanding) are explicitly distinguished from blocking ones — reviewers state which is which, so authors aren't left guessing whether a comment must be resolved before merge.
- CI must be green (lint, typecheck, unit/contract tests, dependency-cruiser, security scan) before merge; a red pipeline is never overridden without the explicit, documented exception described under "What is prohibited" above.
