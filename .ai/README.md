# AI Workspace (`.ai/`)

This is the version-controlled, file-based authoring surface for everything that shapes AI agent behavior on this platform: agent definitions, prompts, policies, workflows, knowledge sources, and the templates used to author all of the above consistently. It is designed to graduate from "internal authoring convention" into a first-class part of SAP App Factory itself — see [docs/architecture/15-ai-workspace.md](../docs/architecture/15-ai-workspace.md) and [ADR-0020](../docs/adr/0020-ai-workspace-for-agent-definitions.md).

**Architecture only, for now.** Nothing in this folder is executed by any runtime yet — there is no loader, no registry sync, no SDK. This is the authored source of truth that a future `orchestrator` component will ingest; see the backlog items referenced in [15-ai-workspace.md](../docs/architecture/15-ai-workspace.md). Do not treat anything here as production-ready prompt content — the example under each folder is illustrative, meant to prove the template works, not to be deployed as-is.

## Folder map

| Folder | Contains | Maps onto (existing domain model) |
|---|---|---|
| [agents/](agents/) | One subfolder per specialized AI agent — its `agent.md` definition (Purpose, Responsibilities, Allowed MCP tools, Inputs, Outputs, Memory, Escalation rules, Approval requirements, Context loading strategy, Prompt version, Tool permissions) | New `AgentDefinition` aggregate, Agent Orchestration/Workflow context — [02-domain-model.md](../docs/architecture/02-domain-model.md) |
| [prompts/](prompts/) | Versioned prompt text, one immutable version per folder, plus shared fragments | `PromptTemplate`, LLM Gateway context — same versioning discipline already required for `WorkflowRun` reproducibility |
| [policies/](policies/) | Escalation rules, approval requirements, and tool-permission scopes as policy-as-code | `PolicyRule`, Governance context — same OPA/Cedar policy-as-code mechanism as [ADR-0011](../docs/adr/0011-hybrid-rbac-abac-policy-as-code.md), not new logic |
| [workflows/](workflows/) | Multi-agent workflow definitions — which agents run in which order, where the human approval gates sit | `WorkflowDefinition`, Workflow context |
| [knowledge/](knowledge/) | Source documents agents retrieve from (SAP domain knowledge, project conventions, examples) — never real customer data | Served to agents via a knowledge-retrieval MCP tool, reusing the existing MCP abstraction ([ADR-0004](../docs/adr/0004-mcp-abstraction-layer.md)) rather than a new retrieval layer |
| [templates/](templates/) | Skeletons for authoring new agents, prompts, workflows, policies, and knowledge sources | Prevents boilerplate drift across "dozens of specialized agents" — same "shared, not duplicated" principle as `generated-app-kit` ([ADR-0019](../docs/adr/0019-execution-profiles-for-generated-applications.md)) |

## Ground rules

1. **Everything here goes through the same PR review as code.** A prompt or policy change here changes production agent behavior — it is never exempt from [CODING_STANDARDS.md](../CODING_STANDARDS.md)'s review discipline just because it's markdown, not TypeScript.
2. **Nothing is edited in place once published.** Prompts and workflow definitions are versioned (`v1/`, `v2/`, ...); a `WorkflowRun`/`AgentInvocation` pins the exact version it used, exactly like the platform already requires for its own workflow/prompt/model reproducibility rule (see [02-domain-model.md](../docs/architecture/02-domain-model.md) aggregate design rule 6).
3. **No secrets, no real customer data, ever.** `knowledge/` holds synthetic or genuinely public material only — see [SECURITY_BASELINE.md](../SECURITY_BASELINE.md).
4. **No agent invents its own escalation, approval, or tool-permission logic in prose.** Those are policy-as-code in `policies/`, referenced by ID from `agents/*/agent.md` — never freeform conditions embedded in an agent's prompt.
5. **No agent hand-rolls its own memory store.** Memory is scoped (none / run / project / tenant) and persisted through the platform's existing repository/persistence abstraction, subject to the same tenant isolation and retention rules as everything else — never a bespoke file, cache, or vector store an agent owns privately.

## Claude's default operating role on this repository

This section is distinct from `agents/` above — it governs Claude's own behavior *while working in this repository as an engineering collaborator*, not a platform-runtime agent definition. It changes exactly once, at a named governance milestone, and is otherwise stable.

- **Sprint 0 (Platform Foundation): Principal Software Architect.** Free to design, propose, and evolve the architecture — that was Sprint 0's job.
- **Sprint 1 onward: Lead SAP Platform Engineer / Product Engineering Lead.** Set at the Sprint 0 → Sprint 1 transition, once [ARCHITECTURE_FREEZE.md](../ARCHITECTURE_FREEZE.md) took effect (see [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)'s Current Decisions).

Responsibilities under the Sprint 1+ role:

- **Implement within the approved architecture.** Build the current sprint's vertical slice on top of the frozen foundation — [BASELINE.md](../BASELINE.md), [ARCHITECTURE_FREEZE.md](../ARCHITECTURE_FREEZE.md) — not redesign it.
- **Never redesign unless an approved ADR requires it.** "This would be cleaner if we changed X" is not, by itself, license to change X. See the Architecture Review Process in [PROJECT_PLAYBOOK.md](../PROJECT_PLAYBOOK.md).
- **Whenever implementation suggests an architectural change is actually needed:**
  1. **Stop.** Do not implement the change speculatively to "see if it works" or because it's already half-written.
  2. **Explain the impact** — which bounded contexts, ports, adapters, or fitness functions would be affected, in concrete terms, not a vague caveat.
  3. **Recommend an ADR** — state plainly that this requires an Architecture Decision Record, Impact Analysis, Architecture Review, and Approval before implementation, per [PROJECT_PLAYBOOK.md](../PROJECT_PLAYBOOK.md)'s Architecture Review Process.
  4. **Do not implement until approved.** Continue only on work that doesn't require the change, or on drafting the ADR itself for review — never on the architectural change pre-emptively.

This rule applies regardless of how confident the suggestion is or how small the change looks — the [ENGINEERING_PRINCIPLES.md](../ENGINEERING_PRINCIPLES.md) Engineering Planning Principles make architecture-change governance a process requirement, not a judgment call left to whoever is implementing at the time.
