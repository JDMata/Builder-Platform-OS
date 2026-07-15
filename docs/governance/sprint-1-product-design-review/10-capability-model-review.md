# Capability Model Review

## The rule being verified

"No screen may depend directly on AI Agents, Providers, MCP Servers, LLMs, or Technology implementations. Screens should invoke business capabilities only." This is not a new rule invented for this review — it's exactly what [ADR-0022](../../adr/0022-capability-model-provider-abstraction.md) already decided in Sprint 0 ("workflows request capabilities, never specific agents, plugins, or any other concrete provider"), extended here one layer further out, to the UI.

## Every Sprint 1 user action, mapped

| User action (screen) | What it actually calls | Does it name an agent/provider/LLM/MCP server? |
|---|---|---|
| Submit business idea (SAF-42) | `POST` to an `apps/api-gateway` route → `SubmitBusinessIdea` use case (SAF-41), a plain application-layer operation on `context-requirements`. | No — the screen has no concept of "AI" at all at this step; it's a plain document-creation call. |
| Answer a clarification (SAF-47) | `POST` to a route → `AnswerClarification` use case (SAF-46), which internally issues a `capability-request` for `structure-business-requirement`. | No — the screen calls "answer this clarification"; the use case, not the screen, decides a capability needs re-invoking. |
| Approve & create Project (SAF-51) | `POST` to a route → `ApproveRequirementDocument` use case (SAF-50). | No — and this action is correctly **not** a capability at all (see below). |
| (Internal, no screen) — structuring itself | `WorkflowEnginePort`'s `capability-request` step → `CapabilityResolverPort.resolve("structure-business-requirement")` → resolves to the `requirements-analyst` `CapabilityProvider` → invokes `LlmProviderPort` (real Anthropic call, SAF-43). | This is where the agent/provider/LLM actually gets named — entirely inside the orchestrator/workflow engine, never in `apps/web` or the API surface a screen calls. |

**Confirmed: zero Sprint 1 screens, and zero `apps/api-gateway` routes a screen calls, reference an agent id, a provider name, an MCP server, or an LLM model name.** The only place `requirements-analyst`, `AnthropicLlmAdapter`, or any provider-specific identifier appears is inside the orchestrator's capability resolution — exactly where the architecture already puts it, confirmed by tracing the real call path rather than assumed.

## Why "Approve & Create Project" is correctly *not* a Capability

Not every user action needs to be a `Capability`. The Capability Model exists specifically for **provider-swappable business asks** — something an agent, a plugin, a human, or an external service could conceivably fulfill (ADR-0022's `providerType: 'agent' | 'plugin' | 'human' | 'external-service'`). Creating a `Project` from an approved `RequirementDocument` is core platform state management — there is no alternative "provider" that could fulfill it differently; it's the platform's own job, always, the same way `SubmitBusinessIdea` is. Modeling every CRUD-shaped operation as a `Capability` would be exactly the kind of unnecessary abstraction this platform has consistently avoided since Sprint 0 (three similar lines beats a premature abstraction). **This is confirmed as correct design, not a gap.**

## Does the Capability Registry fully support Sprint 1?

**Yes.** Sprint 1 needs exactly one capability — `structure-business-requirement` — and it is already:
- Defined business-first (not `invoke-requirements-analyst` or `call-anthropic`), already matching the naming discipline [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md) recommends going forward.
- Backed by a real `CapabilityProvider` registration (the `requirements-analyst` agent, priority 1).
- Getting its first real `CapabilityResolverPort` adapter this sprint (SAF-45) — previously composed directly in Sprint 0's single-provider demo, now resolved dynamically for the first time.

## Missing capabilities

**None for Sprint 1's actual scope.** Every future journey step this review evaluated as [FUTURE] (Functional Specification, Timeline, Cost Estimate, Risk Assessment) will need its own capability when its owning sprint builds it (`generate-functional-specification`, etc., already anticipated directionally in [PLATFORM_MATURITY.md](../../../PLATFORM_MATURITY.md)) — none of that is a Sprint 1 gap.

## Recommended improvement

None required for correctness. One naming-consistency note carried over from [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md): `structure-business-requirement` is already business-first, and every future capability Sprint 2+ registers should follow the same pattern — this review finds nothing to fix now, only a discipline to hold.
