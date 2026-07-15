# Engineering Principles

This document is the constitution of SAP App Factory engineering. It does not change per sprint, per feature, or per team lead. Where a specific technical decision needs detail beyond what's here, this document points to [docs/architecture/](docs/architecture/) and [docs/adr/](docs/adr/) rather than repeating it — those evolve; this document's *principles* should not.

## Vision

SAP App Factory is an AI-native engineering platform that turns business requirements into delivered SAP solutions — orchestrating AI agents and MCP servers to produce SAP Fiori/SAPUI5 apps, SAP GUI modernization, CAP services (Node.js and Java), RAP/ABAP, Integration Suite artifacts, architecture and testing documentation, deployment pipelines, and user manuals. It should feel like engaging an experienced SAP delivery organization, not calling a coding assistant. Full detail: [docs/architecture/00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md).

## Long-term philosophy

This platform is built to be maintained for 10+ years by people who are not in this room. Three habits of mind follow from that, and every decision in this codebase is judged against them:

1. **Boundaries over speed.** Any place SAP-specific knowledge could leak into the core is a design smell, not a shortcut, no matter how much time it saves this sprint.
2. **Reversibility over optimality.** Where a decision is expensive to reverse (a database, an identity provider, a workflow engine), we pick the option that keeps a clean seam to change our mind — even over an option that scores higher today.
3. **Boring technology in the core, ambition at the edges.** Postgres, Redis, OIDC, OpenTelemetry are deliberately unexciting. The platform's ambition — multi-agent orchestration of SAP delivery — lives in the workflow, plugin, and agent layers, which can move fast precisely because the plumbing underneath doesn't.

A corollary: **we would rather ship less this quarter and still be able to change our mind next year than ship more this quarter and be stuck with it for five.** This is not a license for inaction — it's a tiebreaker when speed and reversibility genuinely conflict.

## Architectural principles

The following are non-negotiable. They apply to every package, every PR, every plugin, regardless of deadline pressure. Detailed rules for each live in [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md); this section states what each principle *means* and why it's on the list.

### SOLID
Applied at the class/module level, not as a checklist to recite: **S**ingle Responsibility (a module has one reason to change — a `WorkflowRun` repository doesn't also send notifications), **O**pen/Closed (new capabilities are added via new plugins or new adapters, not by editing a `switch` in core code — this is the entire reason the plugin and adapter patterns exist), **L**iskov Substitution (any adapter behind a port must be interchangeable with any other adapter behind the same port — verified by shared contract tests, not assumed), **I**nterface Segregation (ports are narrow and purpose-specific — `LlmProviderPort` doesn't also expose MCP concerns), **D**ependency Inversion (application code depends on ports/abstractions, never on concrete adapters or third-party SDKs).

### Clean Architecture
Four layers — domain, application, ports, adapters — with dependencies pointing inward only. Domain code has zero framework or I/O dependencies and is testable with no mocks. See [01-high-level-architecture.md](docs/architecture/01-high-level-architecture.md).

### Domain-Driven Design
Ten bounded contexts, each with its own aggregates, its own Postgres schema, and no cross-schema foreign keys. Contexts talk only through domain events or opaque ID references, never shared tables. See [02-domain-model.md](docs/architecture/02-domain-model.md).

### Hexagonal Architecture
Every external dependency — LLM providers, MCP servers, the database, object storage, the identity provider — sits behind a port defined in application-owned terms, implemented by a swappable adapter. This is what makes "no vendor lock-in" enforceable rather than aspirational.

### Event-Driven Architecture
Cross-context communication happens through versioned domain events over a transactional outbox, never synchronous cross-context calls. See [06-event-model.md](docs/architecture/06-event-model.md).

### Plugin Architecture
Every SAP-specific capability (Fiori, CAP, RAP, ABAP, Integration Suite, and everything not yet imagined) is a plugin conforming to `plugin-sdk`, never inline core code. This is the concrete mechanism behind "no SAP-specific logic inside the core platform." The same discipline extends one level down to what plugins produce: every generated application is itself architected behind Ports & Adapters, runnable as Local POC, Hybrid, or Enterprise without forking its business logic — see [ADR-0019](docs/adr/0019-execution-profiles-for-generated-applications.md). See [05-plugin-architecture.md](docs/architecture/05-plugin-architecture.md).

### AI First
The platform is built assuming an AI agent, not only a human, is a first-class consumer of every capability. Concretely: every capability is exposed through a structured, machine-callable contract (API First, below) before — or at the same time as — any UI is built for it; workflow steps, plugin manifests, and MCP tool bindings are all designed to be agent-composable, not just human-clickable; and every agent action (a tool call, a generation, a decision) is recorded with enough structure (inputs, reasoning trace where available, outputs) to be replayed, audited, and improved on, not just displayed once and discarded. AI First does not mean "AI writes the architecture" — it means the architecture treats agents as first-class actors with the same contracts, auditability, and authorization model as human users, never a special-cased backdoor. The concrete home for this principle is the [.ai/ AI Workspace](.ai/README.md) — every specialized agent's purpose, permissions, memory, and escalation/approval behavior is an authored, reviewed, versioned file, not an ad hoc prompt. See [ADR-0020](docs/adr/0020-ai-workspace-for-agent-definitions.md). An agent is one possible **provider** of a business capability, never the only conceivable one — a workflow requests "generate a functional specification," never "invoke the documentation agent," so the same request can later be fulfilled by a different agent, a plugin, or a human without touching the workflow. See [ADR-0022](docs/adr/0022-capability-model-provider-abstraction.md).

