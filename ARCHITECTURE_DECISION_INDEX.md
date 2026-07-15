# Architecture Decision Index

Single navigation document for every ADR. See [docs/adr/README.md](docs/adr/README.md) for the original index this one supersedes as the primary navigation surface (that file remains the canonical location of the ADRs themselves — this index adds the cross-cutting metadata a governance review needs: affected packages, related ADRs, impact level).

All 22 ADRs are **Accepted**, decided 2026-07-14, confirmed unchanged as of the Sprint 0 Baseline (2026-07-15).

## Platform

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0001](docs/adr/0001-pnpm-turborepo-monorepo.md) | pnpm workspaces + Turborepo for the monorepo | Accepted | 2026-07-14 | All | 0018 | v1 | High | Foundational tooling choice — every package's build/test/lint pipeline depends on this. |
| [0003](docs/adr/0003-modular-monolith-first.md) | Modular monolith first; microservices only on proven need | Accepted | 2026-07-14 | `apps/*` | 0002, 0018 | v1 | High | Sets the extraction bar — no service split without a proven, documented need. |
| [0018](docs/adr/0018-package-granularity-revision.md) | Package granularity revision: one package per context | Accepted | 2026-07-14 | All `context-*` | 0001, 0002 | v1 | High | Shaped the entire package tree — domain + application as folders within one package, not separate packages. |

## Architecture

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0002](docs/adr/0002-hexagonal-clean-layering.md) | Hexagonal/Clean layering enforced by dependency-cruiser | Accepted | 2026-07-14 | All | 0001, 0018 | v1 | High | The single mechanical authority for layer boundaries — no duplicate enforcement in ESLint. |
| [0007](docs/adr/0007-event-driven-transactional-outbox.md) | Event-driven core via Postgres transactional outbox | Accepted *(revised)* | 2026-07-14 | `events-core`, `events-adapters/postgres-outbox`, `persistence-postgres/*` | 0009 | v1 + review update | High | Real, working transactional outbox — cross-process description corrected, Redis Streams timeline moved up (backlog item SAF-26, not yet built). |
| [0014](docs/adr/0014-cqrs-read-models.md) | CQRS-lite read models for cross-aggregate reporting | Accepted | 2026-07-14 | `packages/read-models/*` (not yet built) | 0009 | v1 | Low | Not yet implemented — no dashboard view exists to need it yet (SAF-28). |
| [0021](docs/adr/0021-project-digital-twin-knowledge-graph.md) | Project Digital Twin as an event-projected knowledge graph | Accepted | 2026-07-14 | `context-digital-twin` (not yet built) | 0018, graph-store port | v1 | Low | Fully designed, zero implementation — correctly scoped ahead of SAF-34–37. |

## Security

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0010](docs/adr/0010-oidc-federation-zero-trust.md) | Authentication via OIDC federation, Zero Trust, no custom IdP | Accepted | 2026-07-14 | `auth-core`, `apps/api-gateway` | 0011 | v1 | High | Real, working — Authorization Code + PKCE against Keycloak, BFF pattern. |
| [0011](docs/adr/0011-hybrid-rbac-abac-policy-as-code.md) | Hybrid RBAC + ABAC via policy-as-code | Accepted | 2026-07-14 | `auth-core`, `context-identity` | 0010 | v1 | Medium | Real, working OPA/Rego adapter; role/permission schema exists, empty seed data only. |
| [0015](docs/adr/0015-target-system-credential-management.md) | Target-system credential management | Accepted | 2026-07-14 | `context-project` (`TargetSystemConnection`, domain-modeled only) | 0013, 0017 | v1 | Medium (High once built) | Not yet implemented — no real deployment-to-customer-system capability exists yet (SAF-29). |

## Workflow

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0008](docs/adr/0008-workflow-engine-in-house-first.md) | Workflow engine: in-house adapter first, Temporal path kept open | Accepted *(revised)* | 2026-07-14 | `workflow-engine-adapters/in-memory`, `context-workflow` | 0022 | v1 + review update | High | Deliberate skeleton, not durable — bias shifted toward an early Temporal-class spike (SAF-24). |
| [0022](docs/adr/0022-capability-model-provider-abstraction.md) | Capability model: workflows request capabilities, never specific agents | Accepted *(closes a Step-kind inconsistency)* | 2026-07-14 | `context-capability-registry`, `ports/capability-resolver.port.ts`, `apps/orchestrator` | 0006, 0008, 0020 | v1 | High | Actively used — the one real capability/provider registration in Sprint 0 goes through this model. |

