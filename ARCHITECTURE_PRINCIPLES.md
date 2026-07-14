# Architecture Principles

This document states the enforceable rules behind [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md). Where a rule has a deeper rationale or a full design, it links to [docs/architecture/](docs/architecture/) or [docs/adr/](docs/adr/) — this document is the quick-reference rulebook, not the rationale.

## Service boundaries

- Four deployable units exist: `web`, `api-gateway`, `orchestrator`, `worker`. Anything else is a library package consumed by one of these.
- A module graduates to its own service only when it meets one of four documented criteria (independent scaling need, independent release cadence/ownership, a different runtime requirement, or reuse by a second host process) — never "it feels like it should be its own thing."
- LLM Gateway and MCP Registry are named as the first likely extraction candidates, with an explicit trigger metric, not an open-ended "maybe someday."
- Full detail: [04-service-boundaries.md](docs/architecture/04-service-boundaries.md), [ADR-0003](docs/adr/0003-modular-monolith-first.md).

## Package rules

- One package per bounded context (`packages/context-<name>`), with internal `src/domain/` and `src/application/` folders — not a package per layer per context. A context splits into two packages only when it needs independent release cadence.
- `ports/*`, `*-adapters/*`, `plugin-sdk`, and `plugins/*` remain separate packages — the ports/adapters seam is exactly the boundary that must stay mechanically enforced, unlike the domain/application split within a context.
- No package is private-by-neglect: every package has a README stating its purpose and the port(s) it implements or depends on, checked in CI.
- Full detail: [03-monorepo-and-packages.md](docs/architecture/03-monorepo-and-packages.md), [ADR-0018](docs/adr/0018-package-granularity-revision.md).

## Dependency rules

- `context-<name>/src/domain/**` depends on nothing internal outside its own context's domain folder, and no third-party runtime dependency.
- `context-<name>/src/application/**` depends only on its own context's `src/domain/**` and on `ports/*`.
- `*-adapters/*` and `plugins/*` may depend on `ports/*`, `plugin-sdk`, third-party SDKs, and `testing-kit` (dev only) — never on any context's `src/application/**`, and never on another vendor's adapter.
- Only `apps/*` may depend on concrete adapters and wire them to ports (composition root pattern — dependency injection happens at the edge, never inside domain/application code).
- Only `apps/orchestrator` and `apps/worker` may depend on `plugins/*`, and only through `plugin-sdk`'s loader interface — never a named import of a specific plugin.
- All of the above is enforced by `dependency-cruiser`, folder-scoped where a context is one package, package-scoped elsewhere — a CI-failing check, not a review-time reminder. Full detail: [ADR-0002](docs/adr/0002-hexagonal-clean-layering.md).

## Event rules

- Cross-context communication is event-only. No context reads another context's tables, and no cross-schema foreign key ever exists.
- Every domain-meaningful state change is written to the outbox table in the same transaction as the aggregate change (transactional outbox), never a dual write.
- Event envelopes are versioned (`<context>.<aggregate>.<event>.v<N>`); breaking schema changes ship as a new version consumed alongside the old one, never an in-place mutation.
- Consumers are idempotent, keyed on event ID — delivery is at-least-once, never assumed exactly-once.
- Transport: Postgres outbox + LISTEN/NOTIFY for Sprint 0/1, migrating to Redis Streams once event volume requires it (already scheduled, not speculative) — consumers depend on `EventBusPort`, never on the transport directly.
- Full detail: [06-event-model.md](docs/architecture/06-event-model.md), [ADR-0007](docs/adr/0007-event-driven-transactional-outbox.md).

## Workflow rules

