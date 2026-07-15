# @sap-app-factory/orchestrator

## Purpose
Owns Workflow/Agent Orchestration ([04-service-boundaries.md](../../docs/architecture/04-service-boundaries.md)): starts/advances `WorkflowRun`s, invokes `llm-core`/`mcp-core`, dispatches steps. The composition root for `llm-core`/`mcp-core`/`events-core`/the plugin loader (SAF-5) — the second app built in this sequence, reusing `api-gateway`'s composition-root pattern (`createServer(deps)` factory + `main.ts` as the sole `process.env`-touching entry point) rather than inventing a new one.

## Sprint 0 scope (SAF-5)
`GET /health` reports what the composition root actually wired — real port implementations, not asserted in a comment:
- `LlmProviderPort` — `AnthropicLlmAdapter` wrapped with `llm-core`'s `withResilience()`
- `McpConnectionPort` — `StdioMcpAdapter` wrapped with `mcp-core`'s `withMcpResilience()`
- `EventBusPort` — the real `PostgresOutboxAdapter` (not a fake — see `main.ts`)
- `WorkflowEnginePort` — `adapter-workflow-engine-in-memory`'s `InMemoryWorkflowEngineAdapter`
- **Plugin loader** (`plugin-loader.ts`): loads `plugins/fiori-generator`'s one plugin and registers a `Capability`/`CapabilityProvider` pair per artifact type it declares producing (05-plugin-architecture.md § Discovery & loading) — in-memory only, since no repository exists yet for this context (SAF-14 built `Tenant`/`AuditEvent` persistence, not `Capability`/`CapabilityProvider`'s).

**Not built:** any workflow-execution endpoint. No `Step`/`WorkflowDefinition` loader exists yet ([18-capability-model.md](../../docs/architecture/18-capability-model.md)) — there is nothing real for one to call.

## Composition root
`build-dependencies.ts`'s `buildDependencies(eventBus)` takes the one dependency that needs a real external resource (Postgres) as a parameter — everything else (the LLM/MCP adapters, the workflow engine, the plugin loader) is constructed unconditionally inside it. This makes the whole dependency graph testable with any `EventBusPort`, fake or real, without `vitest` needing Postgres running — `main.ts` is the only file that opens a real connection.

**Two Postgres roles, deliberately** (mirrors `persistence-postgres/identity`'s finding): the admin/superuser pool is used once, only to call `ensureSchema()`, then a non-superuser `saf_app` pool for the actual running `PostgresOutboxAdapter` — using the superuser for the latter would silently defeat Row-Level Security the moment this context's tables gain RLS policies of their own. `main.ts` doesn't wire this by hand — it calls `adapter-events-postgres-outbox`'s `createPostgresOutboxEventBus()`, extracted into that package once `apps/worker` (SAF-6) needed the identical bootstrap, per CODING_STANDARDS.md's "extract reusable startup patterns before duplication."

## Testing
`build-dependencies.spec.ts` and `server.spec.ts` use a minimal in-memory `FakeEventBus` test double — proving the wiring and the HTTP surface without needing a live Postgres for this app's own unit tests (the adapters it wires already have their own real-Postgres/real-adapter contract tests in their own packages). `plugin-loader.spec.ts` tests the capability-registration logic as a plain function, no server needed.
