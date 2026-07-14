# SAP App Factory

> An AI-native engineering platform that builds SAP applications from business requirements — orchestrating AI agents and MCP servers to produce SAP Fiori, SAPUI5, CAP, RAP/ABAP, integration, documentation, tests, deployment pipelines, and user manuals.

**Status: Sprint 0 implementation PAUSED at SAF-10 for an independent architecture inventory review (2026-07-14).** SAF-1 through SAF-10 are built (18 packages, 53 passing tests) — see [docs/architecture/17-sprint0-architecture-inventory-review.md](docs/architecture/17-sprint0-architecture-inventory-review.md) for the full audit and its recommendation ("continue with minor adjustments") before SAF-11 resumes. See [docs/backlog/sprint-0-backlog.md](docs/backlog/sprint-0-backlog.md) for per-story progress. Every story follows Explain → Design → Implement → Test → Document → ADR-update, per [CONTRIBUTING.md](CONTRIBUTING.md) and [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).

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
| [docs/adr/README.md](docs/adr/README.md) | Architecture Decision Records index (22 ADRs — 12 original, 6 added by the self-review, 1 for execution profiles, 1 for the AI Workspace, 1 for the Digital Twin, 1 for the Capability Model, several cross-referenced) |
| [docs/backlog/sprint-0-backlog.md](docs/backlog/sprint-0-backlog.md) | Concrete Sprint 0 tickets, plus Sprint 1/2 carry-forward items elevated by the self-review |

## Review gate

All 22 ADRs in [docs/adr/](docs/adr/) are **Accepted** as of 2026-07-14. Any future decision that revises one is proposed the same way the rest were: an ADR (or a dated "Review update" section on an existing one), reviewed before its implementing PR merges — see [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md). Start with [13-principal-architect-self-review.md](docs/architecture/13-principal-architect-self-review.md) if you want the fastest path to understanding what changed since the first draft and why.
