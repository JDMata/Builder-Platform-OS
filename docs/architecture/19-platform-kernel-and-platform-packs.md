# 19 — Platform Kernel and Platform Pack Architecture

A strategic alignment review, performed ahead of the Sprint 1 Product Design Review, not a Sprint 0 redesign and not a Sprint 1 scope change. Companion to [ADR-0023](../adr/0023-platform-kernel-and-platform-pack-architecture.md). **No code changes accompany this document.** Sprint 1 remains exclusively SAP-focused; see [docs/backlog/sprint-1-backlog.md](../backlog/sprint-1-backlog.md), unmodified by this review.

## Why this review, and why now

Sprint 0 built a kernel that is, by explicit design, SAP-agnostic — [02-domain-model.md](02-domain-model.md) opens with "All bounded contexts below are SAP-agnostic by construction," and the `banned-sap-keywords.mjs` fitness function mechanically enforces it against core code every CI run. Before Sprint 1 commits real engineering effort to the first vertical slice, this review asks a narrower question than "is the kernel good architecture": **does the kernel's current shape actually generalize to a future enterprise platform beyond SAP, or does it only pass today because SAP is still the only platform anyone has tried to plug in?** The answer, below, is: mostly yes, with three concrete, small gaps — none of which require touching anything Sprint 0 froze.

## Kernel Review — platform independence audit

| Concept | Platform-independent today? | Finding |
|---|---|---|
| **Project** | Yes | `Project`'s designed shape (id, workspace reference, name, description, source requirement reference) carries nothing enterprise-platform-specific. |
| **Workspace** | Yes | A tenant's organizational grouping — no platform concept anywhere in it. |
| **Discovery Workshop** (Requirements Intake: `RequirementDocument`/`Requirement`/`Clarification`/`AcceptanceCriterion`) | Yes | Deliberately modeled as its own context precisely so intake could evolve independent of what gets built downstream — already the cleanest concept in the kernel. |
| **Capability Registry** (the `Capability`/`CapabilityProvider` *model*) | Yes, mechanism; **no, one instance** | The model is fully agnostic — `ArtifactType` is an opaque, plugin-declared string, `Capability` describes a business outcome. But the one real, registered capability, `generate-fiori-elements-app`, is named technology-first, not business-first. A naming-convention gap in registered data, not a schema gap. See Capability Review below. |
| **Workflow Engine** | Yes | Generic DAG/state machine; steps request capabilities, never name a provider, let alone a platform. |
| **Digital Twin** | Yes | `nodeType` is an opaque, registry-declared string ([16-project-digital-twin.md](16-project-digital-twin.md)) — nothing fixes it to a technology. Already matches the business-concept-oriented shape this review was asked to check for. See Digital Twin Review below. |
| **Documentation Factory** | Not yet built (Sprint 2) | Planned capability names in [PLATFORM_MATURITY.md](../../PLATFORM_MATURITY.md) — "FS/TS/Architecture Generation" — are already business-artifact-oriented, not technology-oriented. Nothing to correct; worth holding the line on when Sprint 2 actually registers these capabilities. |
| **Approval Workflow** | Yes | `WorkflowRunStatus`'s `awaiting_approval` state and the `human-approval` step kind are generic; nothing platform-specific. |
| **Project Charter** | Concept not yet named in the kernel | No aggregate called "Project Charter" exists. What the term describes — an approved, structured bundle of requirements and acceptance criteria that instantiates a `Project` — is already exactly what Sprint 1's `ApproveRequirementDocument` use case (SAF-50) does. No correction needed; "Project Charter" is a possible future renaming/framing of an already-agnostic flow, not a gap. |
| **Security** | Yes | OIDC federation to any compliant IdP — SAP IAS appears in [08-authentication-and-rbac.md](08-authentication-and-rbac.md) only as one illustrative example alongside Entra ID, Okta, and Keycloak, never as a hardcoded dependency. RBAC/ABAC via policy-as-code (OPA/Rego) is fully generic. |
| **Governance** | Yes | `AuditEvent`/`PolicyRule`/`ApprovalGate`/`ComplianceRecord`/`Risk`/`Incident`/`Problem`/`Change` — ITIL-generic, no platform concept anywhere. |
| **Observability** | Yes | OpenTelemetry-based, vendor- and platform-neutral by construction (ADR-0012). |
| **Event Model** | Yes | Versioned, past-tense, generic envelope; no event schema names a platform. |
| **Plugin Model** | Mechanism yes, **structure no** | `CapabilityPlugin`/`PluginManifest`/`ArtifactType`-as-opaque-string carry zero SAP-specific fields. But `plugins/` is a **flat namespace** — `plugins/fiori-generator` sits with no grouping construct above it. Nothing today expresses "these plugins together constitute the SAP Platform Pack," so nothing stops a future Salesforce plugin from being an ungrouped peer with no shared identity, ownership, or lifecycle. This is the core structural gap this review exists to close. |
| **AI Workspace** | Mechanism yes, **one hardcoded path** | The agent/prompt/policy/workflow model in `.ai/` is fully generic. But `.ai/knowledge/sap-domain/` bakes a platform name into what should be a pack-scoped knowledge namespace, and the (deliberately platform-agnostic) `requirements-analyst` agent's own Context Loading Strategy directly references `knowledge/sap-domain/*` — a generic agent role hardcoding one platform's knowledge path. |

