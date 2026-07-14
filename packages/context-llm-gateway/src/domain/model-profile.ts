/** Workflows reference `name` (e.g. "reasoning-large"), never a concrete provider/model string directly. See ADR-0005. */
export type ModelProfileStatus = "active" | "retired";

export interface ModelProfile {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly model: string;
  readonly status: ModelProfileStatus;
}

export function createModelProfile(input: {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly model: string;
}): ModelProfile {
  if (input.name.trim().length === 0) {
    throw new Error("ModelProfile name must not be empty");
  }
  return {
    id: input.id,
    name: input.name,
    provider: input.provider,
    model: input.model,
    status: "active",
  };
}

export function retireModelProfile(profile: ModelProfile): ModelProfile {
  return { ...profile, status: "retired" };
}
