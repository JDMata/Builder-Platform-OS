import type { ExecutionProfileId } from "./execution-profile.js";

export interface GenerationInput {
  readonly requirementRefs: readonly string[];
  readonly targetEnvironmentRef: string;
  readonly targetExecutionProfile: ExecutionProfileId;
  readonly parameters: Readonly<Record<string, unknown>>;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
