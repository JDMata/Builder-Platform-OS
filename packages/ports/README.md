# @sap-app-factory/ports

## Purpose

Types only, no implementation — the abstraction seam every application-layer package depends on instead of a concrete adapter or third-party SDK. See [ADR-0002](../../docs/adr/0002-hexagonal-clean-layering.md) and [ARCHITECTURE_PRINCIPLES.md](../../ARCHITECTURE_PRINCIPLES.md) § Dependency rules.

## Ports

| Port | Backing ADR/doc |
|---|---|
| `Repository<T>` | [02-domain-model.md](../../docs/architecture/02-domain-model.md) (aggregate design rule 1) |
| `LlmProviderPort` | [ADR-0005](../../docs/adr/0005-llm-abstraction-layer.md) |
| `McpConnectionPort` | [ADR-0004](../../docs/adr/0004-mcp-abstraction-layer.md) |
| `EventBusPort` | [ADR-0007](../../docs/adr/0007-event-driven-transactional-outbox.md) |
| `ObjectStorePort` | [09-database-proposal.md](../../docs/architecture/09-database-proposal.md) |
| `SecretsVaultPort` | [08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md) |
| `WorkflowEnginePort` | [ADR-0008](../../docs/adr/0008-workflow-engine-in-house-first.md) |
| `PolicyEnginePort` | [ADR-0011](../../docs/adr/0011-hybrid-rbac-abac-policy-as-code.md) |
| `RateLimiterPort` | [13-principal-architect-self-review.md](../../docs/architecture/13-principal-architect-self-review.md) §9 |
| `TenantConnectionResolverPort` | [ADR-0013](../../docs/adr/0013-tenancy-isolation-tiering.md) |
| `GraphStorePort` | [ADR-0021](../../docs/adr/0021-project-digital-twin-knowledge-graph.md) |
| `SearchIndexPort` | [ADR-0021](../../docs/adr/0021-project-digital-twin-knowledge-graph.md) §7 |

Every method takes `RequestContext` as its first parameter (tenant isolation defense-in-depth, correlation ID, actor identity — see [02-domain-model.md](../../docs/architecture/02-domain-model.md) § Request context).

## Rules for this package

- No implementation, ever — only interfaces, type aliases, and the plain data shapes they reference.
- No third-party runtime dependency of any kind — a port is a contract independent of whichever SDK an adapter happens to wrap.
- A new port is added here only when [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md) names it; adding one elsewhere is a documentation-vs-code drift bug.
