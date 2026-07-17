# 06 — Canonical Machine Model (CMM v1.0)

**Status:** Operational reference material — **not** constitutional, **not** a PAS/CAP/PER/TOM revision. This is the machine-readable contract layer beneath them: where AF/PXF/ECS/XLS decide principles and PAS/CAP/PER/TOM decide product structure, the CMM formalizes the entities, identifiers, relationships, and lifecycles those documents already imply, into a form a runtime, an AI agent, or a code generator can consume without re-deriving it from prose.
**Authored as:** Builder Platform OS Enterprise Architecture Board (Distinguished Enterprise Architect / Principal Product Architect / Principal Solution Architect / Principal Software Architect / Principal Knowledge Architect / Principal Documentation Architect).
**Traceability rule:** every element below cites the constitutional or product document it derives from. Where none exists, the element is marked **[GAP]** rather than filled in.
**Explicitly not in scope:** programming-language types, database schemas, REST/GraphQL/MCP wire formats, or any technology-specific implementation. This document must remain readable by, and equally authoritative for, a TypeScript service, a Java service, a Python agent, a graph database, and a Platform Pack author, none of which is privileged over another.

---

## Part 1 — Machine Model Principles

| Principle | Definition | Why it exists | Source |
|---|---|---|---|
| **Single source of truth** | Every entity has exactly one owning document/context; the CMM formalizes, never duplicates | The whole constitutional set is built on this rule (governance patch v1.0.1's entire purpose); violating it here would contradict the very documents this model derives from | AF Governance; PXF §23; ECS §13; XLS §38 |
| **Stable identifiers** | An entity's identifier, once assigned, is never reused or reassigned to a different entity | `AgentDefinition.id` is explicitly documented as "stable, never reused even if the agent is retired" — the one real, already-implemented example of this rule | `.ai/templates/agent.template.md`; ECS §2 (node identity persists across retirement) |
| **Technology independence** | No entity definition depends on a specific database, language runtime, or transport | Direct restatement of AF's own non-negotiable principles — Hexagonal Architecture (#4) and No Vendor Lock-in (#17) | AF #4, #17 |
| **Extensibility** | New concrete types (a `nodeType`, a `relationshipType`, a `Capability`, a `Persona` row) are added by registration, not by redesigning the model | This is the load-bearing claim of ECS §12, doc16 §3, and doc18 — proven twice already (Capability/CapabilityProvider absorbed into the node/relationship registry with zero mechanism change) | ECS §12; [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md); [18-capability-model.md](../architecture/18-capability-model.md) |
| **Backward compatibility** | A breaking change to a versioned type ships as a new version consumed alongside the old one, never an in-place mutation | Stated explicitly for event envelopes (`<context>.<aggregate>.<event>.v<N>`) and generalized here to every versioned entity | [06-event-model.md](../architecture/06-event-model.md) |
| **Explicit relationships** | Every relationship between entities is a typed, directional, registry-declared fact — never an implicit foreign key or a same-named field coincidence | Doc16's whole relationship model exists specifically to prevent "dozens of near-duplicate ad hoc strings" | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| **Versionability** | Nothing that matters for reproducibility is ever silently re-resolved to "whatever is current" | Domain model aggregate design rule 6, extended by ADR-0022 to `CapabilityProvider` resolution | [02-domain-model.md](../architecture/02-domain-model.md) (rule 6) |
| **Traceability** | Every entity can answer "why does this exist" by walking its relationships backward | Doc16 §5's forward/backward traceability strategy, already the basis of every PAS/CAP/PER/TOM citation | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| **Deterministic interpretation** | Given the same entity and the same version, every consumer (TypeScript, Java, Python, an AI agent) must derive the same meaning | The direct consequence of registry-declared, versioned, non-reinterpreted types — without this, "technology independence" would be meaningless | AF #4, #17; [02-domain-model.md](../architecture/02-domain-model.md) (rule 6) |

---

## Part 2 — Canonical Entity Inventory

Entities are grouped by kind, a distinction this document draws from ECS's own "small, stable, closed kernel" discipline (ECS §4, §6) — some entities are **Aggregates** (rich lifecycle, versioned, own identity and history); others are **Reference/Enumeration entities** (a small, closed, stable set — Persona, View, Lifecycle Workspace — that classify or configure aggregates rather than accumulating history of their own).

### Requirements & Intent (Aggregates)

| Entity | Purpose | Owner document | Primary relationships | Lifecycle | Versioning |
|---|---|---|---|---|---|
| `RequirementDocument` | Holds the originating idea and its structuring process | PAS §2.1, §3 | contains `Requirement`, `Clarification` | Draft → Clarifying → Confirmed | Append-only |
| `Requirement` | The unit of "what must be true"; `kind` distinguishes Business/Functional/Non-Functional/User Story — **not four separate entities** | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | `implements` (from downstream Artifact), `validated-by`, `derived-from` | Proposed → Confirmed → Superseded | Append-only, `supersedes` relationship for revision |
| `AcceptanceCriterion` | Attached, checkable condition | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | Attached to `Requirement` | Inherits parent | Inherits parent |
| `Clarification` | Bounded question/answer pair | PAS §2.1, §3 | Attached to `RequirementDocument` | Asked → Answered | Append-only |

### Project & Delivery (Aggregates)

| Entity | Purpose | Owner document | Primary relationships | Lifecycle | Versioning |
|---|---|---|---|---|---|
| `Project` | One idea's journey from capture to delivery; owns exactly one Digital Twin graph | PXF §6; ECS §3 | Contained by `Workspace`; owns the `DigitalTwinNode`/`DigitalTwinEdge` graph | Ongoing (no terminal state named) | N/A — a Project doesn't version itself, its graph does |
| `Workspace` | Durable, named, Tenant-scoped container for one or more Projects | PXF §7; ECS §3 | Contains `Project` | Ongoing | N/A |
| `Artifact` / `ArtifactVersion` | A produced deliverable; `Artifact` is the enduring identity, `ArtifactVersion` the immutable per-version identity | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | `implements`, `depends-on`, `validated-by`, `documents` | Generated → Reviewed → Promoted → Superseded | `ArtifactVersion` is append-only; `Artifact` is the stable parent |
| `Deployment` / `ApplicationVersion` | One deployment of one immutable release bundle | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | `contains` (Artifacts), `affects` | Pending → Deployed → Retired | `ApplicationVersion` immutable once assembled |

### Capability & Execution (Aggregates)

| Entity | Purpose | Owner document | Primary relationships | Lifecycle | Versioning |
|---|---|---|---|---|---|
| `Capability` | A business-level request for AI/human/plugin fulfillment — `{id, name, description, inputs, outputs, preconditions, requiredPermissions, approvalRequirements, requiredContext, expectedArtifacts, qualityGates}` | [18-capability-model.md](../architecture/18-capability-model.md) (ADR-0022) | `fulfilled-by` `CapabilityProvider`; `requires-capability` (from `WorkflowRun`/`Step`) | Defined → Resolved (via provider) → (optionally) Deprecated | Versioned definition; real implemented example (`structure-business-requirement`) uses a stable kebab-case identifier, not a UUID |
| `CapabilityProvider` | A concrete fulfiller — `{id, capabilityId, providerType: agent \| plugin \| human \| external-service, providerId, providerVersion, priority}` | [18-capability-model.md](../architecture/18-capability-model.md) | `fulfilled-by` → `fulfills` (inverse) | Registered → priority-ordered fallback active | `providerVersion` is a first-class field |
| `WorkflowDefinition` | A versioned, reusable definition of a sequence of `Step`s | [07-workflow-engine.md](../architecture/07-workflow-engine.md) | Composed of `Step`s | Defined → Versioned revisions | Versioned; a `WorkflowRun` pins the exact version used |
| `WorkflowRun` | One execution of a `WorkflowDefinition`; pins every version it depends on at start, never re-resolved | [02-domain-model.md](../architecture/02-domain-model.md) (rule 6); [07-workflow-engine.md](../architecture/07-workflow-engine.md) | Produces edges to its outputs; `requires-capability` per `Step` | Running → AwaitingApproval (`ReviewGate`) → Completed / Failed / Cancelled | Immutable once started — pinned `WorkflowDefinition`/`PromptTemplate`/`AgentDefinition`/`ModelProfile`/`CapabilityProvider` versions |
| `Step` | One unit of work within a `WorkflowRun` — `{kind: agent-invocation \| plugin-generation \| human-approval, capabilityRef, input}` | [18-capability-model.md](../architecture/18-capability-model.md) | `requires-capability` → `Capability` | Bound to its parent `WorkflowRun`'s lifecycle | No independent versioning — inherits its `WorkflowRun`'s pin |

### Digital Twin / Graph (Aggregates)

| Entity | Purpose | Owner document | Primary relationships | Lifecycle | Versioning |
|---|---|---|---|---|---|
| `DigitalTwinNode` (= "Object" / "Graph Node") | The graph-native representation of a real aggregate — `{id, projectId, nodeType, sourceRef: {context, aggregateId, version}, label, status, versionHistory}` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | Typed by `NodeTypeDefinition`; connected via `DigitalTwinEdge` | Active → Retired (never hard-deleted) | Append-only `versionHistory` |
| `DigitalTwinEdge` (= "Relationship" / "Graph Edge") | A typed, directional, provenance-carrying fact connecting two nodes — `{id, projectId, fromNodeId, toNodeId, relationshipType, provenance: declared \| ai-inferred, confidence?, status, createdBy}` | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | Typed by `RelationshipTypeDefinition` | Active → Retired (never hard-deleted) | Never edited in place — a changed fact is a new edge, the old one retired |
| `NodeTypeDefinition` | Registry entry declaring a valid `nodeType` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) | Referenced by every `DigitalTwinNode.nodeType` | Registered → (rarely) deprecated | Registry entries are versioned like any other registry |
| `RelationshipTypeDefinition` | Registry entry declaring a valid `relationshipType`, its inverse, category, and cardinality | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) | Referenced by every `DigitalTwinEdge.relationshipType` | Registered → (rarely) deprecated | Same as above |
| `DigitalTwinSnapshot` | An immutable capture of the graph's full state at a milestone | [16-project-digital-twin.md §4](../architecture/16-project-digital-twin.md) | Captures every current node version + edge status at a moment | Captured at milestone, never modified | Immutable by definition |

