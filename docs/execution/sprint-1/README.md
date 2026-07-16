# Sprint 1 Execution Package

Converts the approved Sprint 1 Product Design Review ([docs/governance/sprint-1-product-design-review/](../../governance/sprint-1-product-design-review/README.md)) into an executable engineering plan, organized **Epic → Vertical Slice → Engineering Tasks**. **No implementation code was generated. No architecture was redesigned. No new architectural concepts were introduced. No Sprint 0 work was reopened. The Architecture Freeze was not touched.**

## Change summary (2026-07-17)

**What changed:** Dashboard, an explicit Project Type field, Business Area/Customer/Country fields, and a real (pulled-forward) `context-digital-twin` implementation — all added to the Execution Package on 2026-07-16 — are **removed**. `Project` reverts to its originally-approved shape (`id`, `workspaceId`, `name`, `description`, `sourceRequirementDocumentId`, with `name` derived by the AI capability, not user-entered). The "Initial Project Workspace" screen reverts to its originally-approved name and scope, **Project Ready**. Digital Twin updates revert to the interim-traceability standard (persisted rows + audit records) that both the Engineering Planning Principles and the Product Design Review already specify. The task count drops from 23 to 19; the previously-added SAF-57–60 tickets and the SAF-34/35 pull-forward are removed from [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md). **The single-Vertical-Slice structure (VS-1 and VS-2 merged) is kept** — that part of the 2026-07-16 revision didn't conflict with the Product Design Review and independently satisfies "don't artificially split business workflows."

**Why it changed:** The Product Design Review is explicit, in its own words, that Dashboard, Project Type, and a real Digital Twin are **FUTURE** — not Sprint 1 — scope:
- *"[Dashboard] no projects exist yet for a new user, so Sprint 1 has no dashboard shell"* ([01-user-journey-and-screen-evaluations.md](../../governance/sprint-1-product-design-review/01-user-journey-and-screen-evaluations.md)).
- *"[Choose Project Type] no field exists in any aggregate yet; not meaningful with one Platform Pack"* (same document).
- *"[Digital Twin] correctly absent rather than faked with a placeholder graph... until `context-digital-twin` exists (Sprint 7)"* ([06-project-workspace-review.md](../../governance/sprint-1-product-design-review/06-project-workspace-review.md)).

The 2026-07-16 revision added all three anyway, in response to a since-superseded instruction to reconcile a form-based "Project Creation" proposal. That reconciliation correctly preserved the Discovery-first principle (a Project is still created only on confirmation, never an upfront form) but over-corrected by pulling in scope the Product Design Review had already explicitly excluded. This revision removes exactly that over-correction, nothing else.

