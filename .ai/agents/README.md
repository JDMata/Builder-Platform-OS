# Agents

One subfolder per specialized AI agent, named by kebab-case agent id. Each subfolder contains:

- `agent.md` — the definition, using [templates/agent.template.md](../templates/agent.template.md). This is the only required file.
- `CHANGELOG.md` — one line per version bump, why it changed (mirrors the Changesets discipline used for versioned packages elsewhere in the repo).

An agent id is never reused, even after the agent is deprecated — see the `supersedes` frontmatter field in the template if a new agent replaces an old one, so the lineage stays visible.

## Illustrative example

[requirements-analyst/](requirements-analyst/) is a fully worked example proving the template holds together end to end — it is **not** production-ready prompt content. Treat it as a reference for "what a complete `agent.md` looks like," not as something to deploy.

## Example roster (illustrative — not all built yet)

To make "dozens of specialized agents" concrete, here is the kind of roster this workspace is designed for, organized like the delivery-org analogy in [00-vision-and-principles.md](../../docs/architecture/00-vision-and-principles.md):

| Phase | Example agents |
|---|---|
| Intake | `requirements-analyst`, `clarification-agent` |
| Architecture | `solution-architect`, `data-modeler` |
| Build | `fiori-ui-developer`, `cap-service-developer`, `abap-rap-developer`, `integration-specialist` |
| Quality | `test-engineer`, `security-reviewer`, `code-reviewer` |
| Delivery | `deployment-engineer`, `technical-writer`, `user-manual-writer` |

Only `requirements-analyst` exists as a worked example today — the rest are named here to size the design, not to claim they're implemented.

## Rules

- No agent's `agent.md` may reference SAP-specific mechanics that belong to a plugin instead (e.g., a specific CDS annotation syntax) — an agent's *Purpose*/*Responsibilities* describe its role in the delivery process; the plugin it eventually invokes owns the SAP-specific detail, per [ADR-0006](../../docs/adr/0006-plugin-architecture.md).
- Every "Allowed MCP tools" entry must correspond to a tool actually registered in the MCP Registry — this file doesn't grant access by itself; it declares intent that the registry and the scoped capability token mechanism enforce.
