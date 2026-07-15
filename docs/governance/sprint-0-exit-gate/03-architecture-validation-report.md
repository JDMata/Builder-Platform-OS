# 3. Sprint 0 Architecture Validation Report

Each principle below is checked against what's actually built and mechanically enforced — not against what a doc says should eventually be true.

## Clean / Hexagonal Architecture

**Holds.** `dependency-cruiser.config.cjs` mechanically enforces every layer boundary (`domain-no-application`, `domain-no-adapters-or-apps-or-plugins`, `domain-no-ports`, `domain-no-runtime-third-party-deps`, `application-no-cross-context`, `application-no-adapters-or-apps-or-plugins`, `application-no-npm-deps-except-ports`, `adapters-no-application`, plus SAF-19's `plugin-import-boundary`) — 9 rules, `no-circular` included, verified clean across 617 modules / 918 dependencies. Composition roots (`apps/*`, `tools/sprint0-demo`) are the only place a concrete adapter is constructed; every other layer depends only on ports/domain. No drift found.

## Domain-Driven Design

**Holds, with one open inconsistency.** Ten bounded contexts, each with its own domain aggregate(s), following the "no hard delete, archive instead" rule (`Tenant`, `Workspace`, `Role` all use status transitions, never deletion) and the "append-only for cross-cutting audit/compliance data" rule (`AuditEvent`). The one gap: the `Notification` context is described in `02-domain-model.md`/`06-event-model.md` but was never given a package — see [Technical Debt Report](02-technical-debt-report.md) item 11. Everything else matches `PROJECT_STRUCTURE.md`'s canonical tree exactly.

## SOLID

**Holds at the boundaries that matter most.** Dependency Inversion is the load-bearing one here — every port is an interface application code depends on, never a concrete class; Single Responsibility shows in the "extract on second occurrence" discipline applied repeatedly (`resilience-kit`, `events-core`, `createPostgresOutboxEventBus()`) rather than either premature abstraction or copy-paste duplication. Open/Closed is what the plugin/capability model exists to prove: a new plugin or capability provider never requires modifying `orchestrator`/`worker`'s core wiring, only registering into it.

## Event-Driven Architecture

**Holds.** Real transactional outbox (`PostgresOutboxAdapter`), not a message-broker-first design — matches ADR-0007's decision. Versioned, past-tense event types (`workflow.run.completed.v1`) from day one. At-least-once delivery verified directly (SAF-11's `SKIP LOCKED` redelivery test). `tools/sprint0-demo` proves a real subscriber processing a real published event end to end, not just publish-and-forget.

## Plugin Architecture

**Holds, with one stated, tracked gap.** `plugin-sdk`'s `CapabilityPlugin` contract + `execute()` seam is real and contract-tested (`capabilityPluginContractTests`). SAP-specific logic is mechanically confined to `plugins/*` (SAF-19's banned-keyword guard + `plugin-import-boundary` rule, both verified against real injected violations, not just written and trusted). The gap: process/container isolation (ADR-0006's own stated Sprint 1/2 requirement, R17/R25 in the risk register) doesn't exist yet — plugins run in-process. Explicitly not a Sprint 0 requirement; explicitly a hard prerequisite before any plugin runs untrusted, real generation logic.

## Capability-Based Orchestration

**Holds structurally, adapter-incomplete.** `Capability`/`CapabilityProvider` domain model (ADR-0022) is real; `apps/orchestrator`'s plugin-loader registers real capability/provider pairs from a real plugin manifest. `CapabilityResolverPort` exists as a port but has no adapter — Sprint 0's demonstrations (SAF-21) compose the underlying domain resolution function directly, which is honest for "one plugin, one provider" but not yet the adapter-swappable seam the architecture ultimately calls for. See Technical Debt item 4.

## MCP Abstraction / LLM Abstraction

**Holds.** Both ports (`McpConnectionPort`, `LlmProviderPort`) have one real, contract-tested adapter each (`StdioMcpAdapter`, `AnthropicLlmAdapter`), each wrapped by a generic, port-agnostic resilience wrapper (`mcp-core`/`llm-core`, sharing `resilience-kit`'s retry/timeout algorithm — extracted on second occurrence, not duplicated). Neither adapter has ever been called with real network traffic in Sprint 0 (mocked responses) — correct per Sprint 0's explicit non-goals (no real LLM/MCP integrations required).

## Local-First Architecture

**Holds for the platform's own dev loop.** The entire stack (`Postgres`, `Keycloak`, `OPA`, `otel-collector`) runs via one `docker-compose` file with no cloud dependency, verified repeatedly this sprint via full `infra:reset`→`infra:up` cycles. For generated applications, ADR-0019's `local-poc` execution profile (mock adapters, no real cloud SDKs) is the documented mechanism — not yet built (`generated-app-kit`, SAF-31, Sprint 1/2), since no application-generating plugin exists yet to need it.

## Project Digital Twin

**Designed, not yet built — correctly so.** ADR-0021 and `16-project-digital-twin.md` fully specify the model (`DigitalTwinNode`/`DigitalTwinEdge`, provenance/confidence tagging, registry-checked node/relationship types). No implementation exists (`context-digital-twin`, `graph-store.port.ts`, the graph adapter — all SAF-34, Sprint 1/2), and nothing in Sprint 0 needed it to exist. Correctly scoped as design-ahead-of-implementation, not a gap.

## Zero Trust

**Holds for what's built.** Every port method carries an explicit `RequestContext` (tenant, actor, correlation id) rather than relying on ambient state — verified structurally (every port signature) and behaviorally (RLS fail-closed tests, tenant-isolation contract tests). Real OIDC federation (Keycloak dev adapter) with Authorization Code + PKCE, never a platform-managed password. Scoped capability tokens for plugin invocations (05-plugin-architecture.md's stated mechanism) are not yet built — correctly deferred alongside process isolation (same SAF-25 trigger).

## ITIL / PMO Alignment

**Holds structurally.** `AuditEvent` is derived from the event bus from Sprint 0's first persisted context (SAF-14), not bolted on later — real, partitioned, persisted, contract-tested. Separation-of-duties (prod approval requiring a distinct approver) is real, working Rego policy (SAF-17), unit-tested via `opa test`. The full governance data model (`Risk`, `Incident`, `Problem`, `Change`) is domain-modeled (`Risk` since SAF-8) but not all persisted yet — correctly scoped to SAF-36 (Sprint 1/2), since nothing yet generates the events these aggregates would project from.

## DevOps

**Holds, with the one real gap already named.** CI pipeline exists, is internally consistent with the documented stage ordering, and has been verified by running every underlying command locally — but has never executed on a real GitHub Actions runner (Technical Debt item 9). Docker infrastructure is one-command up/reset, verified repeatedly fresh.

## Security

**Holds for Sprint 0's actual attack surface**, with the standard set of Sprint 0-appropriate deferrals (no envelope encryption yet — no target-system credentials exist to protect; no BYOK — no Dedicated-tier tenant exists yet). Full detail in [Security Review](05-security-review.md).

## Overall

No implementation was found to have drifted from an *Accepted* architectural decision. Every deviation found (capability resolver adapter, plugin loader boundary, Notification context) was already self-documented at the point it was created, with a named trigger condition for when it becomes a real gap rather than an acceptable one — the pattern this whole platform's technical-debt discipline is built around.
