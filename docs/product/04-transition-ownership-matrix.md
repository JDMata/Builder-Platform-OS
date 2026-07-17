# 04 — Transition Ownership Matrix (TOM v1.0)

**Status:** Operational reference material — **not** constitutional, **not** a PAS revision.
**Derived from:** [01-product-architecture-specification.md](01-product-architecture-specification.md) (PAS) §4 (Workspace Contracts), §6 (Navigation Model), §7 (End-to-End Validation Walkthrough).
**Scope:** every transition between the seven Lifecycle Workspaces PAS defines (Discovery, Architecture & Design, Documentation, Development, Testing, Deployment, Operations). Governance does not get its own row — per PAS §1's own derived finding, it is a cross-cutting gate (`ReviewGate`/`ApprovalGate`) applied *within* every row below, not a discrete eighth transition.

---

## Reinterpreting PAS's transition-shaped [GAP]s

PAS flagged missing events for several transitions (§4: "Publishes" and "Events" marked `[GAP]` for Architecture & Design→Documentation, Documentation→Development, Development→Testing, Testing→Deployment). Applying this task's rule: [06-event-model.md](../architecture/06-event-model.md) already defines the *location and mechanism* — a living "Core event catalog" table, extended by adding new CloudEvents-compatible envelope entries following the existing pattern (the catalog's own history shows this happening twice already: `digitaltwin.node.upserted.v1` "added post-review," `.cancelled.v1` "added SAF-8b"). No new event-transport mechanism, envelope format, or architectural decision is required to add the missing rows. **Reclassified: Planned Events, not gaps.**

---

## TOM-01 — Discovery → Architecture & Design

| Field | Value |
|---|---|
| From Workspace | Discovery |
| To Workspace | Architecture & Design |
| Trigger | `RequirementDocument` reaches Confirmed state (Project Charter confirmation) |
| Preconditions | `Requirement`/`AcceptanceCriterion` exist; Delivery Lead has confirmed |
| Produced Objects | None new — Discovery's own outputs are this transition's precondition |
| Consumed Objects | `Requirement`, `AcceptanceCriterion` |
| Owner | Delivery Lead (PER-002, confirms) handing to Solution/Enterprise Architect (PER-003, receives) |
| Required Approval | Delivery Lead confirmation (already required within Discovery) |
| Review Gate | None named beyond Discovery's own confirmation step |
| AI Participation | None at the transition itself — AI participated upstream, within Discovery |
| Generated Events | `requirements.document.captured.v1` (real, named — [06-event-model.md](../architecture/06-event-model.md)) |
| Traceability Requirements | Architecture Decision must carry a `derived-from` edge to the Requirement(s) it addresses |
| Rollback Strategy | **Planned** — no "Request Changes" reopen path exists yet on the Project Charter screen; already a named, tracked backlog item (`CI-B5`, `CONTINUOUS_IMPROVEMENT_BACKLOG.md`), not a newly discovered gap |
| Success Criteria | Architecture Decision references the Requirement(s) it was created from |
| Constitutional Sources | PXF §5, §9; ECS §5; [06-event-model.md](../architecture/06-event-model.md); PAS §2.1, §2.2, §4 |

## TOM-02 — Architecture & Design → Documentation

