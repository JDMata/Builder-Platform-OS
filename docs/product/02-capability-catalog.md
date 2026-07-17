# 02 — Capability Catalog (CAP v1.0)

**Status:** Operational reference material — **not** constitutional, **not** a PAS revision. Every entry below either already exists in AF/PXF/ECS/XLS/PAS or is a routine extension of a mechanism those documents already define. Nothing here introduces a new constitutional principle; where a capability's existence is genuinely open-ended enough to require touching the Constitution itself, it is marked **Future Extension**, not catalogued as a routine planned item.
**Derived from:** [01-product-architecture-specification.md](01-product-architecture-specification.md) (PAS) §5 (Capability Model) and §7 (End-to-End Validation Walkthrough).
**Purpose:** give every business capability the platform can or will perform a permanent identifier, owner, and status, so implementation, planning, and Platform Pack work has one place to check before building or naming a capability.

---

## Reinterpreting PAS's capability-shaped [GAP]s

PAS flagged five capability-shaped items as `[GAP]`: Architecture Decision generation/assistance, Technical Specification generation, Development-phase generation (Fiori/CAP/RAP/Integration Suite), and Test Suite generation (PAS §5, §7). Applying this task's rule — *a GAP remains a GAP only if the Constitution cannot answer where it lives, who owns it, or how it would be added* — none of these survive as raw gaps:

- **The extension mechanism is already fully defined.** [18-capability-model.md](../architecture/18-capability-model.md) (ADR-0022) makes `Capability`/`CapabilityProvider` a registry: a new capability is a new `Capability` record plus one or more `CapabilityProvider` records (`providerType: agent | plugin | human | external-service`, priority-ordered fallback) — no core redesign, no constitutional change. Every one of the five items is a case of "the registry has no entry yet," not "the registry has nowhere to put it."
- **The owning workspace is already named** by PAS itself for every one of them (§2.2, §2.3, §2.4, §2.5).
- **The Platform Pack mechanism** ([19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md), ADR-0023) is the explicit, already-defined delivery vehicle for the Development-phase generators specifically — AF's own non-goals section defers exactly this class of work to `plugins/*`.

**Reclassification:** all five are **Planned Capabilities** below. None is reclassified as `Future Extension`, because none requires a new node category, a new relationship category, or any other constitutional-weight change — each is a routine registry addition.

---

## Capability index, by Lifecycle Workspace

### Discovery

#### CAP-001 — Structure Business Requirement

| Field | Value |
|---|---|
| Identifier | CAP-001 |
| Name | Structure Business Requirement |
| Purpose | Turn a sponsor's free-text idea and clarification answers into a structured, confirmable `Requirement` |
| Business Objective | No idea is lost or invented in translation (PXF §1) |
| Owning Lifecycle Workspace | Discovery |
| Owner | Discovery workspace owner — Design System Architect function (PXF §23) for the experience; Distinguished Enterprise Architect / Principal Systems Engineer function (AF Governance) for the underlying domain code |
| Inputs | Idea text, clarification answers |
| Outputs | Structured `Requirement`, `AcceptanceCriterion` |
| Produced Objects | `Requirement`, `AcceptanceCriterion`, `Clarification` |
| Consumed Objects | `RequirementDocument` (Draft) |
| Primary Personas | Business Sponsor (PER-001) |
| Supporting Personas | Delivery Lead (PER-002, confirms) |
| AI Participation | Real `CapabilityProvider` (`providerType: agent`, Anthropic-backed) proposes structure; never confirms itself (PXF §9.1) |
| Human Approval Requirements | Delivery Lead confirmation at Project Charter step |
| Quality Gates | None named beyond human confirmation itself |
| Dependencies | `CapabilityResolverPort` |
| Capability Providers | One registered `CapabilityProvider` (`providerType: agent`) |
| Platform Pack Support | Not applicable — a core capability, not a pack-contributed one |
| Extension Points | Additional `CapabilityProvider`s (e.g. a future human-fallback provider) via the existing priority-fallback mechanism |
| Success Criteria | A confirmed `Requirement` with no re-asked information |
| **Current Status** | **Implemented** (Sprint 1, real Anthropic Messages API integration) |
| Constitutional Sources | AF Vision; PXF §1, §4, §9; ECS §4; PAS §2.1, §5 |