### Governance & Audit (Aggregates)

| Entity | Purpose | Owner document | Primary relationships | Lifecycle | Versioning |
|---|---|---|---|---|---|
| `Risk` / `Incident` / `Problem` | ITIL record-keeping | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | `threatens`, `affects` | Per ITIL lifecycle (opened → managed → resolved) | Append-only |
| `Change` | An ITIL change record; a Decision-category node (ECS §4 explicitly lists "Change" as a Decision example) | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); ECS §4 | `affects`, `mitigates`; gated by `ApprovalGate` | Proposed → Approved (`ReviewGate`) → Applied | Append-only |
| `ApprovalGate` | A named approval requirement, checked at a `ReviewGate` workflow step | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); [07-workflow-engine.md](../architecture/07-workflow-engine.md) | Checked by `WorkflowRun`'s `ReviewGate` step | Defined, invoked repeatedly | Versioned like a `PolicyRule` |
| `PolicyRule` (≈ user's "Rule" / "Validation Rule") | A policy-as-code rule (e.g., traceability-completeness) | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §5; [ADR-0011](../adr/0011-hybrid-rbac-abac-policy-as-code.md) | Referenced by `Capability.qualityGates: PolicyRuleId[]` | Defined → Enforced | Versioned |
| `ComplianceRecord` / `AuditEvent` | Audit-visibility mechanism | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) | Produced by governed transitions | Append-only | Append-only |

