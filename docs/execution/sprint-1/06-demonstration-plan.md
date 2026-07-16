# Sprint 1 Demonstration Plan

**Revised 2026-07-17** — synchronized with the approved Product Design Review. Removes Digital Twin evidence and the rich project-detail fields (Business Area, Customer, Country, Project Type) that were never part of the approved scope. Uses the same running business scenario established in the Product Design Review's wireframes ([docs/ux/sprint-1-discovery-workspace.md](../../ux/sprint-1-discovery-workspace.md)).

## Demonstration: VS-1 — Discovery Workspace

| Field | Detail |
|---|---|
| **Business scenario** | A warehouse operations lead logs in and, on the idea-submission screen, describes: "We need a way for warehouse staff to reconcile physical stock counts against SAP inventory records at the end of each shift, and flag discrepancies over a threshold." |
| **Expected outcome** | The idea is structured by the `requirements-analyst` capability, which also derives a suggested Project name ("Shift-End Stock Reconciliation"); at least one real `Clarification` is raised and answered; the user reaches the Project Charter screen, sees requirements grouped with confidence badges, and confirms; a real `Project` is created; Project Ready confirms it. |
| **Artifacts generated** | One draft-then-approved `RequirementDocument`; 2–3 `Requirement`s with `AcceptanceCriterion`s; the `Clarification` and its answer; one `Project` (`name`, `description`, `sourceRequirementDocumentId` — its originally-approved shape, nothing more). |
| **Capabilities exercised** | `structure-business-requirement`, invoked twice (initial + post-clarification), resolved dynamically through the real `CapabilityResolverPort` adapter both times. |
| **Platform events emitted** | `workflow.run.started.v1`; `workflow.step.completed.v1` per step; the workflow reaching `awaiting_approval` for both the clarification round and the final confirmation; `requirements.document.captured.v1` (first real emission); `workflow.run.completed.v1`. |
| **Digital Twin updates** | None — `context-digital-twin` doesn't exist yet (Sprint 7), per the Product Design Review's own position. Evidence instead is the real, persisted `RequirementDocument`/`Requirement`/`Clarification`/`Project` rows and the recorded `AgentInvocation` for each structuring pass. |
| **Evidence collected** | A database query showing the persisted rows; a query against the outbox table showing `requirements.document.captured.v1` present and correctly shaped; the `AgentInvocation` audit record for each structuring pass; `pnpm run demo:sprint1`'s full unattended run output; a screen recording or scripted walkthrough of all five UI screens (Login, Idea Submission, Clarification, Project Charter, Project Ready). |

## Continuous demonstrability

- Once Tasks 1.1–1.11 land: demonstrate login → idea submission → structuring → clarification, stopping short of confirmation.
- Once Tasks 1.12–1.15 land (in addition to the above): demonstrate confirmation → Project creation.
- Once Task 1.16–1.17 land: demonstrate the full, single continuous workflow run and the Project Ready screen.
- Task 1.18 is the final, complete version of all of the above in one unattended run.
