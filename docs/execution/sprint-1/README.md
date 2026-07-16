# Sprint 1 Execution Package

Converts the approved Sprint 1 Product Design Review ([docs/governance/sprint-1-product-design-review/](../../governance/sprint-1-product-design-review/README.md)) into an executable engineering plan, organized **Epic → Vertical Slice → Engineering Tasks** — Vertical Slices, not Stories, are the primary implementation unit. **No implementation code was generated. No architecture was redesigned. No new architectural concepts were introduced.**

**Revised 2026-07-16.** During implementation kickoff, a conflict surfaced between a proposed "VS-001: Project Creation" (a form-based wizard bypassing Discovery) and this package's original two-slice structure. Resolved as follows, per explicit direction: **the Product Design Review is unaffected and was not reopened or modified** — its Discovery-first validation (a `Project` is created only once Discovery reaches confidence and the user confirms, never an upfront form) stands exactly as approved. What changed is this execution package's own packaging: **VS-1 and VS-2 are merged into one Vertical Slice, VS-1 — Discovery Workspace**, now explicitly including Login, Dashboard, Project Type selection, and an Initial Digital Twin/Project Workspace, as the sprint's single, complete, end-to-end business capability. See [01-sprint-1-backlog.md](01-sprint-1-backlog.md)'s "What's newly in scope, and why this doesn't require reopening the Architecture Review" for exactly how the three additions (Dashboard, Project Type, Digital Twin) stay inside already-approved architecture ([ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md), [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md)) without a new ADR.

## Phase 1 — Extraction and completeness check

Everything the Product Design Review established, verified present below and not lost in translation:

| Extracted from the Product Design Review | Where it lives in this execution package |
|---|---|
| **Epics** (original 6) | Consolidated into **1 execution Epic** (Discovery-to-Project Delivery) covering the merged VS-1 — see [01-sprint-1-backlog.md](01-sprint-1-backlog.md). No scope lost, only regrouped. |
| **User journeys** (Login → Dashboard → Discovery Workshop → Clarification → Confirmation → Project Ready, now reconciled with the Product Design Review's full aspirational journey) | Reflected in VS-1's "User journey" field — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Screens** (Login, Dashboard, Start New Project, Clarification Q&A, User Confirmation, Initial Project Workspace) | Reflected in VS-1's "Screens involved" field — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Capabilities** (`structure-business-requirement`) | VS-1's "Capabilities executed" field; Project creation remains a use case, not a Capability — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Workflows** (the Discovery `WorkflowDefinition`) | Now one continuous run within VS-1, intake through Digital Twin update — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Generated artifacts** (`RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project`, and now `DigitalTwinNode`/`DigitalTwinEdge`) | Reflected in VS-1's fields — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Dependencies** (the full task dependency graph) | Re-expressed at task level for the merged 23-task list — [03-dependency-map.md](03-dependency-map.md). |
| **UX improvements** (9 Quick Wins from the Product Design Review) | Each assigned to a specific engineering task — none dropped, listed explicitly in the table below with corrected task numbers. |
| **Risks** | Consolidated into [04-risk-register.md](04-risk-register.md), plus two new risks introduced by the Digital Twin/Project Type pull-forward. |
| **Assumptions** | Carried into [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s Digital Twin fields and [04-risk-register.md](04-risk-register.md) — including the explicit assumption that the minimal Digital Twin built here stays scoped to this slice's 5 node types, not Sprint 7's full feature set. |

### The 9 Quick Wins, traced to their execution task (none dropped, renumbered for the merge)

| # | Quick Win | Assigned to |
|---|---|---|
| 1 | Fix SAF-41 wording (Workspace, not Project) | Applied directly to [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md) during the Product Design Review — carried into Task 1.3 (domain) / Task 1.8 (use case). |
| 2 | Add a minimal login screen | Task 1.1. |
| 3 | Quote source idea text in clarifications | Task 1.12. |
| 4 | Staged progress messages during structuring | Task 1.12. |
| 5 | Surface at least one AI-suggested acceptance criterion | Task 1.6. |
| 6 | "Project Charter" framing on the confirmation screen | Task 1.16. |
| 7 | "What happens next" panel on the Initial Project Workspace | Task 1.21. |
| 8 | Derived confidence badges (no schema change) | Task 1.16. |
| 9 | Fix 3 accessibility gaps | Tasks 1.10, 1.12, 1.16. |

Nothing important was lost — every Epic, screen, capability, workflow, artifact, dependency, UX improvement, risk, and assumption the Product Design Review identified has an explicit home in this execution package, and the merge added Dashboard, Project Type, and Digital Twin scope on top without displacing any of it.

## Documents in this package

1. [Sprint 1 Backlog](01-sprint-1-backlog.md) — Epic → Vertical Slice structure, full Epic-level detail.
2. [Sprint 1 Vertical Slice Catalog](02-vertical-slice-catalog.md) — full VS-1 detail and its 23-task breakdown.
3. [Sprint 1 Dependency Map](03-dependency-map.md) — task dependencies, critical path, parallel work.
4. [Sprint 1 Risk Register](04-risk-register.md).
5. [Sprint 1 Test Strategy](05-test-strategy.md).
6. [Sprint 1 Demonstration Plan](06-demonstration-plan.md).
7. [Sprint 1 Success Metrics](07-success-metrics.md).
8. [Sprint 1 Implementation Order](08-implementation-order.md).

## Final Answer

# READY

Sprint 1 is ready for implementation. First (and only) Vertical Slice: **VS-1 — Discovery Workspace**. First Engineering Task: **Task 1.3 — `context-requirements` domain** (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`), started alongside five other zero-dependency tasks (1.1, 1.2, 1.5, 1.13, 1.17) on day one. Full reasoning: [08-implementation-order.md](08-implementation-order.md).

**Implementation does not begin as part of this task** — this package is the execution plan, not the execution itself.
