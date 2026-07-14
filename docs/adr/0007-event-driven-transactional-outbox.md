# 0007 — Event-driven core via Postgres transactional outbox
Status: Proposed
Date: 2026-07-14

## Context
Bounded contexts ([02-domain-model.md](../architecture/02-domain-model.md)) must communicate without sharing tables or calling each other synchronously, to preserve independent evolution. At Sprint 0 scale there is no justification yet for operating a message broker, but the eventual need for one (cross-process fan-out, replay at scale) must not require rewriting producers or consumers when it arrives.

## Decision
Domain events are written to a Postgres `outbox` table in the same transaction as the aggregate state change they describe. A relay process publishes unpublished rows through `ports/event-bus.port.ts`. Sprint 0's only adapter is Postgres LISTEN/NOTIFY + the outbox table, with subscribers wired in-process. Event payloads use a CloudEvents-compatible, versioned envelope (`.v1`, `.v2`, ...).

## Consequences
- No event is lost on a crash between state change and publish, without needing a distributed transaction or an operated broker in Sprint 0.
- Moving to Kafka/NATS/Redis Streams later is an adapter swap behind `EventBusPort`, not a producer/consumer rewrite.
- Consumers must be written idempotent (keyed on event `id`) from day one, since outbox-relay delivery is at-least-once — stated explicitly so it's never assumed away later.
- Event schema evolution discipline (versioned `type` strings) must be maintained by convention plus PR review; this is not yet mechanically enforced and is called out as a residual risk (R7 in [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)).

## Alternatives considered
- **Message broker (Kafka/NATS/Redis Streams) from Sprint 0**: rejected as premature — no cross-process consumer exists yet; adds an operational dependency with no current payoff. The port design keeps this available as a near-term follow-up once real fan-out exists.
- **Synchronous cross-context calls (direct function/service calls between contexts)**: rejected — creates temporal coupling between contexts and undermines the bounded-context independence the domain model is designed around.
- **Dual-write (update aggregate, then separately publish) without an outbox**: rejected — classic dual-write failure mode (crash between the two writes loses the event); the outbox pattern exists specifically to close that gap using a transaction Postgres already gives us for free.