### AI & Extensibility (Aggregates)

| Entity | Purpose | Owner document | Primary relationships | Lifecycle | Versioning |
|---|---|---|---|---|---|
| `AgentDefinition` (= "AI Agent") | A named, versioned AI agent definition — real, working example: `id`, `version`, `status`, `owner`, `supersedes` frontmatter fields | `.ai/agents/*/agent.md`; [15-ai-workspace.md](../architecture/15-ai-workspace.md) (ADR-0020) | `fulfills` a `Capability` via `CapabilityProvider` (`providerType: agent`) | draft → active → deprecated (real, implemented enum) | `version` field, bump-on-change, `supersedes` points to prior version |
| Platform Pack | A bundle of pack-contributed facets (Templates, Generators, Validators, Deployment Providers, Documentation Standards, Discovery/Security/Testing Extensions) | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) (ADR-0023) | Contributes `CapabilityProvider`s (`providerType: plugin`), `NodeTypeDefinition`s | Registered → active | Versioned per pack |
| Generator | Not a separate entity — a Platform Pack facet, realized as a `CapabilityProvider` with `providerType: plugin` | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md); [18-capability-model.md](../architecture/18-capability-model.md) | Same as `CapabilityProvider` | Same as `CapabilityProvider` | Same as `CapabilityProvider` |
| Deployment Provider (the user's "Delivery Provider") | A Platform Pack facet responsible for publishing an `ApplicationVersion` to an environment | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) | Publishes `Deployment`/`ApplicationVersion` | Registered → active | Versioned per pack |

### Reference/Enumeration entities (closed, stable sets — not aggregates)

| Entity | Purpose | Owner document | Why it's reference data, not an aggregate |
|---|---|---|---|
| `Persona` | A role interacting with the platform (Business Sponsor, Delivery Lead, …) | PXF §4; PER catalog | A small, closed, deliberately-stable table (PXF §23: adding a row is a PXF revision, not a routine registration) — it classifies who acts, it does not itself accumulate history |
| `View` | One of exactly four projections of a Project's graph (Guided, Canvas, Documents, Executive) | ECS §6 | ECS §6's own kernel discipline: this set is fixed and "must not grow every time a plugin registers a new node type" |
| `Lifecycle Workspace` | A named phase-scoped configuration of the Engineering Canvas (Discovery, Architecture & Design, …) | PAS §1, §2 | Explicitly a PAS-level classification concept, not a stored object with its own identity separate from the `Project` graph it configures a view of |
| `Decision` (as a category) | The ECS §4 node category that `Change`, `Change` and Architecture Decision fall under | ECS §4 | A category label applied to specific node types, not itself a distinct aggregate |

---

## Part 3 — Relationship Model

Every relationship below is already named in doc16 §3's registry-declared catalog, doc18's ADR-0022 extension, or explicitly derived from PAS/ECS. None is invented.

| Relationship | From | To | Cardinality | Inverse | Source |
|---|---|---|---|---|---|
| `contains` | `Workspace` | `Project` | 1:N | `contained-by` | PXF §7; ECS §3 |
| `contains` | `ApplicationVersion` | `Artifact` | 1:N | `contained-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `implements` | `Artifact` (e.g. CAP Service) | `Requirement` | N:N | `implemented-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `displayed-by` | `Requirement` | UI Screen `Artifact` | N:N | `displays` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `validated-by` | `Requirement` | Test `Artifact` | N:N | `validates` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `documents` | User Manual `Artifact` | UI Screen `Artifact` | N:N | `documented-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `derived-from` | User Story / Architecture Decision | Business `Requirement` | N:1 | `derives` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `depends-on` | UI Screen `Artifact` | OData Service `Artifact` | N:N | `depended-on-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `affects` | `Incident` / `Change` | `Deployment` | N:N | `affected-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `threatens` | `Risk` | `Requirement` / `Deployment` | N:N | `threatened-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `mitigates` | `Change` | `Risk` | N:1 | `mitigated-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `supersedes` | `ArtifactVersion` N | `ArtifactVersion` N-1 | 1:1 | `superseded-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| `fulfilled-by` | `Capability` / `WorkflowRun`/`Step` output | `CapabilityProvider` | N:1 | `fulfills` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) (ADR-0022 extension) |
| `requires-capability` | `WorkflowRun` / `Step` | `Capability` | N:1 | `required-by` | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) (ADR-0022 extension) |
| projects (not a registry-declared edge — a structural relationship) | `Canvas Session` | `View` (one of four, at a time) | 1:1 at any instant | — | ECS §3, §6 — a Canvas Session shows exactly one View onto a Project's graph, never "Workspace displays Views" as the container-level `Workspace` object never itself renders anything |
| emits | `WorkflowRun` | `Event` | 1:N | consumed-by | [06-event-model.md](../architecture/06-event-model.md) |
| changes | `ReviewGate` step | `WorkflowRun.state` | 1:1 per transition | — | [07-workflow-engine.md](../architecture/07-workflow-engine.md) |
| contributes | Platform Pack | `CapabilityProvider`, `NodeTypeDefinition` | 1:N | contributed-by | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| publishes | Deployment Provider (Platform Pack facet) | `ApplicationVersion` | 1:N | published-by | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| performs | `AgentDefinition` (via `CapabilityProvider`) | `Step` | 1:N | performed-by | [15-ai-workspace.md](../architecture/15-ai-workspace.md); [18-capability-model.md](../architecture/18-capability-model.md) |