- `orchestrator` depends only on `WorkflowEnginePort` — never on a concrete workflow engine's SDK or execution model.
- A `WorkflowRun` pins the exact `WorkflowDefinition` version, `PromptTemplate` version, resolved `ModelProfile` mapping, and resolved `CapabilityProvider` (per step) it started with — never "whatever is current" — so any run is reproducible and auditable later.
- Workflow steps are generic (`capability-request`, `human-approval`) and reference a `Capability` by ID, resolved through the Capability & Plugin Registry to a concrete provider — the engine never interprets what a step's capability actually does, and the workflow definition never names a specific agent or plugin directly (see Capability model rules, below).
- The build-vs-adopt decision between an in-house engine and a proven durable-execution engine (Temporal or equivalent) is made on a fixed timebox against real data, not deferred indefinitely.
- Full detail: [07-workflow-engine.md](docs/architecture/07-workflow-engine.md), [ADR-0008](docs/adr/0008-workflow-engine-in-house-first.md).

## Plugin rules

- Every SAP-specific capability is a `CapabilityPlugin` conforming to `plugin-sdk` — manifest + `activate/validate/generate/deactivate` lifecycle. No exceptions for "just this one small case."
- Core code (`domain/*`, `application/*`, `orchestrator`, `worker`) has no import path to a named plugin — only to the loader/registry abstraction. A banned-keyword CI guard backs up the dependency-cruiser rule as defense in depth.
- Plugin invocations run under a scoped capability token limiting which MCP tools and LLM model profiles they may call, derived from the plugin's declared manifest requirements — least privilege, not ambient access.
- Any plugin with real generation logic (not the empty Sprint 0 stubs) runs under process/container isolation with CPU/memory/time quotas and no default network egress — this applies to first-party plugins too, not only third-party ones.
- Full detail: [05-plugin-architecture.md](docs/architecture/05-plugin-architecture.md), [ADR-0006](docs/adr/0006-plugin-architecture.md).

## MCP abstraction

- Application/workflow code depends only on `ports/mcp-connection.port.ts`, never on a specific MCP client SDK or transport.
- Transport-specific adapters (`stdio`, `http-sse`, `websocket`) live in `mcp-adapters/*` and are the only packages allowed to import an MCP client library.
- Every MCP call goes through a shared resilience wrapper (timeout, retry, circuit breaker, bulkhead) with circuit state shared across replicas via Redis — no adapter reimplements this individually.
- Capability bindings (which plugin/workflow step may call which tool) are enforced at this layer — the Zero Trust control point for tool access.
- Full detail: [ADR-0004](docs/adr/0004-mcp-abstraction-layer.md), [ADR-0016](docs/adr/0016-mandatory-resilience-patterns.md).

## LLM abstraction

- Application/workflow code depends only on `ports/llm-provider.port.ts` and references models by logical `ModelProfile` name (e.g. `"reasoning-large"`), never a concrete provider/model string.
- Provider-specific adapters (`anthropic`, `openai`, `azure-openai`, `bedrock`, ...) are the only packages allowed to import a provider SDK.
- `ModelProfile`s may declare an ordered fallback chain, evaluated automatically on circuit-open, so a single provider outage doesn't fail every workflow depending on it.
- Cost governance (`CostBudget`, `UsageRecord`) is enforced at this layer, uniformly across providers.
- Full detail: [ADR-0005](docs/adr/0005-llm-abstraction-layer.md), [ADR-0016](docs/adr/0016-mandatory-resilience-patterns.md).

## Persistence abstraction

- Application code depends only on `Repository<T>` and other `ports/*` interfaces — never on Drizzle, a raw SQL client, or any ORM type directly.
- Each context's `persistence-postgres/<context>` module is the only place SQL/Drizzle schema is written, scoped to that context's Postgres schema; no cross-schema foreign key ever exists.
- Cross-aggregate/cross-context reporting queries go through `packages/read-models/*` projections, never through write-side repositories bent to fit a dashboard query.
- Object/blob data (generated artifacts) is stored via `ports/object-store.port.ts` (MinIO adapter today, S3/Blob/GCS-compatible later) — Postgres stores only the reference, never the blob.
- Given a tenant ID, the physical database/schema/region to use is resolved through `ports/tenant-connection-resolver.port.ts`, never hardcoded — this is what makes tenancy tiering (Pooled/Silo/Dedicated) an operational decision, not a code change.
- Full detail: [09-database-proposal.md](docs/architecture/09-database-proposal.md), [ADR-0009](docs/adr/0009-postgresql-schema-per-context-drizzle.md), [ADR-0013](docs/adr/0013-tenancy-isolation-tiering.md), [ADR-0014](docs/adr/0014-cqrs-read-models.md).