**Why the updated implementation order better reflects the approved Product Design Review:** the corrected order ([08-implementation-order.md](08-implementation-order.md)) has a shorter critical path (no Digital Twin domain/adapter track), a smaller day-one parallel set (5 tasks instead of 6, matching what's actually needed), and — most importantly — validates *exactly* the platform capabilities the Product Design Review's own Executive Design Review asked the first implementation to validate (real `LlmProviderPort` usage, dynamic `CapabilityResolverPort` resolution), without the added architecture-drift risk of building a production Digital Twin ahead of its designed sprint (Sprint 7) under this sprint's own schedule pressure.

## Phase 1 — Extraction and completeness check

| Extracted from the Product Design Review | Where it lives in this execution package |
|---|---|
| **Epics** | One execution Epic (Discovery-to-Project Delivery) — regrouped from the PDR's planning-level epics, no scope lost. |
| **User journeys** (Login → Discovery Workshop → Clarification → Project Charter → Project Ready — **no Dashboard, no Project Type step**) | VS-1's "User journey" field, now matching the PDR exactly — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Screens** (Login, Idea Submission, Clarification Q&A, Project Charter, Project Ready) | VS-1's "Screens involved" field — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Capabilities** (`structure-business-requirement`) | VS-1's "Capabilities executed" field; Project creation remains a use case — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Workflows** (the Discovery `WorkflowDefinition`) | One continuous run within VS-1 — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Generated artifacts** (`RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project` — its originally-approved shape) | Reflected in VS-1's fields — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Dependencies** | Re-expressed at task level for the corrected 19-task list — [03-dependency-map.md](03-dependency-map.md). |
| **UX improvements** (9 Quick Wins from the Product Design Review) | Each assigned to a specific engineering task — none dropped, listed below. |
| **Risks** | Consolidated into [04-risk-register.md](04-risk-register.md); the two architecture-drift risks the Digital Twin/Project-Type pull-forward introduced are removed along with their cause. |
| **Assumptions** (single Platform Pack, no Digital Twin yet) | Carried into [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md) and [04-risk-register.md](04-risk-register.md), now correctly reflecting "interim traceability," not a real implementation. |

### The 9 Quick Wins, traced to their execution task (none dropped, none affected by this correction)

| # | Quick Win | Assigned to |
|---|---|---|
| 1 | Fix SAF-41 wording (Workspace, not Project) | Applied directly to [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md) during the Product Design Review — carried into Task 1.3 (domain) / Task 1.8 (use case). |
| 2 | Add a minimal login screen | Task 1.1. |
| 3 | Quote source idea text in clarifications | Task 1.11. |
| 4 | Staged progress messages during structuring | Task 1.11. |
| 5 | Surface at least one AI-suggested acceptance criterion | Task 1.6. |
| 6 | "Project Charter" framing on the confirmation screen | Task 1.15. |
| 7 | "What happens next" panel on Project Ready | Task 1.17. |
| 8 | Derived confidence badges (no schema change) | Task 1.15. |
| 9 | Fix 3 accessibility gaps | Tasks 1.9, 1.11, 1.15. |

Nothing important was lost — every Epic, screen, capability, workflow, artifact, dependency, UX improvement, risk, and assumption the Product Design Review identified has an explicit home in this execution package, and nothing beyond what it approved remains in scope.

## Documents in this package

1. [Sprint 1 Backlog](01-sprint-1-backlog.md) — Epic → Vertical Slice structure, the inconsistency table, Epic-level detail.
2. [Sprint 1 Vertical Slice Catalog](02-vertical-slice-catalog.md) — full VS-1 detail and its 19-task breakdown.
3. [Sprint 1 Dependency Map](03-dependency-map.md) — task dependencies, critical path, parallel work.
4. [Sprint 1 Risk Register](04-risk-register.md).
5. [Sprint 1 Test Strategy](05-test-strategy.md).
6. [Sprint 1 Demonstration Plan](06-demonstration-plan.md).
7. [Sprint 1 Success Metrics](07-success-metrics.md).
8. [Sprint 1 Implementation Order](08-implementation-order.md).
9. [VS-1 Readiness Review](09-vs1-readiness-review.md) — Readiness Report, Risk Assessment, Final Acceptance Criteria, Implementation Checklist, and Exit Gate Checklist, performed immediately before implementation begins.

## Final Answer

# IMPLEMENTATION READY

The Execution Package is fully synchronized with the approved Product Design Review, and VS-1 has passed its Readiness Review ([09-vs1-readiness-review.md](09-vs1-readiness-review.md)), which found and corrected two real gaps (a `SecretsVaultPort` acceptance-criteria overreach, and missing explicit authorization checks on two use-case tasks) directly in the Vertical Slice Catalog — no task added, none renumbered. First (and only) Vertical Slice: **VS-1 — Discovery Workspace**. First Engineering Task: **Task 1.3 — `context-requirements` domain** (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`), started alongside four other zero-dependency tasks (1.1, 1.2, 1.5, 1.12) on day one. Full reasoning: [08-implementation-order.md](08-implementation-order.md).

**Implementation does not begin as part of this task.**
