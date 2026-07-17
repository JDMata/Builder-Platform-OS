# 01 — Product Architecture Specification (PAS v1.0)

**Status:** Derivative — **not** a constitutional document. The PAS carries no authority of its own; every claim in it must trace to the Constitution (AF, PXF, ECS, XLS) or be flagged as a gap. Where this document conflicts with any constitutional document, the constitutional document wins and this document is wrong and must be corrected — never the reverse.
**Authored as:** Chief Product Officer / Enterprise Product Architect / Principal Solution Architect / Principal UX Strategist / Enterprise Systems Architect function.
**Purpose:** answer exactly one question — *what product must be built if the Constitution is followed correctly?* — and, in doing so, validate whether the Constitution is sufficient to describe a complete product.
**Explicitly not in scope:** wireframes, React, Figma, APIs, database schemas, or any new constitutional principle. Every object, capability, and workspace named below already exists in, or is a direct logical consequence of, AF, PXF, ECS, XLS, or the architecture documents they in turn reference (principally [16-project-digital-twin.md](../architecture/16-project-digital-twin.md), [18-capability-model.md](../architecture/18-capability-model.md), [07-workflow-engine.md](../architecture/07-workflow-engine.md)). Nothing here is invented to fill a gap — gaps are named as gaps.

---

## 0. Precondition check — is there a Constitution to derive from?

This task named a fifth document, the **Platform Constitutional Charter (PCC)**, as authoritative alongside AF/PXF/ECS/XLS. No such standalone document exists. The governance patch that froze the constitutional set at v1.0.1 ([ED-014](../../ENGINEERING_DECISION_LOG.md)) deliberately embedded precedence, conflict-resolution, ownership, and versioning rules directly into AF/PXF/ECS/XLS's own Governance sections instead of creating a separate charter — a smaller-footprint fix than authoring a fifth constitutional artifact. Per explicit direction, this PAS proceeds on that basis: **every citation below to "constitutional governance" means the distributed clauses now present in AF §Governance, PXF §23, ECS §13, and XLS §38** — there is no separate PCC to cite. This is itself the PAS's first validation finding: the Constitution is sufficient for this exercise, but it is sufficient as *four* documents, not five, and any future reference to "the PCC" should be corrected to mean this distributed set.

Every major decision below carries a citation (`AF`, `PXF §N`, `ECS §N`, `XLS §N`, or a named architecture document). Where none exists, the decision is marked **[GAP]** rather than invented.

---

## 1. The Product Model: one Engineering Canvas, many Lifecycle Workspaces

This is the PAS's single most important derived conclusion, and it revises the brief's own working assumption — carefully, and only because the Constitution itself already says so.

