# Workflows

Multi-agent workflow definitions, following [templates/workflow.template.md](../templates/workflow.template.md). Each maps onto a `WorkflowDefinition` in the Workflow context ([02-domain-model.md](../../docs/architecture/02-domain-model.md)) — versioned the same way prompts are: a `WorkflowRun` pins the exact version it started with, never "whatever `workflow.md` currently says."

A workflow file composes existing step kinds only (`capability-request`, `human-approval` — see [07-workflow-engine.md](../../docs/architecture/07-workflow-engine.md)); it does not define new orchestration primitives. A step never names a specific agent or plugin — it references a `Capability` id, resolved to a concrete provider at run time ([ADR-0022](../../docs/adr/0022-capability-model-provider-abstraction.md), [18-capability-model.md](../../docs/architecture/18-capability-model.md)). If a workflow needs something these two step kinds can't express, that's a `WorkflowEnginePort` design conversation (an ADR), not something to work around inside a single workflow file.

## Illustrative example

[fiori-app-from-requirement/](fiori-app-from-requirement/) shows the shape: requirements intake → (not-yet-built) architecture/build capability requests → human approval, referencing the `requirements-analyst` agent (as a capability provider) and illustrative policy files. It is not runnable — there is no loader yet (see [ADR-0020](../../docs/adr/0020-ai-workspace-for-agent-definitions.md)).
