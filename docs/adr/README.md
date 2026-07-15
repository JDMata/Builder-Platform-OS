# Architecture Decision Records

All ADRs use the standard template: [ADR_TEMPLATE.md](../../ADR_TEMPLATE.md). See [TECHNICAL_DEBT_POLICY.md](../../TECHNICAL_DEBT_POLICY.md) for when a new ADR is required, and [ARCHITECTURE_FREEZE.md](../../ARCHITECTURE_FREEZE.md) for the governance sequence every architectural change now follows post-Sprint-0. For the same 22 ADRs cross-referenced with affected packages, related ADRs, and impact level, see [ARCHITECTURE_DECISION_INDEX.md](../../ARCHITECTURE_DECISION_INDEX.md).

**All 22 ADRs below are `Accepted`** (approved 2026-07-14, alongside the engineering standards, Digital Twin, Local-first/execution-profile, AI Workspace, and Capability Model architecture). Sprint 0 implementation begins against this accepted set. If a decision is later rejected or replaced, don't delete the file — change status to `Superseded by NNNN` and write the replacement, so the reasoning trail (including why the first approach was rejected) survives.

## Index

Six ADRs (0006, 0007, 0008, 0009) carry a **Review update** section added by the principal-architect self-review — read those before treating the original Decision section as final. Six more (0013-0018) were added by that same review. See [architecture/13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) for the full rationale.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-pnpm-turborepo-monorepo.md) | pnpm workspaces + Turborepo for the monorepo | Accepted |
| [0002](0002-hexagonal-clean-layering.md) | Hexagonal/Clean layering enforced by dependency-cruiser | Accepted |
| [0003](0003-modular-monolith-first.md) | Modular monolith first; microservices only on proven need | Accepted |
| [0004](0004-mcp-abstraction-layer.md) | MCP abstraction layer (mcp-core + mcp-adapters) | Accepted |
| [0005](0005-llm-abstraction-layer.md) | LLM provider abstraction layer (llm-core + llm-adapters) | Accepted |
| [0006](0006-plugin-architecture.md) | Plugin architecture for SAP-specific capabilities | Accepted *(revised: isolation elevated to Sprint 1/2 requirement)* |
| [0007](0007-event-driven-transactional-outbox.md) | Event-driven core via Postgres transactional outbox | Accepted *(revised: cross-process description corrected, Redis Streams timeline moved up)* |
| [0008](0008-workflow-engine-in-house-first.md) | Workflow engine: in-house adapter first, Temporal path kept open | Accepted *(revised: default bias shifted toward an early Temporal-class spike)* |
| [0009](0009-postgresql-schema-per-context-drizzle.md) | PostgreSQL, schema-per-context, Drizzle ORM | Accepted *(revised: partitioning, HA, and PII handling added)* |
| [0010](0010-oidc-federation-zero-trust.md) | Authentication via OIDC federation, Zero Trust, no custom IdP | Accepted |
| [0011](0011-hybrid-rbac-abac-policy-as-code.md) | Hybrid RBAC + ABAC via policy-as-code | Accepted |
| [0012](0012-opentelemetry-mandatory.md) | OpenTelemetry as mandatory observability standard | Accepted |
| [0013](0013-tenancy-isolation-tiering.md) | Tenant isolation tiering and deployment topology | Accepted |
| [0014](0014-cqrs-read-models.md) | CQRS-lite read models for cross-aggregate reporting | Accepted |
| [0015](0015-target-system-credential-management.md) | Target-system credential management | Accepted |
| [0016](0016-mandatory-resilience-patterns.md) | Mandatory resilience patterns for LLM/MCP adapters | Accepted |
| [0017](0017-data-retention-crypto-shredding.md) | Data retention, partitioned archival, and crypto-shredding | Accepted |
| [0018](0018-package-granularity-revision.md) | Package granularity revision: one package per context | Accepted |
| [0019](0019-execution-profiles-for-generated-applications.md) | Execution profiles for generated applications (Local POC / Hybrid / Enterprise) | Accepted |
| [0020](0020-ai-workspace-for-agent-definitions.md) | AI Workspace (`.ai/`) for agent definitions | Accepted |
| [0021](0021-project-digital-twin-knowledge-graph.md) | Project Digital Twin as an event-projected knowledge graph | Accepted |
| [0022](0022-capability-model-provider-abstraction.md) | Capability model: workflows request capabilities, never specific agents | Accepted *(closes a real Step-kind inconsistency; 2 new aggregates + 1 new port, reusing AgentDefinition/PluginManifest fields instead of 2 more new aggregates)* |
