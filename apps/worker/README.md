# @sap-app-factory/worker

## Purpose
Executes queued steps: plugin invocations, generation jobs, notification delivery ([04-service-boundaries.md](../../docs/architecture/04-service-boundaries.md)). Third app built in this sequence, reusing `api-gateway`/`orchestrator`'s composition-root shape.

## Sprint 0 scope (SAF-6), and a deliberate deviation from this story's original wording
The backlog line for this story said "consuming a BullMQ queue." That's not what got built, on purpose: [05-plugin-architecture.md](../../docs/architecture/05-plugin-architecture.md) § Isolation & Zero Trust is explicit that Sprint 0 ships plugin execution **in-process**, directly, behind an `execute()` seam — no real queue — "so process-level isolation... can be introduced later without changing plugin authors' code." No Redis exists in `infra/docker-compose` either (SAF-13's own reviewed decision). Building a real BullMQ consumer now would mean standing up infrastructure two already-reviewed stories deliberately deferred.

What this app actually does:
- `POST /invoke` drives one real, in-process plugin execution end to end: HTTP request → `invoke-plugin.ts`'s `invokePlugin()` → `plugin-sdk`'s `execute()` seam → the loaded plugin's full lifecycle (`activate`/`validate`/`generate`/`deactivate`) → a real HTTP response with whatever artifacts came back.
- Every invocation publishes `generation.job.started.v1`, then `.completed.v1` or `.failed.v1`, through the real `PostgresOutboxAdapter` — structural per 05-plugin-architecture.md ("observability and audit are structural, not opt-in per plugin"), not something a caller has to remember to do.
- `GET /health` reports the loaded plugin(s).

**Deferred, not forgotten:** real request AuthN (`buildRequestContext()` in `server.ts` is a fixed dev context, same deferral `api-gateway` already documents, waiting on SAF-17) and the real queue/BullMQ consumer (Sprint 1/2, once a real need for async dispatch — as opposed to a synchronous HTTP call driving one invocation — actually exists).

## Tracing and logging (SAF-16)
`main.ts` calls `startTracing()` first. `invoke-plugin.ts`'s `invokePlugin()` is wrapped in a span (`withSpan`) carrying the one real `executionId` any Sprint 0 call path has — the generation job's own id — alongside `correlationId`/`tenantId`/`actorId` from the request context; the shared logger emits a structured line for job-started/completed/failed, every field redacted before being written (so a plugin's own failure message can be logged without risk).

## Composition root
Smaller than `orchestrator`'s — no LLM/MCP ports, no workflow engine, since this app's job is executing plugin invocations, not orchestrating a workflow run. `build-dependencies.ts`'s `buildDependencies(eventBus)` follows the same "the one real-resource dependency is a parameter, everything else constructed inside" shape. `main.ts` calls the same `createPostgresOutboxEventBus()` helper `orchestrator` uses (extracted into `adapter-events-postgres-outbox` once this, the second app, needed it).

## Testing
`invoke-plugin.spec.ts` proves the started/completed/failed event sequence with a stub plugin and a recording `EventBusPort` fake. `server.spec.ts` proves the HTTP surface, including that `POST /invoke` really drives a plugin invocation and really publishes events — no live Postgres needed for this app's own unit tests, the same reasoning `orchestrator`'s README gives.
