---
id: <kebab-case-agent-id>              # stable, never reused even if the agent is retired
version: 1                              # bump on any change to this file; never edit a published version's meaning in place
status: draft | active | deprecated
owner: <team-or-person>
supersedes: null                        # id of a prior agent this replaces, if any
---

# Agent: <Display Name>

## Purpose
One paragraph: why this agent exists and what part of the "SAP delivery organization" analogy it plays (see [00-vision-and-principles.md](../../docs/architecture/00-vision-and-principles.md)). If you can't state this in one paragraph without an "and also," it's two agents, not one.

## Responsibilities
- What this agent does. Be specific — "reviews generated CAP service code for CDS anti-patterns," not "helps with quality."
- What this agent explicitly does **not** do (list at least one — the boundary is as important as the scope, and prevents this agent's responsibilities from silently expanding over time).

## Allowed MCP tools
List every MCP tool this agent may call, by exact registered tool name. This is an allow-list, not a suggestion — anything not listed here is unreachable by this agent regardless of what the underlying LLM tries to do (enforced via the scoped capability token mechanism already used for plugins, see [ADR-0006](../../docs/adr/0006-plugin-architecture.md)).

| Tool | Why this agent needs it |
|---|---|
| `<tool-name>` | <reason> |

## Inputs
What this agent consumes, typed against existing domain concepts wherever possible (a `RequirementDocument` ref, a prior `AgentInvocation` output, a retrieved `knowledge/` excerpt) — not "whatever text you give it."

## Outputs
What this agent produces, typed the same way (a structured analysis object, a draft `Artifact`, a `Clarification` question routed back to a human). State the shape, not just "a response."

## Memory
- **Scope:** none | run-scoped | project-scoped | tenant-scoped (pick the narrowest that satisfies the agent's purpose)
- **What's retained:** be specific — this is not "conversation history," it's named fields.
- **Retention/expiry:** ties to the platform's retention policy ([ADR-0017](../../docs/adr/0017-data-retention-crypto-shredding.md)) — state the window, don't leave it unbounded by default.
- **Storage:** always through the platform's existing repository/persistence ports, scoped by `RequestContext` — never a private store this agent owns.

## Escalation rules
Reference the policy file(s) in [policies/escalation/](../policies/escalation/) that govern when this agent stops and hands off to a human or another agent. Do not restate conditions in prose here beyond a one-line summary — the policy file is the source of truth.

- `<policy-id>` — <one-line summary of what triggers it>

## Approval requirements
Reference the policy file(s) in [policies/approval/](../policies/approval/) and the RBAC role/permission (see [SECURITY_BASELINE.md](../../SECURITY_BASELINE.md)) that must approve this agent's output before it's acted on.

- `<policy-id>` — requires role `<RoleName>` / permission `<resource:action>`

## Context loading strategy
Pick one or more from the fixed taxonomy (see [15-ai-workspace.md](../../docs/architecture/15-ai-workspace.md)) — do not invent ad hoc retrieval logic:
- `static-bundle` — a fixed set of `knowledge/` documents bundled at authoring time
- `retrieval-augmented` — dynamic semantic search over `knowledge/` + project documents via the knowledge-retrieval MCP tool
- `run-scoped-history` — prior `Step`/`AgentInvocation` outputs within the current `WorkflowRun`
- `project-memory` — this agent's own project-scoped Memory (see above)

State which one(s), and why.

## Prompt version
Pinned reference to an exact, immutable version under [prompts/](../prompts/) — e.g. `prompts/<agent-id>/v2`. Never "latest."

## Tool permissions
For each tool listed under Allowed MCP tools, its scope — reference the policy file(s) in [policies/tool-permissions/](../policies/tool-permissions/):

| Tool | Mode | Requires per-call approval? | Budget/rate limit |
|---|---|---|---|
| `<tool-name>` | read-only \| write | yes \| no | <limit, if any> |
