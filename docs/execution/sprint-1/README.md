# Sprint 1 Execution Package

Converts the approved Sprint 1 Product Design Review ([docs/governance/sprint-1-product-design-review/](../../governance/sprint-1-product-design-review/README.md)) into an executable engineering plan, organized **Epic → Vertical Slice → Engineering Tasks** — Vertical Slices, not Stories, are the primary implementation unit. **No implementation code was generated. No architecture was redesigned. No Sprint 1 scope was expanded** — every task below traces back to an existing SAF ticket from [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md) or a Quick Win from the Product Design Review; nothing new was invented.

## Phase 1 — Extraction and completeness check

Everything the Product Design Review established, verified present below and not lost in translation:

| Extracted from the Product Design Review | Where it lives in this execution package |
|---|---|
| **Epics** (original 6: Idea Intake, AI-Guided Structuring, Clarification Loop, Discovery Review & Approval, Discovery Workflow Orchestration, Technical Debt & Platform Closure) | Consolidated into 2 execution Epics + 1 cross-cutting workstream — see [01-sprint-1-backlog.md](01-sprint-1-backlog.md)'s "Why 2 Epics, not 6" section for the reasoning; no scope lost, only regrouped at the right granularity for execution. |
| **User journeys** (Login → Discovery Workshop → Clarification → Project Charter → Project Ready) | Reflected in each Vertical Slice's "User journey" field — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Screens** (Login, Idea Submission, Clarification Q&A, Project Charter/Review & Approve, Project Ready) | Reflected in each Vertical Slice's "Screens involved" field — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Capabilities** (`structure-business-requirement`) | VS-1's "Capabilities executed" field; VS-2 explicitly notes it introduces none (Project creation is a use case, not a Capability, per the Product Design Review's Capability Model Review) — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Workflows** (the Discovery `WorkflowDefinition`, SAF-52) | Split across VS-1 (capture → structuring → clarification loop) and VS-2 (final approval → completion) — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Generated artifacts** (`RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project`) | Reflected per-slice — [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). |
| **Dependencies** (the full SAF-39–56 dependency graph) | Preserved and re-expressed at task level — [03-dependency-map.md](03-dependency-map.md). |
| **UX improvements** (9 Quick Wins from the Product Design Review) | Each assigned to a specific engineering task in [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s task breakdowns — none dropped, listed explicitly in the table below. |
| **Risks** (R17, R16, CI-never-run, plus UX/future risks from the Product Design Review) | Consolidated into [04-risk-register.md](04-risk-register.md). |
| **Assumptions** (single Platform Pack, no multi-tenant estimation, no Digital Twin yet) | Carried into [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s Digital Twin fields and [04-risk-register.md](04-risk-register.md). |

### The 9 Quick Wins, traced to their execution task (none dropped)

| # | Quick Win | Assigned to |
|---|---|---|
| 1 | Fix SAF-41 wording (Workspace, not Project) | Already applied directly to [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md) during the Product Design Review — carried into VS-1's Task 1.3 (domain) / Task 1.8 (use case). |
| 2 | Add a minimal login screen | VS-1, Task 1.1. |
| 3 | Quote source idea text in clarifications | VS-1, Task 1.11. |
| 4 | Staged progress messages during structuring | VS-1, Task 1.11. |
| 5 | Surface at least one AI-suggested acceptance criterion | VS-1, Task 1.6. |
| 6 | "Project Charter" framing on the review screen | VS-2, Task 2.5. |
| 7 | "What happens next" panel on Project Ready | VS-2, Task 2.7. |
| 8 | Derived confidence badges (no schema change) | VS-2, Task 2.5. |
| 9 | Fix 3 accessibility gaps (label vs. placeholder, labelled clarification inputs, structured review headings) | VS-1 Tasks 1.9/1.11, VS-2 Task 2.5. |

Nothing important was lost — every Epic, screen, capability, workflow, artifact, dependency, UX improvement, risk, and assumption the Product Design Review identified has an explicit home in this execution package.

## Documents in this package

1. [Sprint 1 Backlog](01-sprint-1-backlog.md) — Epic → Vertical Slice structure, full Epic-level detail (Phase 3).
2. [Sprint 1 Vertical Slice Catalog](02-vertical-slice-catalog.md) — full per-slice detail and engineering task breakdown (Phases 4–5).
3. [Sprint 1 Dependency Map](03-dependency-map.md) — Epic/Slice/Task dependencies, critical path, parallel work (Phase 6).
4. [Sprint 1 Risk Register](04-risk-register.md) (Phase 9).
5. [Sprint 1 Test Strategy](05-test-strategy.md) (Phase 8).
6. [Sprint 1 Demonstration Plan](06-demonstration-plan.md) (Phase 7).
7. [Sprint 1 Success Metrics](07-success-metrics.md) (Phase 10).
8. [Sprint 1 Implementation Order](08-implementation-order.md) (Phase 11).

## Final Answer

# READY

Sprint 1 is ready for implementation. First Vertical Slice: **VS-1 — Capture and Structure a Business Idea**. First Engineering Task: **Task 1.3 — `context-requirements` domain** (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`). Full reasoning: [08-implementation-order.md](08-implementation-order.md).

**Implementation does not begin as part of this task** — this package is the execution plan, not the execution itself, per this task's own instruction.
