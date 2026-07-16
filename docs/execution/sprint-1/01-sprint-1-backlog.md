# Sprint 1 Backlog — Epic → Vertical Slice → Engineering Tasks

**Revised 2026-07-16.** The original two-slice structure (VS-1: Capture and Structure a Business Idea; VS-2: Approve Discovery into an Approved Project) has been merged into one Vertical Slice, per an explicit product decision: Sprint 1's first Vertical Slice must be "the first complete end-to-end business capability... everything required by the platform must participate," while preserving the Discovery-first design the [Product Design Review](../../governance/sprint-1-product-design-review/README.md) already validated (a `Project` is created only once Discovery reaches the required confidence and the user confirms — never an upfront form). **The Product Design Review itself is unchanged** — this revision is to the execution package only.

## Structure

```
Epic 1: Discovery-to-Project Delivery
  └── Vertical Slice VS-1: Discovery Workspace
        └── 23 engineering tasks (Task 1.1–1.23)

Cross-cutting workstream: Technical Debt & Platform Closure
  (not an Epic — embedded as tasks inside VS-1, same reasoning as before)
```

Full per-task detail: [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md).

## Why one Epic and one Vertical Slice now, not two

The former Epic 1/Epic 2 split existed because "structure an idea" and "approve it into a Project" looked like two separable destinations. Reconsidered against the instruction that VS-1 must validate the *complete* platform end to end in one slice, splitting them was actually a false economy: a `Project` in this design is never usable on its own without the Discovery session that produced it, and the reverse is equally true — structured-but-never-approved requirements have no durable business outcome. One Epic, one Vertical Slice, is the more honest shape: **Login → Dashboard → Start New Project → AI Discovery Workshop → User Confirmation → Project Creation → Initial Digital Twin → Initial Project Workspace**, as one continuous, demonstrable capability.

## What's newly in scope, and why this doesn't require reopening the Architecture Review

Three things are new relative to the original 18-SAF-ticket backlog. Each is justified below as **implementing an already-approved decision early, under the existing "horizontal work is permitted when the active slice needs it" principle** ([ENGINEERING_PRINCIPLES.md](../../../ENGINEERING_PRINCIPLES.md)) — none is a new architectural concept, and none reopens [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md) or [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md):

1. **Dashboard.** A thin, empty-state screen with a single "Start New Project" action — exactly the design the Product Design Review's own wireframe already sketched for this case ([08-wireframes.md](../../governance/sprint-1-product-design-review/08-wireframes.md)'s Dashboard wireframe), now included as a real screen rather than skipped. No architectural impact — it's a landing screen with no state of its own.
2. **Project Type selection.** Modeled as an **opaque, Platform-Pack-scoped string** on `Project` — the same pattern already established for `ArtifactType` (an opaque, plugin-declared string the Kernel never interprets). The SAP Platform Pack supplies the concrete value set (`fiori`, `gui`, `cap`, `rap`, `integration-suite`) as data an idea-submission screen reads to populate a dropdown — the Kernel's own domain code never hardcodes this list as a TypeScript union or enum. This is exactly how [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md) said Platform Pack-specific vocabulary must stay out of Kernel code, applied here rather than violated — **not** the "Choose Project Type — meaningless with one Platform Pack" gap that ADR flagged, because this isn't a Kernel-level "which enterprise platform" choice (there's still only one, SAP), it's SAP's own Platform Pack contributing project-type data to a Kernel-owned, opaque field.
3. **Initial Digital Twin.** [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md) already fully designed `context-digital-twin` (accepted, Sprint 0) — it was simply sequenced for Sprint 7 (SAF-34–37) because nothing needed it sooner. VS-1 now needs it, so the minimum real slice of that already-approved design is pulled forward: `DigitalTwinNode`/`DigitalTwinEdge`/`NodeTypeDefinition`/`RelationshipTypeDefinition` aggregates and a first real `GraphStorePort` adapter, scoped **only** to the node/relationship types this slice actually produces (`Project`, `Platform`, `ProjectType`, `Owner`, `CreationEvent`) — not the full Sprint 7 scope (search indexing, semantic embeddings, Governance node types, impact-analysis queries). This is implementing an accepted ADR ahead of its original sprint, exactly the kind of pull-forward the Engineering Roadmap already anticipated for other items (e.g., SAF-24, SAF-25) — not a new architectural decision.

**If, during implementation, any of these three reveals that the already-approved design (ADR-0021, ADR-0023, the Capability Model) doesn't actually fit — stop and recommend an ADR, per standing instruction. Nothing above should be treated as license to improvise past what those ADRs already specify.**

## Epic 1: Discovery-to-Project Delivery

| Field | Detail |
|---|---|
| **Business objective** | Let a user turn a business idea into an approved, durable `Project` through one continuous, AI-guided experience — validating every platform service (UI, Workflow, Capability Registry, Digital Twin, Events, Persistence, AuthN/AuthZ, Telemetry, Audit) against one small business capability. |
| **Business value** | The platform's first complete, end-to-end proof that "idea to approved project" actually works, touching every layer of the architecture at once — not a partial slice through some of it. |
| **Dependencies** | The Sprint 0 baseline (frozen architecture, full port/contract-test set), the `drizzle-orm` CVE fix (Task 1.2), and the minimal Digital Twin pull-forward (Tasks 1.17/1.18, justified above). |
| **Primary user** | A business stakeholder with an idea, not necessarily technical. |
| **Generated artifacts** | `RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project`, and — new — `DigitalTwinNode`/`DigitalTwinEdge` records for `Project`/`Platform`/`ProjectType`/`Owner`/`CreationEvent`. |
| **Capabilities introduced** | `structure-business-requirement` — the first capability resolved through a real `CapabilityResolverPort` adapter. (Project creation itself remains a use case, not a Capability — see [10-capability-model-review.md](../../governance/sprint-1-product-design-review/10-capability-model-review.md); nothing about the merge changes that.) |
| **Digital Twin updates** | Real, for the first time — `Project`, `Platform`, `ProjectType`, `Owner`, and `CreationEvent` nodes, related per [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md)'s already-approved model, written at Project-creation time. |
| **Estimated complexity** | Very High — this is now the sprint's only Vertical Slice, carrying every risk the former two slices carried (real LLM integration, dynamic capability resolution) plus the new Digital Twin pull-forward. |
| **Recommended implementation order** | The only Epic this sprint — see [08-implementation-order.md](08-implementation-order.md) for task-level sequencing. |
| **Exit criteria** | A user logs in, starts a new project, is guided through AI structuring and clarification to a confident, resolved requirement set, confirms it, and reaches an Initial Project Workspace showing a real, persisted `Project` with real Digital Twin nodes, real telemetry, and a real audit trail — with zero shortcuts at any layer. |

No SAF ticket, capability, screen, or Quick Win from the Product Design Review is dropped by this restructuring — see [README.md](README.md)'s updated traceability table.
