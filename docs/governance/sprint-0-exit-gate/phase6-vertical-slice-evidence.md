# Phase 6 — Sprint 0 Vertical Slice Validation Evidence

Executed fresh for this audit: `infra:reset` → `infra:up` → wait for real Postgres/Keycloak health → `pnpm run demo:sprint0`. Every step below succeeded; the full transcript follows the checklist.

| Step | Result |
|---|---|
| Authentication | ✅ Real Keycloak, real signed token, real signature validation against live JWKS |
| Tenant creation | ✅ Real Postgres, real RLS, round-tripped (`save()` then `findById()`) |
| Project creation | ✅ `Workspace` domain aggregate created |
| Workflow execution | ✅ Real `InMemoryWorkflowEngineAdapter` run started and advanced to `completed` |
| Capability discovery | ✅ `generate-fiori-elements-app` resolved to provider `fiori-generator` |
| Plugin execution | ✅ Real `execute()` seam, full plugin lifecycle, 1 artifact produced |
| Event publication | ✅ `workspace.created.v1` published via the real transactional outbox |
| Outbox | ✅ Real `PostgresOutboxAdapter`, real `LISTEN`/`NOTIFY` relay |
| Repository | ✅ `TenantRepository` and `AuditEventRepository`, both real Postgres round-trips |
| Audit | ✅ Real `AuditEvent`, real partitioned table, round-tripped |
| Telemetry | ✅ One correlation ID and one trace ID threaded through every step; independently confirmed reaching the OTel Collector |
| Artifact generation | ✅ Real `Artifact` domain object created from the plugin's `GeneratedArtifact` |

**Every step succeeded. No fallback, no fake, no skipped step.**

## Full transcript (this audit's own run, not a prior session's)

```
[0] Applying identity/governance migrations (idempotent — safe to run repeatedly)

[1] Authenticate against real Keycloak
    real signed token validated, sealed session cookie: fjn0b3XtXAxVrF4Z.zmFrOVG...
{"time":"2026-07-15T16:14:40.344Z","level":"info","service":"sprint0-vertical-slice-demo","message":"authenticated","correlationId":"d5b42dfb-fe90-4d89-8693-ec2c738934db","tenantId":"default-tenant","actorId":"f4c28369-1e02-480d-873d-e05a8d135aba","traceId":"656ebdf55b03825f049568758528c3b5","spanId":"8e7eadd411a79e7b"}

[2] Create and persist a Tenant (real Postgres, RLS-scoped)
    persisted and re-read Tenant tenant-0b23ebb9-b102-4db0-abbf-8c9f0ac09610 (Sprint 0 Demo Tenant)

[3] Create a project (Workspace domain aggregate)
    created Workspace workspace-570400f9-bcb9-40bd-9e3c-dba0b009c7b6 (status: active)

[4] Publish a domain event and process it via a real subscriber
    subscriber received workspace.created.v1 for workspace workspace-570400f9-bcb9-40bd-9e3c-dba0b009c7b6

[5] Execute a capability through the workflow engine
    capability "generate-fiori-elements-app" resolved to provider "fiori-generator"
    workflow run run-1 started

[6] Invoke the example plugin via plugin-sdk's execute() seam
    plugin produced 1 GeneratedArtifact(s)
    workflow run run-1 status: completed

[7] Create a real Artifact from the plugin's GeneratedArtifact
    created Artifact artifact-dd09aa8a-aa1e-4731-a1c9-d1275f0d8ffa (type: fiori-elements-app, status: draft)

[8] Record an audit event (real Postgres, partitioned table)
    persisted and re-read AuditEvent audit-7845dd5e-459f-4664-bb0e-b221e4bffc89 (sprint0.vertical-slice.completed)

[9] Correlated telemetry
    correlationId=d5b42dfb-fe90-4d89-8693-ec2c738934db
    traceId=656ebdf55b03825f049568758528c3b5

Sprint 0 vertical-slice demo completed successfully.
```

## Independent telemetry confirmation

`docker compose logs otel-collector` was queried immediately after this run for the same trace ID; **2 spans** matching `Trace ID: 656ebdf55b03825f049568758528c3b5` were found in the Collector's own `debug` exporter output — the root `sprint0.vertical-slice` span and its child `sprint0.telemetry-check` span, correctly parented. Telemetry claimed by the script's own log line was independently verified to have actually reached the Collector, not just been printed.

## Repeatability

This exact sequence (fresh reset → demo run) was executed **three separate times** across this session's SAF-21 story and this exit-gate audit, each producing different correlation/trace IDs and different generated UUIDs but identical step-by-step success. Idempotency (running the demo twice without a reset in between) was also verified separately during SAF-21.
