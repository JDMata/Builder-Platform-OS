# @sap-app-factory/adapter-workflow-engine-in-memory

## Purpose
Sprint 0's `WorkflowEnginePort` skeleton (ADR-0008, [07-workflow-engine.md](../../../docs/architecture/07-workflow-engine.md)): proves the state machine, retry/timeout hooks, and event integration — deliberately **not** the real, durable Postgres+BullMQ in-house adapter ADR-0008 describes, and not Temporal.

## Why in-memory, not the real in-house adapter yet
[17-sprint0-architecture-inventory-review.md](../../../docs/architecture/17-sprint0-architecture-inventory-review.md) flagged a real risk: building out the durable in-house adapter *before* SAF-24's Temporal-class spike runs would make that spike a sunk-cost decision instead of an honest evaluation — exactly what ADR-0008's port abstraction exists to keep optional. This package stays a genuine skeleton (state machine only, no persistence) on purpose, until that spike happens.

## Ports
Implements `WorkflowEnginePort` (`@sap-app-factory/ports`). Depends on `EventBusPort` (constructor-injected — any real adapter, e.g. `adapter-events-postgres-outbox`) to publish `workflow.run.started.v1` / `workflow.step.completed.v1` / `workflow.run.completed.v1` / `.failed.v1` / `.cancelled.v1`, using `@sap-app-factory/events-core`'s `createEnvelope()`.

## Sprint 0 scope
- **State machine**: `pending` (implicit — a run starts `running`) → `running` → `completed`/`failed`/`cancelled`, plus `awaiting_approval` for a `"approval:"`-prefixed step id (a documented Sprint 0 convention standing in for the real `"human-approval"` `Step` kind — no `Step`/`WorkflowDefinition` registry exists yet to declare this structurally).
- **Retries**: a failing step retries in place (`maxStepRetries`, default 3) before the run fails.
- **Timeout hook**: `checkTimeouts()` fails any non-terminal run whose last activity exceeded `runTimeoutMs` — exposed as an explicit method (like `PostgresOutboxAdapter.claimAndDispatch()`) so tests drive it deterministically instead of waiting on a real clock; a real deployment would call it from a periodic reaper. No-op unless `runTimeoutMs` is configured.
- **Event integration**: every transition publishes a real domain event through the injected `EventBusPort` — not asserted separately from the state machine, but as part of the same call.
- **`stepsPerRun`** (default 2): a fixed stand-in for a real `WorkflowDefinition`'s step count, since no definition registry exists yet to look this up from.

**Not built:** persistence (a process restart loses all run state), BullMQ/Redis dispatch, real step execution, and anything resembling production hardening — all explicitly out of scope until the ADR-0008 Temporal-class spike (SAF-24) produces a build-vs-adopt decision.
