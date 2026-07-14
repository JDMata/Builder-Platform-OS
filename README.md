# SAP App Factory

> An AI-native engineering platform that builds SAP applications from business requirements — orchestrating AI agents and MCP servers to produce SAP Fiori, SAPUI5, CAP, RAP/ABAP, integration, documentation, tests, deployment pipelines, and user manuals.

**Status: Sprint 0 — Foundation.** No product features are implemented yet. This repository currently contains the architecture, standards, and backlog required to build the platform without accumulating structural debt. Do not add SAP-specific logic, generators, or business features until the documents below have been reviewed and the Sprint 0 backlog is executed.

## Start here

| Read this | For |
|---|---|
| [docs/architecture/00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md) | Product vision, non-negotiable principles, explicit non-goals for Sprint 0 |
| [docs/architecture/01-high-level-architecture.md](docs/architecture/01-high-level-architecture.md) | System context, logical architecture, layering |
| [docs/folder-structure.md](docs/folder-structure.md) | The actual monorepo tree and what belongs where |
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
| [docs/adr/README.md](docs/adr/README.md) | Architecture Decision Records index |
| [docs/backlog/sprint-0-backlog.md](docs/backlog/sprint-0-backlog.md) | Concrete Sprint 0 tickets |

## Review gate

Every ADR in [docs/adr/](docs/adr/) is currently **Proposed**. Per the operating agreement for this project, no application code is written until these are reviewed and their status is moved to **Accepted** (or revised and re-proposed). Flag disagreements against the ADR itself, not the summary documents, so the decision trail stays intact.