### Architecture & Design

#### CAP-002 — Assist Architecture Decision

| Field | Value |
|---|---|
| Identifier | CAP-002 |
| Name | Assist Architecture Decision |
| Purpose | Support production of an Architecture Decision node from one or more confirmed Requirements |
| Business Objective | Every delivery decision is traceable to the requirement that justified it |
| Owning Lifecycle Workspace | Architecture & Design |
| Owner | Distinguished Enterprise Architect / Principal Systems Engineer function (AF Governance) |
| Inputs | Confirmed `Requirement`(s) |
| Outputs | Draft Architecture Decision content for human review |
| Produced Objects | Architecture Decision (Decision-category node, ECS §4) |
| Consumed Objects | `Requirement`, `AcceptanceCriterion` |
| Primary Personas | Solution/Enterprise Architect (PER-003) |
| Supporting Personas | Delivery Lead (PER-002, approves) |
| AI Participation | Impact Analysis (CAP-012) may inform the decision by traversing the graph; never decides |
| Human Approval Requirements | Architect + Delivery Lead approval before the Decision moves to Approved state |
| Quality Gates | Traceability-completeness check (every Requirement has ≥1 downstream edge) before promotion |
| Dependencies | `CapabilityResolverPort`; Digital Twin graph-store adapter (unbuilt — see Roadmap) |
| Capability Providers | None registered yet |
| Platform Pack Support | Not pack-specific — a core delivery-lifecycle capability |
| Extension Points | New Decision subtypes via `NodeTypeDefinition` registration (ECS §12.2), no Canvas redesign |
| Success Criteria | Approved Decision with `derived-from` edges to its Requirements |
| **Current Status** | **Roadmap** (mechanism ready; no `CapabilityProvider` registered; depends on Digital Twin infrastructure) |
| Constitutional Sources | AF Vision ("architecture review" role); ECS §4, §5, §12; PAS §2.2, §5, §7 |

### Documentation

#### CAP-003 — Generate Functional Specification

| Field | Value |
|---|---|
| Identifier | CAP-003 |
| Name | Generate Functional Specification |
| Purpose | Produce a Functional Specification `Artifact` from approved Requirements |
| Business Objective | A generated document is traceable to the requirement(s) behind it |
| Owning Lifecycle Workspace | Documentation |
| Owner | Design System Architect function (PXF §23), coordinating with the Distinguished Enterprise Architect function for the underlying Capability domain code |
| Inputs | Confirmed `Requirement`(s) |
| Outputs | `Artifact` (`artifactType: "functional-spec"`) |
| Produced Objects | `Artifact`, `ArtifactVersion` |
| Consumed Objects | `Requirement` |
| Primary Personas | Solution/Enterprise Architect (PER-003, consumes) |
| Supporting Personas | Delivery Lead (PER-002, reviews) |
| AI Participation | `CapabilityProvider`-resolved (agent/human/plugin/external-service, priority fallback) |
| Human Approval Requirements | Review before promotion, per this Capability's own `qualityGates` |
| Quality Gates | `qualityGates: PolicyRuleId[]` on the `Capability` record (ADR-0022) |
| Dependencies | `CapabilityResolverPort`; Digital Twin graph-store adapter |
| Capability Providers | None registered yet — this is the Capability Model's own worked example, not yet an active registration |
| Platform Pack Support | Not pack-specific |
| Extension Points | Additional providers via priority fallback |
| Success Criteria | `qualityGates` pass; `implements`/`derived-from` edges present |
| **Current Status** | **Planned** (Sprint 2, "Documentation Factory," per `PROJECT_CONTEXT.md`) |
| Constitutional Sources | [18-capability-model.md](../architecture/18-capability-model.md) (worked example); [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); PAS §2.3, §5, §7 |

#### CAP-004 — Generate Technical Specification

