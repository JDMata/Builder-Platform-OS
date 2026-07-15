# Project Context

**This is the living operational state of SAP App Factory.** Every future session — human or AI — starts here, not from [ROADMAP.md](ROADMAP.md) or the backlog directly (see [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md)). This document is updated at the start and end of every sprint, and whenever a decision changes the answer to any section below. If this document and any other document disagree about the *current* state (as opposed to the frozen baseline or historical record), this document is wrong and needs updating — it is not itself the source of truth for architecture, principles, or the roadmap, only for "where are we right now."

*Last updated: 2026-07-15, Sprint 1 planning drafted, pending review and approval.*

## Current Sprint

**Sprint 1 — Discovery Workspace (Release R0.2), Theme: Intelligent Project Discovery.** Status: **Execution Ready.** Planning ([docs/backlog/sprint-1-backlog.md](docs/backlog/sprint-1-backlog.md)), UX ([docs/ux/sprint-1-discovery-workspace.md](docs/ux/sprint-1-discovery-workspace.md)), Product Design Review ([docs/governance/sprint-1-product-design-review/](docs/governance/sprint-1-product-design-review/README.md), APPROVED WITH MINOR UX IMPROVEMENTS), and the execution plan ([docs/execution/sprint-1/](docs/execution/sprint-1/README.md), organized Epic → Vertical Slice → Engineering Task) are all complete. **Implementation has not started** — this document records the plan as ready; the next update to this section happens when the first engineering task (Task 1.3, per [docs/execution/sprint-1/08-implementation-order.md](docs/execution/sprint-1/08-implementation-order.md)) is actually picked up.

## Current Release

**R0.2 — Discovery Workspace.** Not yet released — this is the release Sprint 1's work targets, per [ROADMAP.md](ROADMAP.md)'s Release Roadmap (`dev` stage, activates once Sprint 1's first mergeable work lands).

## Current Milestone

Sprint 1 planning approval. The next milestone after that is Sprint 1's exit criteria: *a user transforms a business idea into an approved, real `Project` through the Discovery Workspace, AI-guided end to end* (see [docs/backlog/sprint-1-backlog.md](docs/backlog/sprint-1-backlog.md)'s Sprint 1 Definition of Done).

## Current Goal

Get Sprint 1's backlog, UX flow, and recommended implementation order reviewed and approved. No implementation story is picked up until that approval happens, per this sprint's explicit instruction and [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md)'s Definition of Ready discipline.

## Current Epic

**For execution, re-organized into 2 Epics + 1 cross-cutting workstream** (regrouped from the original 6-epic planning breakdown; no scope lost — see [docs/execution/sprint-1/01-sprint-1-backlog.md](docs/execution/sprint-1/01-sprint-1-backlog.md)'s "Why 2 Epics, not 6"): **Epic 1 — Idea Capture & AI-Guided Structuring** (Vertical Slice VS-1) and **Epic 2 — Discovery Approval & Project Creation** (Vertical Slice VS-2), plus the Technical Debt & Platform Closure workstream embedded as tasks within both. Full detail: [docs/execution/sprint-1/01-sprint-1-backlog.md](docs/execution/sprint-1/01-sprint-1-backlog.md).

## Current Stories

**For execution, organized as Epic → Vertical Slice → Engineering Task, not Story** — Vertical Slices are the primary implementation unit ([docs/execution/sprint-1/02-vertical-slice-catalog.md](docs/execution/sprint-1/02-vertical-slice-catalog.md)). The original 18 ticket-numbered SAF-39–56 stories are preserved for traceability in [docs/backlog/sprint-1-backlog.md](docs/backlog/sprint-1-backlog.md) and each maps to exactly one engineering task (Task 1.1–1.13 under VS-1, Task 2.1–2.7 under VS-2) in the execution catalog — none dropped, none renumbered away from its original ticket.

Deliberately **not** pulled into this sprint, with reasoning recorded in the backlog: `context-notification` (SAF-38 — no async consumer this sprint), SAF-24 (Temporal spike — this sprint's workflow doesn't need durable execution), SAF-25 full plugin isolation (conditional only — this sprint ships an agent invocation, not third-party generation logic).

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
- **Platform Kernel and Platform Pack Architecture accepted** ([ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md), 2026-07-15) — a strategic, pre-Sprint-1 alignment review confirmed the kernel is enterprise-platform-agnostic and named SAP as Platform Pack #1. No code changed, no ADR-0023 item is in Sprint 1's backlog; see [19-platform-kernel-and-platform-packs.md](docs/architecture/19-platform-kernel-and-platform-packs.md). **Sprint 1 remains unchanged and proceeds as planned.**
- **Sprint 1 Product Design Review: APPROVED WITH MINOR UX IMPROVEMENTS** (2026-07-15) — see [docs/governance/sprint-1-product-design-review/](docs/governance/sprint-1-product-design-review/README.md). Nine presentation-layer Quick Wins identified (none adds a story or capability); one real backlog inconsistency found and fixed (SAF-41 was scoped to a nonexistent `Project`, corrected to `Workspace`). Sprint 1 implementation may begin.
- **Sprint 1 Execution Package: READY** (2026-07-15) — see [docs/execution/sprint-1/](docs/execution/sprint-1/README.md). Sprint 1 reorganized for execution as 2 Epics / 2 Vertical Slices (VS-1: Capture and Structure a Business Idea; VS-2: Approve Discovery into an Approved Project) / 20 engineering tasks, each traceable to an original SAF ticket. First engineering task: Task 1.3 (`context-requirements` domain). **Implementation has not started.**

## Current ADRs

All 23 ADRs `Accepted`, none `Proposed`, `Superseded`, `Deprecated`, or `Rejected` — the 22 decided at Sprint 0 baseline, plus [ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md) (Platform Kernel and Platform Pack Architecture), a strategic, pre-Sprint-1 alignment decision added 2026-07-15 with no accompanying code changes. Full index with affected packages and impact level: [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md). No ADR is currently pending review.

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

**Sprint 2 — Documentation Factory:** generate real documentation artifacts (functional spec, technical spec, architecture doc) from a captured requirement — the first real generation capability, building on Sprint 1's captured, approved `Requirement`s. Not yet planned in ticket-numbered detail; see [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap and [ROADMAP.md](ROADMAP.md).
