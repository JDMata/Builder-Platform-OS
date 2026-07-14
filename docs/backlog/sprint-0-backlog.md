# Sprint 0 Backlog

Goal: prove every architectural seam in [docs/architecture/](../architecture/) exists, is enforced by CI, and boots locally — with **zero SAP-specific logic and zero real agent/generation behavior**. Definition of done for the sprint: `docker compose up` brings up all services healthy, `pnpm turbo run lint typecheck test build` is green, and every fitness function in [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md) is wired and passing against the empty scaffolds.

> **Revised after principal-architect self-review** ([13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md)): package numbering below (SAF-7/SAF-8) reflects the collapsed one-package-per-context model (ADR-0018). A few items that were originally "later, if needed" are now called out explicitly as Sprint 1/2 blockers, not backlog-someday: durable-execution-engine spike, plugin process isolation, and the Redis Streams event-transport migration. See the "Sprint 1/2 carry-forward" section at the end.
>
> **Extended for execution profiles** ([ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md)): SAF-12's `plugin-sdk` scope grew to include the execution-profile manifest fields, and a new Sprint 1/2 item (SAF-31, `generated-app-kit`) was added — both still contract/scaffolding only, no real plugin logic.
>
> **Extended for the AI Workspace** ([ADR-0020](../adr/0020-ai-workspace-for-agent-definitions.md)): the `.ai/` folder itself (templates + one illustrative agent) is authored now, ahead of any sprint ticket, since it's pure file-based documentation/config with no runtime consumer. Two new Sprint 1/2 items were added (SAF-32 `agent-sdk` + loader, SAF-33 `knowledge-retrieval` MCP server) — building the runtime that would actually load and execute `.ai/` content, not yet in scope.

Tickets are grouped by theme; sequence roughly follows the numbered order (later tickets depend on earlier ones).

## Foundation
- **SAF-1** — Initialize monorepo: pnpm workspace, Turborepo pipeline, root `tsconfig.base.json`, Changesets config.
- **SAF-2** — Shared ESLint + Prettier config package; `dependency-cruiser.config.cjs` encoding the layering rules from [ADR-0002](../adr/0002-hexagonal-clean-layering.md).
- **SAF-18** — `CONTRIBUTING.md`, `CODEOWNERS`, PR template (with the `needs-adr` checklist item from [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)).
- **SAF-19** — Architecture fitness CI checks: banned-SAP-keyword guard, plugin-import-boundary dependency-cruiser rule, package-README-required check.

## Core packages (contracts before implementations)
- **SAF-7** — `packages/ports`: define all port interfaces (`LlmProviderPort`, `McpConnectionPort`, `EventBusPort`, `Repository<T>`, `ObjectStorePort`, `SecretsVaultPort`, `WorkflowEnginePort`, `PolicyEnginePort`, plus post-review additions `RateLimiterPort` and `TenantConnectionResolverPort`) — types only, no implementation. Every port method signature includes `RequestContext` as a parameter ([02-domain-model.md](../architecture/02-domain-model.md)).
- **SAF-8** — `packages/context-<name>/` skeletons for all ten bounded contexts ([02-domain-model.md](../architecture/02-domain-model.md), package granularity per [ADR-0018](../adr/0018-package-granularity-revision.md)): one example aggregate + one unit test per context under `src/domain/`, proving the folder-scoped zero-dependency rule. `context-project` includes the `TargetSystemConnection` aggregate stub ([ADR-0015](../adr/0015-target-system-credential-management.md)).
- **SAF-9** — `packages/llm-core` + `packages/llm-adapters/anthropic` stub returning a typed mocked response; contract test in `testing-kit` run against it.
- **SAF-10** — `packages/mcp-core` + `packages/mcp-adapters/stdio` stub; contract test.
- **SAF-11** — `packages/events-core` (CloudEvents envelope, outbox contract) + `packages/events-adapters/postgres-outbox` skeleton; contract test proving a trivial event round-trips through Postgres.
- **SAF-12** — `packages/plugin-sdk` contract (manifest + lifecycle interface, including the `supportedExecutionProfiles`/`portCategoriesUsed` manifest fields and `targetExecutionProfile` on `GenerationInput` per [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md) — declared in the type contract now, not exercised until a real application-generating plugin exists) + one empty example plugin (`plugins/fiori-generator`, `generate()` returns `[]`) + contract test.
- **SAF-20a** — `packages/testing-kit`: shared fixtures + the contract-test harness used by SAF-9/10/11/12.

## Data & infra
- **SAF-13** — `infra/docker-compose`: Postgres, Redis, MinIO, OpenTelemetry Collector, Keycloak (dev IdP).
- **SAF-14** — Drizzle schema + first migration for `identity` and `governance` schemas only ([09-database-proposal.md](../architecture/09-database-proposal.md)); RLS policy written and tested against seed data; `governance.audit_event` created as a monthly-partitioned table from this first migration ([ADR-0009 revision](../adr/0009-postgresql-schema-per-context-drizzle.md)).
- **SAF-16** — OpenTelemetry SDK wiring (`packages/observability`) in one app, exporting traces to the Collector, visible end to end.
- **SAF-23** *(new — review)* — Tenant-isolation fitness function: automated test suite that varies `RequestContext.tenantId` against fixed seed data and asserts every repository rejects cross-tenant reads, wired into CI ([12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md) R11).