| Field | Value |
|---|---|
| Identifier | CAP-004 |
| Name | Generate Technical Specification |
| Purpose | Produce a Technical Specification `Artifact` from approved Requirements and/or the Architecture Decision |
| Business Objective | Same as CAP-003 |
| Owning Lifecycle Workspace | Documentation |
| Owner | Same as CAP-003 |
| Inputs | `Requirement`(s), Architecture Decision |
| Outputs | `Artifact` (`artifactType: "technical-spec"`) |
| Produced Objects | `Artifact`, `ArtifactVersion` |
| Consumed Objects | `Requirement`, Architecture Decision |
| Primary Personas | Solution/Enterprise Architect (PER-003) |
| Supporting Personas | Delivery Lead (PER-002) |
| AI Participation | Same `CapabilityProvider` mechanism as CAP-003 |
| Human Approval Requirements | Same as CAP-003 |
| Quality Gates | Same mechanism as CAP-003 |
| Dependencies | Same as CAP-003; additionally depends on CAP-002's output existing |
| Capability Providers | None registered yet |
| Platform Pack Support | Not pack-specific |
| Extension Points | Same as CAP-003 |
| Success Criteria | Same as CAP-003 |
| **Current Status** | **Planned** (Sprint 2, per `PROJECT_CONTEXT.md`) |
| Constitutional Sources | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (`artifactType: "technical-spec"`); PAS §2.3, §5, §7 |

#### CAP-005 — Generate Architecture Document

