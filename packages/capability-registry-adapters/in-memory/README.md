# @sap-app-factory/adapter-capability-resolver-in-memory

## Purpose
`CapabilityResolverPort`'s first real adapter (VS-1, Sprint 1) — see [ADR-0022](../../../docs/adr/0022-capability-model-provider-abstraction.md). Sprint 0's demo composed `resolveCapabilityProvider` directly; this sprint's real `WorkflowDefinition` is the first caller that needs a capability resolved dynamically through the port.

## Ports
Implements `CapabilityResolverPort` (`@sap-app-factory/ports`).

## Scope
In-memory, not Postgres-backed — the same legitimate adapter category as `adapter-workflow-engine-in-memory`. Takes its `CapabilityProvider` registrations at construction time, wired by the composition root (e.g. `apps/orchestrator`'s existing in-memory plugin/capability registration). No `Capability`/`CapabilityProvider` repository exists yet; building one was not in Sprint 1's scope.

## Testing
Passes `testing-kit`'s new `capabilityResolverContractTests` (net new this sprint, mirroring the pattern every other port already has), plus a dedicated priority-fallback test (multiple providers registered for the same capability, resolves to the lowest priority number).
