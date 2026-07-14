import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0022 (Capability Model) and docs/architecture/18-capability-model.md.
 * The seam a `WorkflowEnginePort` adapter calls instead of ever naming a
 * specific agent or plugin: a workflow's `capability-request` step asks for a
 * `Capability` by id, and this port resolves it to whichever
 * `CapabilityProvider` should fulfill it right now — the platform decides
 * who does the work, not the workflow definition.
 *
 * `CapabilityProviderType` is intentionally re-declared here rather than
 * imported from `@sap-app-factory/context-capability-registry`'s domain
 * type of the same shape — the two are free to diverge, same rationale as
 * `WorkflowRunStatus` (see context-workflow's domain code): this is the
 * orchestration contract, that is the business concept.
 */
export type CapabilityProviderType = "agent" | "plugin" | "human" | "external-service";

export interface ResolvedCapabilityProvider {
  readonly providerType: CapabilityProviderType;
  readonly providerId: string;
  readonly providerVersion: number;
}

export interface CapabilityResolverPort {
  resolve(ctx: RequestContext, capabilityId: string): Promise<ResolvedCapabilityProvider>;
}