| Field | Value |
|---|---|
| Identifier | CAP-005 |
| Name | Generate Architecture Document |
| Purpose | Produce an Architecture Document `Artifact` |
| Business Objective | Same as CAP-003 |
| Owning Lifecycle Workspace | Documentation |
| Owner | Same as CAP-003 |
| Inputs | Architecture Decision, `Requirement`(s) |
| Outputs | `Artifact` (`artifactType: "architecture-doc"`) |
| Produced Objects | `Artifact`, `ArtifactVersion` |
| Consumed Objects | Architecture Decision, `Requirement` |
| Primary Personas | Solution/Enterprise Architect (PER-003) |
| Supporting Personas | Delivery Lead (PER-002) |
| AI Participation | Same mechanism as CAP-003 |
| Human Approval Requirements | Same as CAP-003 |
| Quality Gates | Same mechanism as CAP-003 |
| Dependencies | Same as CAP-003 |
| Capability Providers | None registered yet |
| Platform Pack Support | Not pack-specific |
| Extension Points | Same as CAP-003 |
| Success Criteria | Same as CAP-003 |
| **Current Status** | **Planned** (named in PAS §2.3's Documentation responsibilities; no sprint attached) |
| Constitutional Sources | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (`artifactType: "architecture-doc"`); PAS §2.3 |

#### CAP-006 — Generate User Manual

| Field | Value |
|---|---|
| Identifier | CAP-006 |
| Name | Generate User Manual |
| Purpose | Produce a User Manual `Artifact` for delivered functionality |
| Business Objective | Same as CAP-003 |
| Owning Lifecycle Workspace | Documentation |
| Owner | Same as CAP-003 |
| Inputs | Generated `Artifact`s (UI Screens, CAP Services) |
| Outputs | `Artifact` (`artifactType: "user-manual"`) |
| Produced Objects | `Artifact`, `ArtifactVersion` |
| Consumed Objects | Development-phase `Artifact`s |
| Primary Personas | Solution/Enterprise Architect (PER-003) |
| Supporting Personas | none named |
| AI Participation | Same mechanism as CAP-003 |
| Human Approval Requirements | Same as CAP-003 |
| Quality Gates | Same mechanism as CAP-003 |
| Dependencies | Depends on Development-phase artifacts existing (CAP-007–010) |
| Capability Providers | None registered yet |
| Platform Pack Support | Not pack-specific |
| Extension Points | Same as CAP-003 |
| Success Criteria | Same as CAP-003; `documents` edge present ([16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md)) |
| **Current Status** | **Roadmap** (depends on Development-phase capabilities, themselves Roadmap-status) |
| Constitutional Sources | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (`artifactType: "user-manual"`); PAS §2.3 |

### Development

#### CAP-007 — Generate Fiori/SAPUI5 Application

| Field | Value |
|---|---|
| Identifier | CAP-007 |
| Name | Generate Fiori/SAPUI5 Application |
| Purpose | Generate a Fiori/SAPUI5 UI application from an approved specification |
| Business Objective | Delivery artifacts are generated, not hand-built, and remain traceable |
| Owning Lifecycle Workspace | Development |
| Owner | Distinguished Enterprise Architect / Principal Systems Engineer function; delivery is Platform-Pack-scoped (below) |
| Inputs | Functional/Technical Specification `Artifact`s |
| Outputs | UI Screen `Artifact`(s), one node per screen, not one per bundle |
| Produced Objects | `Artifact`/`ArtifactVersion` (fine-grained, `depends-on` edges to OData services) |
| Consumed Objects | Specification `Artifact`s |
| Primary Personas | **Planned Persona** — Developer (PER-006) |
| Supporting Personas | Solution/Enterprise Architect (PER-003) |
| AI Participation | `CapabilityProvider`-resolved, `providerType` most plausibly `plugin` |
| Human Approval Requirements | Review before promotion to Testing |
| Quality Gates | `qualityGates` on the Capability, once defined |
| Dependencies | Plugin execution/process isolation (SAF-25, named prerequisite per `PROJECT_CONTEXT.md`) |
| Capability Providers | None registered — awaits a Platform Pack |
| Platform Pack Support | **Planned Platform Pack** — a "Fiori Generator Pack," fulfilling the Generators facet of [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| Extension Points | Plugin Architecture (AF #6) — a pack contributes this generator without core changes |
| Success Criteria | Generated screen passes its `qualityGates`; `depends-on` edges present |
| **Current Status** | **Roadmap** (AF's stated ambition; no sprint attached; blocked on SAF-25) |
| Constitutional Sources | AF Vision, AF #6 (Plugin Architecture), AF non-goals; [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md); [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); PAS §2.4, §5, §7 |

#### CAP-008 — Generate CAP Service

| Field | Value |
|---|---|
| Identifier | CAP-008 |
| Name | Generate CAP Service |
| Purpose | Generate a CAP service (Node.js or Java), one node per service/entity/OData endpoint |
| Business Objective | Same as CAP-007 |
| Owning Lifecycle Workspace | Development |
| Owner | Same as CAP-007 |
| Inputs | Technical Specification `Artifact` |
| Outputs | CAP Service/Entity/OData Service `Artifact`(s) |
| Produced Objects | `Artifact`/`ArtifactVersion` (fine-grained) |
| Consumed Objects | Specification `Artifact`s |
| Primary Personas | **Planned Persona** — Developer (PER-006) |
| Supporting Personas | Solution/Enterprise Architect (PER-003) |
| AI Participation | Same mechanism as CAP-007 |
| Human Approval Requirements | Same as CAP-007 |
| Quality Gates | Same as CAP-007 |
| Dependencies | Same as CAP-007 |
| Capability Providers | None registered — awaits a Platform Pack |
| Platform Pack Support | **Planned Platform Pack** — a "CAP Generator Pack" |
| Extension Points | Same as CAP-007 |
| Success Criteria | Same as CAP-007 |
| **Current Status** | **Roadmap** |
| Constitutional Sources | AF Vision, AF #6; [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (finer-grained artifact table); PAS §2.4 |

#### CAP-009 — Generate RAP/ABAP Artifact

| Field | Value |
|---|---|
| Identifier | CAP-009 |
| Name | Generate RAP/ABAP Artifact |
| Purpose | Generate RAP/ABAP delivery artifacts |
| Business Objective | Same as CAP-007 |
| Owning Lifecycle Workspace | Development |
| Owner | Same as CAP-007 |
| Inputs | Technical Specification `Artifact` |
| Outputs | RAP/ABAP `Artifact`(s) |
| Produced Objects | `Artifact`/`ArtifactVersion` |
| Consumed Objects | Specification `Artifact`s |
| Primary Personas | **Planned Persona** — Developer (PER-006) |
| Supporting Personas | Solution/Enterprise Architect (PER-003) |
| AI Participation | Same mechanism as CAP-007 |
| Human Approval Requirements | Same as CAP-007 |
| Quality Gates | Same as CAP-007 |
| Dependencies | Same as CAP-007 |
| Capability Providers | None registered — awaits a Platform Pack |
| Platform Pack Support | **Planned Platform Pack** — a "RAP/ABAP Generator Pack" |
| Extension Points | Same as CAP-007 |
| Success Criteria | Same as CAP-007 |
| **Current Status** | **Roadmap** |
| Constitutional Sources | AF Vision, AF #6; PAS §2.4 |

#### CAP-010 — Generate Integration Suite Artifact

| Field | Value |
|---|---|
| Identifier | CAP-010 |
| Name | Generate Integration Suite Artifact |
| Purpose | Generate SAP Integration Suite artifacts |
| Business Objective | Same as CAP-007 |
| Owning Lifecycle Workspace | Development |
| Owner | Same as CAP-007 |
| Inputs | Technical Specification `Artifact` |
| Outputs | Integration Suite `Artifact`(s) |
| Produced Objects | `Artifact`/`ArtifactVersion` |
| Consumed Objects | Specification `Artifact`s |
| Primary Personas | **Planned Persona** — Developer (PER-006) |
| Supporting Personas | Solution/Enterprise Architect (PER-003) |
| AI Participation | Same mechanism as CAP-007 |
| Human Approval Requirements | Same as CAP-007 |
| Quality Gates | Same as CAP-007 |
| Dependencies | Same as CAP-007 |
| Capability Providers | None registered — awaits a Platform Pack |
| Platform Pack Support | **Planned Platform Pack** — an "Integration Suite Generator Pack" |
| Extension Points | Same as CAP-007 |
| Success Criteria | Same as CAP-007 |
| **Current Status** | **Roadmap** |
| Constitutional Sources | AF Vision, AF #6; PAS §2.4 |

### Testing

#### CAP-011 — Generate Test Suite

| Field | Value |
|---|---|
| Identifier | CAP-011 |
| Name | Generate Test Suite |
| Purpose | Generate a test suite validating a Development-phase `Artifact` against its Requirements/AcceptanceCriteria |
| Business Objective | No delivered artifact is unvalidated against a real Requirement |
| Owning Lifecycle Workspace | Testing |
| Owner | Distinguished Enterprise Architect / Principal Systems Engineer function |
| Inputs | Generated `Artifact`, `Requirement`/`AcceptanceCriterion` |
| Outputs | `Artifact` (`artifactType: "test-suite"`) |
| Produced Objects | Test-suite `Artifact`, `validated-by` edges |
| Consumed Objects | Development-phase `Artifact`, `Requirement` |
| Primary Personas | **Planned Persona** — QA Engineer (PER-007) |
| Supporting Personas | Solution/Enterprise Architect (PER-003) |
| AI Participation | `CapabilityProvider`-resolved (unconfirmed provider type) |
| Human Approval Requirements | Review before the test-suite is treated as authoritative |
| Quality Gates | Traceability-completeness: every Requirement has ≥1 `validated-by` edge |
| Dependencies | Development-phase artifacts must exist first (CAP-007–010) |
| Capability Providers | None registered yet |
| Platform Pack Support | Testing Extensions facet of [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| Extension Points | New test-artifact types via the existing open `artifactType` string |
| Success Criteria | `validated-by` edges present; test-report `Artifact` produced per CI run |
| **Current Status** | **Roadmap** |
| Constitutional Sources | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §5; [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md); PAS §2.5, §5, §7 |

### Cross-cutting (Architecture & Design / Deployment / Operations)

#### CAP-012 — Impact Analysis

| Field | Value |
|---|---|
| Identifier | CAP-012 |
| Name | Impact Analysis |
| Purpose | Bounded-depth graph traversal reporting what a candidate change affects/depends on, both directions |
| Business Objective | ITIL Change Management's "assess before you change" as an enforced step |
| Owning Lifecycle Workspace | Operations (primary); consumed pre-emptively by Architecture & Design and Deployment |
| Owner | Distinguished Enterprise Architect / Principal Systems Engineer function |
| Inputs | A candidate change + a node |
| Outputs | Structured Impact Report |
| Produced Objects | Impact Report (attached to a `Change`'s `ReviewGate`); `ai-inferred` edges if new relationships are discovered |
| Consumed Objects | Any node/edge in the graph |
| Primary Personas | Platform Operator (PER-004) |
| Supporting Personas | Solution/Enterprise Architect (PER-003), Delivery Lead (PER-002) |
| AI Participation | An illustrative `impact-analysis-agent` declaring `graph-query` as its one Allowed MCP tool — read-only, no approval requirement of its own |
| Human Approval Requirements | None for the analysis itself; its output informs a `Change`'s own `ReviewGate` |
| Quality Gates | None on the capability itself |
| Dependencies | `GraphStorePort`, Digital Twin graph-store adapter (`graph-adapters/postgres-age`, unbuilt) |
| Capability Providers | None registered — illustrative only in the architecture doc today |
| Platform Pack Support | Not pack-specific — a core Digital Twin capability |
| Extension Points | None named beyond the existing MCP tool mechanism |
| Success Criteria | Report attached to the `Change`'s `ReviewGate` before approval |
| **Current Status** | **Roadmap** (explicitly named "Sprint-later" in the architecture doc's own self-review; blocked on the graph-store adapter) |
| Constitutional Sources | [16-project-digital-twin.md §6](../architecture/16-project-digital-twin.md), §8; PAS §2.2, §2.6, §2.7, §5, §8 |

#### CAP-013 — Gap Detection

| Field | Value |
|---|---|
| Identifier | CAP-013 |
| Name | Gap Detection |
| Purpose | Periodic scan for orphan nodes (e.g. an unvalidated Requirement, a CAP Service with no upstream Requirement) |
| Business Objective | Traceability completeness is enforced, not merely aspirational |
| Owning Lifecycle Workspace | Testing (primary); also used in Operations |
| Owner | Distinguished Enterprise Architect / Principal Systems Engineer function |
| Inputs | Full project graph |
| Outputs | A raised `Clarification` or `Risk` |
| Produced Objects | `Clarification` or `Risk` node |
| Consumed Objects | Any node type |
| Primary Personas | Platform Operator (PER-004) |
| Supporting Personas | Solution/Enterprise Architect (PER-003) |
| AI Participation | A periodic agent, reusing existing domain concepts rather than inventing "gap" as a new type |
| Human Approval Requirements | The raised item is reviewed by a human, same as any `Clarification`/`Risk` |
| Quality Gates | None on the capability itself |
| Dependencies | `GraphStorePort`, Digital Twin graph-store adapter |
| Capability Providers | None registered — illustrative only today |
| Platform Pack Support | Not pack-specific |
| Extension Points | None named |
| Success Criteria | Raised items resolved before traceability-completeness gate passes |
| **Current Status** | **Roadmap** |
| Constitutional Sources | [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md); PAS §2.5, §5 |

#### CAP-014 — Root-Cause Assistance

| Field | Value |
|---|---|
| Identifier | CAP-014 |
| Name | Root-Cause Assistance |
| Purpose | Walk backward from an Incident to a likely root cause |
| Business Objective | The graph-assisted realization of ITIL Problem Management |
| Owning Lifecycle Workspace | Operations |
| Owner | Distinguished Enterprise Architect / Principal Systems Engineer function |
| Inputs | `Incident` |
| Outputs | An `ai-inferred`, human-reviewed hypothesis |
| Produced Objects | Hypothesis attached to the `Incident`/`Problem` |
| Consumed Objects | `Incident`, `Deployment`, `ApplicationVersion`, `Artifact`, `Change`, `Requirement` |
| Primary Personas | Platform Operator (PER-004) |
| Supporting Personas | Executive Stakeholder (PER-005, informed of outcome) |
| AI Participation | Backward graph traversal, `ai-inferred` tagged, never an automatic conclusion |
| Human Approval Requirements | A human reviews before the hypothesis is treated as a conclusion |
| Quality Gates | None on the capability itself |
| Dependencies | Same as CAP-012/013 |
| Capability Providers | None registered — illustrative only today |
| Platform Pack Support | Not pack-specific |
| Extension Points | None named |
| Success Criteria | Hypothesis reviewed and either confirmed or retired |
| **Current Status** | **Roadmap** |
| Constitutional Sources | [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md); PAS §2.7, §5, §8 |

### Deployment

No AI Capability, in ADR-0022's specific sense, is owned by Deployment. Deploying an `ApplicationVersion` is a DevOps/workflow action gated by a `ReviewGate`/`ApprovalGate`, not a `CapabilityProvider`-fulfilled request — this was PAS's own correct finding (PAS §2.6, §7) and is not reclassified, since it was never actually a gap: the Constitution already places deployment outside the Capability Model's scope. Impact Analysis (CAP-012) is consumed here but not owned here.

---

## Capability Roadmap

| Capability | Why not implemented yet | Constitutional support | Platform Pack | Suggested sprint | Dependencies | Expected value |
|---|---|---|---|---|---|---|
| CAP-002 Assist Architecture Decision | No `CapabilityProvider` registered; Digital Twin infra unbuilt | ECS §4/§5/§12, AF Vision | None — core capability | Sprint 3+ (after Documentation Factory) | Digital Twin graph-store adapter | Closes PAS's #1 headline gap; makes Architecture & Design traceable end-to-end |
| CAP-003 Generate Functional Specification | Named as illustrative example only; not yet registered | [18-capability-model.md](../architecture/18-capability-model.md) | None — core capability | Sprint 2 ("Documentation Factory," already named in `PROJECT_CONTEXT.md`) | `CapabilityResolverPort` (implemented), Digital Twin (unbuilt — degrade gracefully without full traceability if sequenced first) | First real generation capability; validates the whole resolution chain end-to-end |
| CAP-004 Generate Technical Specification | Same as CAP-003 | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | None | Sprint 2 | CAP-003 pattern reuse | Completes the documentation pair `PROJECT_CONTEXT.md` already names as the Sprint 2 goal |
| CAP-005 Generate Architecture Document | Not yet scheduled | Same | None | Sprint 2 or 3 | CAP-002's output, if sequenced after it | Closes the loop from Decision to durable document |
| CAP-006 Generate User Manual | Depends on Development artifacts existing | Same | None | Sprint 4+ | CAP-007–010 | Completes AF's documentation-role ambition |
| CAP-007–010 Development generators | Explicit AF non-goal for Sprint 0; plugin isolation (SAF-25) outstanding | AF Vision, AF #6, [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) | Fiori / CAP / RAP-ABAP / Integration Suite Generator Packs (four separate packs) | Sprint 4+ (after SAF-25 closes) | SAF-25 (plugin execution isolation) | The platform's core, named ambition (AF Vision) — highest long-term value, correctly sequenced last since it depends on everything above |
| CAP-011 Generate Test Suite | Depends on Development artifacts existing | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), [19](../architecture/19-platform-kernel-and-platform-packs.md) | Testing Extensions facet of a Generator Pack | Sprint 4+ | CAP-007–010 | Closes traceability's `validated-by` requirement |
| CAP-012–014 Impact Analysis / Gap Detection / Root-Cause Assistance | Digital Twin graph-store adapter not yet built; named "Sprint-later" in the architecture doc's own self-review | [16-project-digital-twin.md §6](../architecture/16-project-digital-twin.md), §8 | None — core Digital Twin capabilities | Whenever the Digital Twin graph-store adapter is scheduled (unscheduled today) | `graph-adapters/postgres-age` | Enables real ITIL Change/Problem Management, not just recording |

**This roadmap invents no functionality.** Every row's "why not implemented" cites either an explicit architecture-doc self-review statement ("Sprint-later"), a named backlog item (SAF-25), or PAS's own dependency chain (§7) — nothing here asserts a capability that isn't already named in PAS or the architecture it derives from.
