/**
 * One eligible fulfiller of a `Capability` — see ADR-0022. `priority` orders
 * an automatic fallback chain, structurally identical to `ModelProfile`'s
 * (ADR-0016): lower number wins, ties broken by registration order.
 *
 * Deliberately its own type, not imported from `@sap-app-factory/ports`'s
 * `CapabilityProviderType` of the same shape — the two are free to diverge,
 * same rationale as `WorkflowRunStatus` (context-workflow's domain code):
 * this is the business concept, that is the orchestration contract.
 */
export type CapabilityProviderType = "agent" | "plugin" | "human" | "external-service";

export interface CapabilityProvider {
  readonly id: string;
  readonly capabilityId: string;
  readonly providerType: CapabilityProviderType;
  readonly providerId: string;
  readonly providerVersion: number;
  readonly priority: number;
}

export function registerCapabilityProvider(input: {
  readonly id: string;
  readonly capabilityId: string;
  readonly providerType: CapabilityProviderType;
  readonly providerId: string;
  readonly providerVersion: number;
  readonly priority: number;
}): CapabilityProvider {
  if (input.providerVersion < 1) {
    throw new Error("CapabilityProvider providerVersion must be >= 1");
  }
  if (input.priority < 1) {
    throw new Error("CapabilityProvider priority must be >= 1");
  }
  return { ...input };
}

/**
 * Picks the highest-priority (lowest `priority` number) provider registered
 * for a capability — the fallback-chain resolution ADR-0022 describes. Ties
 * keep the first-listed provider's relative order (stable sort). Throws on
 * an empty list: a `Capability` with zero registered providers is a dead end
 * at run time (see 18-capability-model.md's self-review, point 4) — this
 * function is where that would surface, not silently return `undefined`.
 */
export function resolveCapabilityProvider(
  providers: readonly CapabilityProvider[],
): CapabilityProvider {
  if (providers.length === 0) {
    throw new Error("No CapabilityProvider is registered for this capability");
  }
  return [...providers].sort((a, b) => a.priority - b.priority)[0]!;
}
