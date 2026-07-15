# SAP App Factory

> An AI-native engineering platform that builds SAP applications from business requirements — orchestrating AI agents and MCP servers to produce SAP Fiori, SAPUI5, CAP, RAP/ABAP, integration, documentation, tests, deployment pipelines, and user manuals.

**Status: Sprint 0 Baseline v1.0 established (2026-07-15); Sprint 0 → Sprint 1 governance transition complete.** Tag `sprint0-baseline-v1.0`. The Sprint 0 Exit Gate ([docs/governance/sprint-0-exit-gate/](docs/governance/sprint-0-exit-gate/README.md)) returned **GO WITH MINOR CORRECTIONS**; the architecture is now frozen per [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) — see [BASELINE.md](BASELINE.md) for the full consolidated baseline and [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md) for every ADR with its affected packages and impact level. Sprint 1 (Discovery Workspace) is the active development sprint, planned and closed per [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) using Vertical Slice Architecture ([ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s Engineering Planning Principles); any architectural change from this point requires an ADR, impact analysis, and architecture review before implementation. **Every session — human or AI — should start at [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), per [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md), not from this README or the roadmap directly.** See [ROADMAP.md](ROADMAP.md) for the product roadmap and [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md) for the maturity matrix sprint by sprint. Every story follows Explain → Design → Implement → Test → Document → ADR-update, per [CONTRIBUTING.md](CONTRIBUTING.md) and [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).

## Engineering governance (read these first — they govern every PR)

| Document | For |
|---|---|
| [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md) | Vision, long-term philosophy, and the non-negotiable principles (SOLID, Clean/Hexagonal Architecture, DDD, Event-Driven, Plugin, AI First, API First, Testability, Documentation First, Security First, Zero Trust, maintainability over speed, no vendor lock-in) |
| [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md) | Enforceable rules: service boundaries, package/dependency rules, event/workflow/plugin rules, MCP/LLM/persistence/authentication abstractions |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | Naming, folder conventions, TypeScript rules, logging, error handling, DI, testing, comments, documentation |
| [SECURITY_BASELINE.md](SECURITY_BASELINE.md) | AuthN/AuthZ, secrets, encryption, audit, Zero Trust, RBAC, environment separation, secure coding, OWASP mapping |
| [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md) | What counts as debt, what's prohibited outright, refactoring/architecture-review/ADR/code-review policy |
| [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md) | When a backlog item may enter a sprint |
| [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) | Every requirement for a story to be considered complete |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to actually work on this project, day to day |
| [ADR_TEMPLATE.md](ADR_TEMPLATE.md) | Standard template for new Architecture Decision Records |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | The canonical monorepo tree and placement rules |
| [BASELINE.md](BASELINE.md) | **The Sprint 0 architectural baseline** — repository/package/app/infra inventory, architecture summary, bounded contexts, capability + event catalogs, technology stack, accepted debt, deferred decisions, current limitations, and the authoritative document checksum for future architecture reviews |
| [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md) | Every ADR in one table — status, decision date, affected packages, related ADRs, version, impact level, organized by category |
| [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md) | The maturity matrix — what's implemented vs. planned vs. not-yet-scheduled, sprint by sprint, and the platform evolution strategy |
| [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) | **The Sprint 0 architecture freeze** — what's stable, what Sprint 1+ may change freely, what requires an ADR, and what triggers a formal Architecture Review Board |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | **The living operational state** — current sprint, stories, risks, decisions, architecture freeze status; every session starts here, per [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md) |
| [ROADMAP.md](ROADMAP.md) | The official Product Roadmap (Sprint 0–8), plus the distinctly-scoped Engineering Roadmap, Release Roadmap, and Future Ideas — only the Product Roadmap drives implementation |
| [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) | The operational handbook — how to begin/end a sprint, Sprint Exit Gate, Definition of Ready/Done, Architecture Review/ADR process, PR review, testing/documentation/release strategy, how to introduce a new context/capability/plugin/agent, incident/problem/change/drift management, retrospectives |
| [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md) | The required reading order and verification checklist every future session (human or AI) follows before starting work |

## Start here (architecture record)

| Read this | For |
|---|---|
| [docs/architecture/00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md) | Product vision, non-negotiable principles, explicit non-goals for Sprint 0 |
| [docs/architecture/01-high-level-architecture.md](docs/architecture/01-high-level-architecture.md) | System context, logical architecture, layering |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | The actual monorepo tree and what belongs where |
| [docs/architecture/02-domain-model.md](docs/architecture/02-domain-model.md) | Bounded contexts, aggregates, context map |
| [docs/architecture/03-monorepo-and-packages.md](docs/architecture/03-monorepo-and-packages.md) | Monorepo tooling, package boundaries, versioning |
| [docs/architecture/04-service-boundaries.md](docs/architecture/04-service-boundaries.md) | What is a deployable service vs. a library |
| [docs/architecture/05-plugin-architecture.md](docs/architecture/05-plugin-architecture.md) | How SAP-specific capability plugins attach without touching the core |
| [docs/architecture/06-event-model.md](docs/architecture/06-event-model.md) | Domain events, envelope, delivery guarantees |
| [docs/architecture/07-workflow-engine.md](docs/architecture/07-workflow-engine.md) | Agent/task orchestration proposal |
| [docs/architecture/08-authentication-and-rbac.md](docs/architecture/08-authentication-and-rbac.md) | Zero Trust auth, RBAC/ABAC model |
| [docs/architecture/09-database-proposal.md](docs/architecture/09-database-proposal.md) | PostgreSQL schema strategy, Redis, MinIO |
| [docs/architecture/10-coding-standards-and-naming.md](docs/architecture/10-coding-standards-and-naming.md) | Coding standards and naming conventions |
| [docs/architecture/11-git-and-cicd-strategy.md](docs/architecture/11-git-and-cicd-strategy.md) | Branching model, CI/CD pipeline |
| [docs/architecture/12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md) | Risk register, technical debt prevention (fitness functions) |
| [docs/architecture/13-principal-architect-self-review.md](docs/architecture/13-principal-architect-self-review.md) | **Adversarial self-review at 500+ projects / dozens of MCP servers / hundreds of workflows / enterprise SaaS scale — read this to see what changed and why** |
| [docs/architecture/14-execution-profiles.md](docs/architecture/14-execution-profiles.md) | Execution profiles (Local POC / Hybrid / Enterprise) for **generated applications** — ports & adapters at the product boundary, not the platform's own runtime |
| [docs/architecture/15-ai-workspace.md](docs/architecture/15-ai-workspace.md) | The [.ai/](.ai/README.md) AI Workspace — file-based authoring surface for the dozens of specialized agents the platform will eventually orchestrate |
| [docs/architecture/16-project-digital-twin.md](docs/architecture/16-project-digital-twin.md) | The **Project Digital Twin** — a knowledge graph tracing every artifact a project produces (requirements through incidents) and the typed relationships between them |
| [docs/architecture/17-sprint0-architecture-inventory-review.md](docs/architecture/17-sprint0-architecture-inventory-review.md) | **Independent architecture inventory review of everything built in SAF-1–10 — package-by-package audit, dependency graph, bounded-context review, technical debt assessment, scorecard, and Sprint 0 readiness gate. Read this before resuming implementation.** |
| [docs/architecture/18-capability-model.md](docs/architecture/18-capability-model.md) | The **Capability Model** — workflows request capabilities, never specific agents/plugins; a `Capability` resolves to a `CapabilityProvider` (agent, plugin, human, or external service), reusing `AgentDefinition`/`PluginManifest` fields for "Implementation"/"Resources" rather than adding two more aggregates |
| [docs/adr/README.md](docs/adr/README.md) | Architecture Decision Records index (23 ADRs — 12 original, 6 added by the self-review, 1 for execution profiles, 1 for the AI Workspace, 1 for the Digital Twin, 1 for the Capability Model, 1 strategic pre-Sprint-1 Platform Pack decision, several cross-referenced); see also [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md) for the same 23 ADRs with affected packages, related ADRs, and impact level |
| [docs/backlog/sprint-0-backlog.md](docs/backlog/sprint-0-backlog.md) | Concrete Sprint 0 tickets, plus Sprint 1/2 carry-forward items elevated by the self-review |

## Review gate

All 23 ADRs in [docs/adr/](docs/adr/) are **Accepted** — the 22 decided 2026-07-14, confirmed unchanged at the Sprint 0 Baseline (2026-07-15), plus [ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md) (2026-07-15, strategic, no code changes). Any future decision that revises one is proposed the same way the rest were: an ADR (or a dated "Review update" section on an existing one), reviewed before its implementing PR merges — see [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md) and, from this baseline forward, [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) for what's frozen and [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md)'s Architecture Review Process for exactly how the ADR → impact analysis → architecture review → approval sequence works, before implementation. Start with [13-principal-architect-self-review.md](docs/architecture/13-principal-architect-self-review.md) if you want the fastest path to understanding what changed since the first draft and why, or [BASELINE.md](BASELINE.md) for the consolidated Sprint 0 state this freeze locks in.
