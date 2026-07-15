# 0023 — Platform Kernel and Platform Pack Architecture
Status: Accepted
Date: 2026-07-15

## Context

Ahead of the Sprint 1 Product Design Review, a strategic alignment review was requested: confirm the platform's kernel actually generalizes to a future enterprise platform beyond SAP, without redesigning Sprint 0's frozen architecture and without expanding Sprint 1's scope. Sprint 1 remains, and this ADR keeps it, exclusively SAP-focused ([docs/backlog/sprint-1-backlog.md](../backlog/sprint-1-backlog.md), unmodified).

The review (full detail: [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md)) audited fifteen kernel concepts — Project, Workspace, Discovery/Requirements Intake, Capability Registry, Workflow Engine, Digital Twin, Documentation Factory, Approval Workflow, Project Charter, Security, Governance, Observability, Event Model, Plugin Model, and the AI Workspace — against the question "does this depend on anything SAP-specific?" Twelve are already fully platform-independent by construction, several deliberately so since Sprint 0 (`02-domain-model.md`'s "SAP-agnostic by construction" principle, mechanically enforced by the `banned-sap-keywords.mjs` fitness function). Three concrete gaps were found:

1. **No grouping construct above a plugin.** `plugins/` is a flat namespace — nothing expresses "these plugins together constitute the SAP platform's capability set," so nothing would stop a future platform's plugins from being ungrouped peers with no shared identity.
2. **A platform name inside shared kernel code.** `packages/plugin-sdk/src/execution-profile.ts`'s `PortCategory` union type includes a literal `"sap-connectivity"` member — `plugin-sdk` is consumed by every plugin regardless of platform, so this is a concrete platform name inside kernel-tier code, not a plugin's own data.
3. **A platform name inside a supposedly-generic knowledge path.** `.ai/knowledge/sap-domain/` bakes a platform name into what should be a platform-scoped namespace, referenced directly by the deliberately platform-agnostic `requirements-analyst` agent's Context Loading Strategy.

No code implements any of the changes these gaps imply yet, and this ADR does not implement them either — see Consequences.

## Decision

- **The Kernel is enterprise-platform-agnostic.** This was already Sprint 0's stated principle; this ADR makes the boundary a named, first-class architectural concept rather than only an enforced rule.
- **SAP is Platform Pack #1**, not a special case baked into the kernel. `plugins/fiori-generator` and `.ai/knowledge/sap-domain/` become, in a future implementation pass, contents of the SAP Platform Pack.
- **Future enterprise platforms** (Salesforce, Oracle, Microsoft, ServiceNow, or others) integrate exclusively by registering their own `PlatformPack` — never by adding a platform-specific branch, field, or dependency to kernel code.
- **A new aggregate, `PlatformPack`,** is added to the existing Capability & Plugin Registry context (no new bounded context) — the smallest structural addition that groups one platform's plugins, knowledge namespace, deployment-provider bindings, and documentation conventions under one registered identity. Full facet definitions (Purpose, Responsibilities, Capabilities, Templates, Generators, Validators, Deployment Providers, Documentation Standards, Discovery Extensions, Security Extensions, Testing Extensions): [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md).
- **No `TechnologyPack` layer is added beneath `PlatformPack`.** `CapabilityPlugin`'s existing opaque `ArtifactType` already labels a plugin's technology; a third nesting layer would relabel an existing concept without adding expressiveness, and would incorrectly conflate a deployment concern (BTP, already modeled by `ExecutionProfile`) with a generation-technology concern (UI5/CAP/RAP, already modeled by `CapabilityPlugin`).
- **Capabilities should be named business-first**, not technology-first, going forward (`generate-backend`, not `generate-cap`) — a data/registration convention, applied prospectively when future sprints register new capabilities, not a schema change and not a retroactive rename of Sprint 0's existing placeholder.
- **The Digital Twin requires no change.** `nodeType` is already an opaque, registry-declared string; it already supports business-concept-oriented node types (`Business Service`, `Presentation Component`, `Deployment Unit`) with zero kernel change — a data-registration discipline to hold going forward, not a gap to fix.
- **Sprint 1 remains exclusively SAP-focused**, entirely unaffected by this ADR.

## Consequences

- **No code changes ship with this ADR.** The three concrete corrections it identifies — renaming `PortCategory`'s `"sap-connectivity"` member, introducing the `PlatformPack` aggregate, and relocating `.ai/knowledge/sap-domain/` to a pack-scoped path — are each deferred to whichever future sprint's backlog actually needs them, and each still requires the standard Architecture Review Process ([PROJECT_PLAYBOOK.md](../../PROJECT_PLAYBOOK.md)) before implementation. None is added to Sprint 1's backlog by this ADR.
- Future platform expansion (a Salesforce, Oracle, Microsoft, or ServiceNow Platform Pack) becomes additive once `PlatformPack` is implemented — no kernel modification, the same guarantee the plugin/adapter pattern already gives the platform's own infrastructure, extended one level up to whole-platform scope.
- The Capability Registry, Workflow Engine, Digital Twin, and every other already-agnostic kernel concept require zero change — this ADR's scope is deliberately narrow, confirming what already generalizes rather than redesigning what doesn't need to.
- [ROADMAP.md](../../ROADMAP.md)'s long-term vision gains a clearly separated Future Platform Vision section distinguishing it from the unchanged, SAP-exclusive Current Delivery Scope (Sprints 0–8) — see the roadmap update accompanying this ADR.

## Alternatives considered

- **Do nothing; revisit multi-platform support only when a second platform is actually being built:** rejected as the sole approach — while implementation genuinely should wait, the three gaps found (especially the kernel-tier `"sap-connectivity"` enum literal) are cheap to name now and expensive to discover mid-implementation of a second platform pack, the same "cheapest possible moment to correct the shape" reasoning [ADR-0022](0022-capability-model-provider-abstraction.md) used.
- **A three-level Platform Pack → Technology Pack → Plugin hierarchy, matching the prompt's literal example:** rejected — see the Technology Packs section of [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md); it relabels `CapabilityPlugin` without adding expressiveness and conflates a deployment concern with a generation-technology concern.
- **A new bounded context for Platform Packs:** rejected — the Capability & Plugin Registry context already owns the adjacent concepts (`CapabilityPlugin`, `PluginManifest`, `ArtifactType`); adding one aggregate to an existing, appropriately-named context is smaller-surface-area than a new context, the same reasoning ADR-0022 used for `Capability`/`CapabilityProvider`.
- **Implement the corrections immediately, as part of this review:** rejected — the review's own instructions were architecture-only, no new implementation work unless absolutely necessary, and no Sprint 1 scope expansion; none of the three gaps found blocks Sprint 1, so none is urgent enough to justify implementing outside a planned sprint.
