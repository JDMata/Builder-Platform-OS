# Workflows

Multi-agent workflow definitions, following [templates/workflow.template.md](../templates/workflow.template.md). Each maps onto a `WorkflowDefinition` in the Workflow context ([02-domain-model.md](../../docs/architecture/02-domain-model.md)) — versioned the same way prompts are: a `WorkflowRun` pins the exact version it started with, never "whatever `workflow.md` currently says."

A workflow file composes existing steps kinds only (`agent-invocation`, `plugin-generation`, `human-approval` — see [07-workflow-engine.md](../../docs/architecture/07-workflow-engine.md)); it does not define new orchestration primitives. If a workflow needs something the three step kinds can't express, that's a `WorkflowEnginePort` design conversation (an ADR), not something to work around inside a single workflow file.

## Illustrative example

[fiori-app-from-requirement/](fiori-app-from-requirement/) shows the shape: requirements intake → (not-yet-built) architecture/build agents → human approval, referencing the `requirements-analyst` agent and illustrative policy files. It is not runnable — there is no loader yet (see [ADR-0020](../../docs/adr/0020-ai-workspace-for-agent-definitions.md)).
