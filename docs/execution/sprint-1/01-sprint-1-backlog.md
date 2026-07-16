# Sprint 1 Backlog — Epic → Vertical Slice → Engineering Tasks

**Revised 2026-07-17 — synchronized with the approved Product Design Review.** The 2026-07-16 revision merged VS-1/VS-2 into one slice but also added Dashboard, an explicit Project Type field, and a real (pulled-forward) Digital Twin implementation, in response to a since-superseded instruction. **The Product Design Review ([docs/governance/sprint-1-product-design-review/](../../governance/sprint-1-product-design-review/README.md)) explicitly marks all three as FUTURE, not Sprint 1 scope**:

- *Dashboard*: "no projects exist yet for a new user, so Sprint 1 has no dashboard shell" ([01-user-journey-and-screen-evaluations.md](../../governance/sprint-1-product-design-review/01-user-journey-and-screen-evaluations.md)).
- *Choose Project Type*: "no 'project type' field exists in any aggregate yet; not meaningful with one Platform Pack" (same document).
- *Digital Twin*: "correctly absent rather than faked with a placeholder graph... until `context-digital-twin` exists (Sprint 7, SAF-34–37)" ([06-project-workspace-review.md](../../governance/sprint-1-product-design-review/06-project-workspace-review.md)).

All three are reverted below. **The single-Vertical-Slice structure itself is kept** — merging VS-1/VS-2 was independently correct (a coherent business capability shouldn't be artificially split) and doesn't conflict with the PDR, which never mandated two slices.

## Structure

```
Epic 1: Discovery-to-Project Delivery
  └── Vertical Slice VS-1: Discovery Workspace
        └── 19 engineering tasks (Task 1.1–1.19)

Cross-cutting workstream: Technical Debt & Platform Closure
  (not an Epic — embedded as tasks inside VS-1)
```

Full per-task detail: [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md).

## Inconsistencies found and corrected

| # | Inconsistency | PDR position | Prior execution-package position | Resolution |
|---|---|---|---|---|
| 1 | Dashboard | FUTURE — Sprint 1 redirects straight to Discovery, no dashboard shell. | Added as Task 1.9. | **Removed.** Login redirects directly to the idea-submission screen. |
| 2 | Project Type field | FUTURE — no field exists, meaningless with one Platform Pack. | Added to `SubmitBusinessIdea`/`Project` (SAF-58). | **Removed.** `Project` reverts to its originally-approved shape: `id`, `workspaceId`, `name`, `description`, `sourceRequirementDocumentId`. |
| 3 | Business Area / Customer / Country fields | Not present anywhere in the PDR's wireframes or screen evaluations. | Added alongside Project Type (SAF-58). | **Removed**, same reasoning as #2 — never approved. |
| 4 | Real Digital Twin implementation (`context-digital-twin` domain + `GraphStorePort` adapter, pulled forward from Sprint 7) | "Correctly absent... until Sprint 7." Interim traceability (persisted rows + `AgentInvocation` audit records) is the approved standard for Sprint 1. | Added as Tasks 1.17/1.18/1.19 (SAF-59), with 2 new architecture-drift risks in the risk register as a direct consequence. | **Removed.** Reverts to the interim traceability standard the Engineering Planning Principles and the PDR both already specify. |
| 5 | "Initial Project Workspace" (renamed/expanded from "Project Ready") | The PDR's own screen is named **Project Ready** — a confirmation screen, explicitly distinct from the full Project Workspace, which is FUTURE (Sprint 2+). | Renamed to "Initial Project Workspace" and given a Digital Twin summary panel. | **Reverted to Project Ready**, matching the PDR's exact terminology and scope; the Digital Twin summary panel is removed (nothing real to summarize). |
| 6 | Project's `name` | The PDR's Project Ready wireframe shows a named Project ("Shift-End Stock Reconciliation") with no upstream "enter a project name" field anywhere in the approved screens. | Implied as a wizard-collected field (SAF-58). | **Corrected**: `name` is derived by the `requirements-analyst` capability as part of structuring (the same way it infers requirements), not a separate user-entered field — consistent with the PDR's own example. |

None of the 9 approved Quick Wins are affected by this correction — they're listed, verified still-present, in [README.md](README.md).

## Epic 1: Discovery-to-Project Delivery

| Field | Detail |
|---|---|
| **Business objective** | Let a user turn a business idea into an approved, durable `Project` through one continuous, AI-guided experience — exactly the journey the Product Design Review validated, no more and no less. |
| **Business value** | The platform's first complete, end-to-end proof that "idea to approved project" works — the Sprint 1 mission statement, demonstrated for real. |
| **Dependencies** | The Sprint 0 baseline (frozen architecture, full port/contract-test set) and the `drizzle-orm` CVE fix (Task 1.2). |
| **Primary user** | A business stakeholder with an idea, not necessarily technical. |
| **Generated artifacts** | `RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project`. |
| **Capabilities introduced** | `structure-business-requirement` — the first capability resolved through a real `CapabilityResolverPort` adapter. Project creation remains a use case, not a Capability. |
| **Digital Twin updates** | Interim standard, per the Engineering Planning Principles and the PDR: every generated artifact is a real, persisted, ID-referenceable row, and every structuring pass is an audited `AgentInvocation` record. `context-digital-twin` itself remains Sprint 7 scope, untouched by Sprint 1. |
| **Estimated complexity** | High — real external LLM integration and the first dynamically-resolved `CapabilityResolverPort` adapter remain this Epic's genuine novel risks. |
| **Recommended implementation order** | The only Epic this sprint — see [08-implementation-order.md](08-implementation-order.md). |
| **Exit criteria** | A user logs in, submits an idea, is guided through AI structuring and clarification to a confident, resolved requirement set, confirms it as a "Project Charter," and reaches a Project Ready confirmation showing a real, persisted `Project` — with zero shortcuts, and with zero screens or fields the Product Design Review didn't approve. |

No SAF ticket, capability, screen, or Quick Win from the Product Design Review is dropped by this correction — see [README.md](README.md)'s traceability table.
