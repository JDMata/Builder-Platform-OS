# @sap-app-factory/context-capability-registry

## Purpose
The seam where SAP-specific knowledge is allowed to exist — but only as data the core reads, never as code the core executes inline. See [05-plugin-architecture.md](../../docs/architecture/05-plugin-architecture.md).

## Contents (Sprint 0 scope)
`src/domain/capability-plugin.ts` — the `CapabilityPlugin` registry aggregate. `PluginManifest`, `ArtifactType`, `ExecutionProfile` and its registries arrive with their owning feature work — see [ADR-0019](../../docs/adr/0019-execution-profiles-for-generated-applications.md).

## Ports
None yet — `src/application/` is added once a real use case needs one.
