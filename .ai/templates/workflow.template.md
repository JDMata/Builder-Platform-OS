---
id: <kebab-case-workflow-id>
version: 1                        # WorkflowRun pins this exact version — see docs/architecture/02-domain-model.md rule 6
status: draft | active | deprecated
---

# Workflow: <Display Name>

## Purpose
What business outcome this workflow produces (e.g., "from an approved requirement, produce a reviewable draft Fiori Elements app"), and which `Project.requiredExecutionProfiles` it's expected to run under (see [ADR-0019](../../docs/adr/0019-execution-profiles-for-generated-applications.md)) if that's relevant to any step.

## Steps

List steps in order. Each step is one of the three kinds the platform's `WorkflowEngine` already understands (see [07-workflow-engine.md](../../docs/architecture/07-workflow-engine.md)) — this file never introduces a fourth kind.

| # | Kind | Capability reference | Notes |
|---|---|---|---|
| 1 | `agent-invocation` | `agents/<agent-id>@v<N>` | |
| 2 | `plugin-generation` | `<plugin-id>` / `<artifactType>` | |
| 3 | `human-approval` | `policies/approval/<policy-id>` | Reviewer role required: `<RoleName>` |

## Escalation / failure handling
What happens if a step fails or an agent escalates mid-run (retry, fall back to a human, abort the run) — reference the relevant `policies/escalation/*` file rather than restating conditions here.

## Data flow
Briefly: what each step consumes from the previous step's output. Keep this to the shape of the data (which fields), not an implementation of how it's passed — that's the `WorkflowEngine` adapter's concern, not this file's.
