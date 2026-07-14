/**
 * `artifactType` is a deliberately opaque, plugin-declared string (e.g.
 * "fiori-elements-app") — the core treats it as an identifier, never a type it
 * understands. See ADR-0006 and ARCHITECTURE_PRINCIPLES.md.
 */
export type ArtifactStatus = "draft" | "in_review" | "approved" | "archived";

export interface Artifact {
  readonly id: string;
  readonly artifactType: string;
  readonly storageRef: string;
  readonly status: ArtifactStatus;
}

export function createArtifact(input: {
  readonly id: string;
  readonly artifactType: string;
  readonly storageRef: string;
}): Artifact {
  if (input.artifactType.trim().length === 0) {
    throw new Error("artifactType must not be empty");
  }
  return {
    id: input.id,
    artifactType: input.artifactType,
    storageRef: input.storageRef,
    status: "draft",
  };
}

export function submitArtifactForReview(artifact: Artifact): Artifact {
  return { ...artifact, status: "in_review" };
}

export function approveArtifact(artifact: Artifact): Artifact {
  return { ...artifact, status: "approved" };
}

export function archiveArtifact(artifact: Artifact): Artifact {
  return { ...artifact, status: "archived" };
}
