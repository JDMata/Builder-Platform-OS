import type { ArtifactType } from "./artifact-type.js";
import type { ExecutionProfileId } from "./execution-profile.js";

/**
 * What a plugin's `generate()` hands back — a DTO, deliberately distinct
 * from `context-generation`'s persisted `Artifact` aggregate (which has a
 * review lifecycle status this plugin-facing shape has no business knowing
 * about). The Generation context's application layer turns one of these
 * into a real, persisted `Artifact` once `generate()` returns.
 */
export interface GeneratedArtifact {
  readonly artifactType: ArtifactType;
  readonly content: unknown;
  readonly generatedForExecutionProfile: ExecutionProfileId;
}
