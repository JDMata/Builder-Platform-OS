# @sap-app-factory/events-core

## Purpose
Transport-agnostic building blocks for `EventBusPort` (ADR-0007): the in-process `SubscriberRegistry` dispatch logic and an envelope-construction helper. Written once here so `events-adapters/postgres-outbox` (Sprint 0) and `events-adapters/redis-streams` (Sprint 1-2 per the ADR-0007 revision) don't each reimplement dispatch.

## Ports
Depends on `@sap-app-factory/ports` (`EventBusPort`, `DomainEventEnvelope`). Does not implement the port itself — adapters compose `SubscriberRegistry` internally to do so. Application code never depends on this package directly (it's adapter-tier, injected at the composition root in `apps/*`, same rule as `llm-core`/`mcp-core`).

## Sprint 0 scope
- `SubscriberRegistry` — event-type → handler[] map; `dispatch()` runs every matching handler (via `Promise.allSettled`, so one handler failing doesn't stop the others) and throws if any failed, so a relay never marks a partially-delivered event as delivered.
- `createEnvelope()` — fills in `id`/`time`/`tenantId`/`correlationId` so producers only supply the business-meaningful fields (`type`, `source`, `dataVersion`, `data`).

**Not yet built:** dead-letter/poison-pill isolation for a handler that always fails — see `events-adapters/postgres-outbox`'s README for how this currently behaves.
