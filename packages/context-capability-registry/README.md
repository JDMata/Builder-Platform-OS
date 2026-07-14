# @sap-app-factory/context-capability-registry

## Purpose
The seam where SAP-specific knowledge is allowed to exist — but only as data the core reads, never as code the core executes inline. See [05-plugin-architecture.md](../../docs/architecture/05-plugin-architecture.md).

## Contents (Sprint 0 scope)
- `src/domain/capability-plugin.ts` — the `CapabilityPlugin` registry aggregate (an installed plugin's record — not the same thing as `@sap-app-factory/plugin-sdk`'s `CapabilityPlugin` interface; see the naming-collision note in [18-capability-model.md](../../docs/architecture/18-capability-model.md)).
- `src/domain/capability.ts` — the `Capability` aggregate (ADR-0022): the provider-agnostic, business-level request a workflow step asks for.
- `src/domain/capability-provider.ts` — the `CapabilityProvider` aggregate (ADR-0022) and `resolveCapabilityProvider()`, the priority-ordered fallback-chain selection rule (mirrors `ModelProfile`'s pattern).

`PluginManifest`, `ArtifactType`, `ExecutionProfile` and its registries arrive with their owning feature work — see [ADR-0019](../../docs/adr/0019-execution-profiles-for-generated-applications.md).

## Ports
None yet — `src/application/` is added once a real use case needs one.
