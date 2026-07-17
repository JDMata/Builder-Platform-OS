# 03 — Persona Catalog (PER v1.0)

**Status:** Operational reference material — **not** constitutional, **not** a PXF revision. Every persona already defined in PXF §4 is restated here with its full operational detail; every persona PAS identified as missing is catalogued as a Planned Persona, never invented as if already constitutional.
**Derived from:** [00-platform-experience-foundation.md §4](../ux/00-platform-experience-foundation.md#4-user-personas) (PXF); [01-product-architecture-specification.md](01-product-architecture-specification.md) (PAS) §2.4–2.6.

---

## Reinterpreting PAS's persona-shaped [GAP]s

PAS flagged missing personas for Development, Testing, and Deployment (§2.4–2.6) as `[GAP]`. Applying this task's rule: PXF §4 already defines the *architectural location* of every persona (a single, owned, numbered table) and the *owner* of that table (Design System Architect function, PXF §23). What PXF does **not** define is a registry-style extension mechanism that lets a new persona be added without amending PXF itself — unlike capabilities (ADR-0022's `CapabilityProvider` registry) or node/relationship types (ECS §12's registry), **a persona is constitutional content**, and adding one is a PXF revision (PXF §23: "a new numbered revision of this document"), not a routine registration.

This distinction matters for classification: the *location and ownership* are defined (satisfying this task's stated test for "not a GAP"), but the *mechanism* is heavier-weight than a capability's. The three missing personas are therefore classified as **Planned Personas** — not `Future Extension`, since nothing about them requires a new *kind* of constitutional content (PXF §4 is already exactly the right kind of table for a persona), only a new *row* in it, added the next time PXF is deliberately revised.

---

## Existing personas (PXF §4)

### PER-001 — The Business Sponsor

| Field | Value |
|---|---|
| Identifier | PER-001 |
| Name | The Business Sponsor |
| Purpose | Submits the original idea; owns the business outcome |
| Responsibilities | Express intent in their own words; answer clarification questions |
| Goals | See the idea reflected back accurately, with nothing lost or invented |
| Decisions they own | What the idea actually is (via clarification answers) |
| Objects they create | `RequirementDocument` (Draft, via idea submission) |
| Objects they approve | None — approval is the Delivery Lead's role |
| Objects they consume | Confirmed `RequirementDocument` (to verify it reflects their intent) |
| Lifecycle Workspaces | Discovery |
| AI Collaboration | Receives AI-structured requirements as reviewable proposals (PXF §9.1) |
| Permissions | Session-derived tenant/actor identity; no elevated permission named |
| Review Responsibilities | None formal — informal verification that intent was captured correctly |
| Success Metrics | Idea structured and confirmed with no re-asked information (PXF §5.2) |
| **Status** | Exists constitutionally (PXF §4) |
| Constitutional Sources | PXF §4; PAS §2.1 |

### PER-002 — The Delivery Lead

| Field | Value |
|---|---|
| Identifier | PER-002 |
| Name | The Delivery Lead |
| Purpose | Reviews and confirms structured requirements/charters before they proceed |
| Responsibilities | Assess completeness/correctness quickly; confirm at the Project Charter gate |
| Goals | Confidence signals, not raw AI output, to decide quickly |
| Decisions they own | Confirming a `RequirementDocument`; approving downstream artifacts at review points |
| Objects they create | None directly — confirms objects AI/others propose |
| Objects they approve | `RequirementDocument`, Architecture Decision, generated specification `Artifact`s |
| Objects they consume | AI-proposed structure, confidence signals |
| Lifecycle Workspaces | Discovery, Architecture & Design, Documentation |
| AI Collaboration | Reviews AI-proposed content at every confirmation gate; never receives unreviewable AI output (PXF §9.4) |
| Permissions | `requirement:approve` permission (session-derived, per `apps/api-gateway`'s current default permission set) |
| Review Responsibilities | Project Charter confirmation; Architecture Decision approval; specification review |
| Success Metrics | Confirmation happens without re-reading the entire idea from scratch (PXF §4) |
| **Status** | Exists constitutionally (PXF §4) |
| Constitutional Sources | PXF §4, §9; PAS §2.1–2.3 |

### PER-003 — The Solution/Enterprise Architect

| Field | Value |
|---|---|
| Identifier | PER-003 |
| Name | The Solution/Enterprise Architect |
| Purpose | Consumes generated artifacts as the source of truth for downstream delivery |
| Responsibilities | Traceability verification; consumption of specs/architecture docs |
| Goals | Every generated artifact shows what requirement it came from and why |
| Decisions they own | Architecture Decision content (with CAP-002's assistance) |
| Objects they create | Architecture Decision (with AI assistance) |
| Objects they approve | Architecture Decision (jointly with Delivery Lead) |
| Objects they consume | Specification/Architecture-Document `Artifact`s, Development-phase `Artifact`s |
| Lifecycle Workspaces | Architecture & Design, Documentation, Development (secondary), Testing (secondary) |
| AI Collaboration | Receives Impact Analysis reports; reviews AI-generated specifications | 
| Permissions | Session-derived; presumed elevated review permission for architecture-level objects (unconfirmed — see Permissions gap note below) |
| Review Responsibilities | Architecture Decision approval; specification traceability checks |
| Success Metrics | Traceability completeness check passes for every artifact they own |
| **Status** | Exists constitutionally (PXF §4) |
| Constitutional Sources | PXF §4; PAS §2.2–2.5 |

### PER-004 — The Platform Operator

| Field | Value |
|---|---|
| Identifier | PER-004 |
| Name | The Platform Operator |
| Purpose | Manages workspaces, tenants, and platform configuration |
| Responsibilities | Risk/Incident/Problem/Change management; Impact Analysis and Root-Cause Assistance review |
| Goals | Predictable, low-frequency administrative interactions that stay out of the primary delivery flow |
| Decisions they own | `Change` approval via `ReviewGate`; `Incident`/`Problem` resolution |
| Objects they create | `Risk`, `Incident`, `Problem`, `Change` |
| Objects they approve | `Change` (via `ApprovalGate`) |
| Objects they consume | Impact Reports, root-cause hypotheses, Deployment status |
| Lifecycle Workspaces | Operations (primary), Deployment (secondary) |
| AI Collaboration | Reviews `ai-inferred` root-cause hypotheses before treating them as conclusions (PXF §9.1, doc16 §8) |
| Permissions | Not yet built; PXF §4 itself notes this persona is "not yet built, but implied by the multi-tenant architecture" |
| Review Responsibilities | `Change` approval; audit/compliance review |
| Success Metrics | No production change without record, approval, rollback plan (AF #11) |
| **Status** | Exists constitutionally (PXF §4) — the persona itself is defined, but PXF §4 explicitly notes the underlying admin capability is not yet built |
| Constitutional Sources | PXF §4; AF #11; PAS §2.7 |

### PER-005 — The Executive Stakeholder

| Field | Value |
|---|---|
| Identifier | PER-005 |
| Name | The Executive Stakeholder |
| Purpose | Occasional, high-level visibility into project status |
| Responsibilities | None operational — a consumer of honest status signals only |
| Goals | A small number of trustworthy signals, never a dashboard to interpret |
| Decisions they own | None named |
| Objects they create | None |
| Objects they approve | None |
| Objects they consume | Executive view's aggregated signals (ECS §6) |
| Lifecycle Workspaces | Operations (Executive view), potentially any workspace's Executive-view projection |
| AI Collaboration | None direct — consumes only already-reviewed, aggregated signals |
| Permissions | Read-only, tenant-scoped |
| Review Responsibilities | None |
| Success Metrics | Signals remain honest and derived directly from real graph state, never synthetic (ECS §6) |
| **Status** | Exists constitutionally (PXF §4) |
| Constitutional Sources | PXF §4; ECS §6; PAS §2.7 |

---

## Planned personas (identified by PAS as missing, reclassified per this task's rule)

### PER-006 — The Developer

| Field | Value |
|---|---|
| Identifier | PER-006 |
| Name | The Developer |
| Purpose | Reviews and refines AI-generated code/UI artifacts before promotion to Testing |
| Responsibilities | Review generated CAP Services, UI Screens, RAP/ABAP, and Integration Suite artifacts |
| Goals | Confidence that generated code correctly implements its Specification |
| Decisions they own | Whether a generated artifact is promoted to Testing |
| Objects they create | None directly — reviews AI/plugin-generated `Artifact`s |
| Objects they approve | Development-phase `Artifact`s (CAP-007–010) |
| Objects they consume | Specification `Artifact`s |
| Lifecycle Workspaces | Development |
| AI Collaboration | Reviews `CapabilityProvider`-generated artifacts as proposals (PXF §9.1), never auto-promoted |
| Permissions | **Planned** — no permission set defined yet |
| Review Responsibilities | Generated-artifact review before Testing handoff |
| Success Metrics | Generated artifact passes its Capability's `qualityGates` |
| **Status** | **Planned Persona** — location (Development workspace, PAS §2.4) and owning document (PXF §4's table) already defined; the row itself does not yet exist |
| Constitutional Sources | PXF §4 (table location); AF Vision (Development-phase ambition); PAS §2.4; CAP-007–010 |

### PER-007 — The QA Engineer

| Field | Value |
|---|---|
| Identifier | PER-007 |
| Name | The QA Engineer |
| Purpose | Validates generated artifacts against Requirements/AcceptanceCriteria |
| Responsibilities | Review/author test suites; interpret test-report results |
| Goals | Every artifact has a real, passing `validated-by` edge before promotion |
| Decisions they own | Whether a test result counts as passing validation |
| Objects they create | Test-suite/test-report `Artifact`s (with CAP-011's assistance) |
| Objects they approve | `validated-by` edges |
| Objects they consume | Development-phase `Artifact`s, `Requirement`/`AcceptanceCriterion` |
| Lifecycle Workspaces | Testing |
| AI Collaboration | Reviews Gap Detection's raised `Clarification`/`Risk` items | 
| Permissions | **Planned** — no permission set defined yet |
| Review Responsibilities | Test-suite review; traceability-completeness verification |
| Success Metrics | Traceability-completeness policy passes before promotion |
| **Status** | **Planned Persona** — same reasoning as PER-006 |
| Constitutional Sources | PXF §4 (table location); [16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md); PAS §2.5; CAP-011, CAP-013 |

### PER-008 — The Release Engineer

| Field | Value |
|---|---|
| Identifier | PER-008 |
| Name | The Release Engineer |
| Purpose | Assembles `ApplicationVersion`s and executes `Deployment`s |
| Responsibilities | Bundle validated artifacts; execute deployment under an execution profile; respond to a `Change`'s `ReviewGate` |
| Goals | Every deployment traceable to exactly the artifacts, requirements, and approvals behind it |
| Decisions they own | Which validated `Artifact` set is bundled; deployment execution timing |
| Objects they create | `ApplicationVersion`, `Deployment` |
| Objects they approve | `Deployment` readiness (subject to `Change` `ReviewGate`) |
| Objects they consume | Validated `Artifact`s (post-Testing) |
| Lifecycle Workspaces | Deployment |
| AI Collaboration | Consumes Impact Analysis reports attached to the `Change`'s `ReviewGate` |
| Permissions | **Planned** — no permission set defined yet |
| Review Responsibilities | Deployment execution sign-off |
| Success Metrics | `Change` approved via `ReviewGate` before promotion |
| **Status** | **Planned Persona** — same reasoning as PER-006 |
| Constitutional Sources | PXF §4 (table location); [16-project-digital-twin.md §1](../architecture/16-project-digital-twin.md); [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md); PAS §2.6 |

---

## A note on Permissions gaps found while cataloguing

Cataloguing PER-003 through PER-008 surfaced a real, honestly-reported observation not previously called out this precisely: **only Discovery's permission set is concretely implemented today** (`requirement:submit`/`requirement:clarify`/`requirement:approve`, per `apps/api-gateway`'s current default). Every other persona's permissions above are marked unconfirmed or Planned — this is not a new [GAP] this catalog invents a classification for; it is the same, single, already-named limitation PXF §4 itself discloses ("default, undifferentiated actor permissions on every authenticated session," `CI-B3` in `CONTINUOUS_IMPROVEMENT_BACKLOG.md`) restated at the per-persona level where it becomes visible.
