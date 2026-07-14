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

## Review update (2026-07-14)
Principal-architect self-review ([13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §6.1, §6.3) found two issues:

1. **A real inconsistency, now fixed:** this ADR and [06-event-model.md](../architecture/06-event-model.md) previously described Sprint 0 subscribers as wired "in-process," which cannot be true once `orchestrator` and `worker` are separate deployable processes ([04-service-boundaries.md](../architecture/04-service-boundaries.md)). Corrected: Postgres LISTEN/NOTIFY (backed by the relay's polling fallback) *is* the cross-process delivery mechanism — each process runs its own relay/subscriber against the shared outbox table, not a shared in-memory dispatcher.
2. **NOTIFY doesn't hold at target event volume:** NOTIFY payloads are capped (~8000 bytes), all notify traffic competes with OLTP query load on the same instance, and disconnected consumers miss notifications outright (mitigated only by polling, which itself doesn't scale gracefully to dozens of MCP servers' worth of event volume). **Revised timeline:** the Redis Streams adapter (`events-adapters/redis-streams`) moves from "someday, if needed" to an explicit Sprint 1–2 milestone — Redis is already a stack dependency, making this a much smaller lift than adopting Kafka. The outbox table and its transactional write-side guarantee are unchanged; only the fan-out transport moves off Postgres NOTIFY earlier than originally planned. A multi-replica relay must also use `SELECT ... FOR UPDATE SKIP LOCKED` (or equivalent single-claim semantics) so multiple relay instances don't double-publish the same outbox row.
