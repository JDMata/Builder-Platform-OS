# Architecture Decision Records

All ADRs use this template:

```markdown
# NNNN — Title
Status: Proposed | Accepted | Superseded by NNNN
Date: YYYY-MM-DD

## Context
## Decision
## Consequences
## Alternatives considered
```

**Every ADR below is currently `Proposed`.** No related implementation work starts until an ADR is moved to `Accepted` (edit the ADR's Status line as part of the review). If a decision is rejected, don't delete the file — change status to `Superseded by NNNN` and write the replacement, so the reasoning trail (including why the first approach was rejected) survives.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-pnpm-turborepo-monorepo.md) | pnpm workspaces + Turborepo for the monorepo | Proposed |
| [0002](0002-hexagonal-clean-layering.md) | Hexagonal/Clean layering enforced by dependency-cruiser | Proposed |
| [0003](0003-modular-monolith-first.md) | Modular monolith first; microservices only on proven need | Proposed |
| [0004](0004-mcp-abstraction-layer.md) | MCP abstraction layer (mcp-core + mcp-adapters) | Proposed |
| [0005](0005-llm-abstraction-layer.md) | LLM provider abstraction layer (llm-core + llm-adapters) | Proposed |
| [0006](0006-plugin-architecture.md) | Plugin architecture for SAP-specific capabilities | Proposed |
| [0007](0007-event-driven-transactional-outbox.md) | Event-driven core via Postgres transactional outbox | Proposed |
| [0008](0008-workflow-engine-in-house-first.md) | Workflow engine: in-house adapter first, Temporal path kept open | Proposed |
| [0009](0009-postgresql-schema-per-context-drizzle.md) | PostgreSQL, schema-per-context, Drizzle ORM | Proposed |
| [0010](0010-oidc-federation-zero-trust.md) | Authentication via OIDC federation, Zero Trust, no custom IdP | Proposed |
| [0011](0011-hybrid-rbac-abac-policy-as-code.md) | Hybrid RBAC + ABAC via policy-as-code | Proposed |
| [0012](0012-opentelemetry-mandatory.md) | OpenTelemetry as mandatory observability standard | Proposed |