## Execution profile rules (generated applications)

- These rules govern applications the platform *generates* (via plugins), not the platform's own runtime — see the scope note in [ADR-0019](docs/adr/0019-execution-profiles-for-generated-applications.md).
- Every application-generating plugin scaffolds its output behind exactly seven ports: Persistence, Authentication, Authorization, Messaging, Storage, SAP Connectivity, External APIs. The generated application's domain/business logic depends only on these — no SAP-specific or infrastructure-specific code in a generated app's domain layer, the same rule the platform holds its own core to.
- An `ExecutionProfile` is a per-port-category adapter selection, not three fixed hardcoded modes. `local-poc` and `enterprise` are the pure presets (all-mock, all-real); `hybrid` is any non-uniform mix of the two — it requires no separate mechanism.
- Adapter implementations for the seven ports live in one shared, versioned package (`packages/generated-app-kit`), consumed by every application-generating plugin — never reimplemented per plugin.
- Enterprise-tier SAP Connectivity bindings resolve real credentials through `TargetSystemConnection` ([ADR-0015](docs/adr/0015-target-system-credential-management.md)) — never a second credential mechanism.
- Every port's mock and real adapters must pass the same shared contract-test suite — this is what makes "works in Local POC" a reliable predictor of "works in Enterprise," not an assumption.
- Full detail: [14-execution-profiles.md](docs/architecture/14-execution-profiles.md), [ADR-0019](docs/adr/0019-execution-profiles-for-generated-applications.md).

## Agent definition rules (`.ai/` workspace)

- Every specialized AI agent is defined as a file (`.ai/agents/<id>/agent.md`), not a database row edited outside change control — reviewed, versioned, and rolled back exactly like code.
- An agent definition declares all eleven required fields (Purpose, Responsibilities, Allowed MCP tools, Inputs, Outputs, Memory, Escalation rules, Approval requirements, Context loading strategy, Prompt version, Tool permissions) using the standard template — never a bare prompt string with implicit behavior.
- Memory is scoped (none/run/project/tenant) and persisted only through the existing `Repository<T>` port and `RequestContext` — never a private store an agent alone owns.
- Escalation, approval, and tool-permission rules are policy-as-code (`.ai/policies/*`), referenced by id — never freeform conditions embedded in a prompt.
- Tool permissions reuse and generalize the scoped capability token mechanism already established for plugins ([ADR-0006](docs/adr/0006-plugin-architecture.md)) — never a second, agent-specific permission model.
- An `AgentDefinition` is never named directly by a workflow `Step` — it declares `providesCapabilities: CapabilityId[]` and is resolved as one possible provider of a capability (see Capability model rules, below). A `WorkflowRun` still pins the exact `AgentDefinition` version it resolved to, never "whichever version is current."
- Full detail: [15-ai-workspace.md](docs/architecture/15-ai-workspace.md), [ADR-0020](docs/adr/0020-ai-workspace-for-agent-definitions.md).

## Capability model rules

