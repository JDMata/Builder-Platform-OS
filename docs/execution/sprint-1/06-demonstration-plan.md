# Sprint 1 Demonstration Plan

Ensures Sprint progress is continuously demonstrable, not only provable at the very end — the same discipline `tools/sprint0-demo` established for Sprint 0, applied per Vertical Slice this sprint. Both demonstrations use the same running business scenario, already used consistently across the Product Design Review's wireframes ([docs/ux/sprint-1-discovery-workspace.md](../../ux/sprint-1-discovery-workspace.md)), so the two demos read as one continuous story, not two disconnected examples.

## Demonstration: VS-1 — Capture and Structure a Business Idea

| Field | Detail |
|---|---|
| **Business scenario** | A warehouse operations lead logs in and describes: "We need a way for warehouse staff to reconcile physical stock counts against SAP inventory records at the end of each shift, and flag discrepancies over a threshold." |
| **Expected outcome** | The idea is submitted, the `requirements-analyst` capability structures it into requirements, raises at least one real `Clarification` (e.g., "what counts as a discrepancy over threshold?"), the user answers it, and structuring completes with zero unresolved clarifications. |
| **Artifacts generated** | One draft `RequirementDocument`; 2–3 `Requirement`s (business/functional/non-functional mix); `AcceptanceCriterion`s attached to each; the `Clarification` record and its answer. |
| **Capabilities exercised** | `structure-business-requirement`, invoked twice (once on initial submission, once after the clarification answer), resolved dynamically through the real `CapabilityResolverPort` adapter both times. |
| **Platform events emitted** | `workflow.run.started.v1`; `workflow.step.completed.v1` for the `capture-idea` step and each `capability-request` pass; the workflow reaching `awaiting_approval` for the clarification round. |
| **Digital Twin updates** | None written (not built yet) — evidence instead is the real, persisted `RequirementDocument`/`Requirement`/`Clarification` rows plus the recorded `AgentInvocation` for each structuring pass, per the interim traceability standard. |
| **Evidence collected** | A recorded run's outbox/event log; a database query showing the persisted aggregates; the `AgentInvocation` audit record showing the real Anthropic call's inputs/outputs; a screen recording or scripted walkthrough of the two UI screens. |

## Demonstration: VS-2 — Approve Discovery into an Approved Project

| Field | Detail |
|---|---|
| **Business scenario** | Continuing directly from VS-1's demo: the warehouse operations lead reviews the "Shift-End Stock Reconciliation" Project Charter and approves it. |
| **Expected outcome** | The review screen shows every requirement with a confidence badge; approval succeeds (no unanswered clarifications remain); a `Project` named "Shift-End Stock Reconciliation" is created; the Project Ready screen confirms it with a "what happens next" panel. |
| **Artifacts generated** | The `RequirementDocument` transitions to `approved`; a new `Project` referencing it. |
| **Capabilities exercised** | None new — this demo proves the approval *use case*, deliberately not a Capability (see [10-capability-model-review.md](../../governance/sprint-1-product-design-review/10-capability-model-review.md)). |
| **Platform events emitted** | `requirements.document.captured.v1` — the first real emission of an event [BASELINE.md](../../../BASELINE.md) previously recorded as "designed, not yet emitted"; `workflow.run.completed.v1`. |
| **Digital Twin updates** | None written — evidence is the real, persisted `Project` row and the real outbox event row, per the same interim traceability standard. |
| **Evidence collected** | A database query showing the created `Project` and its `sourceRequirementDocumentId` reference; a query against the outbox table showing `requirements.document.captured.v1` present, correctly shaped, and delivered; `pnpm run demo:sprint1`'s full unattended run output (SAF-53/Task 2.6), the same evidentiary bar `tools/sprint0-demo` set for Sprint 0. |

## Continuous demonstrability, not just a Sprint-end demo

Both demonstrations above should be runnable **the moment their owning Vertical Slice's tasks land**, not held back until Sprint 1's very last day. This is what "continuously demonstrable" means in practice: VS-1's demo becomes runnable once Tasks 1.1–1.12 are done (well before VS-2 exists), giving real, inspectable proof of progress mid-sprint — exactly the kind of evidence a Sprint Exit Gate or an interim stakeholder check-in should be able to ask for on any given day, not only at the end.
