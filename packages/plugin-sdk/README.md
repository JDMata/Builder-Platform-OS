# @sap-app-factory/plugin-sdk

## Purpose
The `CapabilityPlugin` contract (ADR-0006, [05-plugin-architecture.md](../../docs/architecture/05-plugin-architecture.md)): manifest shape, lifecycle methods, the `GenerationInput`/`GeneratedArtifact` types a plugin exchanges with the core, and — added SAF-6 — the `execute()` host-runner seam every real invocation goes through.

## Ports
Depends on `@sap-app-factory/ports` for `RequestContext` only. Every SAP-specific plugin (`plugins/*`) depends on this package; core orchestration code (`packages/context-*`, `apps/*`) never imports a specific plugin directly, only through the loader (`apps/orchestrator`) or `execute()` (`apps/worker`).

## Sprint 0 scope
- `PluginManifest`, `GenerationInput`, `ValidationResult`, `GeneratedArtifact`, `CapabilityPlugin`, `ArtifactType`, `ExecutionProfileId`, `PortCategory` — types only.
- `requiredMcpCapabilities`/`requiredLlmCapabilities`/`requiredPermissions` are opaque `string[]` — the registries they'd otherwise reference (`ToolBindingRef`, `ModelProfile` names, permission scopes) aren't built as code anywhere in this platform yet either, so this manifest carries them the same way it already carries `ArtifactType`: as identifiers the core never interprets.
- **`execute(plugin, ctx, input)`** (SAF-6, real implementation, real tests) — drives the full lifecycle (`activate` → `validate` → `generate` → `deactivate`, `deactivate` always running via `finally`) in-process, per 05-plugin-architecture.md § Isolation & Zero Trust's explicit Sprint 0 scope: "plugin execution in-process... behind an `execute()` seam... so process-level isolation can be introduced later without changing plugin authors' code." Callers (`apps/worker`) invoke this, never a plugin's `generate()` directly.

**Not yet built:** the plugin loader itself lives in `apps/orchestrator`, not here; the scoped-capability-token mechanism real invocations carry, and process/container-level execution isolation *inside* `execute()` — both explicitly Sprint 1/2 per ADR-0006's review update.

## Testing
`execute.spec.ts` — real unit tests (a recording fake `CapabilityPlugin`, not mocked-out logic) proving lifecycle order, that `deactivate()` always runs (validation failure, `generate()` throwing), and that a failed `validate()` produces a `PluginValidationError` without ever calling `generate()`. The `CapabilityPlugin` *contract* itself is exercised separately by `testing-kit`'s `capabilityPluginContractTests`, run against `plugins/fiori-generator`.