**What the Constitution actually specifies:** there is exactly one Digital Twin graph per Project ([ECS §2](00-engineering-canvas-specification.md#2-the-graph-model): "There is exactly one graph per project"), and the Engineering Canvas is the one human experience of that graph, expressed through four synchronized views — Guided, Canvas, Documents, Executive ([ECS §6](00-engineering-canvas-specification.md#6-the-four-views-and-the-synchronization-principle)). ECS §6 states explicitly that **Sprint 1's Discovery Workspace already *is* an instance of the Guided view** ("the same linear, wizard-like experience Sprint 1's Discovery Workspace already demonstrates"). This means Discovery is not architecturally a separate product from the Engineering Canvas — it is what the Guided view looks like early in a Project's life.

**The consequence:** the platform is not a chain of independent products, each with its own data model, that a project passes through in sequence. It is **one product — the Engineering Canvas, operating on one Project's Digital Twin graph — experienced through a sequence of purpose-built configurations of that same Canvas**, each scoped to the node/relationship categories, personas, and capabilities relevant to a phase of the work. This PAS calls these configurations **Lifecycle Workspaces** — a PAS-level term, deliberately distinct from the formally defined "Workspace" object (the Tenant-level container holding many Projects, [PXF §7](../ux/00-platform-experience-foundation.md#7-workspace-philosophy)/[ECS §3](00-engineering-canvas-specification.md#3-workspace-objects)) — precisely to avoid recreating the "Canvas"/"Canvas view" terminology collision the Constitutional Review found and fixed. **A Lifecycle Workspace is not a new object, a new view, or a new graph — it is a named phase of the one Engineering Canvas's operation over one Project's graph.**

This resolves cleanly against every constitutional constraint checked:
- **One graph, four views, always synchronized** ([ECS §2](00-engineering-canvas-specification.md#2-the-graph-model), [ECS §6](00-engineering-canvas-specification.md#6-the-four-views-and-the-synchronization-principle)) — a Lifecycle Workspace never forks the graph; moving from Discovery to Architecture & Design is the same graph, with different node categories now becoming relevant.
- **Extensibility absorbs new node/relationship types without new Canvas work** ([ECS §12](00-engineering-canvas-specification.md#12-extensibility)) — this is exactly the mechanism that lets later Lifecycle Workspaces (Development, Testing, Deployment) introduce their own artifact types without redesigning the Canvas.
- **AF's vision** of a platform that "should feel like engaging an experienced SAP delivery organization — with intake, architecture review, delivery, QA, and documentation roles" (AF, Vision) is the origin of the Lifecycle Workspace list in §2 below — each named role maps to a phase, not a separate product.

**A second, related finding, also derived rather than assumed:** the brief's example chain treats "Governance" as a terminal stage after Operations. The Constitution does not support this. Governance & Audit ([16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md)) owns `ApprovalGate`/`PolicyRule`/`ComplianceRecord`/`AuditEvent`, and a `ReviewGate` is a step *type* within a `WorkflowRun` ([07-workflow-engine.md](../architecture/07-workflow-engine.md): "Running → AwaitingApproval: Step is a human ReviewGate") that can occur at **any** promotion point, not only at the end. Traceability completeness is itself a policy-as-code check enforceable "before a `ReviewGate` allows promotion past Local POC" ([16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md)). **Governance is therefore modeled below as a cross-cutting capability active at every Lifecycle Workspace transition, not a ninth sequential stage.**

---

## 2. Lifecycle Workspaces

Seven Lifecycle Workspaces are fully derivable from the Constitution. One (Continuous Improvement) is flagged as a gap rather than invented.

### 2.1 Discovery

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Turn a business idea into a confirmed, structured requirement | ECS §6, PXF §1 |
| Business Objective | No idea is lost in translation; every confirmed requirement is traceable back to the sponsor's own words | PXF §1 |
| Primary Personas | The Business Sponsor (submits), The Delivery Lead (confirms) | PXF §4 |
| Secondary Personas | None defined | PXF §4 |
| Responsibilities | Idea capture, bounded clarification, requirement structuring, charter confirmation | PXF §5, §9 |
| Inputs | Free-text idea, sponsor answers to clarification questions | Sprint 1 (built) |
| Outputs | A confirmed `RequirementDocument` with `Requirement`/`AcceptanceCriterion` children | Sprint 1 (built) |
| Objects Owned | `RequirementDocument`, `Requirement`, `AcceptanceCriterion`, `Clarification` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Consumed | None (first phase) | — |
| Objects Produced | `RequirementDocument` (confirmed), `Project` (on confirmation) | Sprint 1 (built) |
| Capabilities | `structure-business-requirement` | Sprint 1 (built, real Anthropic integration) |
| Primary Views | Guided view (default); Canvas view available once a `Project` exists | ECS §6 |
| AI Participation | Proposes structured requirements and clarification questions; never confirms its own output (PXF §9.1) | PXF §9, ECS §7 |
| Notifications | None defined beyond in-flow state changes | **[GAP]** — no notification model exists for asynchronous clarification response |
| Search Behavior | Not yet defined for pre-confirmation `RequirementDocument`s | **[GAP]** |
| Timeline Behavior | Every `Requirement`/`Clarification` version is retained ([16-project-digital-twin.md §4](../architecture/16-project-digital-twin.md)) | ECS §11 |
| Security Context | tenantId/actorId derived from session, never from client input (Sprint 1, `apps/api-gateway`) | AF #9 (Zero Trust) |
| Extension Points | New clarification question types via the same bounded-loop mechanism | PXF §5.6 |
| Success Criteria | A confirmed requirement exists with no re-asked information (PXF §5.2) | PXF §5 |

### 2.2 Architecture & Design

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Turn a confirmed requirement into an architecture decision governing how it will be delivered | AF Vision ("architecture review" role) |
| Business Objective | Every delivery decision is traceable to the requirement that justified it | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) (Backward traceability) |
| Primary Personas | The Solution/Enterprise Architect | PXF §4 |
| Secondary Personas | The Delivery Lead (reviews/approves) | PXF §4 |
| Responsibilities | Produce and approve an Architecture Decision node against one or more Requirements | ECS §4 (Decision category) |
| Inputs | Confirmed `RequirementDocument`/`Requirement`(s) | ECS §5 (`derived-from` relationship) |
| Outputs | An approved Architecture Decision, linked `implements`/`derived-from` to its Requirements | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Objects Owned | Architecture Decision (a `Decision`-category node type) | ECS §4 |
| Objects Consumed | `Requirement`, `AcceptanceCriterion` | ECS §5 |
| Objects Produced | Architecture Decision node, `derived-from`/`implements` edges | ECS §5 |
| Capabilities | **[GAP]** — no named Capability equivalent to "Generate Architecture Decision" is defined anywhere in the Constitution or its referenced architecture docs; `18-capability-model.md` names "Generate Functional Specification" as its illustrative example, not an architecture-decision capability | **[GAP]** |
| Primary Views | Canvas view (structure/relationships), Documents view (reading the decision as prose) | ECS §6 |
| AI Participation | Impact analysis (an existing named agent pattern) may inform the decision by walking the graph both directions from a candidate change | [16-project-digital-twin.md §6](../architecture/16-project-digital-twin.md) |
| Notifications | **[GAP]** | — |
| Search Behavior | Structured graph search by relationship type; semantic search over node labels ("find requirements related to X") | [16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md) |
| Timeline Behavior | Architecture Decisions are append-only; a superseding decision uses the `supersedes` relationship, never an edit | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) (Versioning category) |
| Security Context | Same tenant/actor-scoped session model as Discovery | AF #9 |
| Extension Points | New Decision subtypes via `NodeTypeDefinition` registration, no Canvas redesign | ECS §12 |
| Success Criteria | Traceability completeness check passes — every Requirement has at least one downstream edge | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |

### 2.3 Documentation

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Generate the structured documentation artifacts a project needs before development | AF Vision; `PROJECT_CONTEXT.md`'s Sprint 2 goal ("Documentation Factory") |
| Business Objective | Every generated document is traceable to the requirement(s)/decision(s) behind it | PXF §4 (Solution/Enterprise Architect persona need) |
| Primary Personas | The Solution/Enterprise Architect (consumes), The Delivery Lead (reviews) | PXF §4 |
| Secondary Personas | none named | — |
| Responsibilities | Generate Functional Specification, Technical Specification, Architecture Document, User Manual artifacts from approved requirements/decisions | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (artifactType table) |
| Inputs | Confirmed `RequirementDocument`, approved Architecture Decision | ECS §5 |
| Outputs | `Artifact`/`ArtifactVersion` records, `artifactType` ∈ {functional-spec, technical-spec, architecture-doc, user-manual} | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Owned | `Artifact`, `ArtifactVersion` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Consumed | `Requirement`, Architecture Decision | ECS §5 |
| Objects Produced | `Artifact` nodes, `implements`/`documents` edges | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Capabilities | `Generate Functional Specification` (the Capability Model's own worked example) | [18-capability-model.md](../architecture/18-capability-model.md) |
| Primary Views | Documents view (default — this is the view built for reading-order narrative content), Canvas view for traceability checks | ECS §6 |
| AI Participation | Proposes documents via a `CapabilityProvider`; `providerType` may be `agent`, `human`, `plugin`, or `external-service` — AI is never the only possible fulfiller of a Documentation capability | [18-capability-model.md](../architecture/18-capability-model.md) |
| Notifications | **[GAP]** | — |
| Search Behavior | Semantic search prioritized for Requirements and Incidents first per the Constitution's stated rollout order; Documentation-artifact semantic search is not yet in that initial scope | [16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md) |
| Timeline Behavior | `ArtifactVersion` is itself a version-history mechanism; superseded versions remain visible via Timeline | [16-project-digital-twin.md §4](../architecture/16-project-digital-twin.md) |
| Security Context | Same tenant/actor model | AF #9 |
| Extension Points | New `artifactType` values require no schema change (already an open string) | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Success Criteria | `qualityGates: PolicyRuleId[]` on the Capability all pass before promotion | [18-capability-model.md](../architecture/18-capability-model.md) |

### 2.4 Development

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Generate the real delivery artifacts — Fiori/SAPUI5 apps, CAP services, RAP/ABAP, Integration Suite artifacts | AF Vision |
| Business Objective | Delivery artifacts are generated, not hand-built, and remain traceable to what they implement | AF Vision; [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| Primary Personas | **[GAP]** — no persona equivalent to "the developer reviewing generated code" is defined in PXF §4; the closest defined persona (Solution/Enterprise Architect) is scoped to consuming artifacts as source of truth, not to code-level review | PXF §4 |
| Secondary Personas | The Solution/Enterprise Architect | PXF §4 |
| Responsibilities | Generate finer-grained artifacts (UI Screen, CAP Service, Entity, OData Service), each with its own Digital Twin node, not one node for a whole bundle | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Inputs | Approved Functional/Technical Specification | ECS §5 |
| Outputs | `Artifact`/`ArtifactVersion` per generated component, `implements`/`depends-on` edges | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Objects Owned | `Artifact`/`ArtifactVersion` (fine-grained: UI Screen, CAP Service, Entity, OData Service) | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Consumed | Functional/Technical Specification `Artifact`s | ECS §5 |
| Objects Produced | Fine-grained `Artifact` nodes and `depends-on` structural edges (e.g. UI Screen → OData Service) | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Capabilities | **[GAP]** — AF names the generator targets (Fiori, CAP, RAP, Integration Suite) as the platform's ambition, but no `Capability` aggregate for any of them is named in the Constitution or its referenced architecture docs; `plugins/*` are architecture-level stubs only (AF, Explicit Sprint 0 non-goals) | AF, non-goals |
| Primary Views | Canvas view (dependency structure), Documents view (reading a generated spec) | ECS §6 |
| AI Participation | Same `CapabilityProvider` resolution chain as Documentation | [18-capability-model.md](../architecture/18-capability-model.md) |
| Notifications | **[GAP]** | — |
| Search Behavior | Same structured/semantic split as Documentation | [16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md) |
| Timeline Behavior | Same append-only `ArtifactVersion` model | [16-project-digital-twin.md §4](../architecture/16-project-digital-twin.md) |
| Security Context | Same tenant/actor model; plugin execution isolation named as a hard prerequisite before real generation ships (`PROJECT_CONTEXT.md`, SAF-25) | AF #6, #9 |
| Extension Points | Plugin Architecture (AF #6) — a Platform Pack contributes its own generator without core changes | AF #6, [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| Success Criteria | Generated artifact passes its Capability's `qualityGates` | [18-capability-model.md](../architecture/18-capability-model.md) |

### 2.5 Testing

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Validate generated artifacts against the requirements/acceptance criteria they implement | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) (`validated-by` relationship) |
| Business Objective | No delivered artifact is unvalidated against a real Requirement | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| Primary Personas | **[GAP]** — no QA/test-engineer persona is defined in PXF §4 | PXF §4 |
| Secondary Personas | The Solution/Enterprise Architect | PXF §4 |
| Responsibilities | Generate and run test suites; record pass/fail per CI run | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Inputs | Generated `Artifact` (code-bearing), the `Requirement`/`AcceptanceCriterion` it must satisfy | ECS §5 |
| Outputs | `Artifact` (`artifactType: "test-suite"`), `Artifact` (`artifactType: "test-report"`), `validated-by` edges | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Owned | Test-suite and test-report `Artifact`s | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Consumed | Generated `Artifact`s from Development, `Requirement`/`AcceptanceCriterion` | ECS §5 |
| Objects Produced | Test-suite/test-report `Artifact`s, `validated-by` edges, per-CI-run `status` updates | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Capabilities | **[GAP]** — no named `Generate Test Suite` Capability exists in the Constitution; only the resulting artifact types are named | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Primary Views | Canvas view (traceability: which Requirements lack a `validated-by` edge) | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| AI Participation | Gap detection: a periodic agent scan for orphan nodes (e.g. a Requirement with no `validated-by` edge) raises a `Clarification` or `Risk` | [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md) |
| Notifications | **[GAP]** | — |
| Search Behavior | Structured graph query by `validated-by` relationship | [16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md) |
| Timeline Behavior | Test-report status updates per CI run, retained in version history | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Security Context | Same tenant/actor model | AF #9 |
| Extension Points | New test-artifact types via the existing open `artifactType` string | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Success Criteria | Traceability-completeness policy: every Requirement has ≥1 `validated-by` edge before promotion | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |

### 2.6 Deployment

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Deploy a named, immutable bundle of validated artifacts to a specific environment | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (`Deployment`/`ApplicationVersion`) |
| Business Objective | Every deployment is traceable to exactly the artifacts, requirements, and approvals behind it | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| Primary Personas | **[GAP]** — no deployment/release-engineer persona defined in PXF §4 | PXF §4 |
| Secondary Personas | The Platform Operator | PXF §4 |
| Responsibilities | Assemble an `ApplicationVersion`, execute a `Deployment` under a specific execution profile | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md) |
| Inputs | Validated `Artifact`/`ArtifactVersion` set | ECS §5 (`contains` relationship) |
| Outputs | `ApplicationVersion` (immutable bundle), `Deployment` record with status | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Owned | `Deployment`, `ApplicationVersion` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Consumed | Tested `Artifact`s | ECS §5 |
| Objects Produced | `ApplicationVersion`, `Deployment`, `contains` edges | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Capabilities | **[GAP]** — deployment is a DevOps/workflow action, not a named `Capability` in ADR-0022's specific (AI/LLM-provider-fulfilled) sense; conflating the two would misrepresent the Capability Model | [18-capability-model.md](../architecture/18-capability-model.md) |
| Primary Views | Executive view (deployment status as an honest, aggregated signal) | ECS §6 |
| AI Participation | Impact analysis may run automatically before a `Change`'s `ReviewGate` opens, attaching its report as evidence | [16-project-digital-twin.md §6](../architecture/16-project-digital-twin.md), §8 |
| Notifications | **[GAP]** | — |
| Search Behavior | Structured query by `contains` relationship | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Timeline Behavior | `ApplicationVersion` is itself an immutable, versioned snapshot of what was deployed | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Security Context | Zero Trust; execution profile governs the deployed application's own security posture | AF #9; [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md) |
| Extension Points | New execution profiles registrable without core changes | [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md) |
| Success Criteria | `Change` approved via `ReviewGate` before promotion | [07-workflow-engine.md](../architecture/07-workflow-engine.md), [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |

### 2.7 Operations

| Attribute | Definition | Source |
|---|---|---|
| Purpose | Manage the running system's risks, incidents, problems, and changes | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) (Governance & Audit's ITIL aggregates) |
| Business Objective | ITIL alignment: no production change without record, approval, rollback plan | AF #11 |
| Primary Personas | The Platform Operator | PXF §4 |
| Secondary Personas | The Executive Stakeholder | PXF §4 |
| Responsibilities | Record and manage `Risk`, `Incident`, `Problem`, `Change`; run root-cause and impact analysis | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §8 |
| Inputs | Live `Deployment`/`ApplicationVersion` state | ECS §5 (`affects` relationship) |
| Outputs | `Risk`/`Incident`/`Problem`/`Change` records, `affects`/`threatens`/`mitigates` edges | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Objects Owned | `Risk`, `Incident`, `Problem`, `Change`, `ApprovalGate`, `PolicyRule`, `ComplianceRecord`, `AuditEvent` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Objects Consumed | `Deployment`, `ApplicationVersion`, `Requirement` (a Risk can `threaten` a Requirement) | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Objects Produced | Governance & Audit aggregates, their edges | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Capabilities | Root-cause assistance (an agent walking Incident → Deployment → Application Version → Artifacts → Changes → Requirements) | [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md) |
| Primary Views | Executive view (status signals), Canvas view (root-cause traversal) | ECS §6 |
| AI Participation | Root-cause hypothesis generation (`ai-inferred`, human-reviewed, never an automatic conclusion) | [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md) |
| Notifications | **[GAP]** | — |
| Search Behavior | Semantic search prioritized here — Incidents are one of the two node types with initial semantic-search rollout | [16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md) |
| Timeline Behavior | `DigitalTwinSnapshot` captured at `Deployment`/`Change` approval milestones, feeding audit reconstruction | [16-project-digital-twin.md §4](../architecture/16-project-digital-twin.md) |
| Security Context | Same tenant/actor model; `ComplianceRecord`/`AuditEvent` are the audit-visibility mechanism PXF §18 requires be surfaced, not just logged | AF #9; PXF §18 |
| Extension Points | New Governance & Audit aggregate types would be a new bounded context — a higher bar than a new `artifactType` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Success Criteria | `Change` approved with an attached Impact Report before promotion | [16-project-digital-twin.md §6](../architecture/16-project-digital-twin.md) |

### 2.8 Continuous Improvement — flagged, not specified

The brief's example chain ends with "Lessons Learned." No constitutional or architecture document defines a customer-facing capability, object, or workflow for structured retrospective/lessons-learned work on a delivered project. The closest adjacent mechanism is Problem Management's root-cause assistance ([16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md)), which explains *why* an incident happened but does not constitute a "Lessons Learned" artifact or a recurring improvement-backlog mechanism for the customer's own project (as distinct from this platform's own internally-facing `CONTINUOUS_IMPROVEMENT_BACKLOG.md`, which governs the *platform's* engineering process, not a customer's delivered product). **This is named here as an identified gap, per this task's own instruction, rather than invented.**

---

## 3. Object Model

Organized by ECS §4's own node-category kernel — every object below already falls into one of these seven categories; none of them adds an eighth.

| Category (ECS §4) | Object | Purpose | Owner (Workspace) | Lifecycle | Relationships | State Model | Searchability | Timeline | AI Participation | Permissions | Versioning | Provenance |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Intent | `RequirementDocument` (idea capture) | Hold the originating idea and its structuring | Discovery | Draft → Clarifying → Confirmed | `derived-from` children (`Requirement`) | Draft/Clarifying/Confirmed | **[GAP]** pre-confirmation search undefined | Full version history | Proposes structure (`ai-inferred`) | tenant/actor-scoped | Append-only | `declared` once confirmed |
| Requirement | `Requirement` | The unit of "what must be true" | Discovery | Proposed → Confirmed → Superseded | `implements`, `validated-by`, `derived-from` | Proposed/Confirmed/Superseded | Semantic search (priority tier) | Full version history | AI-proposed structure, human-confirmed | tenant/actor-scoped | Append-only | Mixed `declared`/`ai-inferred` per field |
| Requirement | `AcceptanceCriterion` | Attached, checkable condition on a `Requirement` | Discovery | Same as parent | Attached to `Requirement` | Same as parent | Inherits parent | Full version history | Same as `Requirement` | Same as parent | Append-only | Same as parent |
| Requirement | `Clarification` | A bounded question/answer pair | Discovery | Asked → Answered | Attached to `RequirementDocument` | Asked/Answered | **[GAP]** | Full version history | AI-generated question, human answer | tenant/actor-scoped | Append-only | `ai-inferred` (question), `declared` (answer) |
| Decision | Architecture Decision | A governance/architecture judgment on a Requirement | Architecture & Design | Proposed → Approved → Superseded | `derived-from`, `supersedes` | Proposed/Approved/Superseded | Structured graph query | Full version history, never edited in place | Impact analysis may inform, never decides | tenant/actor-scoped, approval gate | Append-only | `declared` (human decision) |
| Decision | `Change` | An ITIL change record | Operations | Proposed → Approved (`ReviewGate`) → Applied | `affects`, `mitigates` | Proposed/Approved/Applied | Structured query | Full history | Impact Report attached automatically | Approval-gated | Append-only | `declared` |
| Artifact | `Artifact`/`ArtifactVersion` | A produced deliverable (spec, code, test, doc) | Documentation / Development / Testing | Generated → Reviewed → Promoted → Superseded | `implements`, `depends-on`, `validated-by`, `documents` | Per §1 of [16](../architecture/16-project-digital-twin.md) | Structured + semantic (rollout-ordered) | `ArtifactVersion` history | `CapabilityProvider`-fulfilled (agent/human/plugin/external) | tenant/actor-scoped | Append-only | Per-provider, tagged |
| Execution | `WorkflowRun` | One execution of a `WorkflowDefinition` | Cross-cutting | Running → AwaitingApproval → Completed/Failed/Cancelled | Produces edges to its outputs | Per [07-workflow-engine.md](../architecture/07-workflow-engine.md) | **[GAP]** | Full run history | Orchestrates capability invocation | tenant/actor-scoped | Append-only | Pins exact versions used (domain model rule 6) |
| Execution | `Deployment` | One deployment of an `ApplicationVersion` | Deployment | Pending → Deployed → Retired | `contains`, `affects` | Per [16 §1](../architecture/16-project-digital-twin.md) | Structured query | Immutable per-deployment record | None named | tenant/actor-scoped, approval gate | Append-only | `declared` |
| Execution | `ApplicationVersion` | An immutable release bundle | Deployment | Assembled → Released | `contains` (Artifacts) | Immutable once assembled | Structured query | Itself a version snapshot | None named | tenant/actor-scoped | Immutable | `declared` |
| Capability | `Capability` | A business-level request for AI/human/plugin fulfillment | Documentation, Development | Defined → Resolved (via `CapabilityProvider`) | `requires-capability`, `fulfilled-by` | N/A (a definition, not a state machine) | **[GAP]** | Definition versioned like any registry entry | Is the AI-participation mechanism itself | Governed by `requiredPermissions` field | Versioned definition | N/A |
| Capability | `CapabilityProvider` | A concrete fulfiller (agent/human/plugin/external-service) | Documentation, Development | Registered → Priority-ordered fallback | `fulfilled-by` | Active/inactive | **[GAP]** | Priority-chain versioned | **Is** the AI participation, when `providerType: agent` | Provider-type-scoped | Versioned | Attributed by `providerId` |
| Annotation | `Clarification` question, AI review comments | Commentary attached to another node, never standalone | All (contextual) | Proposed → Resolved | Attached only | Proposed/Resolved | Not independently searchable (attached) | Retained with parent | Is, by definition, AI or human commentary | Inherits parent's permissions | Append-only | Always tagged (never `declared` as fact) |
| — (Governance & Audit, not a Canvas node category but a cross-cutting object set) | `Risk`, `Incident`, `Problem`, `ApprovalGate`, `PolicyRule`, `ComplianceRecord`, `AuditEvent` | ITIL/governance record-keeping | Operations | Per ITIL lifecycle (varies by type) | `threatens`, `affects`, `mitigates` | Per type | Semantic search (Incidents, priority tier) | Full history, `DigitalTwinSnapshot` at milestones | Root-cause/gap-detection agents propose, never conclude | tenant/actor-scoped, some approval-gated | Append-only | `declared`/`ai-inferred` mixed |

**Note on category placement:** Governance & Audit's aggregates are not explicitly assigned to one of ECS §4's seven node categories in the Constitution itself — they are Digital Twin nodes ("Governance" appears as a *relationship* category in ECS §5, not a node category in ECS §4). This PAS places them for completeness but flags the placement as an inference, not a constitutional statement: **[GAP]** — ECS §4's node taxonomy does not explicitly enumerate where ITIL governance objects sit.

---

## 4. Workspace Contracts

| Workspace | Consumes | Produces | Publishes | Subscribes | Dependencies | Events | Integration Points | Downstream Consumers | Upstream Providers |
|---|---|---|---|---|---|---|---|---|---|
| Discovery | Sponsor idea text | Confirmed `RequirementDocument` | `requirements.document.captured.v1` | none | `structure-business-requirement` Capability | Domain events per [06-event-model.md](../architecture/06-event-model.md) | None (first phase) | Architecture & Design | None |
| Architecture & Design | Confirmed `RequirementDocument` | Approved Architecture Decision | **[GAP]** — no named event exists for architecture-decision approval | `requirements.document.captured.v1` | Impact-analysis agent (optional) | **[GAP]** | Digital Twin graph write | Documentation, Development | Discovery |
| Documentation | Requirement + Architecture Decision | `Artifact`/`ArtifactVersion` (spec/doc types) | **[GAP]** | Architecture-decision events (once named) | `Generate Functional Specification` Capability | **[GAP]** | Digital Twin graph write, Capability resolution chain | Development, Testing | Architecture & Design |
| Development | Specification `Artifact`s | Fine-grained code/UI `Artifact`s | **[GAP]** | Documentation events (once named) | Plugin Architecture (AF #6), execution isolation (SAF-25 prerequisite) | **[GAP]** | Digital Twin graph write | Testing, Deployment | Documentation |
| Testing | Generated `Artifact`s + Requirements | Test-suite/test-report `Artifact`s, `validated-by` edges | **[GAP]** | Development events (once named) | CI execution | **[GAP]** | Digital Twin graph write | Deployment | Development |
| Deployment | Validated `Artifact` set | `ApplicationVersion`, `Deployment` record | `.completed.v1`/`.failed.v1`/`.cancelled.v1` (`WorkflowRun` events already catalogued) | Testing completion | `ReviewGate` (Change approval) | [06-event-model.md](../architecture/06-event-model.md)'s core catalog | Digital Twin graph write, execution profile | Operations | Testing |
| Operations | Live `Deployment` state | `Risk`/`Incident`/`Problem`/`Change` records | **[GAP]** | Deployment events | Root-cause/impact-analysis agents | **[GAP]** | Digital Twin graph write | Continuous Improvement (**[GAP]**, §2.8) | Deployment |

**Cross-cutting Governance** intersects every row above via `ReviewGate` steps and `ApprovalGate` checks ([07-workflow-engine.md](../architecture/07-workflow-engine.md)), not as its own row.

**Named gap, stated once rather than repeated per row:** the Constitution's event catalog ([06-event-model.md](../architecture/06-event-model.md)) names events for Discovery (`requirements.document.captured.v1`) and for generic `WorkflowRun` completion/failure/cancellation, but **does not yet name events for architecture-decision approval, documentation-artifact generation, development-artifact generation, or test completion specifically.** This is a real, checkable gap in the event catalog, not an oversight of this PAS.

---

## 5. Capability Model

Only capabilities with a real name in the Constitution or its referenced architecture docs are listed as defined; every other lifecycle need is marked as a gap rather than given an invented name.

| Capability | Purpose | Owner (Workspace) | Inputs | Outputs | Objects | Views | AI | Success Criteria | Dependencies |
|---|---|---|---|---|---|---|---|---|---|
| `structure-business-requirement` | Turn free-text idea + clarification answers into a structured `Requirement` | Discovery | Idea text, clarification answers | Confirmed `Requirement`/`AcceptanceCriterion` | `RequirementDocument`, `Requirement` | Guided | Real Anthropic-backed `CapabilityProvider` (Sprint 1, built) | Human confirmation at Project Charter step | `CapabilityResolverPort` |
| `Generate Functional Specification` (named as the Capability Model's own worked example) | Produce a Functional Specification `Artifact` from approved requirements | Documentation | `Requirement`(s) | `Artifact` (`artifactType: "functional-spec"`) | `Requirement`, `Artifact` | Documents | `CapabilityProvider` (`providerType`: agent/human/plugin/external-service, priority fallback) | `qualityGates: PolicyRuleId[]` on the `Capability` pass | `CapabilityResolverPort`, `.ai/agents/documentation-agent` (illustrative) |
| Impact analysis | Bounded-depth traversal reporting what a candidate change affects/depends on | Architecture & Design, Deployment, Operations | A candidate change + a node | Structured Impact Report | Any node/edge in the graph | Canvas | `impact-analysis-agent`, `graph-query` MCP tool, read-only, no approval of its own | Report attached to the `Change`'s `ReviewGate` | `GraphStorePort` |
| Gap detection | Periodic scan for orphan nodes (e.g. unvalidated Requirements) | Testing, Operations | Full project graph | `Clarification` or `Risk` raised | Any node type | Canvas | Periodic agent, reuses existing domain concepts rather than inventing "gap" as a new type | Raised items reviewed by a human | `GraphStorePort` |
| Root-cause assistance | Walk backward from an Incident to a likely cause | Operations | `Incident` | `ai-inferred`, human-reviewed hypothesis | `Incident`, `Deployment`, `ApplicationVersion`, `Artifact`, `Change`, `Requirement` | Canvas | Same agent pattern as impact analysis, backward traversal | Human reviews before treated as a conclusion | `GraphStorePort` |
| **[GAP]** — Fiori/CAP/RAP/Integration Suite generation | Named as AF's Vision, never given a `Capability` definition | Development | Specification `Artifact`s | Fine-grained code `Artifact`s | `Artifact` | Canvas/Documents | Presumably `CapabilityProvider`-resolved, unconfirmed | Undefined | Undefined |
| **[GAP]** — Test-suite generation | Implied by the existing `test-suite`/`test-report` `artifactType`s | Testing | Generated `Artifact` | Test-suite/report `Artifact` | `Artifact` | Canvas | Undefined | Undefined | Undefined |
| **[GAP]** — Architecture-decision generation/assistance | Implied by AF's "architecture review" role | Architecture & Design | `Requirement`(s) | Architecture Decision | Decision node | Canvas/Documents | Undefined | Undefined | Undefined |

---

## 6. Navigation Model

This describes work progression, not menus, per [PXF §8](../ux/00-platform-experience-foundation.md#8-navigation-model)'s own rule that "progress within a journey is shown as a process position, not a page in a menu tree."

```
Idea (Discovery)
  ↓  — a confirmed Requirement is the precondition for any downstream decision (PXF §5.2: never re-ask what's already known)
Architecture & Design
  ↓  — an approved Decision is what Documentation's generated specs must derive from (ECS §5, derived-from)
Documentation
  ↓  — a reviewed Specification is the input Development's generators require (AF Vision)
Development
  ↓  — a generated Artifact is only real once validated (ECS §5, validated-by)
Testing
  ↓  — validated Artifacts are what a Deployment bundles into an ApplicationVersion (16 §1)
Deployment
  ↓  — a live Deployment is what Operations then manages the risk/incident/change lifecycle of (AF #11, ITIL)
Operations
  ↺  — Governance (ApprovalGate/ReviewGate) is not a stage here; it gates every transition above, every time (07-workflow-engine.md)
  ?  — Continuous Improvement: **[GAP]**, §2.8
```

Each transition exists because the Digital Twin's own traceability model requires an upstream node before a downstream one can legitimately reference it ([16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md), Forward traceability) — the sequence above is not a UI convention, it is the shape of the graph's own dependency structure, expressed as a path a user experiences one Lifecycle Workspace at a time. A user does not "navigate to a page" — they move to the next Lifecycle Workspace because the graph now has new content relevant to a different set of node categories, exactly as [ECS §12.2](00-engineering-canvas-specification.md#12-extensibility) already guarantees the Canvas absorbs without redesign.

---

## 7. End-to-End Validation Walkthrough

This is the PAS's central proof. Each row identifies Workspace / Objects / Capabilities / AI Participation / Governance / Outputs for one transition, and flags ambiguity rather than resolving it silently.

| Step | Workspace | Objects | Capabilities | AI Participation | Governance | Outputs | Ambiguity found |
|---|---|---|---|---|---|---|---|
| 1. Business idea | Discovery | `RequirementDocument` (Draft) | `structure-business-requirement` | Proposes structure, bounded clarification | None yet (pre-confirmation) | Draft `RequirementDocument` | None |
| 2. Discovery | Discovery | `RequirementDocument`, `Requirement`, `Clarification` | `structure-business-requirement` | AI-proposed, human-confirmed (PXF §9.1) | Human confirmation at Project Charter | Confirmed `RequirementDocument` | None |
| 3. Requirements | Discovery → Architecture & Design boundary | `Requirement`, `AcceptanceCriterion` | none named | none | Traceability-completeness check available, not yet mandatory here | Requirements ready for architecture reference | None |
| 4. Architecture | Architecture & Design | Architecture Decision | **[GAP]** — no named capability | Impact analysis may inform | `ReviewGate` (implied by "Approved" state) | Approved Architecture Decision | **[GAP]**: no generation capability named |
| 5. Functional Specification | Documentation | `Artifact` (functional-spec) | `Generate Functional Specification` | `CapabilityProvider`-resolved | `qualityGates` on the Capability | Functional Specification `Artifact` | None — this step is the Constitution's own worked example |
| 6. Technical Specification | Documentation | `Artifact` (technical-spec) | **[GAP]** — no equivalently-named capability, only the `artifactType` exists | Presumed `CapabilityProvider`-resolved | Presumed `qualityGates` | Technical Specification `Artifact` | **[GAP]**: capability unnamed |
| 7. Engineering Canvas | (all — this is not a step, it is the surface every step above and below occurs through) | The whole graph so far | N/A | N/A | N/A | N/A | Corrects the brief's framing: the Canvas is not a stage between Technical Specification and Development, it is the medium the entire walkthrough occurs in (ECS §2, §6) |
| 8. Development | Development | Fine-grained `Artifact`s | **[GAP]** — Fiori/CAP/RAP/Integration Suite generation named as vision, not as a capability | Presumed `CapabilityProvider`-resolved | Plugin execution isolation prerequisite (SAF-25) not yet built | Generated code/UI `Artifact`s | **[GAP]**: capability unnamed; isolation prerequisite outstanding |
| 9. Testing | Testing | Test-suite/report `Artifact`s | **[GAP]** — no named capability | Gap detection (real, named) | Traceability-completeness check (`validated-by`) | Test results, `validated-by` edges | **[GAP]**: generation capability unnamed |
| 10. Deployment | Deployment | `ApplicationVersion`, `Deployment` | N/A — a workflow action, not an AI Capability | Impact analysis before `Change` `ReviewGate` | `Change` approved via `ReviewGate` | Live `Deployment` | None — correctly not an AI capability |
| 11. Operations | Operations | `Risk`/`Incident`/`Problem`/`Change` | Root-cause assistance (real, named) | `ai-inferred` hypotheses, human-reviewed | `ApprovalGate` on `Change` | Managed incidents/changes | None |
| 12. Governance | cross-cutting, not a stage | `ApprovalGate`, `PolicyRule`, `ComplianceRecord`, `AuditEvent` | N/A | N/A | Is the mechanism itself | Audit trail | Corrects the brief's framing: not a stage after Operations, active throughout |
| 13. Lessons Learned | **[GAP]**, §2.8 | Undefined | Undefined | Undefined | Undefined | Undefined | **[GAP]**: no constitutional grounding |

**Validation verdict for this walkthrough:** the Constitution is sufficient to describe steps 1–3, 5, 10, 11, and 12 completely, with real, named objects, capabilities, and governance. It is **insufficient**, as written, for steps 4, 6, 8, 9, and 13 — not because the *shape* of the work is unclear (the node/edge/artifact-type model absorbs all of it structurally, per [ECS §12](00-engineering-canvas-specification.md#12-extensibility)), but because the specific **Capability** that would perform the generation is named nowhere for Architecture Decisions, Technical Specifications, Development artifacts, or Test artifacts — only Documentation's Functional Specification has a named, worked capability example. **This is the single most important finding of this PAS**: the constitutional layer's *product model* (workspaces, objects, views, governance) is complete; its *capability catalog* is not — five of eight generation-shaped steps in a real project have no named `Capability`, only an implied one.

---

## 8. AI Architecture

Per workspace, grounded in [PXF §9](../ux/00-platform-experience-foundation.md#9-ai-interaction-model), [ECS §7](00-engineering-canvas-specification.md#7-ai-annotation-behavior), [XLS §19](../ux/01-experience-language-specification.md#19-ai-visual-language), and [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md).

| Workspace | AI assists with | AI never owns | Requires human approval | Produces provenance | Becomes searchable knowledge |
|---|---|---|---|---|---|
| Discovery | Structuring free text, proposing clarification questions | Confirming a Requirement | Project Charter confirmation | Every AI-proposed field tagged (PXF §9.4) | Confirmed Requirements (semantic search, priority tier) |
| Architecture & Design | Impact analysis informing the decision | The Architecture Decision itself | The decision's approval | Impact Report attribution | Architecture Decisions (structured search) |
| Documentation | Generating spec/doc content via `CapabilityProvider` | Final promotion of the document | `qualityGates` pass | Provider attribution (`providerId`) | **[GAP]** not yet in semantic-search rollout order |
| Development | Generating code/UI artifacts (once a capability is named) | Plugin execution / isolation guarantees | Promotion past generation | Provider attribution (presumed) | **[GAP]** |
| Testing | Gap detection (orphan/unvalidated Requirements) | Deciding a test actually passed | Traceability-completeness gate | Raised `Clarification`/`Risk` tagged `ai-inferred` | Test artifacts (structured search) |
| Deployment | Impact analysis before a `Change`'s `ReviewGate` | The `Change` approval itself | `ReviewGate` | Impact Report attribution | **[GAP]** |
| Operations | Root-cause hypothesis generation | The incident's actual resolution | Treating a hypothesis as conclusion | `ai-inferred` tag on every hypothesis | Incidents (semantic search, priority tier) |

The one platform-wide invariant across every row, derived directly rather than assumed: **AI never crosses from `ai-inferred` to `declared` without a human action at a named gate** (PXF §9.1, ECS §7.1, [16-project-digital-twin.md §8](../architecture/16-project-digital-twin.md)) — this holds in every workspace above without exception, and is the one AI-architecture rule this PAS did not need to flag a gap for.

---

## 9. Product Governance

- **Workspace ownership:** each Lifecycle Workspace's constitutional grounding is owned by the same function that owns the constitutional document it derives from most heavily — Discovery/Documentation/Testing trace primarily to PXF and ECS (Design System Architect function, per [PXF §23](../ux/00-platform-experience-foundation.md#23-ux-governance)/[ECS §13](00-engineering-canvas-specification.md#13-governance)); Architecture & Design, Development, Deployment, Operations trace primarily to AF (Distinguished Enterprise Architect / Principal Systems Engineer function, per AF's own Governance section).
- **Capability ownership:** every `Capability`/`CapabilityProvider` is governed by [18-capability-model.md](../architecture/18-capability-model.md)'s existing resolution chain — no new ownership model is introduced here.
- **Object ownership:** as tabulated in §3; every object's single source of truth is the Digital Twin graph itself ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md), "a graph overlay, not a second source of truth") — no Lifecycle Workspace, including this PAS's own list, may introduce a second copy of any object.
- **Review responsibilities:** every Lifecycle Workspace transition is checked against all four constitutional documents at Product Design Review, exactly as [PXF §23](../ux/00-platform-experience-foundation.md#23-ux-governance), [ECS §13](00-engineering-canvas-specification.md#13-governance), and [XLS §38](../ux/01-experience-language-specification.md#38-governance) already require — this PAS adds no new review body.
- **Product evolution:** this PAS itself is not constitutional and can be revised freely as gaps are closed (e.g., once a named `Capability` for Architecture Decisions is defined) — unlike AF/PXF/ECS/XLS, a PAS revision does not require ADR-weight governance, since it derives rather than decides.
- **Extension strategy:** new Lifecycle Workspaces (should the Constitution's roadmap add one) are additions to §2's list, following the same derivation discipline — cite the constitutional source or flag the gap, never invent.
- **Platform Packs integration:** every named **[GAP]** capability in §5 is exactly where a future Platform Pack ([19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md)) is expected to register its generator/capability contribution — the gap list in this PAS is, read differently, the Platform Pack roadmap's own backlog.

---

## 10. Review Checklist

| # | Check | Reference |
|---|---|---|
| 1 | Does every Lifecycle Workspace have a purpose traceable to a constitutional document? | §1, §2 |
| 2 | Is every capability named here either a real Capability in the Constitution, or explicitly flagged [GAP]? | §5 |
| 3 | Does every object have exactly one owning Workspace and one source of truth (the Digital Twin graph)? | §3, §9 |
| 4 | Is navigation described as work progression, not menus? | §6 |
| 5 | Is every workspace's AI participation explicit about what AI never owns and what requires approval? | §8 |
| 6 | Is governance shown as cross-cutting, not a terminal stage? | §1, §4, §7 |
| 7 | Does no duplicated capability exist (e.g., two workspaces both claiming to own the same Capability)? | §5 |
| 8 | Does no orphan object exist (an object with no owning Workspace)? | §3 |
| 9 | Does no orphan workflow exist (a transition in §7 with no Workspace)? | §6, §7 |
| 10 | Does this document violate any constitutional principle? | Throughout — none found |

---

## 11. Definition of Done

The PAS is complete only if a new engineering team, reading only this document plus AF/PXF/ECS/XLS, could understand: what the platform is (§1); what Lifecycle Workspaces exist and why (§2, §6); how they collaborate (§4); what objects exist and who owns them (§3); how users move through the platform (§6); where AI participates and where it is bounded (§8); and how an engineering project reaches production, including exactly where the Constitution currently falls short (§7) — without requiring any additional architectural specification to understand the *shape* of the answer, even where a specific capability's *content* remains a named, open gap.

---

## Closing validation verdict

**The Constitution is sufficient to define a complete product architecture — with five identified gaps, none of which required inventing a new principle to work around:**

1. No standalone Platform Constitutional Charter exists; its role is fulfilled by AF/PXF/ECS/XLS's own distributed governance clauses (§0).
2. No `Capability` is named for Architecture Decision generation, Technical Specification generation, Development-phase code generation, or Test-suite generation — only Documentation's Functional Specification has a fully worked capability example (§5, §7).
3. No persona is defined for Development, Testing, or Deployment roles — PXF §4's five personas cover Discovery, Documentation-consumption, and Operations/Executive roles, but not a developer, QA engineer, or release engineer (§2.4–2.6).
4. The event catalog names events for Discovery and generic `WorkflowRun` lifecycle, but not for architecture-decision approval, documentation generation, development generation, or test completion specifically (§4).
5. Continuous Improvement / Lessons Learned has no constitutional grounding beyond Problem Management's root-cause assistance (§2.8, §7).

None of these five gaps required this PAS to invent behavior to compensate — each is stated plainly, traced to where it would need to be closed (a future Capability definition, a future PXF persona, a future event catalog entry), and left open, per this task's own governing instruction.
