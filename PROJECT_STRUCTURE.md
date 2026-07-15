# Project Structure

This is the canonical description of the monorepo layout — the single source of truth for "where does this file go." It supersedes the earlier draft at [docs/folder-structure.md](docs/folder-structure.md) (kept only as a pointer here, to avoid two copies of a tree that will otherwise drift apart over 10 years). Reflects the architecture as approved plus the revisions from the principal-architect self-review ([docs/architecture/13-principal-architect-self-review.md](docs/architecture/13-principal-architect-self-review.md)) — package granularity is one package per bounded context (ADR-0018), not one package per layer per context.

Everything under `plugins/` and the `*-adapters` directories is stub-only until a feature sprint gives it real logic — the goal of the current phase is to prove the seams exist and are enforced, not to implement capability. See [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md) and [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md) for the rules this structure exists to enforce.

## Monorepo tree

```
sap-app-factory/
├── .ai/                                   # AI Workspace — version-controlled agent/prompt/policy/workflow/knowledge authoring surface (ADR-0020)
│   ├── agents/                            # One subfolder per specialized agent: agent.md (11 required fields) + CHANGELOG.md
│   ├── prompts/                           # Versioned, immutable prompt text per agent + _shared/ fragments
│   ├── policies/                          # Escalation / approval / tool-permission policy-as-code (escalation/, approval/, tool-permissions/)
│   ├── workflows/                         # Multi-agent WorkflowDefinition sources, versioned
│   ├── knowledge/                         # Retrieval corpus — public/internal/synthetic only, never customer data
│   └── templates/                         # Skeletons for authoring the above consistently — prevents drift across dozens of agents
│
├── apps/                                 # Deployable units only — four total, see ARCHITECTURE_PRINCIPLES.md § Service boundaries
│   ├── web/                              # Next.js control-plane UI (React, TS, Tailwind, UI5 Web Components)
│   ├── api-gateway/                      # BFF + public API, AuthN/AuthZ enforcement point, OIDC relying party
│   ├── orchestrator/                     # Owns Workflow/Agent Orchestration; composition root for llm-core/mcp-core/events-core/plugin loader
│   └── worker/                           # Async job execution (BullMQ consumers, plugin invocations); tenant/workload-class queue partitioning lives here
│
├── packages/
│   ├── context-identity/                 # One package per bounded context — domain + application as folders, not separate packages (ADR-0018)
│   │   └── src/
│   │       ├── domain/                   # Zero framework/third-party deps; folder-scoped dependency-cruiser enforcement
│   │       └── application/              # Depends only on this context's domain/ and packages/ports
│   ├── context-project/                  # Includes Workspace, Project, RepositoryBinding, Environment, TargetSystemConnection (ADR-0015)
│   ├── context-requirements/
│   ├── context-capability-registry/
│   ├── context-workflow/                 # WorkflowRun pins definition/prompt/model versions — see ARCHITECTURE_PRINCIPLES.md § Workflow rules
│   ├── context-llm-gateway/
│   ├── context-mcp-registry/
│   ├── context-generation/
│   ├── context-governance/                # AuditEvent, PolicyRule, ApprovalGate; Risk/Incident/Problem/Change (ADR-0021); PII vault / crypto-shredding concerns (ADR-0017)
│   ├── context-digital-twin/              # DigitalTwinNode/Edge, NodeTypeDefinition/RelationshipTypeDefinition registries, Snapshot — graph structure only, never artifact content (ADR-0021)
│   ├── context-notification/              # NotificationChannel, NotificationEvent (02-domain-model.md) — a library invoked by `worker`, not its own service, until delivery volume/channel count justifies isolating it (04-service-boundaries.md). Resolved during the Sprint 0 exit-gate review: real, scheduled, not yet built — carried forward alongside the other Sprint 1/2 items, not an indefinitely ambiguous gap.
│   │
│   ├── ports/                             # Interfaces only — no implementation, no third-party imports
│   │   ├── llm-provider.port.ts
│   │   ├── mcp-connection.port.ts
│   │   ├── event-bus.port.ts
│   │   ├── repository.port.ts
│   │   ├── object-store.port.ts
│   │   ├── secrets-vault.port.ts
│   │   ├── workflow-engine.port.ts
│   │   ├── policy-engine.port.ts
│   │   ├── rate-limiter.port.ts           # Per-tenant/provider/plugin quotas
│   │   ├── tenant-connection-resolver.port.ts  # Resolves tenant → physical DB/schema/region (ADR-0013)
│   │   ├── request-context.ts             # RequestContext type ({ tenantId, actorId, correlationId, tenancyTier }) threaded through every port method
│   │   ├── graph-store.port.ts            # upsertNode/retireNode/upsertEdge/retireEdge/traverse/snapshot (ADR-0021)
│   │   ├── search-index.port.ts           # Structured + semantic search over Digital Twin nodes and knowledge content (ADR-0021)
│   │   └── capability-resolver.port.ts    # Resolves a Capability to a concrete CapabilityProvider (agent/plugin/human/external-service) — 13th port (ADR-0022)
│   │
│   ├── resilience-kit/                     # Generic, port-agnostic retry/timeout primitive shared by llm-core and mcp-core (ADR-0016) — extracted during SAF-10 to avoid duplicating the algorithm llm-core implemented for SAF-9
│   ├── llm-core/                          # LLM Gateway domain/application logic + shared resilience wrapper (ADR-0016)
│   ├── llm-adapters/
│   │   ├── anthropic/
│   │   ├── openai/
│   │   ├── azure-openai/
│   │   └── bedrock/
│   │
│   ├── mcp-core/                          # MCP Registry domain/application logic + shared resilience wrapper (ADR-0016)
│   ├── mcp-adapters/
│   │   ├── stdio/
│   │   ├── http-sse/
│   │   └── websocket/
│   │
│   ├── events-core/                       # CloudEvents envelope, outbox contract, EventBusPort implementation helpers
│   ├── events-adapters/
│   │   ├── postgres-outbox/               # Default transport (Postgres LISTEN/NOTIFY + outbox table)
│   │   └── redis-streams/                 # Scheduled migration target, not indefinitely deferred (ADR-0007 revision)
│   │
│   ├── persistence-postgres/              # Repository implementations (Drizzle), one module per bounded-context schema
│   │   ├── identity/                      # Tenant repository, RLS proof (SAF-14)
│   │   └── governance/                    # AuditEvent repository, monthly-partitioned-table proof (SAF-14)
│   ├── read-models/                       # Event-fed projections for cross-aggregate/cross-context reporting (ADR-0014) — the ONLY place dashboard/list queries live
│   ├── graph-adapters/
│   │   ├── postgres-age/                  # Default — Apache AGE (Cypher-compatible) on the platform's existing Postgres instance (ADR-0021)
│   │   └── dedicated-graph-engine/        # Future adapter slot (Neo4j/Neptune/managed) — not built until traversal scale demands it
│   ├── search-adapters/
│   │   └── postgres-fts-pgvector/         # Default — Postgres full-text search + pgvector embeddings for semantic search (ADR-0021)
│   ├── object-storage-minio/
│   ├── auth-core/                         # AuthN session handling + PolicyEnginePort + OPA/Cedar adapter
│   │
│   ├── plugin-sdk/                        # The ONLY package allowed to define the CapabilityPlugin contract; execute() seam hides process/container isolation (ADR-0006)
│   ├── generated-app-kit/                 # Versioned runtime dependency FOR GENERATED APPLICATIONS (not the platform itself) — the seven ports (persistence, auth, authz, messaging, storage, sap-connectivity, external-api) + mock and Enterprise adapters + shared contract tests (ADR-0019)
│   │
│   ├── ui-kit/                            # Shared design system (React + UI5 Web Components wrappers)
│   ├── observability/                     # OpenTelemetry SDK setup, shared structured logger, tracing helpers
│   ├── config/                            # Typed env/config loader
│   └── testing-kit/                       # Shared fixtures, contract-test harness for every port/adapter pair
│
├── plugins/                               # SAP-specific capability plugins — OUT of core, dynamically loaded, isolated execution (ADR-0006)
│   ├── fiori-generator/
│   ├── cap-node-generator/
│   ├── cap-java-generator/
│   ├── abap-rap-generator/
│   ├── integration-suite-generator/
│   └── README.md                          # How to author a plugin against plugin-sdk
│
├── infra/
│   ├── docker-compose/                    # postgres, otel-collector, keycloak (dev IdP) — dev/local only. redis/minio deliberately deferred (SAF-13, no scheduled Sprint 0 consumer yet) — see infra/README.md
│   ├── terraform/                         # Environment provisioning (HA Postgres/Patroni, KMS, tenancy-tier infra) — not a Sprint 0 deliverable, placeholder
│   ├── github-actions/                    # Reusable/composite workflow definitions
│   └── otel-collector/                    # Collector config
│
├── docs/
│   ├── architecture/                      # Architecture record: vision, domain model, ADR-adjacent design docs, self-review
│   ├── adr/                               # Architecture Decision Records (see ADR_TEMPLATE.md at root)
│   └── backlog/                           # Sprint backlogs
│
├── tools/
│   ├── scripts/                           # Repo maintenance scripts
│   └── generators/                        # Plop/Hygen templates for new packages/contexts/plugins — consistency by default, not by memory
│
├── .github/workflows/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── dependency-cruiser.config.cjs          # Enforces layering (folder-scoped within a context, package-scoped across ports/adapters/plugins/apps)
│
├── ENGINEERING_PRINCIPLES.md
├── ARCHITECTURE_PRINCIPLES.md
├── CODING_STANDARDS.md
├── SECURITY_BASELINE.md
├── TECHNICAL_DEBT_POLICY.md
├── DEFINITION_OF_DONE.md
├── DEFINITION_OF_READY.md
├── CONTRIBUTING.md
├── ADR_TEMPLATE.md
├── PROJECT_STRUCTURE.md                   # This file
├── BASELINE.md                            # The Sprint 0 architectural baseline (established 2026-07-15, tag sprint0-baseline-v1.0)
├── ARCHITECTURE_DECISION_INDEX.md         # Every ADR in one table — affected packages, related ADRs, impact level
├── PLATFORM_MATURITY.md                   # Maturity matrix — implemented/planned/not-started/deferred, sprint by sprint
├── ARCHITECTURE_FREEZE.md                 # What's frozen, what Sprint 1+ may change freely, what needs an ADR
├── CODEOWNERS
└── README.md
```

