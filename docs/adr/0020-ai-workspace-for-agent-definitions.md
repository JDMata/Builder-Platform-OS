# 0020 — AI Workspace (`.ai/`) for agent definitions
Status: Accepted
Date: 2026-07-14

## Context

The platform is expected to eventually orchestrate dozens of specialized AI agents (requirements analysis, architecture, per-SAP-stack build agents, quality/security review, delivery/documentation — see the illustrative roster in [.ai/agents/README.md](../../.ai/agents/README.md)). Without a designed, consistent authoring surface, each agent's purpose, permissions, memory, and escalation/approval behavior would be defined ad hoc — likely duplicated boilerplate per agent, reviewed with less rigor than code because it "looks like configuration," and with no clear place for agent-specific concerns (memory, tool permissions) that don't map cleanly onto anything already built.

## Decision

Add a version-controlled `.ai/` workspace at the repository root with six folders — `agents/`, `prompts/`, `policies/`, `workflows/`, `knowledge/`, `templates/` — as the authored source of truth for agent behavior, structured so it can later graduate into a first-class part of the product (the same path `plugin-sdk` took from Sprint 0 contract to product mechanism). Full design: [15-ai-workspace.md](../architecture/15-ai-workspace.md).

Every agent definition (`agents/*/agent.md`) declares exactly eleven things: Purpose, Responsibilities, Allowed MCP tools, Inputs, Outputs, Memory, Escalation rules, Approval requirements, Context loading strategy, Prompt version, and Tool permissions — using [.ai/templates/agent.template.md](../../.ai/templates/agent.template.md). Of the six folders, four map onto runtime concepts that already existed before this decision (`PromptTemplate`, `PolicyRule`, `WorkflowDefinition`, MCP tool bindings) — this ADR does not introduce four new mechanisms, it gives four already-designed mechanisms a consistent, reviewable authoring home. The one genuinely new concept is `AgentDefinition`, added to the Agent Orchestration / Workflow context, referenced by a `Step` of kind `agent-invocation` exactly as a `plugin-generation` step already references a capability — no new `Step` kind was required.

Three deliberate reuse decisions, made to avoid this becoming a second, parallel set of mechanisms alongside ones already built:
- **Memory** is not a new persistence mechanism — it's scoped (none/run/project/tenant) and read/written through the existing `Repository<T>` port and `RequestContext`, subject to the same tenant isolation and retention/crypto-shredding rules ([ADR-0017](0017-data-retention-crypto-shredding.md)) as all other project data.
- **Escalation rules, approval requirements, and tool permissions** are policy-as-code, evaluated by the same policy engine already established for RBAC/ABAC ([ADR-0011](0011-hybrid-rbac-abac-policy-as-code.md)) — never freeform conditions embedded in an agent's prompt.
- **Tool permissions** reuse and generalize the scoped capability token mechanism from [ADR-0006](0006-plugin-architecture.md) (originally "plugin invocations carry a scoped token") to cover agent invocations too, rather than building a second permission model.

`.ai/` content is authored now; nothing loads or executes it yet. The registry/sync mechanism (a `packages/agent-sdk` package and a loader ingesting `.ai/` content on merge) is a named Sprint 1/2 backlog item, not part of this decision.

## Consequences

- Agent definitions get the same review, versioning, and rollback properties as code (PR review, diff, blame, revert) rather than living in a database table edited outside change control.
- "Dozens of specialized agents" can be authored consistently via shared templates and prompt fragments, rather than each agent independently reinventing its own escalation/permission/memory handling.
- Adds a real authoring discipline cost: every agent needs its eleven fields filled honestly, not just a prompt string — this is deliberate friction, matching the platform's general bias toward reviewed, explicit contracts over convenience shortcuts.
- Until the Sprint 1/2 loader exists, `.ai/` content is documentation with no enforcement — a plugin or `orchestrator` change could drift from what `.ai/` describes with nothing to catch it. Accepted for now, tracked as a risk (see [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)) rather than solved by building the loader ahead of schedule.

## Alternatives considered

- **Store agent definitions only as database rows, authored through a future admin UI**: rejected — loses git's review/diff/rollback properties for content that materially changes production agent behavior, and creates a bootstrapping problem (the UI doesn't exist yet, and building it now would be far more implementation work than a reviewable file format).
- **Let each agent embed its own escalation/approval/memory/tool-permission logic in its own prompt or config**: rejected — this is exactly the ad hoc, duplicated, unreviewable-as-a-unit pattern this ADR exists to prevent; it also directly contradicts "authorization logic is data" ([ADR-0011](0011-hybrid-rbac-abac-policy-as-code.md)).
- **A separate, agent-specific memory store (e.g., a dedicated vector database per agent)**: rejected — would be exactly the kind of unreviewed shadow infrastructure [TECHNICAL_DEBT_POLICY.md](../../TECHNICAL_DEBT_POLICY.md) prohibits; reusing the existing persistence abstraction costs nothing extra and keeps memory subject to the platform's existing tenant-isolation and retention guarantees.
- **Build the `agent-sdk` package and loader now, alongside the file format**: rejected as premature — no agent has real logic yet (mirroring the same discipline already applied to `plugin-sdk` and `generated-app-kit`); the file format needs to prove itself with a worked example before a runtime is built against it.
