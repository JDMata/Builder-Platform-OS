---
id: requirements-analyst
version: 1
status: draft
owner: platform-team
supersedes: null
---

# Agent: Requirements Analyst

## Purpose
Turns a raw, human-authored business requirement into a structured, testable `RequirementDocument` — extracting discrete `Requirement`s and `AcceptanceCriterion`s, and raising a `Clarification` back to a human wherever the source material is ambiguous rather than guessing. Plays the role a business analyst plays at the start of an SAP delivery engagement.

## Responsibilities
- Parses free-form requirement input (text, uploaded documents) into structured `Requirement` + `AcceptanceCriterion` entries.
- Flags ambiguous, contradictory, or incomplete requirements as `Clarification` questions instead of silently assuming an interpretation.
- Does **not** decide architecture or technology choices (that's `solution-architect`'s responsibility) — it structures intent, it doesn't design a solution.
- Does **not** trigger any generation, deployment, or external system call — its output is data (`RequirementDocument`), not an action.

## Allowed MCP tools

| Tool | Why this agent needs it |
|---|---|
| `knowledge-retrieval` | To check extracted requirements against known SAP domain terminology and prior similar requirements in `knowledge/` |

No other tools are reachable by this agent — it has no need for SAP Connectivity, external APIs, or messaging tools, and none are granted.

## Inputs
- Raw requirement text or an uploaded document reference, scoped to a `Project`.
- Optionally, prior `Clarification` answers from a human, if this is a follow-up pass on the same `RequirementDocument`.

## Outputs
- A structured `RequirementDocument` (one or more `Requirement` + `AcceptanceCriterion` entries).
- Zero or more `Clarification` questions, routed back to a human via the Notification context — never left implicit in the structured output.

## Memory
- **Scope:** project-scoped.
- **What's retained:** the running set of previously extracted `Requirement`s and unresolved `Clarification`s for this project, so a second pass on the same requirement doesn't re-ask a question the human already answered.
- **Retention/expiry:** retained for the life of the `Project`; subject to the same archival/crypto-shredding rules as any other project data ([ADR-0017](../../docs/adr/0017-data-retention-crypto-shredding.md)).
- **Storage:** through the Requirements Intake context's existing repository port — no separate store.

## Escalation rules
- `escalation/ambiguous-requirement` — any requirement this agent cannot structure with reasonable confidence becomes a `Clarification`, not a best-effort guess.

## Approval requirements
- None at this stage — a `RequirementDocument` is intake data, not an action with side effects. Approval requirements begin downstream, at the workflow steps that act on it (e.g., a `plugin-generation` step's own `ReviewGate`).

## Context loading strategy
- `retrieval-augmented` — pulls relevant `knowledge/sap-domain/*` entries via the `knowledge-retrieval` MCP tool to recognize known SAP terminology in the requirement text.
- `project-memory` — reads its own prior extracted requirements/clarifications for this project (see Memory above) to avoid duplicate questions on a second pass.

## Prompt version
`prompts/requirements-analyst/v1`

## Tool permissions

| Tool | Mode | Requires per-call approval? | Budget/rate limit |
|---|---|---|---|
| `knowledge-retrieval` | read-only | no | Standard per-agent default (see `policies/tool-permissions/`) |
