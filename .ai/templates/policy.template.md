---
id: <kebab-case-policy-id>
kind: escalation | approval | tool-permission
version: 1
status: draft | active | deprecated
---

# Policy: <Display Name>

## Condition
The specific, checkable condition that triggers this policy — written so it could be compiled to a Rego/Cedar rule without ambiguity (a vague condition here is a vague authorization decision in production). Example: "the agent's proposed output includes a change to a `TargetSystemConnection` referencing an `Environment.kind == 'prod'`."

## Action
What happens when the condition is true:
- **escalation** policies: who/what gets notified, and whether the workflow run pauses (`AwaitingApproval`, see [07-workflow-engine.md](../../docs/architecture/07-workflow-engine.md)) or continues with a flag.
- **approval** policies: which `ReviewGate` is created, and which RBAC role/permission ([SECURITY_BASELINE.md](../../SECURITY_BASELINE.md)) can satisfy it. State separation-of-duties requirements explicitly if this policy needs them (e.g., "approver must not be the same actor who configured the referenced `TargetSystemConnection`").
- **tool-permission** policies: the scope granted (read-only/write), any rate/cost budget, and whether every call (not just the first) requires approval.

## Applies to
Which agent(s)/workflow(s) reference this policy by id. Kept here (rather than only discoverable by grepping `agents/*`) so a policy's blast radius is visible from the policy file itself.

## Rationale
Why this rule exists — the risk it closes. A policy with no stated rationale is hard to safely relax later; this is the same discipline ADRs require of "Consequences," applied to a smaller-grained decision.