## Placement rules (quick reference)

- **"Is this SAP-specific?"** → `plugins/<name>/`. Never any `packages/context-*` folder.
- **"Does this talk to a third-party SDK (LLM, MCP transport, cloud storage, an ORM)?"** → an `*-adapters/<vendor>` package or `persistence-postgres`, behind the matching port. Never imported directly by a context's `src/application/`.
- **"Is this a business rule with no I/O?"** → `packages/context-<name>/src/domain/`.
- **"Is this a use case coordinating domain + ports?"** → `packages/context-<name>/src/application/`.
- **"Is this a runnable process with its own deploy lifecycle?"** → `apps/*`, and it must be listed in [docs/architecture/04-service-boundaries.md](docs/architecture/04-service-boundaries.md).
- **"Is this a cross-aggregate/cross-context read query for a dashboard or list view?"** → `packages/read-models/*`, queried directly — never bent into an aggregate repository call. See [ADR-0014](docs/adr/0014-cqrs-read-models.md).
- **"Does this touch a credential for a customer's own SAP system (not the platform's own operational secrets)?"** → the Connection Management concept in `context-project`, behind `TargetSystemConnection`, never the generic `secrets-vault` port. See [ADR-0015](docs/adr/0015-target-system-credential-management.md).
- **"Is this a cross-cutting interface with no implementation (an abstraction every layer depends on)?"** → `packages/ports/`, never mixed into a context or adapter package.
- **"Is this a port or adapter consumed by a *generated application* at its own runtime (persistence, auth, authz, messaging, storage, SAP connectivity, external APIs)?"** → `packages/generated-app-kit/`, never `packages/ports/` (which is for the platform's own runtime) and never hand-rolled inside a plugin. See [ADR-0019](docs/adr/0019-execution-profiles-for-generated-applications.md).
- **"Does a new bounded context or a new deployable app need scaffolding?"** → run the generator in `tools/generators`, don't hand-write the boilerplate.
- **"Am I defining a specialized AI agent's purpose, permissions, memory, or prompt?"** → `.ai/`, following its templates — never a bare string embedded in application code, and never a database row edited outside PR review. See [ADR-0020](docs/adr/0020-ai-workspace-for-agent-definitions.md).
- **"Am I tracing/relating one artifact to another (a Requirement to a CAP Service, a Deployment to an Incident)?"** → a `DigitalTwinEdge` in `context-digital-twin`, referencing existing aggregates by ID — never a new foreign key bolted onto an unrelated context. See [ADR-0021](docs/adr/0021-project-digital-twin-knowledge-graph.md).
- **"Does a workflow step need to name who/what performs the work?"** → it never does — a `Step` references a `Capability` (`context-capability-registry`), resolved to a `CapabilityProvider` (agent, plugin, human, or external service) via `ports/capability-resolver.port.ts`. See [ADR-0022](docs/adr/0022-capability-model-provider-abstraction.md).

## Why this structure, briefly

Every top-level folder maps to exactly one of the architectural layers in [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md): `apps/` is the composition-root layer, `packages/context-*` is domain+application, `packages/ports` is the abstraction seam, `*-adapters`/`persistence-postgres`/`object-storage-minio` are the adapter layer, `plugins/` is the SAP-specific extension layer kept structurally outside the core, and `packages/read-models`/`context-digital-twin` are the deliberate exceptions to "queries go through aggregate repositories" — both are read-side, event-projected views (tabular and graph-shaped, respectively; see [ADR-0014](docs/adr/0014-cqrs-read-models.md) and [ADR-0021](docs/adr/0021-project-digital-twin-knowledge-graph.md)). If a new file doesn't obviously fit one of these, that's a signal to ask before creating a new top-level convention — see [CONTRIBUTING.md](CONTRIBUTING.md).
