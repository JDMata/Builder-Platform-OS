# 04 — Service Boundaries

## Deployable services (Sprint 0)

Only four processes are deployable in Sprint 0. Everything else is a library consumed by one of these.

| Service | Owns | Talks to | Scaling driver |
|---|---|---|---|
| `web` | Control-plane UI rendering, session cookie handling (BFF pattern) | `api-gateway` only, never other services or the DB directly | Request concurrency |
| `api-gateway` | Public API surface, request AuthN/AuthZ enforcement, input validation, rate limiting | `orchestrator` (internal RPC/HTTP), `auth-core` | Request concurrency, kept stateless |
| `orchestrator` | Workflow/Agent Orchestration context: starts/advances `WorkflowRun`s, invokes `llm-core`/`mcp-core`, dispatches long-running steps to `worker` via queue | Postgres, Redis (queue), `llm-core`, `mcp-core`, `events-core` | Workflow step fan-out |
| `worker` | Executes queued steps: plugin invocations, generation jobs, notification delivery | Redis (queue), Postgres, MinIO, `plugin-sdk` loader | Job volume, independently scalable from `orchestrator` |

```mermaid
graph LR
    Web -->|HTTP| GW[api-gateway]
    GW -->|HTTP/RPC| Orc[orchestrator]
    Orc -->|enqueue| Q[(Redis queue)]
    Q -->|consume| Wrk[worker]
    Orc --> PG[(PostgreSQL)]
    Wrk --> PG
    Wrk --> MinIO[(MinIO)]
```

## What is explicitly *not* a separate service yet

- **LLM Gateway** and **MCP Registry** are library packages (`llm-core`, `mcp-core`) embedded in `orchestrator`/`worker`, not standalone microservices. Rationale: they have no independent scaling or ownership need yet, and a network hop here would only add latency and failure modes to every agent call. The port boundary (`ports/llm-provider.port.ts`, `ports/mcp-connection.port.ts`) means extracting either into its own service later is a matter of swapping the in-process adapter for an HTTP-client adapter — callers don't change.
- **Auth** is not a standalone identity provider — `auth-core` is a library that talks to an external OIDC IdP and a policy engine; the platform never stores passwords. See [08](08-authentication-and-rbac.md).
- **Notification** is a library invoked by `worker`, not a service, until delivery volume or channel count justifies isolating it.

### Named extraction candidates (post-review)
Principal-architect self-review ([13-principal-architect-self-review.md](13-principal-architect-self-review.md) §1.2) applied [ADR-0003](../adr/0003-modular-monolith-first.md)'s own extraction criteria forward rather than reversing modular-monolith-first: once `orchestrator`/`worker` run multiple replicas (required at target scale), **LLM Gateway and MCP Registry are the first candidates likely to meet criterion 1 (independent scaling need)** — their call volume scales with total workflow execution across all replicas, not with `orchestrator`/`worker` instance count, and centralizing circuit-breaker/rate-limit state is materially simpler in one gateway than replicated across every replica. **Trigger to revisit as an ADR:** `orchestrator`/`worker` running more than a handful of replicas in production, or observed inconsistency in per-replica circuit-breaker/fallback decisions. Until that trigger, the near-term mitigation is moving circuit-breaker/rate-limit *state* to Redis now ([ADR-0016](../adr/0016-mandatory-resilience-patterns.md)) regardless of whether the code is a library or a service — the state-sharing problem exists either way and doesn't wait for a service-extraction decision.

### Tenant and workload fairness in the worker fleet (post-review)
The original design assumed a single BullMQ queue consumed by `worker` with no fairness model — at target scale, one enterprise tenant's burst or one runaway plugin execution can starve every other tenant's jobs on the same fleet. **Added requirement:** queue partitioning by tenant tier and by workload class (lightweight steps vs. heavy generation jobs get separate queues/pools), with weighted fair scheduling across tenants sharing the pooled tier ([ADR-0013](../adr/0013-tenancy-isolation-tiering.md)). This is a `worker` deployment/scheduling concern, not a service split — it doesn't change the four-deployable-unit model above.

### Registry cache invalidation across replicas (post-review)
The Capability & Plugin Registry, `ModelProfile`s, and MCP server registrations are read on every workflow step and change rarely — every `orchestrator`/`worker` replica is expected to cache them in memory. The original design didn't say how a registry change propagates to already-running replicas, risking configuration drift (different replicas serving different registry state at once). **Added requirement:** registry-change domain events ([06-event-model.md](06-event-model.md)) double as cache-invalidation signals — every replica's in-memory cache subscribes to its own context's change events rather than relying on a TTL alone.

## Extraction criteria

A module graduates from "package inside `orchestrator`/`worker`" to "its own service" only when at least one of these is true, and the decision is recorded as an ADR:
1. It needs to scale independently at a materially different rate than its host process.
2. It needs a release cadence decoupled from the host process (e.g., a partner team owns it).
3. It needs a different runtime/language than Node.js (e.g., a Python-based ML component).
4. It becomes a reuse target for a second host process.

Splitting for any other reason (e.g., "it feels like it should be its own thing") is treated as premature and requires sign-off — see the modular-monolith-first decision in [ADR-0003](../adr/0003-modular-monolith-first.md).