**One additional finding, found by reading shared kernel-tier code directly, not just the docs:** `packages/plugin-sdk/src/execution-profile.ts` defines `PortCategory` as a fixed union type — `"persistence" | "authentication" | "authorization" | "messaging" | "storage" | "sap-connectivity" | "external-api"`. `plugin-sdk` is consumed by every plugin regardless of platform; a literal `"sap-connectivity"` member inside it is a concrete enterprise-platform name inside shared kernel code, not a plugin's own data — the clearest single instance of kernel-level platform coupling this review found.

## Smallest architectural corrections identified

None of the four corrections below are implemented by this review — each becomes a normal backlog item in whichever future sprint actually needs it, going through the standard Architecture Review Process ([PROJECT_PLAYBOOK.md](../../PROJECT_PLAYBOOK.md)) before implementation. None is added to Sprint 1.

1. **Rename `PortCategory`'s `"sap-connectivity"` member** to a platform-neutral label (e.g., `"target-system-connectivity"`). Zero behavior change — SAP BTP/S4/ECC connectivity becomes one concrete adapter binding the SAP Platform Pack supplies for that category, exactly as it does today, just not named in the shared enum.
2. **Introduce a `PlatformPack` aggregate** (below) so plugins are no longer an ungrouped flat list. The smallest structural addition that answers "which enterprise platform does this plugin belong to."
3. **Relocate `.ai/knowledge/sap-domain/`** to a pack-scoped path (e.g., `.ai/knowledge/platform-packs/sap/`), and generalize `requirements-analyst`'s Context Loading Strategy to "retrieve knowledge scoped to the Project's assigned Platform Pack" rather than a hardcoded folder name.
4. **Prefer business-oriented capability IDs going forward** (`generate-backend`, not `generate-cap`) when Sprint 2+ registers new capabilities. The existing Sprint 0 placeholder (`generate-fiori-elements-app`) is left exactly as is — it has no real generation logic behind it yet, and renaming a placeholder mid-review is not worth a code change outside this sprint's actual work.

## Platform Pack architecture (new concept — architecture only)

### Purpose
A `PlatformPack` is the single registered identity that encapsulates everything specific to one enterprise platform (SAP, and in the future Salesforce, Oracle, Microsoft, ServiceNow, or others). The kernel resolves capabilities to providers; every provider it resolves must belong to some registered `PlatformPack` — the kernel never talks to a bare, ungrouped plugin, and never contains platform-specific logic itself.