| Field | Value |
|---|---|
| From Workspace | Architecture & Design |
| To Workspace | Documentation |
| Trigger | Architecture Decision reaches Approved state |
| Preconditions | Architecture Decision has `derived-from` edge(s) to Requirement(s); approved by Solution/Enterprise Architect + Delivery Lead |
| Produced Objects | None new at the boundary — the Approved Decision itself is the precondition |
| Consumed Objects | Architecture Decision, `Requirement` |
| Owner | Solution/Enterprise Architect (PER-003) |
| Required Approval | Architecture Decision approval (CAP-002's own human-approval requirement) |
| Review Gate | Architecture Decision approval acts as this transition's gate |
| AI Participation | None at the transition itself — Impact Analysis (CAP-012) may have already informed the Decision upstream |
| Generated Events | **Planned Event** — no named event exists yet for architecture-decision approval; the mechanism to add one (a new catalog row) is already defined ([06-event-model.md](../architecture/06-event-model.md)) |
| Traceability Requirements | Every generated specification `Artifact` must carry `derived-from`/`implements` edges back to the Decision and its Requirements |
| Rollback Strategy | **Planned** — superseding an Architecture Decision uses the `supersedes` relationship ([16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md)); no dedicated UI/workflow for this yet |
| Success Criteria | A generation `Capability` (CAP-003/004/005) is invoked against the approved Decision |
| Constitutional Sources | ECS §4, §5; [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md); PAS §2.2, §2.3, §4, §5 |

## TOM-03 — Documentation → Development

| Field | Value |
|---|---|
| From Workspace | Documentation |
| To Workspace | Development |
| Trigger | Technical Specification `Artifact` reaches a reviewed/promoted state |
| Preconditions | Functional + Technical Specification `Artifact`s exist and pass their `qualityGates` |
| Produced Objects | None new at the boundary |
| Consumed Objects | Technical Specification `Artifact` |
| Owner | Solution/Enterprise Architect (PER-003) handing to Developer (PER-006, Planned Persona) |
| Required Approval | `qualityGates` pass on CAP-003/CAP-004 |
| Review Gate | Specification review, per CAP-003/004's own Human Approval Requirements |
| AI Participation | None at the transition itself |
| Generated Events | **Planned Event** — no named event yet for documentation-artifact promotion |
| Traceability Requirements | Every generated code/UI `Artifact` must carry `implements`/`depends-on` edges back to the Specification |
| Rollback Strategy | **Planned** — no defined mechanism for reopening a promoted Specification; follows the same `supersedes` pattern as TOM-02 once defined |
| Success Criteria | A Development-phase Capability (CAP-007–010) is invoked against the promoted Specification |
| Constitutional Sources | AF Vision; [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §3; PAS §2.3, §2.4, §4, §5 |

## TOM-04 — Development → Testing

| Field | Value |
|---|---|
| From Workspace | Development |
| To Workspace | Testing |
| Trigger | A generated `Artifact` (UI Screen, CAP Service, RAP/ABAP, Integration Suite) reaches a reviewed state |
| Preconditions | Developer (PER-006) review complete; execution isolation (SAF-25) in place |
| Produced Objects | None new at the boundary |
| Consumed Objects | Generated `Artifact`s |
| Owner | Developer (PER-006, Planned Persona) handing to QA Engineer (PER-007, Planned Persona) |
| Required Approval | Developer review sign-off (CAP-007–010's Human Approval Requirements) |
| Review Gate | Generated-artifact review, per CAP-007–010 |
| AI Participation | None at the transition itself |
| Generated Events | **Planned Event** — no named event yet for development-artifact promotion |
| Traceability Requirements | Test-suite `Artifact` must carry `validated-by` edges to the `Artifact` under test |
| Rollback Strategy | **Planned** — no defined mechanism for returning a failed-review artifact to Development; presumed to be a simple re-invocation of the generation Capability, unconfirmed |
| Success Criteria | Test Suite Capability (CAP-011) is invoked against the promoted artifact |
| Constitutional Sources | AF #6; [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); PAS §2.4, §2.5, §4, §5 |

## TOM-05 — Testing → Deployment

| Field | Value |
|---|---|
| From Workspace | Testing |
| To Workspace | Deployment |
| Trigger | Test-report `Artifact` shows a passing result; `validated-by` edges present for the Requirement(s) in scope |
| Preconditions | Traceability-completeness policy passes (every relevant Requirement has ≥1 `validated-by` edge) |
| Produced Objects | None new at the boundary |
| Consumed Objects | Validated `Artifact` set, test-report `Artifact` |
| Owner | QA Engineer (PER-007, Planned Persona) handing to Release Engineer (PER-008, Planned Persona) |
| Required Approval | Traceability-completeness policy check (policy-as-code, [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md)) |
| Review Gate | The policy-as-code check itself functions as this transition's gate |
| AI Participation | Gap Detection (CAP-013) may have already surfaced any orphan Requirements upstream |
| Generated Events | **Planned Event** — no named event yet for test-completion; the `.completed.v1`/`.failed.v1`/`.cancelled.v1` `WorkflowRun`-level events already exist generically ([06-event-model.md](../architecture/06-event-model.md)) but no test-specific row is named |
| Traceability Requirements | `ApplicationVersion` must carry `contains` edges to exactly the validated `Artifact`s |
| Rollback Strategy | **Planned** — a failing test-report blocks promotion by construction (the policy-as-code gate simply doesn't pass); no separate rollback mechanism is needed beyond not promoting |
| Success Criteria | An `ApplicationVersion` is assembled from exactly the validated `Artifact` set |
| Constitutional Sources | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §5; PAS §2.5, §2.6, §4, §5 |

## TOM-06 — Deployment → Operations

| Field | Value |
|---|---|
| From Workspace | Deployment |
| To Workspace | Operations |
| Trigger | `Deployment` reaches Deployed state |
| Preconditions | `Change` approved via `ReviewGate`, with an Impact Report attached |
| Produced Objects | `Deployment` (Deployed state) |
| Consumed Objects | `ApplicationVersion` |
| Owner | Release Engineer (PER-008, Planned Persona) handing to Platform Operator (PER-004) |
| Required Approval | `Change` approval via `ApprovalGate`/`ReviewGate` ([07-workflow-engine.md](../architecture/07-workflow-engine.md)) |
| Review Gate | The `Change`'s `ReviewGate`, with Impact Analysis (CAP-012) attached as evidence |
| AI Participation | Impact Analysis runs automatically before the `ReviewGate` opens ([16-project-digital-twin.md §6](../architecture/16-project-digital-twin.md)) |
| Generated Events | `.completed.v1`/`.failed.v1`/`.cancelled.v1` (real, named, generic `WorkflowRun` catalog — [06-event-model.md](../architecture/06-event-model.md)) |
| Traceability Requirements | `Deployment` must carry `affects`/`contains` edges tying it back to the `ApplicationVersion` and, transitively, the Requirements it fulfills |
| Rollback Strategy | ITIL Change record includes a rollback plan by definition (AF #11: "no production changes without... rollback plan") — the rollback plan itself is part of the `Change` record, not a separate mechanism |
| Success Criteria | `Deployment` live; `Change` record complete with rollback plan on file |
| Constitutional Sources | AF #11; [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §6; [07-workflow-engine.md](../architecture/07-workflow-engine.md); PAS §2.6, §2.7, §4, §5 |

---

## On the absence of a seventh transition (Operations → Continuous Improvement)

No row above targets Continuous Improvement, and none is added here. PAS §2.8 found no constitutional grounding for a Continuous Improvement Lifecycle Workspace — no owning bounded context, no node category, no persona. Per this task's own reclassification rule, this is not resolved into a "Planned" bucket the way capabilities, personas, and events were, because none of PAS's six reclassification buckets fit: it is not a routine registry addition to an existing mechanism (unlike a Capability, Persona, or Event), it would require a genuinely new node category or bounded context — a constitutional-weight change per [ECS §12.3](00-engineering-canvas-specification.md#12-extensibility) ("a genuinely new node or relationship category... is a constitutional change"). **It remains classified as `Future Extension` in the Capability Catalog's terms** and is deliberately absent from this matrix rather than represented as an invented, unowned transition — this is what "no orphan transitions" means in practice: the matrix contains no row it cannot fully own, rather than a row with blank fields.

---

## Ownership completeness statement

Every one of the six transitions above has: a named "From" and "To" Lifecycle Workspace (both fully defined in PAS §2), a named or Planned-Persona owner, a named or Planned-Event trigger mechanism, and a named Review Gate or approval mechanism. No transition in this matrix has an undefined owner.