## AI

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0004](docs/adr/0004-mcp-abstraction-layer.md) | MCP abstraction layer (mcp-core + mcp-adapters) | Accepted | 2026-07-14 | `mcp-core`, `mcp-adapters/stdio`, `context-mcp-registry` | 0016 | v1 | Medium | Real, contract-tested adapter; mocked responses only, no real MCP traffic yet. |
| [0005](docs/adr/0005-llm-abstraction-layer.md) | LLM provider abstraction layer (llm-core + llm-adapters) | Accepted | 2026-07-14 | `llm-core`, `llm-adapters/anthropic`, `context-llm-gateway` | 0016 | v1 | Medium | Real, contract-tested adapter; mocked responses only, no real LLM traffic yet. |
| [0016](docs/adr/0016-mandatory-resilience-patterns.md) | Mandatory resilience patterns for LLM/MCP adapters | Accepted | 2026-07-14 | `resilience-kit`, `llm-core`, `mcp-core` | 0004, 0005 | v1 | Medium | Real, minimal (timeout + bounded retry); Redis-backed cross-replica state deferred (SAF-27). |
| [0020](docs/adr/0020-ai-workspace-for-agent-definitions.md) | AI Workspace (`.ai/`) for agent definitions | Accepted | 2026-07-14 | `.ai/` (file-based, no runtime consumer yet) | 0022 | v1 | Low | Templates + one illustrative agent exist; the loader that ingests them (`agent-sdk`) is SAF-32. |

## Plugins

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0006](docs/adr/0006-plugin-architecture.md) | Plugin architecture for SAP-specific capabilities | Accepted *(revised)* | 2026-07-14 | `plugin-sdk`, `plugins/fiori-generator`, `apps/orchestrator`, `apps/worker` | 0022 | v1 + review update | High | Real, working `execute()` seam and one real plugin; process/container isolation elevated to a Sprint 1/2 hard requirement (SAF-25). |
| [0019](docs/adr/0019-execution-profiles-for-generated-applications.md) | Execution profiles for generated applications (Local POC / Hybrid / Enterprise) | Accepted | 2026-07-14 | `plugin-sdk` (manifest fields only; `generated-app-kit` not yet built) | 0006 | v1 | Medium | Manifest fields exist; the seven generated-application ports and mock/Enterprise adapters are SAF-31. |

## Persistence

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0009](docs/adr/0009-postgresql-schema-per-context-drizzle.md) | PostgreSQL, schema-per-context, Drizzle ORM | Accepted *(revised)* | 2026-07-14 | `persistence-postgres/*` | 0007, 0013, 0017 | v1 + review update | High | Real, working for two contexts (`identity`, `governance`); partitioning, HA, PII handling added by review. |
| [0013](docs/adr/0013-tenancy-isolation-tiering.md) | Tenant isolation tiering and deployment topology | Accepted | 2026-07-14 | `ports/tenant-connection-resolver.port.ts` (no adapter yet) | 0009 | v1 | Medium | Every tenant is Pooled-tier today; Silo/Dedicated implementation is SAF-30, gated on a real customer commitment. |

## Observability

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0012](docs/adr/0012-opentelemetry-mandatory.md) | OpenTelemetry as mandatory observability standard | Accepted | 2026-07-14 | `observability`, all four `apps/*` | — | v1 | Medium | Real, working — cross-process trace propagation independently verified against a live Collector. |

## Governance

| ADR | Title | Status | Decision Date | Affected Packages | Related ADRs | Version | Impact | Description |
|---|---|---|---|---|---|---|---|---|
| [0017](docs/adr/0017-data-retention-crypto-shredding.md) | Data retention, partitioned archival, and crypto-shredding | Accepted | 2026-07-14 | `persistence-postgres/governance` | 0009, 0015 | v1 | Medium | Partitioning is real (`audit_events`); PII vault/crypto-shredding not yet built — no real PII exists yet to protect. |

## Infrastructure

No ADR is dedicated purely to infrastructure choices — the local-only Docker Compose stack (Postgres, Keycloak, OPA, otel-collector; no Redis/MinIO) follows directly from ADR-0001 (monorepo tooling) and ADR-0003 (modular-monolith-first, no premature service extraction) rather than requiring its own decision record. See `infra/README.md` for the reviewed, documented reasoning behind exactly which services are included.

---

## Current ADR Statistics

| Status | Count |
|---|---|
| Accepted | 22 |
| Superseded | 0 |
| Deprecated | 0 |
| Draft | 0 |
| Rejected | 0 |
| Pending | 0 |
| **Total** | **22** |

Six ADRs (0006, 0007, 0008, 0009) carry a **Review update** section from the principal-architect self-review — read those before treating the original Decision section as final. Six more (0013–0018) were added fresh by that same review. See [13-principal-architect-self-review.md](docs/architecture/13-principal-architect-self-review.md) for the full rationale behind both.

No ADR has ever been superseded, deprecated, or rejected as of this baseline — every decision made in Sprint 0 has held.