**Correction to the brief's own example:** "Workspace displays Views" is not quite what the Constitution says. A `Workspace` (PXF §7/ECS §3) is a Tenant-scoped container of `Project`s — it has no rendering behavior of its own. What actually displays a `View` is a **Canvas Session** (ECS §3), scoped to one `Project` at a time. This is stated precisely here to avoid reintroducing the "Workspace" terminology collision the Constitutional Review already found and fixed once.

---

## Part 4 — Identity Model

| Identity concern | Rule | Evidence |
|---|---|---|
| **Global identifier** | Every aggregate instance (`Requirement`, `Project`, `Artifact`, `DigitalTwinNode`, `Event`) carries an opaque surrogate `id`. Cross-context references are always by this ID, never by embedding another aggregate's object graph | [02-domain-model.md §"Aggregate design rules"](../architecture/02-domain-model.md), rule 2 |
| **UUID vs. semantic slug** | **Two different conventions coexist by design, not by accident.** Aggregate *instance* identifiers (a specific `Requirement`, a specific `Event`) follow a UUID convention — the event envelope's `id` field is explicitly "producers are expected to use UUIDs in practice." Registry-declared *type* identifiers (a `Capability.id`, a `nodeType`, an `artifactType`, an `AgentDefinition.id`) follow a stable, human-readable kebab-case slug convention — proven by the one real, shipped example: the Sprint 1 capability is literally named `structure-business-requirement`, and `AgentDefinition.id` is documented as "stable, never reused" kebab-case | [06-event-model.md](../architecture/06-event-model.md); real code (Sprint 1); `.ai/templates/agent.template.md` |
| **Immutable identifier** | `Artifact` (enduring identity) vs. `ArtifactVersion` (immutable per-version identity) is the model's one explicit split between a thing's continuity and one frozen state of it | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| **Display name** | `DigitalTwinNode.label` is the explicit, separate display-facing field — the graph's `id`/`nodeType` are never shown to a user directly, consistent with PXF §6's rule that users never see internal service/context names | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); PXF §6 |
| **Version identifier** | Two different shapes, both real: an incrementing integer (`AgentDefinition.version: 1, 2, …`) for config-like entities, and a suffix embedded in the type identifier itself (`requirements.document.captured.v1`) for events — the machine model must support both, not force one convention onto the other | `.ai/templates/agent.template.md`; [06-event-model.md](../architecture/06-event-model.md) |
| **Natural key vs. surrogate key** | Surrogate keys are the rule everywhere aggregates cross a context boundary (rule 2, above). The one natural-key-like exception is a registry-declared type string (`nodeType`, `capabilityId`) — these are deliberately human-readable because they are *directly referenced in code and config*, not because they're a natural key in the relational sense | [02-domain-model.md](../architecture/02-domain-model.md); [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| **Dual identity for graph overlays** | A `DigitalTwinNode` has its *own* `id` (for graph traversal) **and** a `sourceRef: {context, aggregateId, version}` pointing back to the real aggregate it overlays — this is not the same ID reused twice, it is two coordinated identifiers with an explicit pointer, because "the graph is a overlay, not a second source of truth" | [16-project-digital-twin.md](../architecture/16-project-digital-twin.md) (opening statement); §1 |