### Responsibilities
A `PlatformPack` registration owns:
- Which `CapabilityPlugin`s belong to it (a plugin declares exactly one owning pack).
- Which `CapabilityProvider` registrations it contributes to the Capability Registry.
- Its own knowledge namespace under `.ai/knowledge/platform-packs/<pack-id>/`.
- Its own deployment-target bindings for `ExecutionProfile`'s Hybrid/Enterprise tiers.
- Its own documentation-generation conventions for whichever capabilities it fulfills.

### Capabilities
A pack doesn't invent new capabilities — it *provides* `CapabilityProvider`s for capabilities already defined business-first in the Capability Registry (per the Capability Review below). The SAP Platform Pack provides an implementation of `generate-backend`; a future Salesforce Platform Pack could provide a different implementation of the *same* capability, with the workflow that requests it unchanged.

### Templates
Whatever a pack's plugins need to produce artifacts of its platform's shape — e.g., the SAP Platform Pack's Fiori Elements floorplan templates, CAP service scaffolds. Already exactly what `CapabilityPlugin` implementations hold today; a pack just groups them under one identity instead of leaving them ungrouped.

### Generators
The pack's `CapabilityPlugin`s themselves — no new concept, just now scoped under a `platformPackId`.

### Validators
Each plugin's existing `ValidationResult`-producing logic (`plugin-sdk`), scoped the same way generators are — a pack's validators check output specific to that pack's technologies (e.g., a Fiori annotation lint), never something the kernel itself understands.

### Deployment Providers
The concrete `AdapterBindingRef`s a pack supplies for `ExecutionProfile`'s Hybrid/Enterprise tiers — e.g., the SAP Platform Pack's BTP Cloud Foundry/Kyma deploy adapter, fulfilling the (renamed, platform-neutral) connectivity `PortCategory`. This is exactly what `ExecutionProfile`/`AdapterBindingRef` (ADR-0019) already models; a pack is simply the named source of those bindings instead of an unstated one.

### Documentation Standards
The pack's own conventions for whichever documentation-generation capabilities it fulfills — e.g., an SAP-flavored functional-spec template versus a future Salesforce-flavored one, both satisfying the same generic "Generate Functional Specification" capability request with different output conventions.

### Discovery Extensions
The pack's contribution to the Discovery flow: its knowledge-source namespace (`knowledge/platform-packs/<pack-id>/`) and any pack-specific clarification patterns the `requirements-analyst` agent's *retrieval* — never the agent's own logic — draws on. The agent stays platform-agnostic; only the knowledge it retrieves is pack-scoped.

### Security Extensions
The pack's concrete credential/connection resolution behind the already-generic, already-clean `TargetSystemConnection` aggregate (ADR-0015) — e.g., the SAP Platform Pack's BTP destination-service resolution logic. `TargetSystemConnection` itself needs no change; it already carries only an opaque `encryptedConnectionRef`, exactly the shape a pack-agnostic kernel needs.

### Testing Extensions
Pack-specific contract-test fixtures for whatever a pack's generated applications need verified beyond the kernel's own port contract tests — e.g., a Fiori Elements-specific accessibility check, never something `testing-kit`'s existing, generic contract-test harness needs to know about.

## Technology Packs — recommendation: no, don't add a third layer

The question was whether `PlatformPack` should itself contain a nested `TechnologyPack` layer (SAP Platform Pack → UI5, CAP, RAP, GUI, Integration Suite, BTP). **Recommendation: no.**

Each of UI5, CAP, RAP, and GUI modernization is already exactly one `CapabilityPlugin`, and each plugin's `ArtifactType` (an opaque string like `"fiori-elements-app"` or `"cap-service"`) already *is* that plugin's technology label — fully agnostic to the kernel, already sufficient to answer "what technology does this plugin target." A `PlatformPack` grouping a set of `CapabilityPlugin`s already produces exactly the tree in the prompt (SAP Platform Pack → [fiori-generator, cap-generator, rap-generator, gui-modernizer, integration-suite-generator]) with **two levels**, not three.

