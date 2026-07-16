# @sap-app-factory/sprint1-demo

## Purpose
Task 1.18 — the Sprint 1 (VS-1 "Discovery Workspace") end-to-end vertical-slice demonstration: login → submit a business idea → answer the real `requirements-analyst` agent's clarifications → approve the Project Charter → a real `Project` is created. A leaf script, never imported by anything else.

Unlike `tools/sprint0-demo` (a single in-process script composing adapters directly), VS-1's real components are three actual running HTTP services. This script spawns the real built `apps/api-gateway` and `apps/orchestrator` processes (`dist/main.js` — the same artifact a real deployment runs) and drives them over real HTTP, exactly as a browser client would. `apps/web`'s screens call into the same real HTTP chain this script exercises directly.

## Ports
None. Like `tools/sprint0-demo`, this is a composition root — it spawns real apps as child processes and calls them over HTTP, rather than implementing a port itself.

## Running it
Requires `infra/docker-compose` running (`pnpm run infra:up`), the monorepo built (`pnpm run build`), and a real Anthropic API key:

```sh
SAF_TEST_ANTHROPIC_API_KEY=sk-ant-... pnpm --filter @sap-app-factory/sprint1-demo run demo
```

Without `SAF_TEST_ANTHROPIC_API_KEY` set, the script prints why and exits cleanly (code 0) rather than substituting a fabricated key or a canned LLM response — the same gating convention `adapter-llm-anthropic`'s own integration tests use.

## What's real, and what's a documented simplification
Every step uses the real, already-built production code path — no fakes, no mocks:

- **Start the real apps**: `node apps/orchestrator/dist/main.js` and `node apps/api-gateway/dist/main.js`, spawned as child processes on dedicated demo ports (`14001`/`14002` by default) so they don't collide with a developer's own `pnpm dev` instances. Each applies its own real Postgres migrations at startup (already idempotent, `apps/orchestrator/src/main.ts`'s own behavior) — this script doesn't touch migrations itself.
- **Authenticate**: real Keycloak, a real signed access token via Direct Grant (the same dev-only mechanism `tools/sprint0-demo` and `auth-core`'s own test suite use — a real Authorization Code needs a browser this environment doesn't have), real signature validation, a real sealed session cookie built with the exact same `SAF_SESSION_SECRET` the spawned `api-gateway` process is configured with.
- **Submit an idea / clarification loop / approve**: real HTTP calls to `api-gateway`'s Discovery proxy routes, which re-derive identity from the session cookie and forward to `apps/orchestrator`'s real `discovery-workflow.ts`, which calls the real Anthropic API through `structure-business-requirement`. The clarification loop submits a fixed, generic answer to whatever real questions the model raises — the questions are real and unpredictable; the answer is a deliberately generic placeholder good enough to let a real model-driven loop resolve within the same bounded round count (`discovery-workflow.ts`'s `MAX_CLARIFICATION_ROUNDS`) production code enforces.
- **Project creation**: the real cross-context event flow (`requirements.document.captured.v1` → `apps/orchestrator`'s real event subscriber → a real `Project` row), the same path `apps/web`'s Project Charter screen triggers.
- **Correlated telemetry**: the whole run executes inside one root span; every `logger.info()` call carries the same `correlationId`. The script prints both the `correlationId` and the root span's `traceId` — grep the OTel Collector's `debug` exporter output for either.

Not exercised by this script: `apps/web`'s actual pages (Next.js Server Components/Actions) — there is no headless-browser harness in this monorepo, so `apps/web`'s own test suite (fetch-mocked) and manual browser verification cover that layer; this script proves the real HTTP chain underneath it end to end.