**Conclusion: UUIDs for instances, semantic slugs for registered types, dual identity for graph overlays.** This is not a new convention introduced here — it is the pattern already present, independently, in three different real artifacts (the event model, the one shipped Capability, and the one shipped `AgentDefinition`), formalized here as one consistent rule for the first time.

---

## Part 5 — Versioning Strategy

| Entity class | Requires | Reasoning |
|---|---|---|
| `Requirement`, `AcceptanceCriterion`, `Clarification` | Immutable versions, historical lineage, superseded states | Append-only per domain model rule; a corrected requirement is a new version, `supersedes` the old |
| `Artifact` / `ArtifactVersion` | Immutable versions (per `ArtifactVersion`), historical lineage | Explicit split already exists in the architecture for exactly this reason |
| `DigitalTwinNode` / `DigitalTwinEdge` | Historical lineage (`versionHistory`), superseded/retired states, snapshots | Doc16 §4's versioning strategy verbatim |
| `WorkflowRun` | Immutable versions — the entire run is pinned at start and never mutated | Rule 6; a `WorkflowRun` is the strongest immutability case in the whole model |
| `Capability`, `CapabilityProvider`, `AgentDefinition`, `NodeTypeDefinition`, `RelationshipTypeDefinition` | Mutable metadata (status can change: draft → active → deprecated) **plus** versioned definitions (a new version is a new artifact, not an edit) | Matches `AgentDefinition`'s real, shipped frontmatter exactly |
| `Persona`, `View`, `Lifecycle Workspace` | **No independent versioning** — these are reference data whose "version" is the constitutional document's own version (PXF/ECS/PAS) | They are not aggregates; giving them independent version numbers would create a second versioning axis for something that already has one, upstream |
| `DigitalTwinSnapshot` | Snapshots, by definition | This *is* the model's snapshot mechanism — nothing else needs its own |
| Branching | **[GAP]** — no entity in the Constitution or PAS/CAP/PER/TOM has a defined branching model (e.g., two parallel in-progress revisions of the same `Requirement`). Superseding is linear (`supersedes` points to exactly one prior version), not branching | — |

---

## Part 6 — Lifecycle Model

