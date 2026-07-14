/**
 * The provider-agnostic, business-level request a workflow's
 * `capability-request` step actually asks for — see ADR-0022 and
 * docs/architecture/18-capability-model.md. Approval/quality-gate policy
 * references live here, shared across every `CapabilityProvider` that could
 * ever fulfill this capability, never duplicated per provider.
 */
export interface Capability {
  readonly id: string;
  readonly name: string;
  readonly expectedArtifactTypes: readonly string[];
}

export function defineCapability(input: {
  readonly id: string;
  readonly name: string;
  readonly expectedArtifactTypes: readonly string[];
}): Capability {
  if (input.id.trim().length === 0) {
    throw new Error("Capability id must not be empty");
  }
  if (input.name.trim().length === 0) {
    throw new Error("Capability name must not be empty");
  }
  if (input.expectedArtifactTypes.length === 0) {
    throw new Error("Capability must declare at least one expected artifact type");
  }
  return {
    id: input.id,
    name: input.name,
    expectedArtifactTypes: input.expectedArtifactTypes,
  };
}
