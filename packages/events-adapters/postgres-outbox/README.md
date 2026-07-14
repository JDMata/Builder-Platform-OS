# @sap-app-factory/adapter-events-postgres-outbox

## Purpose
Sprint 0's only `EventBusPort` implementation (ADR-0007): Postgres transactional outbox + LISTEN/NOTIFY with a polling fallback. See [06-event-model.md](../../../docs/architecture/06-event-model.md).

## Ports
Implements `EventBusPort` (`@sap-app-factory/ports`). Composes `@sap-app-factory/events-core`'s `SubscriberRegistry` for in-process dispatch. Adapter-tier — application code depends on `EventBusPort`, never on this package directly; injected at the composition root in `apps/*`.

## Sprint 0 scope
- `ensureSchema()` — bootstraps `outbox.events` via `CREATE TABLE IF NOT EXISTS`. Temporary: this table definition moves into a real Drizzle migration once SAF-14 exists.
- `publish()` — inserts the row in its own transaction, then `NOTIFY`s. Combining this insert with a real aggregate write in one *shared* transaction (the other half of "transactional outbox") is proven for real once SAF-14 delivers the first repository — there is no aggregate write to share a transaction with yet.
- `start()`/`claimAndDispatch()` — the relay: a dedicated `LISTEN` connection plus a polling fallback (default 200ms), claiming one row at a time via `SELECT ... FOR UPDATE SKIP LOCKED` so concurrent relay instances never double-process a row, and so a relay that crashes between claiming a row and committing its delivered-mark leaves the row claimable again (at-least-once delivery — see `PostgresOutboxAdapter`'s class doc for exactly how this was verified).

## Known Sprint 0 limitation (documented, not accidental)
No dead-letter/poison-pill isolation: a handler that always throws for one event blocks only that event's own delivered-mark (each row claims and dispatches in its own transaction), but that one event will retry every poll interval indefinitely. Acceptable for Sprint 0's scale; revisit if/when a real consumer needs it.

## Testing
Real-Postgres integration tests (not mocks) live in `postgres-outbox-adapter.spec.ts`, gated behind `SAF_TEST_POSTGRES_URL` — see the file's header comment for how to point it at a throwaway container. They exercise: transactional write + round-trip, rollback atomicity, single-relay delivery ordering, at-most-once-per-successful-pass delivery, and at-least-once redelivery after a simulated crash — plus `testing-kit`'s `eventBusContractTests` run against this real adapter (not a fake), closing the gap flagged in [17-sprint0-architecture-inventory-review.md](../../../docs/architecture/17-sprint0-architecture-inventory-review.md) where this harness had never been run against a real adapter.