| Entity | Creation | Modification | Approval | Publication | Deprecation | Archival | Deletion |
|---|---|---|---|---|---|---|---|
| `Requirement` | Discovery capability | New version, `supersedes` prior | Delivery Lead confirmation | Confirmed state | Superseded (new version exists) | Status → archived, never removed | **Never** — rule 5 |
| `Artifact`/`ArtifactVersion` | Generation capability | New `ArtifactVersion` | `qualityGates` pass | Promoted | Superseded | Status → archived | **Never** |
| `DigitalTwinNode`/`Edge` | Projected from a domain event | New version entry | N/A (a projection, not itself approved) | N/A | Retired | Retained forever at prior Timeline points | **Never** — rule 5, explicitly doc16's own rule |
| `WorkflowRun` | Started | **Never** — immutable once started | `ReviewGate` step(s) | Completed | N/A | Retained for audit | **Never** |
| `Capability`/`CapabilityProvider` | Registered | New version | Governance review (implied, not separately named) | Active status | Deprecated status | Retained | **[GAP]** — not explicitly addressed; likely never, by analogy to rule 5, but not stated |
| `AgentDefinition` | Authored, `status: draft` | `version` bump | Promotion to `status: active` | Active | `status: deprecated` | Retained (real field exists) | Not addressed in the template — presumed never, consistent with rule 5 |
| `Persona`/`View`/`Lifecycle Workspace` | A PXF/ECS/PAS revision | Same | Same (ADR-weight review) | Same | Same | N/A — these are reference rows in a governed document, not runtime records | N/A |

**Should deletion ever occur? No — with one nameable exception.** Domain model rule 5 states this explicitly for any aggregate that may be cross-referenced: hard deletes are prohibited because they produce silent dangling references. The only entities never cross-referenced (`Persona`, `View`, `Lifecycle Workspace` — reference rows inside a governed document, not runtime records with foreign keys pointing at them) are the sole plausible exception, and even there, removal is a document revision with its own recorded history (a PXF/ECS/PAS diff), not a silent deletion.

---

## Part 7 — Serialization Strategy

**No single format is recommended for everything — the architecture already implies different formats fit different roles, and one already exists in production.**

