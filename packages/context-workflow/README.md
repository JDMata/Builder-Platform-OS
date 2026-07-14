# @sap-app-factory/context-workflow

## Purpose
Agent Orchestration / Workflow bounded context — the heart of "orchestrate multiple AI agents." See [07-workflow-engine.md](../../docs/architecture/07-workflow-engine.md).

## Contents (Sprint 0 scope)
`src/domain/workflow-run.ts` — the `WorkflowRun` aggregate, illustrating a real invariant (no transition out of a terminal status) and pinned-version reproducibility (aggregate design rule 6). Note its `WorkflowRunStatus` is domain-owned, deliberately not imported from `@sap-app-factory/ports` — see the `domain-no-ports` dependency-cruiser rule. `WorkflowDefinition`, `Step`, `AgentInvocation`, `AgentDefinition` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `WorkflowEnginePort`) is added once a real use case needs one.
