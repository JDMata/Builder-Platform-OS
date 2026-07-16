# Sprint 1 Demonstration Plan

**Revised 2026-07-16** — one unified demonstration for the merged VS-1, rather than two separate ones. Ensures Sprint progress is continuously demonstrable, not only provable at the very end. Uses the same running business scenario established in the Product Design Review's wireframes ([docs/ux/sprint-1-discovery-workspace.md](../../ux/sprint-1-discovery-workspace.md)).

## Demonstration: VS-1 — Discovery Workspace

| Field | Detail |
|---|---|
| **Business scenario** | A warehouse operations lead logs in, lands on an empty Dashboard, starts a new project — providing Project Name ("Shift-End Stock Reconciliation"), Business Area ("Warehouse Operations"), Customer ("Acme Retail"), Country, Project Type ("Fiori"), and the idea: "We need a way for warehouse staff to reconcile physical stock counts against SAP inventory records at the end of each shift, and flag discrepancies over a threshold." |
| **Expected outcome** | The idea is structured by the `requirements-analyst` capability; at least one real `Clarification` is raised and answered; the user reaches User Confirmation, sees requirements grouped with confidence badges, and confirms; a real `Project` is created; the Initial Project Workspace shows it. |
| **Artifacts generated** | One draft-then-approved `RequirementDocument`; 2–3 `Requirement`s with `AcceptanceCriterion`s; the `Clarification` and its answer; one `Project` (`name`, `businessArea`, `customer`, `country`, `projectType`, `description`, `sourceRequirementDocumentId` all populated); `DigitalTwinNode`/`DigitalTwinEdge` records for `Project`, `Platform` (`sap`), `ProjectType` (`fiori`), `Owner`, `CreationEvent`. |
| **Capabilities exercised** | `structure-business-requirement`, invoked twice (initial + post-clarification), resolved dynamically through the real `CapabilityResolverPort` adapter both times. |
| **Platform events emitted** | `workflow.run.started.v1`; `workflow.step.completed.v1` per step; the workflow reaching `awaiting_approval` for both the clarification round and the final confirmation; `requirements.document.captured.v1` (first real emission); `workflow.run.completed.v1`. |
| **Digital Twin updates** | Real, for the first time this sprint: a queryable `Project` node related to its `Platform`, `ProjectType`, `Owner`, and `CreationEvent` nodes, exactly per [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md)'s model. |
| **Evidence collected** | A database query showing the persisted `RequirementDocument`/`Requirement`/`Clarification`/`Project` rows; a graph-store query showing the written Digital Twin nodes/edges and a real traversal (e.g., "what Platform is this Project on?"); a query against the outbox table showing `requirements.document.captured.v1` present and correctly shaped; the `AgentInvocation` audit record for each structuring pass; `pnpm run demo:sprint1`'s full unattended run output; a screen recording or scripted walkthrough of all six UI screens (Login, Dashboard, Start New Project, Clarification, User Confirmation, Initial Project Workspace). |

## Continuous demonstrability

Because VS-1 is now Sprint 1's only Vertical Slice, "continuous" demonstrability means something more specific than before: **partial paths through the flow should be demonstrable as soon as their owning tasks land**, even before the whole slice is done. Concretely:

- Once Tasks 1.1–1.12 land: demonstrate login → Dashboard → Start New Project → structuring → clarification, stopping short of confirmation.
- Once Tasks 1.13–1.19 land (in addition to the above): demonstrate confirmation → Project creation → real Digital Twin writes.
- Once Task 1.20–1.21 land: demonstrate the full, single continuous workflow run and the Initial Project Workspace.
- Task 1.22 is the final, complete version of all of the above in one unattended run — not the first time any of it has been shown.

This gives real, inspectable evidence of progress throughout the sprint, not only at its close — the same principle the original two-slice plan had, applied at task granularity now that there's only one slice to break progress down within.
