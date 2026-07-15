# Sprint 1 Backlog — Epic → Vertical Slice → Engineering Tasks

## Structure

```
Epic 1: Idea Capture & AI-Guided Structuring
  └── Vertical Slice VS-1: Capture and Structure a Business Idea
        └── 13 engineering tasks (Task 1.1–1.13)

Epic 2: Discovery Approval & Project Creation
  └── Vertical Slice VS-2: Approve Discovery into an Approved Project
        └── 7 engineering tasks (Task 2.1–2.7)

Cross-cutting workstream: Technical Debt & Platform Closure
  (not an Epic — no independent business value; its work is embedded as
   tasks inside VS-1 and VS-2 above, not a standalone Vertical Slice)
```

Full per-task detail: [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md). This document covers the structure and Epic-level detail only.

## Why 2 Epics, not 6

The Product Design Review's original 6 epics (Idea Intake, AI-Guided Structuring, Clarification Loop, Discovery Review & Approval, Discovery Workflow Orchestration, Technical Debt & Platform Closure) were the right granularity for *backlog planning* — grouping related stories before anyone had reconciled them against a UX review. For *execution*, they don't each stand alone as independently valuable, demonstrable units — "Clarification Loop" alone has no user-visible value without "Idea Intake" to feed it, and "Discovery Workflow Orchestration" is plumbing that serves both, not a third destination. Regrouped around what a business user actually experiences as one coherent capability:

- **Epic 1** absorbs the original Idea Intake + AI-Guided Structuring + Clarification Loop epics — together, these are the single user-visible capability "give the platform an idea, get back a validated, structured, clarified requirement set."
- **Epic 2** absorbs the original Discovery Review & Approval + (the completion half of) Discovery Workflow Orchestration — together, "review what was structured and turn it into a real, approved Project."
- **Technical Debt & Platform Closure** isn't promoted to a third Epic — a CVE fix and a first CI run have no business value of their own; they're prerequisites embedded as tasks, exactly where the Engineering Planning Principles say horizontal work belongs (justified by the slice that needs it, not built or tracked as if it were a destination in its own right).

No SAF ticket, capability, screen, or Quick Win from the Product Design Review is dropped by this regrouping — see [README.md](README.md)'s Phase 1 traceability table.

## Epic 1: Idea Capture & AI-Guided Structuring

| Field | Detail |
|---|---|
| **Business objective** | Replace a human business analyst's initial intake-and-clarify pass with an AI-guided equivalent that never silently guesses. |
| **Business value** | The first moment any user-supplied business idea becomes structured, validated, machine-usable data — the precondition for every later sprint's generation capability. |
| **Dependencies** | None beyond the Sprint 0 baseline (frozen architecture, full port/contract-test set) and the `drizzle-orm` CVE fix (Task 1.2), which is fully self-contained within this Epic. |
| **Primary user** | A business stakeholder with an idea, not necessarily technical. |
| **Generated artifacts** | `RequirementDocument` (draft), `Requirement`, `Clarification`, `AcceptanceCriterion`. |
| **Capabilities introduced** | `structure-business-requirement` — the first capability registered and resolved through a real `CapabilityResolverPort` adapter. |
| **Digital Twin updates** | `context-digital-twin` doesn't exist yet (Sprint 7) — satisfied today by existing traceability: every `Requirement`/`Clarification`/`AcceptanceCriterion` is a real, persisted, ID-referenceable row, and every structuring pass is an audited `AgentInvocation` record, per the Engineering Planning Principles' stated interim standard. Once built, this Epic's artifacts become `Requirement`/`Clarification` nodes with `derived-from` edges back to the source idea text. |
| **Estimated complexity** | High — this Epic carries the sprint's only genuinely novel integration risk (a real external LLM call behind `LlmProviderPort` for the first time, and the first dynamically-resolved `CapabilityResolverPort` adapter). |
| **Recommended implementation order** | First — see [08-implementation-order.md](08-implementation-order.md) for the full reasoning. |
| **Exit criteria** | A user's free-text idea reliably becomes a structured `RequirementDocument` with zero unresolved `Clarification`s, demonstrated against a real (not mocked) LLM call, with the real `requirements-analyst` `CapabilityProvider` resolved dynamically. |

## Epic 2: Discovery Approval & Project Creation

| Field | Detail |
|---|---|
| **Business objective** | Give the user a single, clear decision point — approve what Discovery produced, or send it back for more clarification — and turn an approval into a real, durable business outcome. |
| **Business value** | The moment Discovery's output stops being exploratory and becomes a committed `Project` a later sprint can build on — the actual "idea to approved project" promise the Sprint 1 mission states. |
| **Dependencies** | Epic 1 (a resolved `RequirementDocument` to approve) and the `drizzle-orm` CVE fix (Task 1.2, shared prerequisite). |
| **Primary user** | The same stakeholder, now in a decision-making role. |
| **Generated artifacts** | An `approved` `RequirementDocument`; a new `Project`; a real `requirements.document.captured.v1` event. |
| **Capabilities introduced** | None new — Project creation is deliberately a use case, not a `Capability` (see the Product Design Review's [Capability Model Review](../../governance/sprint-1-product-design-review/10-capability-model-review.md)); there is no alternative "provider" that could fulfill it differently. |
| **Digital Twin updates** | Same interim standard as Epic 1. Once built, this Epic's approval becomes a `Project` node with a `fulfilled-by` edge back to the approved `RequirementDocument`. |
| **Estimated complexity** | Medium — no new external integration risk; the work is domain modeling, persistence, and a well-understood state transition + event emission, all patterns Sprint 0 already proved. |
| **Recommended implementation order** | Second, after Epic 1 — a `Project` cannot be created from a `RequirementDocument` that doesn't yet exist and isn't yet resolved. |
| **Exit criteria** | Approving a fully-resolved `RequirementDocument` reliably creates exactly one `Project`, emits `requirements.document.captured.v1` through the real transactional outbox, and is blocked while any `Clarification` remains outstanding. |
