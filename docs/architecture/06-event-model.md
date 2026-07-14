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

This guarantees **no event is lost if the process crashes between state change and publish**, without needing a distributed transaction or a broker as a Sprint 0 dependency. The `EventBusPort` interface is identical whether the adapter is "Postgres LISTEN/NOTIFY + outbox table" (Sprint 0) or "Kafka/NATS/Redis Streams" (later, when cross-process/cross-service fan-out or replay-at-scale is actually needed) — consumers subscribe to the port, not to Postgres.

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

## Consumption model

Sprint 0 wires subscribers **in-process** (a subscriber registry inside `orchestrator`/`worker` calling handlers synchronously off the relay) — no message broker to operate yet. Because everything goes through `EventBusPort`, moving to genuine async pub/sub across services later is an adapter swap, not a rewrite of producers or consumers.

## Idempotency

Every consumer handler is required to be idempotent keyed on `id` (event UUID) — the outbox relay uses at-least-once delivery semantics, never exactly-once. This is stated explicitly so no future contributor "optimizes" a handler into assuming single delivery.
