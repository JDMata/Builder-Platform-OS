# 0022 — Capability model: workflows request capabilities, never specific agents
Status: Accepted
Date: 2026-07-14

## Context

The architecture had a latent, already-visible inconsistency: a `WorkflowDefinition`'s `Step` was typed `{ kind: "agent-invocation" | "plugin-generation" | "human-approval", capabilityRef, input }` ([07-workflow-engine.md](../architecture/07-workflow-engine.md)). A `plugin-generation` step already resolved indirectly through a "capability" concept in the Capability & Plugin Registry, but an `agent-invocation` step referenced a specific `AgentDefinition` by id and version directly ([02-domain-model.md](../architecture/02-domain-model.md), pre-this-ADR wording: "...referenced by a `Step` of kind `agent-invocation`..."). This meant the workflow definition itself hardcoded *which kind of thing* — and, for agents, *which specific one* — fulfilled a step. Changing who or what performs "generate a functional specification" (moving it from an AI agent to a human consultant, or to a different agent, or to an external service) would require editing every workflow definition that named the old provider directly, not swapping a binding.

No code implements `Step`, `WorkflowDefinition`, or `AgentInvocation` yet — this is the cheapest possible moment to correct the shape, before any real workflow content depends on the wrong one.

## Decision

Workflows request **capabilities**, never specific agents, plugins, or any other concrete provider. A `Step` collapses from three kinds to two: `"capability-request" | "human-approval"` — `agent-invocation` and `plugin-generation` merge into one, since from the workflow's perspective both are "ask the platform to fulfill this capability"; the platform decides who does it.

The resolution chain is conceptually five layers — **Capability → Provider → Implementation → Resources → MCP Tools** — but is realized with **two new aggregates, not four**, both added to the existing Capability & Plugin Registry context (which already had "Capability" in its name):

- **`Capability`**: the provider-agnostic business-level contract — id, name, description, inputs, outputs, preconditions, required permissions, approval requirements (policy-as-code references), required context (data-shape requirements, not a retrieval mechanism), expected artifacts (`ArtifactType` references — `Capability` sits *above* `ArtifactType`, it doesn't replace it), quality gates (policy-as-code / `ReviewGate` references).
- **`CapabilityProvider`**: one eligible provider for a capability — `providerType: 'agent' | 'plugin' | 'human' | 'external-service'`, `providerId`, `providerVersion`, `priority` (an ordered fallback list, structurally identical to `ModelProfile`'s fallback chain from [ADR-0016](0016-mandatory-resilience-patterns.md) — the same pattern, not a new one).

**"Implementation" and "Resources" are deliberately not new aggregates** — they are already-existing fields on whichever concrete provider a `CapabilityProvider` points to:
- For an agent provider, "Implementation" is `AgentDefinition.pinnedPromptVersion` (already required by aggregate design rule 6); "Resources" is `AgentDefinition`'s already-existing `allowedMcpTools`/`toolPermissions` ([ADR-0020](0020-ai-workspace-for-agent-definitions.md)).
- For a plugin provider, "Implementation" is the `PluginManifest`'s version; "Resources" is its already-existing `requiredMcpCapabilities`/`requiredLlmCapabilities` ([ADR-0006](0006-plugin-architecture.md)).

Resolving a capability request to a concrete provider at run time requires crossing from the Workflow context into the Capability & Plugin Registry context — a new port, `CapabilityResolverPort` (the 13th port), makes this an adapter-swappable lookup instead of a direct cross-context import, consistent with every other cross-context concern in this architecture. A `WorkflowRun` records the exact resolved `{providerType, providerId, providerVersion}` at the moment a capability request executes, extending the existing pinned-reproducibility rule (aggregate design rule 6) rather than adding a new one.

Full design, including the self-review this ADR is based on: [18-capability-model.md](../architecture/18-capability-model.md).

## Consequences

- A workflow definition never changes when the fulfilling provider changes — the same decoupling the ports/adapters pattern already gives the platform's own infrastructure, applied one level up to business-capability fulfillment.
- Governance (approval requirements, quality gates) is now declared once per capability rather than duplicated per provider type — closes a real duplication risk (an agent's own escalation/approval fields and a plugin's own `ReviewGate` usage would otherwise drift independently for the "same" business outcome).
- Adds one new port (13th) and two new aggregates — a small, bounded addition, not a new layer of general-purpose indirection. `Step` actually has *fewer* kinds after this change (two, not three) than before.
- Multiple providers for one capability, ordered by priority with automatic fallback, is now representable without any new mechanism — same shape as `ModelProfile`'s fallback chain.
- The Digital Twin's opaque, registry-declared node/relationship-type pattern ([ADR-0021](0021-project-digital-twin-knowledge-graph.md)) absorbs `Capability` and `CapabilityProvider` as new node types and `fulfilled-by`/`requires-capability` as new relationship types with zero mechanism change — evidence that pattern was already extensible enough for this, not a coincidence.
- New naming-collision risk to manage: `CapabilityProvider` (this ADR, Capability & Plugin Registry — "who fulfills a capability") is not `CapabilityBinding` (MCP Registry, existing — "which plugin/step may call which tool"). Both names contain "Capability" and describe a different thing; documented explicitly to prevent confusion.

## Alternatives considered

- **Four new aggregates (`Capability`, `Provider`, `Implementation`, `Resources`), matching the requested diagram literally**: rejected — "Implementation" and "Resources" would duplicate data that already exists on `AgentDefinition`/`PluginManifest`, creating exactly the kind of drift-prone duplication this platform's governance exists to prevent (the same lesson already applied to `resilience-kit`'s extraction during SAF-10). Reusing the existing fields by reference is less code and less to keep in sync, not more.
- **A new bounded context for the capability model**: rejected — the Capability & Plugin Registry context already existed, already had "Capability" in its name, and already owned the adjacent concepts (`PluginManifest`, `ArtifactType`). Adding two aggregates to an existing, appropriately-named context is smaller-surface-area than standing up an eleventh (twelfth, counting the still-undecided Notification context) bounded context.
- **Keep three `Step` kinds and add capability resolution only for a new fourth kind**: rejected — this would leave the original inconsistency in place for two of the three kinds and add a fourth concept instead of removing one; collapsing to two kinds is strictly simpler.
- **Resolve capability→provider via the existing `read-models` (CQRS) projection instead of a new port**: rejected for this use case — read-models exist for reporting/dashboard queries where eventual consistency is acceptable; capability resolution is an in-request-path decision the orchestrator needs synchronously and correctly every time, which is what a port (like `PolicyEnginePort`, a structurally similar "given inputs, return a decision" concern) is for.