| Use case | Recommended format | Why | Evidence |
|---|---|---|---|
| Agent/config definitions (`AgentDefinition`, `WorkflowDefinition`, `Capability`) | **Markdown with YAML frontmatter** | Already real and shipped — `.ai/agents/requirements-analyst/agent.md` proves this format is simultaneously machine-parseable (frontmatter) and directly consumable by an LLM agent without translation (the prose body) | `.ai/agents/*/agent.md`, `.ai/templates/*.template.md` |
| Registries (`NodeTypeDefinition`, `RelationshipTypeDefinition`, `CapabilityProvider` records) | **JSON**, as rows in Postgres/Apache AGE, exposed over MCP tools | These are database records, not files — JSON is the natural wire format for `graph-query`/`digital-twin-search` MCP tool responses | [16-project-digital-twin.md §2](../architecture/16-project-digital-twin.md), §7 |
| API contracts (whichever protocol a given service exposes) | **JSON Schema** as the canonical schema definition; OpenAPI as a REST-specific *projection* of it, never the source | AF's API First principle (#14) is protocol-agnostic; JSON Schema is embeddable in OpenAPI, GraphQL SDL, and directly validated in TypeScript/Java/Python, so it — not any one protocol's own format — is the right canonical layer | AF #14 |
| AI context assembly | **Markdown** (narrative/prompt-facing) with **JSON** for structured tool-call payloads | Matches `.ai/knowledge/`'s existing format and MCP's JSON-RPC-based tool-call convention | `.ai/knowledge/README.md`; [15-ai-workspace.md](../architecture/15-ai-workspace.md) |
| Platform Pack manifests | **YAML or JSON**, validated against a JSON Schema | Consistent with the monorepo's existing `package.json`/`pnpm-workspace.yaml`-centric tooling; no format-specific reason to deviate | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| Graph query surface, if a GraphQL binding is ever added | GraphQL SDL — **a possible future protocol binding, not the canonical model** | Consistent with treating protocols as swappable adapters (AF #4) | — |
| Documentation-corpus-as-graph (if ever pursued, per the prior Repository Review's Optional recommendation) | RDF/JSON-LD — **explicitly not recommended for the Digital Twin itself** | Doc16 already rejected RDF/OWL/SPARQL for the *project* knowledge graph on cost/complexity grounds ("without the ontology-reasoning overhead RDF/SPARQL is built for") — recommending RDF here would contradict an already-made architectural decision | [16-project-digital-twin.md §2](../architecture/16-project-digital-twin.md) |
| Wire efficiency (Protocol Buffers) | **Not recommended** | Binary opacity cuts against PXF §18's audit-visibility principle and the AI transparency principle (PXF §21) — every other format on this list is human-readable; introducing one that isn't should require a much stronger performance justification than exists today | PXF §18, §21 |

**The one unifying rule: JSON Schema is the canonical schema-definition language across every row above** — every other format (YAML, Markdown-with-frontmatter, JSON, OpenAPI, GraphQL SDL) is a serialization *of* a JSON-Schema-describable model, not a competing schema language. This is the one recommendation in this section not already directly evidenced by a shipped artifact — flagged as a judgment call, not a **[GAP]**, since it follows directly from the "technology independence" and "deterministic interpretation" principles in Part 1.

---

## Part 8 — Validation Rules

| Category | Rule | Source |
|---|---|---|
| Identity validation | Every cross-context reference must resolve to a live or archived aggregate — never a dangling reference | [02-domain-model.md](../architecture/02-domain-model.md), rule 5 |
| Relationship validation | Every `relationshipType` used must have a registered `RelationshipTypeDefinition`, with its inverse declared | [16-project-digital-twin.md §3](../architecture/16-project-digital-twin.md) |
| Schema validation | Every `nodeType`/`artifactType`/`Capability.id` must resolve to a registered definition before acceptance | [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md), §3 |
| Lifecycle validation | A traceability-completeness policy-as-code check (e.g., "every `Requirement` has ≥1 downstream edge") must pass before a `ReviewGate` allows promotion | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| Governance validation | An `ApprovalGate` must be satisfied before a `Change`/`Deployment` promotes | [07-workflow-engine.md](../architecture/07-workflow-engine.md); [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md) |
| Capability validation | `Capability.preconditions` and `qualityGates: PolicyRuleId[]` must all pass before a `Capability`'s output is treated as complete | [18-capability-model.md](../architecture/18-capability-model.md) |
| Traceability validation | Backward-walk from any node must terminate at a real `Requirement`/decision, never an orphan | [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md) |
| Version validation | A `WorkflowRun`'s pinned versions must have existed and been resolvable at the moment it started — never validated against "whatever is current" | [02-domain-model.md](../architecture/02-domain-model.md), rule 6 |

**Note on a separate, already-existing validation layer:** dependency-cruiser, ESLint, and the repository's fitness functions validate *code structure* (are the architectural boundary rules respected in the TypeScript source) — this is a real, working, but **different** validation layer than the eight rows above, which validate the *machine model's data*, not the code that implements it. The two should not be conflated: a PR can pass every fitness function and still violate a traceability-validation rule at runtime, and vice versa.

---

## Part 9 — AI Consumption Model

**The correct retrieval strategy is already implied by the architecture — bounded relationship neighborhoods, never entire registries.**

- Doc16 §6's Impact Analysis is the canonical retrieval pattern: "bounded-depth graph traversal, both directions, from a candidate change" via `GraphStorePort.traverse(fromNodeId, relationshipTypes[], maxDepth)` — an AI agent retrieves a **neighborhood scoped to its actual task**, never a full registry dump. This is not a new recommendation; it is the existing pattern, generalized here as the model's one retrieval rule.
- This is also the direct consequence of PXF §9.2 ("AI presence is proportional to AI's actual contribution") applied to retrieval rather than UI: retrieving an entire registry when a bounded neighborhood would answer the question is the retrieval-layer equivalent of the "persistent chat bubble" anti-pattern PXF rejects everywhere else.
- **Lifecycle slices**: an agent operating within a `WorkflowRun` already has its exact `Capability`/`CapabilityProvider`/`AgentDefinition`/`ModelProfile` versions pinned at start (rule 6) — it does not need to retrieve "the capability graph" broadly; its own pinned resolution *is* its lifecycle slice, already resolved for it.
- **Capability graphs / workflow graphs**: retrieved the same way — bounded traversal from the specific `Capability` or `WorkflowRun` in question, via the same `graph-query`/`digital-twin-search` MCP tools `.ai/knowledge`'s retrieval-augmented context-loading strategy already uses.
- **Entire registries**: **never** the right retrieval unit for an AI agent, at any scale named in the prior Repository Review (1,000+ capabilities makes a full-registry retrieval both wasteful and a direct violation of the proportionality principle above).

---

## Part 10 — Implementation Mapping

Every row below consumes the same Part 2 entities and Part 3 relationships — no implementation introduces its own parallel model.

| Implementation surface | Consumes | Maps to |
|---|---|---|
| Graph Engine | `DigitalTwinNode`, `DigitalTwinEdge`, `NodeTypeDefinition`, `RelationshipTypeDefinition` | `GraphStorePort` ([16-project-digital-twin.md §2](../architecture/16-project-digital-twin.md)) |
| Registry Engine | `Capability`, `CapabilityProvider`, `NodeTypeDefinition`, `RelationshipTypeDefinition` | `CapabilityResolverPort` ([18-capability-model.md](../architecture/18-capability-model.md)) |
| Workflow Runtime | `WorkflowDefinition`, `WorkflowRun`, `Step` | `WorkflowEnginePort` ([07-workflow-engine.md](../architecture/07-workflow-engine.md)) |
| Delivery Runtime | `Deployment`, `ApplicationVersion`, Deployment Provider | Execution profiles ([ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md)) |
| Engineering Canvas | `DigitalTwinNode`/`Edge` (via the same Graph Engine), `View`, Canvas Session | ECS in full |
| Search | `Requirement`, `Incident` (priority-tier semantic search), any node (structured search) | `search-index.port.ts` ([16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md)) |
| Knowledge Graph | Same as Graph Engine — there is exactly one graph mechanism, not a separate "knowledge graph" system | [16-project-digital-twin.md](../architecture/16-project-digital-twin.md) |
| AI Agents | `AgentDefinition`, `Capability` (via `CapabilityProvider`), bounded graph neighborhoods (Part 9) | [15-ai-workspace.md](../architecture/15-ai-workspace.md) |
| Platform Packs | Contribute `CapabilityProvider`s, `NodeTypeDefinition`s, Deployment Providers | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md) |
| Code Generators | A `CapabilityProvider` with `providerType: plugin`, consuming `Artifact`/`ArtifactVersion` as input and output | [18-capability-model.md](../architecture/18-capability-model.md); CAP-007–010 |
| Validation Engine | `PolicyRule`, `ApprovalGate`, `Capability.qualityGates` | Part 8, above — data-level validation, distinct from code-level fitness functions |