Adding a separate `TechnologyPack` aggregate between `PlatformPack` and `CapabilityPlugin` would relabel `CapabilityPlugin`/`PluginManifest` without adding expressiveness — the same "extract on second occurrence, not first" discipline this platform has applied consistently since Sprint 0. Worse, **BTP is not a peer of UI5/CAP/RAP** — it's a deployment target, already modeled by `ExecutionProfile`/`AdapterBindingRef`, not a generation technology. Folding BTP into a "Technology Pack" alongside UI5/CAP/RAP would conflate two already-distinct, already-modeled concerns (what a plugin generates vs. where a generated application deploys) under one new, unnecessary concept.

**Simpler alternative, recommended instead:** keep the existing two-level shape — `PlatformPack` groups `CapabilityPlugin`s (the generation-technology concern) and separately supplies `ExecutionProfile` bindings (the deployment-target concern) through its Deployment Providers facet. No new aggregate, no new nesting.

## Capability Registry — business-oriented naming

The `Capability`/`CapabilityProvider` model itself already supports this correctly — a `Capability` is defined as a provider-agnostic business contract, and a `CapabilityProvider` is one eligible fulfiller (ADR-0022). The gap is entirely in the *data*, not the *schema*: the one real registration, `generate-fiori-elements-app`, names a capability after its output's technology rather than the business outcome it serves.

**Recommendation, applied prospectively, not retroactively:** name capabilities after the business outcome (`generate-backend`, `generate-frontend`, `generate-integration`), with a specific `CapabilityProvider` (owned by a specific `PlatformPack`) supplying the concrete technology. `generate-backend` implemented by the SAP Platform Pack today means "CAP" or "RAP" under the hood; the same capability implemented by a future Salesforce Platform Pack could mean "Apex," with zero change to any workflow that requests `generate-backend`. This recommendation does not touch Sprint 1 — Sprint 1's own capability, `structure-business-requirement` (SAF-44/45), is already named business-first, exactly matching this pattern.

## Digital Twin — already business-concept-oriented

`DigitalTwinNode.nodeType` is an opaque, `NodeTypeDefinition`-registry-declared string (see [16-project-digital-twin.md](16-project-digital-twin.md), line "`nodeType: string`, // opaque, registry-declared") — nothing in the Digital Twin's design fixes node types to a technology. The graph is already capable of representing exactly the chain this review asked about — `Requirement → Business Service → Presentation Component → Deployment Unit` — with zero kernel change, the same way it already absorbed `Capability`/`CapabilityProvider` as new node types with zero mechanism change when ADR-0022 was decided. **No correction needed here.** The one discipline to hold going forward: when Sprint 2+ actually registers new node types for generated artifacts, register them as business/architectural concepts (`Business Service`, `Presentation Component`, `Deployment Unit`) rather than technology names (`CAP`, `UI5`) — a data-registration discipline, not a schema change.

## Mapping: existing Plugin Model concepts → Platform Pack facets

| Existing concept | Platform Pack facet | Change required |
|---|---|---|
| `CapabilityPlugin` | Templates / Generators | Gains a `platformPackId` field |
| `PluginManifest` | (unchanged) | None |
| `ArtifactType` (opaque string) | (unchanged) | None |
| `ExecutionProfile` / `AdapterBindingRef` | Deployment Providers | None to the model; `PortCategory`'s one literal renamed (see corrections above) |
| `CapabilityProvider` | (scoped by) | Gains an (implicit, via its plugin/agent) association to a `PlatformPack` |
| `.ai/knowledge/*` | Discovery Extensions | Folder renamed to a pack-scoped path (see corrections above) |
| `TargetSystemConnection` | Security Extensions | None — already opaque enough |
| `testing-kit` contract tests | (kernel-owned, unchanged) | None — packs add their own fixtures, never modify the shared harness |

Every row above shows either "none" or a small, additive, already-anticipated change — evidence the Sprint 0 kernel was, in fact, already close to right for this without anyone designing for it explicitly at the time.