- A workflow `Step` requests a **capability** (e.g. "Generate Functional Specification") — it never names a specific agent, plugin, or any other provider directly. `Step` has two kinds: `capability-request` and `human-approval`.
- A `Capability` is provider-agnostic: inputs, outputs, preconditions, required permissions, approval requirements, required context, expected `ArtifactType`s, and quality gates — all as policy-as-code references, never a hardcoded provider.
- A `CapabilityProvider` is one eligible fulfiller of a capability — `providerType: 'agent' | 'plugin' | 'human' | 'external-service'` — ordered by priority into an automatic fallback chain, the same shape as `ModelProfile`'s fallback chain ([ADR-0016](docs/adr/0016-mandatory-resilience-patterns.md)).
- "Implementation" and "Resources" in the capability-resolution chain are never new aggregates — they are the provider's own already-existing fields (`AgentDefinition`'s pinned prompt version and allowed MCP tools, or `PluginManifest`'s version and required MCP/LLM capabilities).
- Resolving a capability to a concrete provider crosses a context boundary (Workflow → Capability & Plugin Registry) through `ports/capability-resolver.port.ts` — never a direct cross-context import. A `WorkflowRun` pins the exact resolved provider (`providerType`, `providerId`, `providerVersion`) at the moment it's chosen, per aggregate design rule 6.
- `CapabilityProvider` (Capability & Plugin Registry — who fulfills a capability) is not `CapabilityBinding` (MCP Registry — which plugin/step may call which tool) — the two names are easy to confuse and describe different things.
- Full detail: [18-capability-model.md](docs/architecture/18-capability-model.md), [ADR-0022](docs/adr/0022-capability-model-provider-abstraction.md).

## Digital Twin & traceability rules

- Every project's Digital Twin is a graph **overlay**, never a second source of truth — a `DigitalTwinNode` stores a `sourceRef` and minimal display fields only; the real data stays owned by whichever context produced it (`Requirement`, `Artifact`, `Deployment`, `Risk`, ...).
- The graph is populated exclusively by projecting domain events already emitted by other contexts — never written to directly by a command-side use case.
- Node types and relationship types are opaque, registry-declared strings (`NodeTypeDefinition`, `RelationshipTypeDefinition`) — never a hardcoded core enum, and never used before being registered. This is the same pattern already applied to `ArtifactType` and `PortCategory`.
- Every edge carries `provenance: 'declared' | 'ai-inferred'`. An inferred edge is never treated as ground truth for impact analysis or traceability-completeness checks until confirmed via `ReviewGate`.
- Nodes and edges are never hard-deleted — a node's state is an append-only version history; an edge that becomes invalid is marked `retired`, never removed.
- Graph storage lives behind `ports/graph-store.port.ts` — Apache AGE on the platform's existing Postgres instance by default, with a dedicated graph engine as a documented future adapter, never a hardcoded dependency on one graph technology.
- Full detail: [16-project-digital-twin.md](docs/architecture/16-project-digital-twin.md), [ADR-0021](docs/adr/0021-project-digital-twin-knowledge-graph.md).

## Authentication abstraction

- The platform is never an identity provider. `api-gateway` federates to an external OIDC provider (Entra ID, Okta, SAP IAS, Keycloak) via Authorization Code + PKCE; no passwords are ever stored.
- `web` never receives raw tokens in browser JS — `api-gateway` is the BFF and session boundary.
- Service-to-service calls carry short-lived, scoped workload identity tokens, never static shared secrets.
- Authorization logic is externalized behind `ports/policy-engine.port.ts` (OPA/Cedar), evaluated at both `api-gateway` (coarse) and `application/*` (fine-grained, resource-scoped) — never scattered `if (user.role === ...)` conditionals in business code.
- Every port method takes an explicit `RequestContext` (`tenantId`, `actorId`, `correlationId`, `tenancyTier`) — tenant scoping is an application-layer control, not solely a database RLS setting.
- Platform secrets (`ports/secrets-vault.port.ts`) and customer target-system credentials (`TargetSystemConnection`, envelope-encrypted, optionally BYOK) are deliberately different concepts with different threat models — never conflated.
- Full detail: [08-authentication-and-rbac.md](docs/architecture/08-authentication-and-rbac.md), [ADR-0010](docs/adr/0010-oidc-federation-zero-trust.md), [ADR-0011](docs/adr/0011-hybrid-rbac-abac-policy-as-code.md), [ADR-0015](docs/adr/0015-target-system-credential-management.md).
