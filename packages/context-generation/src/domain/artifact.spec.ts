import { describe, expect, it } from "vitest";
import {
  approveArtifact,
  archiveArtifact,
  createArtifact,
  submitArtifactForReview,
} from "./artifact.js";

describe("Artifact", () => {
  it("is created draft with an opaque artifactType", () => {
    const artifact = createArtifact({
      id: "a1",
      artifactType: "fiori-elements-app",
      storageRef: "s3://x",
    });
    expect(artifact.status).toBe("draft");
    expect(artifact.artifactType).toBe("fiori-elements-app");
  });

  it("rejects an empty artifactType", () => {
    expect(() => createArtifact({ id: "a1", artifactType: "", storageRef: "x" })).toThrow(
      /must not be empty/,
    );
  });

  it("moves through the review lifecycle without mutating prior states", () => {
    const draft = createArtifact({ id: "a1", artifactType: "fiori-elements-app", storageRef: "x" });
    const inReview = submitArtifactForReview(draft);
    const approved = approveArtifact(inReview);
    const archived = archiveArtifact(approved);

    expect(draft.status).toBe("draft");
    expect(inReview.status).toBe("in_review");
    expect(approved.status).toBe("approved");
    expect(archived.status).toBe("archived");
  });
});