## Apps (composition roots)
- **SAF-3** — `apps/web`: Next.js skeleton, health/status page, BFF session-cookie handling stub.
- **SAF-4** — `apps/api-gateway`: skeleton with health endpoint, wired to `auth-core` for request AuthN.
- **SAF-5** — `apps/orchestrator`: skeleton wiring `llm-core`, `mcp-core`, `events-core`, and the plugin loader together at the composition root — proving the dependency-injection pattern from [10-coding-standards-and-naming.md](../architecture/10-coding-standards-and-naming.md).
- **SAF-6** — `apps/worker`: skeleton consuming a BullMQ queue, invoking the `plugin-sdk` loader against the empty example plugin.

## Auth & workflow skeletons
- **SAF-17** — `packages/auth-core`: session handling against dev Keycloak, `PolicyEnginePort` + minimal OPA adapter loading one example policy bundle.
- **SAF-8b** — `WorkflowEnginePort` in-house adapter skeleton (Postgres run/step tables, BullMQ dispatch stub) + contract test proving a trivial two-step workflow round-trips ([07-workflow-engine.md](../architecture/07-workflow-engine.md)).

## CI/CD
- **SAF-15** — `.github/workflows/ci.yml`: lint, typecheck, unit test, contract test, build, security scan stages against the empty scaffolds; deploy stages defined and pointed at a throwaway dev target.

## Closing the sprint
- **SAF-21** — Sprint 0 demo: `docker compose up` → all services report healthy; `pnpm turbo run lint typecheck test build` green; each fitness function has at least one deliberately-broken test case proving it actually fails the build when violated (not just passes when everything is correct).
- **SAF-22** — Architecture review checkpoint: walk every ADR in [docs/adr/](../adr/) — including the six added and four amended by the principal-architect self-review — with stakeholders; move each from `Proposed` to `Accepted` or supersede it before any Sprint 1 feature work is scheduled.

## Sprint 1/2 carry-forward (elevated from "someday" by the self-review — not Sprint 0 scope, but no longer indefinitely deferred)
- **SAF-24** — Timeboxed spike: stand up Temporal (or an equivalent durable-execution engine) against the `WorkflowEnginePort`, alongside the in-house adapter, and make the build-vs-adopt call on real data ([ADR-0008 revision](../adr/0008-workflow-engine-in-house-first.md)).
- **SAF-25** — Plugin process/container isolation (CPU/memory/time quotas, no default network egress) — required before the first plugin with real generation logic ships, not just before third-party plugins ([ADR-0006 revision](../adr/0006-plugin-architecture.md)).
- **SAF-26** — `events-adapters/redis-streams` adapter, replacing Postgres NOTIFY as the event fan-out transport before real event volume arrives ([ADR-0007 revision](../adr/0007-event-driven-transactional-outbox.md)).
- **SAF-27** — Shared resilience wrapper (circuit breaker/retry/bulkhead, Redis-backed state) in `llm-core`/`mcp-core`, applied before onboarding enough concurrent workflow load to run multiple `orchestrator`/`worker` replicas ([ADR-0016](../adr/0016-mandatory-resilience-patterns.md)).
- **SAF-28** — `packages/read-models/*` + first projection (e.g., workflow-run status by project) backing the first real dashboard view ([ADR-0014](../adr/0014-cqrs-read-models.md)).
- **SAF-29** — `TargetSystemConnection` implementation: envelope encryption, KMS-backed KEK, just-in-time credential issuance ([ADR-0015](../adr/0015-target-system-credential-management.md)) — required before the first real deployment-to-customer-system capability, not before Sprint 0 closes.
- **SAF-30** — Tenancy tier decision + `TenantConnectionResolverPort` implementation for the first Silo/Dedicated customer commitment ([ADR-0013](../adr/0013-tenancy-isolation-tiering.md)).
- **SAF-31** *(new — execution profiles)* — `packages/generated-app-kit`: the seven generated-application ports (persistence, authentication, authorization, messaging, storage, sap-connectivity, external-api), `local-poc` mock adapters, thin Enterprise-tier adapters wrapping official SAP SDKs, and the shared contract-test suite proving mock/real parity — required before the first application-generating plugin (e.g., `cap-node-generator`) ships real logic. See [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md), [14-execution-profiles.md](../architecture/14-execution-profiles.md).
- **SAF-32** *(new — AI Workspace)* — `packages/agent-sdk`: `AgentDefinition`/`PromptTemplate`/`PolicyRule`/`WorkflowDefinition` TypeScript types + a sync/loader ingesting `.ai/` content into the platform's registries on merge to `main`, plus CI validation (schema lint against each template, banned-content scan for secrets/customer data under `.ai/knowledge/`) — required before any real agent (starting with `requirements-analyst`) can actually run. See [ADR-0020](../adr/0020-ai-workspace-for-agent-definitions.md), [15-ai-workspace.md](../architecture/15-ai-workspace.md).
- **SAF-33** *(new — AI Workspace)* — `knowledge-retrieval` MCP server: indexes `.ai/knowledge/*` content and serves semantic search as a standard MCP tool, subject to the same capability binding and resilience wrapper as any other MCP server ([ADR-0004](../adr/0004-mcp-abstraction-layer.md), [ADR-0016](../adr/0016-mandatory-resilience-patterns.md)).

## Explicitly out of scope for Sprint 0
Anything involving real Fiori/CAP/RAP/ABAP/Integration Suite generation, real LLM prompting/reasoning, real MCP server integrations, a production IdP, or multi-tenant physical isolation. See [00-vision-and-principles.md](../architecture/00-vision-and-principles.md#explicit-sprint-0-non-goals). Note that Temporal adoption is *no longer* indefinitely deferred (see SAF-24) — it's carried forward with an explicit timebox rather than left off this list entirely.