### API First
Every capability is designed as a versioned, documented API contract before a UI consumes it. A UI-only feature with no programmatic contract is a design defect, not a shortcut — it blocks both the AI-First principle above and third-party/partner integration later.

### Testability
Code that requires a live external service to unit test is a design defect, not an inconvenience. Domain logic tests run in milliseconds with zero mocks; every port has a shared contract test suite run against every adapter. See coverage floors in [CODING_STANDARDS.md](CODING_STANDARDS.md).

### Documentation First
A package, port, or ADR-worthy decision without documentation does not merge. Documentation is written before or alongside the code it describes, not backfilled — see [10-coding-standards-and-naming.md](docs/architecture/10-coding-standards-and-naming.md) and the fitness function requiring a README per package. This extends to every project the platform delivers: every generated artifact — requirement, service, screen, test, deployment — is a traceable node in that project's [Digital Twin](docs/architecture/16-project-digital-twin.md), not a file whose relationship to everything else lives only in someone's memory.

### Security First
Security is a design input, not a post-implementation review step. Every new capability is threat-modeled against [SECURITY_BASELINE.md](SECURITY_BASELINE.md) before it ships, not after.

### Zero Trust
No implicit trust by network location, process boundary, or "it's an internal service." Every request — human or service-to-service — is authenticated and authorized regardless of origin. See [08-authentication-and-rbac.md](docs/architecture/08-authentication-and-rbac.md).

### Maintainability over speed
When a maintainability concern and a delivery-speed concern genuinely conflict, maintainability wins by default. This is a default, not an absolute — but overriding it requires an explicit, recorded decision (an ADR or a documented exception), not a silent shortcut. See the long-term philosophy above.

### No Vendor Lock-In
No core code imports a specific cloud, LLM, MCP, or deployment vendor's SDK directly — only adapters do, and only behind a port. This is what lets the platform run on multiple LLM providers, multiple SAP deployment targets, and eventually multiple clouds without a rewrite.

### Technical Debt Policy
Technical debt is tracked, categorized, and paid down by policy, not by accident. Full policy: [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).

## Engineering Planning Principles

Added at the Sprint 0 → Sprint 1 transition ([ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md)). Sprint 0 built the foundation; these rules govern how every sprint from Sprint 1 onward is planned and closed on top of it. See [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) for the step-by-step process each rule below implies.

- **Beginning with Sprint 1, development follows Vertical Slice Architecture.** A sprint is planned and delivered as a thin, complete slice through every layer a capability needs — domain, application, port, adapter, UI where applicable — never as a horizontal layer built in isolation "to be wired up later."
- **Every sprint must deliver a complete, user-visible capability.** A sprint that ships only internal refactoring, infrastructure, or partial plumbing with nothing a user or an agent can actually invoke has not met this bar, regardless of how much code it produced.
- **Horizontal technical work is permitted only when required to support the active vertical slice.** A new port, a new adapter, a shared helper — each is justified by the slice that needs it this sprint, not built ahead of demand. This is the same "extract on second occurrence, not first" discipline Sprint 0 already established, applied at the sprint-planning level, not just the code level.
- **Architecture is frozen after Sprint 0.** See [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) for exactly what that means and what remains free to change.
- **Architecture changes require, before implementation:**
  - An Architecture Decision Record (ADR).
  - Impact Analysis — which contexts, ports, adapters, or fitness functions are affected.
  - Architecture Review — an independent, evidence-based check, not a self-certification.
  - Approval — before implementation begins, not retrofitted onto work already in progress.
- **Every sprint must finish with:**
  - Sprint Exit Gate — the same discipline [docs/governance/sprint-0-exit-gate/](docs/governance/sprint-0-exit-gate/README.md) established, scaled to a single sprint's scope.
  - Technical Debt Review — every item introduced this sprint classified by severity and given a resolution timeline, per [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).
  - Architecture Drift Review — confirming nothing shipped this sprint silently diverged from an Accepted ADR.
  - ADR Review — confirming every cross-cutting decision made this sprint has a corresponding ADR, and no ADR was implemented ahead of its own approval.
  - Documentation Review — confirming every touched package's README, every architecture doc a change makes inaccurate, and [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)'s operational state are all current.
- **Every completed feature must:**
  - Update the [Project Digital Twin](docs/architecture/16-project-digital-twin.md) — once it exists (SAF-34–37); until then, this requirement is satisfied by the feature's artifacts being traceable through existing means (audit events, backlog entries), not skipped.
  - Register its capabilities in the Capability Registry — never leave a workflow invoking an unregistered, ad hoc implementation.
  - Emit events for every domain-meaningful state transition, via the transactional outbox — never a silent side effect.
  - Include documentation — package README, architecture doc updates, and an ADR if the feature was cross-cutting.
  - Include tests — unit coverage for new domain logic, contract tests for any new/changed port-adapter pair, and an end-to-end proof the vertical slice actually works, not just that its parts pass in isolation.

## How these principles are enforced, not just stated

Every principle above has a corresponding mechanical check — a "fitness function" — that fails CI when violated, documented in [12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md). A principle that only lives in this document and is never checked by a machine will erode under deadline pressure; that is the single most important lesson this governance package encodes.