---

## Part 11 — Constitutional Validation

**No architectural concept was invented in this document.** Every entity in Part 2, every relationship in Part 3, and every rule in Parts 4–8 cites a specific section of AF, PXF, ECS, XLS, PAS, CAP, PER, TOM, an ADR, or a named architecture document — verified against each as this document was written, not asserted afterward.

**True [GAP]s found, carried forward honestly rather than filled in:**

1. **Branching** (Part 5) — no entity in the Constitution supports two parallel in-progress revisions of the same aggregate; only linear supersession is defined.
2. **`Capability`/`CapabilityProvider` deletion/archival** (Part 6) — not explicitly addressed anywhere; presumed to follow domain model rule 5 by analogy, but no document states this for these two entities specifically.
3. **JSON Schema as the unifying canonical schema language** (Part 7) — the one recommendation in this document that is a judgment call rather than a direct citation, though it follows from Part 1's principles rather than contradicting anything.

No other element required inventing a principle to fill a hole — every other apparent gap (e.g., "Delivery Provider," "Generator," "Rule" as the user's own example terms) resolved to an existing, precisely-named entity once traced back to its source.

---

## Part 12 — Readiness Assessment

| Dimension | Score | Basis |
|---|---|---|
| Consistency | 92/100 | Every entity has exactly one owning document; the one prior duplicate-ownership finding (engineering principles) is outside this model's scope and already tracked from the last review |
| Extensibility | 95/100 | Proven twice already (Capability/CapabilityProvider absorbed with zero mechanism change) — the strongest dimension in this assessment |
| Technology Independence | 88/100 | No entity definition names a language, database, or protocol; the one soft spot is Part 7's JSON-Schema recommendation being a judgment call rather than a direct citation |
| AI Readiness | 85/100 | The retrieval model (bounded neighborhoods) is already architected; the one gap is that no agent yet consumes this document itself as context (same finding as the prior Repository Review's Part 6) |
| Implementation Readiness | 80/100 | Every implementation surface in Part 10 has a named port/mechanism to build against; three named `[GAP]`s remain genuinely open |
| Governance | 90/100 | Traceability is exhaustive and directly checkable against Parts 2–3's citations |
| Longevity | 87/100 | The identity/versioning conventions formalized here already exist in two independently-shipped real artifacts (the event model, `AgentDefinition`), not invented for this document — the strongest evidence this model will hold |
| **Overall Readiness** | **88/100** | A model that formalizes rather than invents, with three narrow, explicitly-named gaps and no contradiction of any existing document |

### Remaining recommendations

| # | Recommendation | Classification |
|---|---|---|
| 1 | Decide and record a deletion/archival policy for `Capability`/`CapabilityProvider` explicitly, rather than relying on analogy to rule 5 | **Recommended** |
| 2 | Decide whether branching is ever needed for `Requirement` revision (e.g., two competing proposed changes under review simultaneously) before the Documentation Factory (Sprint 2) makes this a live question | **Recommended** |
| 3 | Adopt JSON Schema as the explicit, named canonical schema language in a future ADR, closing Part 7's one judgment call | **Optional** |
| 4 | When the Digital Twin's graph-store adapter is actually built, verify this document's Part 2/3 entity and relationship definitions against the real schema before implementation diverges from it | **Critical**, but correctly time-boxed to that build, not now |

No architecture was redesigned and no new specification was created beyond formalizing what Parts 1–10 above trace to existing documents, per this task's own constraint.
