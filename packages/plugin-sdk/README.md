# @sap-app-factory/plugin-sdk

## Purpose
The `CapabilityPlugin` contract (ADR-0006, [05-plugin-architecture.md](../../docs/architecture/05-plugin-architecture.md)): manifest shape, lifecycle methods, and the `GenerationInput`/`GeneratedArtifact` types a plugin exchanges with the core. Types only, no implementation, no loader — matching `@sap-app-factory/ports`'s scope exactly, one layer down (a contract for the plugin extension seam rather than the port seam).

## Ports
Depends on `@sap-app-factory/ports` for `RequestContext` only. Every SAP-specific plugin (`plugins/*`) depends on this package; core orchestration code (`packages/context-*`, `apps/*`) never imports a specific plugin, only the (not yet built) loader/registry.

## Sprint 0 scope
- `PluginManifest`, `GenerationInput`, `ValidationResult`, `GeneratedArtifact`, `CapabilityPlugin`, `ArtifactType`, `ExecutionProfileId`, `PortCategory`.
- `requiredMcpCapabilities`/`requiredLlmCapabilities`/`requiredPermissions` are opaque `string[]` — the registries they'd otherwise reference (`ToolBindingRef`, `ModelProfile` names, permission scopes) aren't built as code anywhere in this platform yet either, so this manifest carries them the same way it already carries `ArtifactType`: as identifiers the core never interprets.

**Not yet built:** the plugin loader (`orchestrator`), the scoped-capability-token mechanism real invocations carry, and process/container-level execution isolation — all explicitly Sprint 1/2 per ADR-0006's review update, not part of this contract.

## Testing
This package is verified by build/typecheck only, same as `@sap-app-factory/ports` — a stable type contract has nothing to unit test on its own. The contract is exercised for real by `testing-kit`'s `capabilityPluginContractTests`, run against `plugins/fiori-generator` (a real, if intentionally empty, implementation — not a fake).
