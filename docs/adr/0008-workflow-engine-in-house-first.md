# 0008 — Workflow engine: in-house adapter first, Temporal path kept open
Status: Proposed
Date: 2026-07-14

## Context
Multi-agent orchestration requires durable, resumable, sometimes long-running (hours to days, for human approval gates) workflow execution — the platform's core differentiator. The two realistic candidates are building a lightweight engine on Postgres/Redis or adopting Temporal.io. This is the highest-consequence infrastructure decision in Sprint 0 because it is expensive to reverse once workflow definitions exist against a specific execution model. See the full comparison in [07-workflow-engine.md](../architecture/07-workflow-engine.md).

## Decision
Define `ports/workflow-engine.port.ts` (`startRun`, `advance`, `signal`, `getStatus`, `cancel`) as the only interface `orchestrator` depends on. Implement a single in-house adapter for Sprint 0 (Postgres tables for run/step state, BullMQ/Redis for dispatch and retries). Do not adopt Temporal in Sprint 0. Revisit via a new ADR once real workflow definitions exist and their fan-out width, cross-day human-gate frequency, and compensation-logic needs are empirically known — or immediately, if the team already has production Temporal operating experience, since that changes the cost side of the tradeoff materially.

## Consequences
- No new operational dependency (Temporal server + its own datastore) is introduced before there is workflow logic to justify it.
- The team takes on the risk of building and hardening durable-execution primitives (retry, replay, resumable human gates) that Temporal would provide for free — this is accepted deliberately, not overlooked, and is the single ADR most likely to be revisited.
- Because the port is the only thing `orchestrator` depends on, adopting Temporal later is an adapter addition plus a migration of in-flight `WorkflowRun` state, not a rewrite of workflow-calling code.

## Alternatives considered
- **Adopt Temporal in Sprint 0**: rejected for now — no workflow complexity exists yet to justify its operational cost and the team's ramp-up curve on its execution model (workflow/activity split, determinism constraints); reconsidered explicitly above if team experience already covers this gap.
- **Build a full custom engine with no port abstraction, assuming in-house forever**: rejected — removes the option to adopt Temporal later without a rewrite, which is the actual risk this ADR is managing.
- **Cron/queue-only orchestration with no durable run/step state**: rejected — insufficient for multi-day human approval gates and audit/replay requirements in [02-domain-model.md](../architecture/02-domain-model.md).
