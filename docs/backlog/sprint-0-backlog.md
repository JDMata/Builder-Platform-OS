# Sprint 0 Backlog

Goal: prove every architectural seam in [docs/architecture/](../architecture/) exists, is enforced by CI, and boots locally — with **zero SAP-specific logic and zero real agent/generation behavior**. Definition of done for the sprint: `docker compose up` brings up all services healthy, `pnpm turbo run lint typecheck test build` is green, and every fitness function in [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md) is wired and passing against the empty scaffolds.

Tickets are grouped by theme; sequence roughly follows the numbered order (later tickets depend on earlier ones).

## Foundation
- **SAF-1** — Initialize monorepo: pnpm workspace, Turborepo pipeline, root `tsconfig.base.json`, Changesets config.
- **SAF-2** — Shared ESLint + Prettier config package; `dependency-cruiser.config.cjs` encoding the layering rules from [ADR-0002](../adr/0002-hexagonal-clean-layering.md).
- **SAF-18** — `CONTRIBUTING.md`, `CODEOWNERS`, PR template (with the `needs-adr` checklist item from [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)).
- **SAF-19** — Architecture fitness CI checks: banned-SAP-keyword guard, plugin-import-boundary dependency-cruiser rule, package-README-required check.

## Core packages (contracts before implementations)
- **SAF-7** — `packages/ports`: define all port interfaces (`LlmProviderPort`, `McpConnectionPort`, `EventBusPort`, `Repository<T>`, `ObjectStorePort`, `SecretsVaultPort`, `WorkflowEnginePort`, `PolicyEnginePort`) — types only, no implementation.
- **SAF-8** — `packages/domain/*` skeletons for all ten bounded contexts ([02-domain-model.md](../architecture/02-domain-model.md)): one example aggregate + one unit test per context, proving the zero-dependency rule.
- **SAF-9** — `packages/llm-core` + `packages/llm-adapters/anthropic` stub returning a typed mocked response; contract test in `testing-kit` run against it.
- **SAF-10** — `packages/mcp-core` + `packages/mcp-adapters/stdio` stub; contract test.
- **SAF-11** — `packages/events-core` (CloudEvents envelope, outbox contract) + `packages/events-adapters/postgres-outbox` skeleton; contract test proving a trivial event round-trips through Postgres.
- **SAF-12** — `packages/plugin-sdk` contract (manifest + lifecycle interface) + one empty example plugin (`plugins/fiori-generator`, `generate()` returns `[]`) + contract test.
- **SAF-20a** — `packages/testing-kit`: shared fixtures + the contract-test harness used by SAF-9/10/11/12.

## Data & infra
- **SAF-13** — `infra/docker-compose`: Postgres, Redis, MinIO, OpenTelemetry Collector, Keycloak (dev IdP).
- **SAF-14** — Drizzle schema + first migration for `identity` and `governance` schemas only ([09-database-proposal.md](../architecture/09-database-proposal.md)); RLS policy written and tested against seed data.
- **SAF-16** — OpenTelemetry SDK wiring (`packages/observability`) in one app, exporting traces to the Collector, visible end to end.

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
- **SAF-22** — Architecture review checkpoint: walk every ADR in [docs/adr/](../adr/) with stakeholders; move each from `Proposed` to `Accepted` or supersede it before any Sprint 1 feature work is scheduled.

## Explicitly out of scope for Sprint 0
Anything involving real Fiori/CAP/RAP/ABAP/Integration Suite generation, real LLM prompting/reasoning, real MCP server integrations, Temporal, a production IdP, or multi-tenant physical isolation. See [00-vision-and-principles.md](../architecture/00-vision-and-principles.md#explicit-sprint-0-non-goals). If a good idea for one of these surfaces while working the backlog above, add it here as a future-sprint candidate instead of building it now:

- _(none yet — add future-sprint candidates here as they come up)_
