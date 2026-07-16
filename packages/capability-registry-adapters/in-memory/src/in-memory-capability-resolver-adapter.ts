import {
  resolveCapabilityProvider,
  type CapabilityProvider,
} from "@sap-app-factory/context-capability-registry";
import type {
  CapabilityResolverPort,
  RequestContext,
  ResolvedCapabilityProvider,
} from "@sap-app-factory/ports";

/**
 * `CapabilityResolverPort`'s first real adapter (VS-1, Sprint 1) — Sprint 0's
 * demo composed `resolveCapabilityProvider` directly, correct then for "one
 * provider, no runtime-swappable resolution needed yet." This sprint's real
 * `WorkflowDefinition` is the first caller that needs a capability resolved
 * dynamically through the port rather than composed inline.
 *
 * In-memory, not Postgres-backed — the same legitimate category as
 * `InMemoryWorkflowEngineAdapter`: a real, testable, swappable adapter, just
 * not backed by external persistence. No `Capability`/`CapabilityProvider`
 * repository exists yet (none was in Sprint 1's scope); this adapter takes
 * its registrations at construction time, wired by the composition root the
 * same way `registerPluginCapabilities` already produces them in-memory.
 */
export class InMemoryCapabilityResolverAdapter implements CapabilityResolverPort {
  constructor(private readonly providers: readonly CapabilityProvider[]) {}

  resolve(_ctx: RequestContext, capabilityId: string): Promise<ResolvedCapabilityProvider> {
    const candidates = this.providers.filter((p) => p.capabilityId === capabilityId);
    if (candidates.length === 0) {
      return Promise.reject(
        new Error(`No CapabilityProvider is registered for capability "${capabilityId}"`),
      );
    }
    const resolved = resolveCapabilityProvider(candidates);
    return Promise.resolve({
      providerType: resolved.providerType,
      providerId: resolved.providerId,
      providerVersion: resolved.providerVersion,
    });
  }
}
