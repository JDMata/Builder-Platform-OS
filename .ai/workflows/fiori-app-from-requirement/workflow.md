---
id: fiori-app-from-requirement
version: 1
status: draft
---

# Workflow: Fiori app from requirement

## Purpose
From an intake requirement, produce a reviewable draft Fiori Elements app. Illustrative — several referenced agents and the `fiori-generator` plugin's real generation logic don't exist yet; this file exists to show how a workflow composes agents, plugins, and approval gates, not to be run. Expected to run under the `local-poc` execution profile by default for the generation step, promotable to `enterprise` only after the approval step below ([ADR-0019](../../docs/adr/0019-execution-profiles-for-generated-applications.md)).

## Steps

| # | Kind | Capability reference | Notes |
|---|---|---|---|
| 1 | `agent-invocation` | `agents/requirements-analyst@v1` | Produces a structured `RequirementDocument`; may raise `Clarification`s per `policies/escalation/ambiguous-requirement` |
| 2 | `agent-invocation` | `agents/solution-architect@v1` *(illustrative — not yet built)* | Proposes a Fiori Elements floorplan and data model from the structured requirement |
| 3 | `plugin-generation` | `fiori-generator` / `fiori-elements-app` | Generates the draft app under the `local-poc` execution profile |
| 4 | `human-approval` | `policies/approval/review-gate-thresholds` | Reviewer role required: `Reviewer` |

## Escalation / failure handling
Step 1 escalations (`policies/escalation/ambiguous-requirement`) do not halt the run unless the ambiguous part blocks step 2's input — see that policy file. A failure in step 3 (plugin execution) follows the platform's standard retry/circuit-breaker behavior ([ADR-0016](../../docs/adr/0016-mandatory-resilience-patterns.md)), not a workflow-specific retry rule.

## Data flow
Step 2 consumes step 1's `RequirementDocument`. Step 3 consumes step 2's proposed floorplan/data model as `GenerationInput.parameters`. Step 4 reviews step 3's output `Artifact` before it may be promoted past Local POC.
