# Project Context

**This is the living operational state of SAP App Factory.** Every future session — human or AI — starts here, not from [ROADMAP.md](ROADMAP.md) or the backlog directly (see [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md)). This document is updated at the start and end of every sprint, and whenever a decision changes the answer to any section below. If this document and any other document disagree about the *current* state (as opposed to the frozen baseline or historical record), this document is wrong and needs updating — it is not itself the source of truth for architecture, principles, or the roadmap, only for "where are we right now."

*Last updated: 2026-07-17 — Sprint 1 OFFICIALLY CLOSED. Sprint 1 Baseline v1.0 recorded (`sprint1-baseline-v1.0`).*

## Current Sprint

**Sprint 1 — Discovery Workspace (Release R0.2), Theme: Intelligent Project Discovery.** Status: **OFFICIALLY CLOSED.** Implementation complete, Exit Gate passed, CTO Improvement Pack complete, Engineering Retrospective complete, Sprint 1 Baseline v1.0 recorded — see [BASELINE.md](BASELINE.md)'s Sprint 1 Baseline section for the full closeout record. Planning, UX, the Product Design Review, and the Execution Package are complete and approved (see [docs/execution/sprint-1/](docs/execution/sprint-1/README.md)). All 19 engineering tasks are done — domain, persistence, real Anthropic integration, the `structure-business-requirement` capability, `CapabilityResolverPort`'s first real adapter, all three use cases, the Discovery `WorkflowDefinition` orchestrating them end to end via `apps/orchestrator`, `api-gateway`'s Discovery proxy routes (session-derived identity, never trusting client-supplied `tenantId`/`actorId`), `apps/web`'s five real Next.js screens (Login, Idea Submission, Clarification Q&A, Project Charter, Project Ready), and `tools/sprint1-demo`'s end-to-end demo script. **Task 1.19 (first real CI run) passed for real**: the project's GitHub remote moved to `https://github.com/JDMata/Builder-Platform-OS.git`, and [run 29545999065](https://github.com/JDMata/Builder-Platform-OS/actions/runs/29545999065) is fully green across all four jobs — build/lint/typecheck/unit tests, the real Postgres/Keycloak/OPA integration job, the security scan (OSV + secret scan), and the deploy placeholder. One post-implementation fix rode along in that same push: `esbuild`/`postcss` transitive-dependency CVEs (via `drizzle-kit` and `next`, respectively) forced to safe versions via `pnpm.overrides`. See [10-vs1-exit-gate-report.md](docs/execution/sprint-1/10-vs1-exit-gate-report.md) for the full accounting, including several disclosed UI simplifications (document-level rather than per-requirement confidence badges; no "Request Changes" reopen path; no staged progress messaging; a fixed single workspace rather than a real selector) — none blocking, all recorded honestly. **VS-1 is approved and now part of the official Sprint 1 baseline; do not modify its implementation unless a defect is discovered.**

**Engineering Retrospective complete (2026-07-17):** a Principal Engineer-level review of VS-1 across architecture, DDD/hexagonal compliance, testing, telemetry, documentation, the Capability Registry, security, CI/CD, maintainability, and code duplication. Findings are captured in two new living documents: [CONTINUOUS_IMPROVEMENT_BACKLOG.md](CONTINUOUS_IMPROVEMENT_BACKLOG.md) (Category A/B/C/D-classified improvements) and [ENGINEERING_DECISION_LOG.md](ENGINEERING_DECISION_LOG.md) (implementation-level decisions made while building VS-1). `CHANGELOG.md` also now exists, started at this point rather than backfilled. **Verdict on the next Vertical Slice ("VS-002"): NOT READY** — no Product Design Review, Execution Package, or ticket-numbered backlog exists yet for Sprint 2 (Documentation Factory); see "Upcoming Sprint Goal" below and the retrospective's VS-002 Readiness Report for exactly what needs to happen first.

## Current Release

**R0.2 — Discovery Workspace.** Not yet released — this is the release Sprint 1's work targets, per [ROADMAP.md](ROADMAP.md)'s Release Roadmap (`dev` stage, activates once Sprint 1's first mergeable work lands).

## Current Milestone

Sprint 1 planning approval. The next milestone after that is Sprint 1's exit criteria: *a user transforms a business idea into an approved, real `Project` through the Discovery Workspace, AI-guided end to end* (see [docs/backlog/sprint-1-backlog.md](docs/backlog/sprint-1-backlog.md)'s Sprint 1 Definition of Done).

## Current Goal

VS-1 is complete, the Exit Gate has passed, and the Engineering Retrospective is done. Before Sprint 2/VS-002 implementation can start: (1) complete the Category A immediate improvements in [CONTINUOUS_IMPROVEMENT_BACKLOG.md](CONTINUOUS_IMPROVEMENT_BACKLOG.md), and (2) run a real Sprint 2 planning pass (Product Design Review + Execution Package + ticket-numbered backlog, the same governance sequence VS-1 itself went through) — neither exists yet for Documentation Factory.

## Current Epic

**One Epic, one Vertical Slice**: **Epic 1 — Discovery-to-Project Delivery**, containing **Vertical Slice VS-1 — Discovery Workspace**, the sprint's single, complete, end-to-end business capability (login through Project Ready) — matching the Product Design Review's approved journey exactly, with no Dashboard and no Project Type step. The Technical Debt & Platform Closure workstream remains embedded as tasks within it, not its own Epic.

## Current Stories

**Organized as Epic → Vertical Slice → Engineering Task, not Story** — 19 engineering tasks under VS-1 ([docs/execution/sprint-1/02-vertical-slice-catalog.md](docs/execution/sprint-1/02-vertical-slice-catalog.md)). The original 18 SAF-39–56 tickets are preserved for traceability in [docs/backlog/sprint-1-backlog.md](docs/backlog/sprint-1-backlog.md), each mapping to exactly one engineering task. SAF-34/SAF-35 (Digital Twin domain + `GraphStorePort` adapter) remain Sprint 7 scope, untouched by Sprint 1 — a brief pull-forward proposed 2026-07-16 was reverted 2026-07-17 once checked against the Product Design Review's explicit position ("correctly absent... until Sprint 7").

**Progress as of 2026-07-17: 19 of 19 tasks complete** (1.1–1.19, all of VS-1) — real domain, persistence, LLM integration, capability resolution, all three use cases, the Discovery `WorkflowDefinition` orchestration (`apps/orchestrator`'s `discovery-workflow.ts`/`discovery-routes.ts`, wired to the composition root's `POST /discovery/start|answer-clarification|confirm` and `GET /discovery/:id` endpoints, plus the `requirements.document.captured.v1` event subscriber that creates the `Project`), `api-gateway`'s Discovery proxy routes (`discovery-proxy-routes.ts` — every route re-derives `tenantId`/`actorId` from the sealed session cookie, never from the request body), `apps/web`'s five real screens (`/login`, `/discovery/new`, `/discovery/[id]` — covering both the Clarification Q&A and Project Charter screens, since which one renders is a pure function of `unansweredClarifications.length` — and `/discovery/[id]/ready`), `tools/sprint1-demo` (end-to-end demo, gated cleanly on `SAF_TEST_ANTHROPIC_API_KEY`), all fully tested (23 orchestrator + 17 api-gateway + 20 web tests, high coverage on every new file), and a fully green first real CI run. Two supporting packages not in the original 19-task list were added during implementation, per the "extract reusable patterns / close real gaps immediately" discipline: `persistence-postgres-shared` (a `withTenantScope` helper, extracted on its 3rd+ occurrence) and `adapter-secrets-vault-env` (`SecretsVaultPort`'s first real adapter, needed for Task 1.5's own acceptance criteria to be genuinely satisfied) and `adapter-capability-resolver-in-memory` (Task 1.7's actual deliverable, in its own package following the existing adapter-family convention).

Deliberately **not** pulled into this sprint, with reasoning recorded in the backlog: `context-notification` (SAF-38 — no async consumer this sprint), SAF-24 (Temporal spike — this sprint's workflow doesn't need durable execution), SAF-25 full plugin isolation (conditional only — this sprint ships an agent invocation, not third-party generation logic).

## Current Risks

Full register: [12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md) and [Known Risks](docs/governance/sprint-0-exit-gate/07-known-risks.md). Most relevant entering Sprint 1:

- R17 — plugin isolation deferred past the point real plugins run untrusted input. **Now the single most important blocking item for Sprint 2**: PLATFORM_MATURITY.md itself names Sprint 2 (Documentation Factory) as the sprint that introduces real generation logic — see `CONTINUOUS_IMPROVEMENT_BACKLOG.md`'s `CI-B6`.
- R16 — in-house workflow engine's durability gap (mitigation scheduled, not yet run; see `ENGINEERING_DECISION_LOG.md`'s `ED-003`/`CI-C4` — VS-1 exercised it successfully but only at small, bounded scale).
- ~~CI has never executed on a real GitHub Actions runner~~ — **resolved 2026-07-17**: [run 29545999065](https://github.com/JDMata/Builder-Platform-OS/actions/runs/29545999065) passed fully green, including the real Postgres/Keycloak/OPA integration job.

## Current Decisions

- Sprint 0 Exit Gate: **GO WITH MINOR CORRECTIONS** (2026-07-15).
- Architecture frozen per [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) (2026-07-15).
- Sprint 1 onward follows Vertical Slice Architecture (Engineering Planning Principles, [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)).
- Claude's default working role changes from Principal Software Architect to **Lead SAP Platform Engineer / Product Engineering Lead** starting Sprint 1 (see [.ai/README.md](.ai/README.md)).
- **Platform Kernel and Platform Pack Architecture accepted** ([ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md), 2026-07-15) — a strategic, pre-Sprint-1 alignment review confirmed the kernel is enterprise-platform-agnostic and named SAP as Platform Pack #1. No code changed, no ADR-0023 item is in Sprint 1's backlog; see [19-platform-kernel-and-platform-packs.md](docs/architecture/19-platform-kernel-and-platform-packs.md). **Sprint 1 remains unchanged and proceeds as planned.**
- **Sprint 1 Product Design Review: APPROVED WITH MINOR UX IMPROVEMENTS** (2026-07-15) — see [docs/governance/sprint-1-product-design-review/](docs/governance/sprint-1-product-design-review/README.md). Nine presentation-layer Quick Wins identified (none adds a story or capability); one real backlog inconsistency found and fixed (SAF-41 was scoped to a nonexistent `Project`, corrected to `Workspace`). Sprint 1 implementation may begin.
- **Sprint 1 Execution Package: READY** (2026-07-15) — see [docs/execution/sprint-1/](docs/execution/sprint-1/README.md).
- **Sprint 1 Execution Package revised: VS-1/VS-2 merged into one Vertical Slice** (2026-07-16) — a proposed form-based "Project Creation" request was reconciled instead of adopted as-is; VS-1 ("Discovery Workspace") gained Login, Dashboard, a Project Type field, and a Digital Twin pull-forward from Sprint 7. **Superseded the next day — see below.**
- **Sprint 1 Execution Package corrected: synchronized with the approved Product Design Review** (2026-07-17) — the 2026-07-16 revision's Dashboard, Project Type field, and Digital Twin pull-forward are **removed**: the Product Design Review explicitly marks all three FUTURE, not Sprint 1, scope ("no dashboard shell," "not meaningful with one Platform Pack," "correctly absent... until Sprint 7"). VS-1 (now 19 tasks) reverts to exactly the approved journey: Login → Idea Submission → Clarification loop → Project Charter → Project Ready. The single-Vertical-Slice structure itself is kept — that part didn't conflict with the Product Design Review.
- **VS-1 Readiness Review: IMPLEMENTATION READY** (2026-07-17) — see [docs/execution/sprint-1/09-vs1-readiness-review.md](docs/execution/sprint-1/09-vs1-readiness-review.md). Confirmed VS-1 is correctly sized (not too large, not mixing capabilities) and found two real, corrected gaps: a `SecretsVaultPort` acceptance criterion that would have triggered unnecessary new-adapter work (corrected to rely on the already-accepted dev-only adapter), and two use-case tasks missing explicit authorization checks against the existing, real `PolicyEnginePort`/OPA adapter (both now explicit acceptance criteria). No task added, none renumbered. First engineering task: Task 1.3 (`context-requirements` domain). **Implementation has not started.**
- **VS-1 Exit Gate: PASSED** (2026-07-17) — see [10-vs1-exit-gate-report.md](docs/execution/sprint-1/10-vs1-exit-gate-report.md). All 19 tasks complete, real CI green. VS-1 approved into the Sprint 1 baseline.
- **VS-1 Engineering Retrospective complete; VS-002 verdict: NOT READY** (2026-07-17) — see `CONTINUOUS_IMPROVEMENT_BACKLOG.md` and `ENGINEERING_DECISION_LOG.md`. No Sprint 2 Product Design Review/Execution Package/backlog exists yet; plugin isolation (`CI-B6`/R17) is a named hard prerequisite before Sprint 2's real generation logic ships.

## Current ADRs

All 23 ADRs `Accepted`, none `Proposed`, `Superseded`, `Deprecated`, or `Rejected` — the 22 decided at Sprint 0 baseline, plus [ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md) (Platform Kernel and Platform Pack Architecture), a strategic, pre-Sprint-1 alignment decision added 2026-07-15 with no accompanying code changes. Full index with affected packages and impact level: [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md). No ADR is currently pending review.

## Architecture Status

**Stable and frozen.** See [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) for exactly what's frozen, what Sprint 1+ may change freely, and what requires an ADR.

## Architecture Freeze Status

**In effect since 2026-07-15.** No architectural change has been proposed or made since the freeze took effect.

## Baseline Version

**Sprint 1 Baseline v1.0** — git tag `sprint1-baseline-v1.0`, commit `ef7017c` on `https://github.com/JDMata/Builder-Platform-OS`, created 2026-07-17. Supersedes **Sprint 0 Baseline v1.0** (git tag `sprint0-baseline-v1.0`) as the current baseline — Sprint 0's remains valid as the frozen historical record it always was, not superseded in the sense of being wrong, just no longer the most recent baseline. Full detail: [BASELINE.md](BASELINE.md).

## Known Technical Debt

Full detail: [Technical Debt Report](docs/governance/sprint-0-exit-gate/02-technical-debt-report.md) and [BASELINE.md](BASELINE.md)'s Accepted Technical Debt section (both frozen Sprint 0 snapshots, not retroactively edited). **Resolved during VS-1 implementation (2026-07-17):** the `drizzle-orm` CVE (bumped to 0.45.2 across every `persistence-postgres/*` package and `tools/sprint0-demo`, full regression verified); `CapabilityResolverPort` now has a real (in-memory) adapter; `SecretsVaultPort` now has a real (dev-only `.env`-default) adapter; CI now runs green on a real GitHub Actions runner for the first time (`esbuild`/`postcss` transitive-dependency CVEs also fixed via `pnpm.overrides` as part of getting that run clean). **Still open:** none newly introduced by VS-1 — see [10-vs1-exit-gate-report.md](docs/execution/sprint-1/10-vs1-exit-gate-report.md) §12 for disclosed, non-blocking UI simplifications.

## Deferred Decisions

Every Sprint 1/2 carry-forward item (SAF-24 through SAF-38) — each has a named ADR and a stated trigger condition. Full list: [BASELINE.md](BASELINE.md)'s Deferred Decisions section. None is committed to a specific sprint beyond what [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap projects.

## Constitutional documents

**Established 2026-07-17**, before Sprint 2 planning begins — four documents now govern the platform at the same authority level, none overridable without the same deliberate, recorded governance process used to change any one of them:

- [docs/architecture/00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md) — the Architecture Foundation (AF).
- [docs/ux/00-platform-experience-foundation.md](docs/ux/00-platform-experience-foundation.md) — the Platform Experience Foundation (PXF): the long-term experience philosophy (vision, personas, information architecture, AI interaction model, design/interaction/accessibility/motion principles, design tokens strategy, governance, and a Definition of Done for UX) governing every screen built from Sprint 2 onward.
- [docs/product/00-engineering-canvas-specification.md](docs/product/00-engineering-canvas-specification.md) — the Engineering Canvas Specification (ECS v1.0): the product specification for the platform's living engineering workspace — the human experience layer over the Project Digital Twin ([ADR-0021](docs/adr/0021-project-digital-twin-knowledge-graph.md)), specifying its graph model, node/relationship taxonomy, the four synchronized views (Guided, Canvas, Documents, Executive), AI annotation behavior, keyboard-first interaction, inspector panels, timeline model, extensibility, and a Definition of Done.
- [docs/ux/01-experience-language-specification.md](docs/ux/01-experience-language-specification.md) — the Experience Language Specification (XLS v1.0): the platform's visual, interaction, motion, and communication language — typography, color and semantic color, material/glass/elevation, motion grammar, iconography/illustration, AI visual language, the Canvas's visual expression, and Figma/React derivation rules — underneath both the PXF's general screens and the ECS's Canvas.

None of the four produces screen designs, component code, or implementation detail — all four are principle-first and technology-agnostic; downstream Figma/React work must be derivable from them, not an independent design exercise. Every future Vertical Slice's Product Design Review checks against all four.

## Upcoming Sprint Goal

**Sprint 2 — Documentation Factory:** generate real documentation artifacts (functional spec, technical spec, architecture doc) from a captured requirement — the first real generation capability, building on Sprint 1's captured, approved `Requirement`s. **Not yet planned in ticket-numbered detail** — confirmed by the VS-1 Engineering Retrospective's VS-002 Readiness Report (2026-07-17): no Product Design Review, Execution Package, or `DEFINITION_OF_READY.md`-passing backlog exists for it yet, and plugin process/container isolation (SAF-25) is a named hard prerequisite once real generation logic ships. See [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap, [ROADMAP.md](ROADMAP.md), and `CONTINUOUS_IMPROVEMENT_BACKLOG.md` for what needs to happen before implementation starts.
