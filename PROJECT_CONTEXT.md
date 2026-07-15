# Project Context

**This is the living operational state of SAP App Factory.** Every future session — human or AI — starts here, not from [ROADMAP.md](ROADMAP.md) or the backlog directly (see [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md)). This document is updated at the start and end of every sprint, and whenever a decision changes the answer to any section below. If this document and any other document disagree about the *current* state (as opposed to the frozen baseline or historical record), this document is wrong and needs updating — it is not itself the source of truth for architecture, principles, or the roadmap, only for "where are we right now."

*Last updated: 2026-07-15, at the Sprint 0 → Sprint 1 transition.*

## Current Sprint

**Sprint 1 — Discovery Workspace.** Not yet started as of this update — Sprint 0 has just closed (Exit Gate passed, baseline established). This document will be updated the moment Sprint 1 planning begins.

## Current Release

None. No version of SAP App Factory has been released — Sprint 0 built the foundation only, verified locally, never deployed anywhere. See [BASELINE.md](BASELINE.md)'s Current Limitations for the full list of what doesn't exist yet (no production deployment pipeline, no real customer-facing capability).

## Current Milestone

Sprint 0 Baseline v1.0 established (tag `sprint0-baseline-v1.0`). The next milestone is Sprint 1's exit criteria: *a user submits a requirement through a real UI and sees it processed end to end* (see [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap).

## Current Goal

Begin Sprint 1 planning: turn the Discovery Workspace objective into real, ticket-numbered, [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md)-compliant stories, following the Vertical Slice Architecture rule in [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s Engineering Planning Principles.

## Current Epic

**Discovery Workspace** (Sprint 1's named theme — see [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap for objective, deliverables, dependencies, and exit criteria).

## Current Stories

None yet planned as formal, ticket-numbered Sprint 1 stories. Candidate work already identified (from the Sprint 0 Exit Gate's recommendations) that Sprint 1 planning should evaluate against the Discovery Workspace vertical slice:

- `drizzle-orm` dependency bump (High-severity CVE, [Technical Debt Report](docs/governance/sprint-0-exit-gate/02-technical-debt-report.md) item 1) — dedicated story, full regression cycle.
- First real GitHub Actions run — once push is authorized.
- SAF-24 (Temporal spike) — if the Discovery Workspace vertical slice's workflow needs durability sooner than expected.
- SAF-25 (plugin process isolation) — hard prerequisite before any real generation logic ships (Sprint 2 onward).
- `context-notification`'s implementation (SAF-38) — only if the Discovery Workspace slice needs to notify a user of a processed requirement.

None of the above is committed until it passes Definition of Ready and is actually pulled into a sprint plan.

## Current Risks

Full register: [12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md) and [Known Risks](docs/governance/sprint-0-exit-gate/07-known-risks.md). Most relevant entering Sprint 1:

- R17 — plugin isolation deferred past the point real plugins run untrusted input (live risk the moment Sprint 2 ships real generation logic).
- R16 — in-house workflow engine's durability gap (mitigation scheduled, not yet run).
- CI has never executed on a real GitHub Actions runner — the largest verified-vs-proven gap from the Exit Gate, unresolved until push is authorized.

## Current Decisions

- Sprint 0 Exit Gate: **GO WITH MINOR CORRECTIONS** (2026-07-15).
- Architecture frozen per [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) (2026-07-15).
- Sprint 1 onward follows Vertical Slice Architecture (Engineering Planning Principles, [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)).
- Claude's default working role changes from Principal Software Architect to **Lead SAP Platform Engineer / Product Engineering Lead** starting Sprint 1 (see [.ai/README.md](.ai/README.md)).

## Current ADRs

All 22 ADRs `Accepted`, none `Proposed`, `Superseded`, `Deprecated`, or `Rejected`. Full index with affected packages and impact level: [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md). No ADR is currently pending review.

## Architecture Status

**Stable and frozen.** See [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) for exactly what's frozen, what Sprint 1+ may change freely, and what requires an ADR.

## Architecture Freeze Status

**In effect since 2026-07-15.** No architectural change has been proposed or made since the freeze took effect.

## Baseline Version

**Sprint 0 Baseline v1.0** — git tag `sprint0-baseline-v1.0` (local only, not yet pushed). Full detail: [BASELINE.md](BASELINE.md).

## Known Technical Debt

Full detail: [Technical Debt Report](docs/governance/sprint-0-exit-gate/02-technical-debt-report.md) and [BASELINE.md](BASELINE.md)'s Accepted Technical Debt section. Highest-priority open items: the `drizzle-orm` CVE (High), CI never having run on a real GitHub Actions runner (High, gated on push authorization), and two ports (`CapabilityResolverPort`, `SecretsVaultPort`) with no adapter yet (Medium).

## Deferred Decisions

Every Sprint 1/2 carry-forward item (SAF-24 through SAF-38) — each has a named ADR and a stated trigger condition. Full list: [BASELINE.md](BASELINE.md)'s Deferred Decisions section. None is committed to a specific sprint beyond what [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap projects.

## Upcoming Sprint Goal

**Sprint 1 — Discovery Workspace:** a user submits a requirement through a real UI, it runs through a real workflow, and produces a real, traceable, tested, documented, telemetry-emitting, capability-registered result — the platform's first complete vertical slice, per [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s Engineering Planning Principles.
