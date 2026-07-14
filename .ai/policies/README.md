# Policies

Escalation rules, approval requirements, and tool-permission scopes, as policy-as-code — the same discipline [ADR-0011](../../docs/adr/0011-hybrid-rbac-abac-policy-as-code.md) already established for the platform's own RBAC/ABAC: authorization logic is data, reviewed and versioned like code, never scattered conditionals embedded inside an agent's prompt or an `agent.md`'s prose.

Files here are written in the structured form defined by [templates/policy.template.md](../templates/policy.template.md) — human-readable now, designed to compile down to Rego/Cedar bundles once the loader described in [ADR-0020](../../docs/adr/0020-ai-workspace-for-agent-definitions.md) exists (not yet — see the backlog).

## Subfolders

- **`escalation/`** — when an agent stops and hands off to a human or another agent, referenced from an `agent.md`'s *Escalation rules* section.
- **`approval/`** — which `ReviewGate` + RBAC role/permission must sign off before an agent's output is acted on, referenced from *Approval requirements*.
- **`tool-permissions/`** — per-MCP-tool scope (read-only/write, per-call approval, rate/cost budget), referenced from *Tool permissions*.

## Rule

A policy file's `id` is the only thing an `agent.md` or `workflow.md` may reference — never a restated copy of its condition. If two agents need "the same" escalation rule, they reference the same policy file; they do not each get their own near-identical copy. This is what keeps "dozens of specialized agents" from producing dozens of independently drifting authorization rules.
