# 0008 — Workflow engine: in-house adapter first, Temporal path kept open
Status: Accepted
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

## Review update (2026-07-14)
Principal-architect self-review ([13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §1.4, §6.2), performed against the target scale of hundreds of workflow definitions, concluded the original "defer until empirically justified" framing under-weighted this decision. Durable execution correctness — crash-safe resumption, exactly-once step advancement, multi-day human-approval signals, safe concurrent agent fan-out, and running-workflow-definition versioning — is the platform's core reliability property, not an optional refinement, and is a well-known place where in-house implementations accumulate rare, hard-to-reproduce production bugs over years of operation.

**Revised decision:** spike a proven durable-execution engine (Temporal, or a lighter-weight equivalent such as Restate) in Sprint 1, in parallel with hardening the in-house adapter, and make the build-vs-adopt call on a fixed timebox rather than an open-ended "revisit once complexity is observed." The `WorkflowEnginePort` abstraction from the original decision is unchanged and is exactly what makes this timebox low-risk to set — either adapter slots in behind the same port without touching `orchestrator`'s calling code. This ADR's status remains `Proposed`; the in-house adapter is not rejected outright, but it is no longer the presumed default outcome of the evaluation.

## Related decision (2026-07-14, second)
[ADR-0022](0022-capability-model-provider-abstraction.md) changes what a `Step` may reference — a `Capability`, never a specific agent or plugin directly — but does not change `WorkflowEnginePort` itself: `StepResult`/`WorkflowInput` were already abstract enough to need no revision. Whichever engine this ADR ultimately selects executes `capability-request` steps exactly as it would have executed the old `agent-invocation`/`plugin-generation` steps; the resolution from capability to concrete provider happens one layer above the engine, via the new `CapabilityResolverPort` ([18-capability-model.md](../architecture/18-capability-model.md)).
