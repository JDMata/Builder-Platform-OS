# @sap-app-factory/api-gateway

## Purpose
Public API surface, request AuthN/AuthZ enforcement, input validation, rate limiting ([04-service-boundaries.md](../../docs/architecture/04-service-boundaries.md)). The **composition root** for this deployable — the one place concrete adapters get constructed and wired to the ports application code depends on ([CODING_STANDARDS.md](../../CODING_STANDARDS.md) § Dependency Injection). First of the four apps built, per the revised Sprint 0 sequence: fully prove the composition-root pattern here before repeating it in `web`/`orchestrator`/`worker`.

## Sprint 0 scope (SAF-4)
A health endpoint only (`GET /health` → `{ status: "ok", service: "api-gateway" }`), served by plain `node:http` — no HTTP framework dependency yet. Choosing one (Fastify, Express, etc.) is an unreviewed architectural decision this skeleton doesn't need to force; `createServer()` is deliberately small enough to swap the underlying implementation later without this being a rewrite.

**Deferred, not forgotten:** this app's other SAF-4 acceptance criterion — wiring to `auth-core` for request AuthN — waits for SAF-17, which comes after all four apps in this sequence. Building a fake auth check now would be thrown away, not reused, once the real `auth-core` package exists; the health endpoint needs no AuthN, so nothing here is blocked by the wait.

**No logging yet:** `no-console` is an active lint rule with no exemption for `apps/*`, and the shared structured logger (`packages/observability`) is SAF-16's deliverable, not built yet. This skeleton has nothing that needs to log (a health check succeeding or 404ing needs no log line), so it satisfies the rule by not needing a logger at all — not by working around it.

## Composition-root pattern (for `web`/`orchestrator`/`worker` to follow)
`server.ts` exports a `createServer()` factory returning an unbound `http.Server` — testable by binding it to an ephemeral port (`listen(0)`) rather than a fixed one. `main.ts` is the only file that reads environment configuration and actually calls `.listen()` on a real port; nothing else in this app touches `process.env`. Once a second app's startup logic is written (`web`), whatever turns out to be genuinely shared (graceful shutdown handling, health-check wiring, config loading) gets extracted then — not preemptively here, matching this session's established "factor it on the second occurrence, not the first" discipline (`resilience-kit`, `events-core`).

## Testing
`server.spec.ts` starts a real server on an ephemeral port and issues real HTTP requests via `fetch` — no framework-specific test client, since there's no framework yet.
