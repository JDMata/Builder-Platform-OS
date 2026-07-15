# @sap-app-factory/sprint0-demo

## Purpose
SAF-21 — the Sprint 0 end-to-end vertical-slice demonstration: authenticate → create a tenant, persist tenant-scoped data → create a project → publish an event, process it → execute a capability through the workflow engine → invoke the example plugin → create an artifact → record an audit event → generate correlated telemetry. A leaf script, never imported by anything else — not a library, a runnable demonstration that every seam built this sprint actually holds together, using real components end to end.

## Ports
None. This package doesn't implement a port — it's a composition root exactly like `apps/*`, constructing real adapters (`TenantRepository`, `AuditEventRepository`, `PostgresOutboxAdapter`, `InMemoryWorkflowEngineAdapter`) and calling them directly, the same pattern every app in this monorepo follows.

## Running it
Requires `infra/docker-compose` running (`pnpm run infra:up`) and the monorepo built (`pnpm run build`):

```sh
pnpm --filter @sap-app-factory/sprint0-demo run demo
```

## What's real, and what's a documented Sprint 0 gap
Every step uses a real, already-built component — no fakes, no mocks, and no real SAP/BTP/LLM/MCP integrations (none exist yet, none are needed for this scenario):

- **Authenticate**: real Keycloak, a real signed access token via Direct Grant (the same dev-only mechanism `auth-core`'s own test suite uses — see its README's "Sprint 0 limitation" section for why: a real Authorization Code needs a browser this environment doesn't have), real signature validation against the IdP's live JWKS, a real sealed session cookie.
- **Tenant**: real `TenantRepository`, real Postgres, real RLS — round-tripped (`save()` then `findById()`), not just written.
- **Project**: `context-project`'s `Workspace` domain aggregate, in-memory only — no `persistence-postgres/project` package exists yet (the same documented Sprint 0 gap as `context-governance`'s `Risk`).
- **Publish + process an event**: the real `PostgresOutboxAdapter` (transactional outbox, `LISTEN`/`NOTIFY` relay) — a real subscriber registered before publishing, awaited via a promise the handler resolves, not a fixed delay.
- **Execute a capability through the workflow engine**: `context-capability-registry`'s real `defineCapability`/`registerCapabilityProvider`/`resolveCapabilityProvider` domain functions (the same logic `apps/orchestrator`'s `plugin-loader.ts` uses) resolve the one registered provider, then a real `InMemoryWorkflowEngineAdapter` run is started and advanced with the result. No `CapabilityResolverPort` adapter exists yet (`packages/ports`'s `CapabilityResolverPort` has zero implementations) — this script composes the same real domain functions an adapter would eventually wrap, rather than building that adapter as a byproduct of a demonstration script.
- **Invoke the example plugin**: `plugin-sdk`'s real `execute()` seam driving `FioriGeneratorPlugin`'s full lifecycle — the same call `apps/worker`'s `invoke-plugin.ts` makes.
- **Create an artifact**: `context-generation`'s real `createArtifact()`, converting the plugin's `GeneratedArtifact` DTO into a real `Artifact` domain object. `FioriGeneratorPlugin.generate()` was changed (SAF-21) to return one fixed placeholder artifact instead of `[]` — still no real Fiori generation logic, just enough content for this step to have something real to convert. Not persisted — no `persistence-postgres/generation` package exists yet, same gap as `Workspace`.
- **Record an audit event**: real `AuditEventRepository`, real Postgres, the real monthly-partitioned table — round-tripped, not just written.
- **Correlated telemetry**: the whole run executes inside one root span (`withSpan`); every `logger.info()` call carries the same `correlationId`. The script prints both the `correlationId` and the root span's `traceId` at the end — grep the OTel Collector's `debug` exporter output for either to see every span this run produced.

## A real bug found and fixed while building this
`drizzle-orm`'s `migrate()` resolves `migrationsFolder` relative to `process.cwd()`, never to the importing module's own location — this script computes absolute paths instead (`src/run.ts`), since running it via `pnpm --filter ... run demo` sets `cwd` to this package's own directory, not `persistence-postgres/identity`'s or `.../governance`'s. Also applies the same per-package `migrationsTable` fix SAF-15 found (drizzle-orm's shared, unscoped default tracking table makes the second package's migration silently no-op) — this script runs both packages' migrations itself, since no other production code applies them outside each package's own test suite.
