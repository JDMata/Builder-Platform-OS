# 06 — Event Model

## Envelope

All domain events cross context boundaries wrapped in a CloudEvents-compatible envelope (`packages/events-core`), so the transport/broker can change without touching producers or consumers:

```ts
interface DomainEventEnvelope<T = unknown> {
  id: string;              // event UUID
  type: string;            // e.g. "sap-app-factory.workflow.run.completed.v1"
  source: string;           // emitting context, e.g. "workflow"
  time: string;             // ISO 8601
  tenantId: string;
  correlationId: string;    // ties an event chain back to a WorkflowRun / RequirementDocument
  dataVersion: number;      // schema version for `data`
  data: T;
}
```

Event `type` strings are versioned (`.v1`, `.v2`) from day one — additive schema evolution is expected; breaking changes ship as a new version consumed side by side during migration, never as an in-place mutation of `v1`.

## Delivery: transactional outbox on Postgres (Sprint 0), broker-ready seam

**Decision:** an aggregate's state change and its resulting domain event are written in the *same* Postgres transaction to an `outbox` table; a relay process publishes from the outbox to the event bus port and marks rows delivered. See [ADR-0007](../adr/0007-event-driven-transactional-outbox.md).

```mermaid
sequenceDiagram
    participant App as Application service
    participant DB as PostgreSQL
    participant Relay as Outbox relay
    participant Bus as EventBusPort
    participant Sub as Subscriber (another context)

    App->>DB: BEGIN; update aggregate; INSERT INTO outbox; COMMIT
    Relay->>DB: poll/LISTEN unpublished outbox rows
    Relay->>Bus: publish(envelope)
    Bus->>Sub: deliver (in-process handler in Sprint 0)
    Relay->>DB: mark row delivered
```

This guarantees **no event is lost if the process crashes between state change and publish**, without needing a distributed transaction or a broker as a Sprint 0 dependency. The `EventBusPort` interface is identical whether the adapter is "Postgres LISTEN/NOTIFY + outbox table" (Sprint 0) or "Redis Streams" (Sprint 1-2, see revision below) — consumers subscribe to the port, not to Postgres.

> **Correction (post-review):** an earlier version of this document described Sprint 0 subscribers as wired "in-process." That can't be literally true — `orchestrator` and `worker` are separate deployable processes ([04-service-boundaries.md](04-service-boundaries.md)), so an event published by one cannot reach an in-process subscriber living in the other. What actually provides cross-process delivery in Sprint 0 is the relay itself: **each process runs its own relay/subscriber**, listening via Postgres `NOTIFY` (with the polling fallback catching anything missed while disconnected) against the shared `outbox` table. "In-process" was shorthand for "no message broker," not an accurate description of the IPC mechanism — see [13-principal-architect-self-review.md](13-principal-architect-self-review.md) §6.1 for how this was found.

## Core event catalog (Sprint 0 schema only, no business logic behind them yet)

| Event | Emitted by | Consumed by (future) |
|---|---|---|
| `requirements.document.captured.v1` | Requirements Intake | Workflow |
| `workflow.run.started.v1` | Workflow | Governance, Notification |
| `workflow.step.completed.v1` | Workflow | Workflow (advance), Governance |
| `workflow.run.completed.v1` / `.failed.v1` | Workflow | Governance, Notification |
| `generation.job.started.v1` / `.completed.v1` / `.failed.v1` | Generation | Governance, Notification |
| `generation.artifact.review_requested.v1` / `.approved.v1` / `.rejected.v1` | Generation | Governance, Notification |
| `governance.audit.recorded.v1` | Governance (derived from all of the above) | Audit sinks, compliance export |
| `mcp.tool.invocation_denied.v1` | MCP Registry (policy violation) | Governance, Notification |
| `governance.risk.identified.v1` / `.mitigated.v1` | Governance (added post-review, [ADR-0021](../adr/0021-project-digital-twin-knowledge-graph.md)) | Digital Twin, Notification |
| `governance.incident.reported.v1` / `.resolved.v1` | Governance (added post-review) | Digital Twin, Notification |
| `governance.problem.identified.v1` / `.resolved.v1` | Governance (added post-review) | Digital Twin, Notification |
| `governance.change.requested.v1` / `.approved.v1` / `.rejected.v1` | Governance (added post-review) | Digital Twin, Notification |
| `project.deployment.started.v1` / `.completed.v1` / `.failed.v1` | Project & Workspace (added post-review) | Digital Twin, Governance, Notification |
| `digitaltwin.node.upserted.v1` / `.retired.v1` | Digital Twin (added post-review — derived, not a source event) | Search index, impact-analysis agents |
| `digitaltwin.edge.upserted.v1` / `.retired.v1` | Digital Twin (added post-review) | Search index, impact-analysis agents |

## Consumption model

Each process (`orchestrator`, `worker`) runs its own relay/subscriber registry against the shared outbox table, invoking its own handlers as events arrive — no message broker to operate in Sprint 0. Because everything goes through `EventBusPort`, moving to genuine async pub/sub across services later is an adapter swap, not a rewrite of producers or consumers. If more than one replica of the same process runs the relay, claims on outbox rows use `SELECT ... FOR UPDATE SKIP LOCKED` (or equivalent) so replicas don't double-publish the same event.

## Idempotency

Every consumer handler is required to be idempotent keyed on `id` (event UUID) — the outbox relay uses at-least-once delivery semantics, never exactly-once. This is stated explicitly so no future contributor "optimizes" a handler into assuming single delivery.

## Transport revision: Redis Streams brought forward (post-review)

Principal-architect self-review ([13-principal-architect-self-review.md](13-principal-architect-self-review.md) §6.3, [ADR-0007 revision](../adr/0007-event-driven-transactional-outbox.md)) found that Postgres `LISTEN`/`NOTIFY` does not hold at target event volume: payloads are capped (~8000 bytes), notify traffic competes with regular OLTP load on the same instance, and disconnected consumers miss notifications outright. **Revised plan:** adopt the `events-adapters/redis-streams` adapter as an explicit Sprint 1-2 milestone rather than an indefinite "later" — Redis is already a stack dependency, so this is a materially smaller lift than adopting Kafka/NATS, and it removes the notify-volume ceiling well before dozens of MCP servers and hundreds of workflows are generating events concurrently. The outbox table and its transactional write-side guarantee are unaffected by this change; only the fan-out transport moves.
