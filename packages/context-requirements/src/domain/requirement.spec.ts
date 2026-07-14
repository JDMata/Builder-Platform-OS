import { describe, expect, it } from "vitest";
import { approveRequirement, archiveRequirement, createRequirement } from "./requirement.js";
import type { RequirementKind } from "./requirement.js";

describe("Requirement", () => {
  it.each<RequirementKind>(["business", "functional", "non-functional", "user-story"])(
    "is created draft for kind '%s'",
    (kind) => {
      const requirement = createRequirement({
        id: "r1",
        requirementDocumentId: "d1",
        kind,
        description: "The system shall do a thing",
      });
      expect(requirement.status).toBe("draft");
      expect(requirement.kind).toBe(kind);
    },
  );

  it("rejects an empty description", () => {
    expect(() =>
      createRequirement({
        id: "r1",
        requirementDocumentId: "d1",
        kind: "business",
        description: " ",
      }),
    ).toThrow(/must not be empty/);
  });

  it("approve then archive transitions status without mutating prior versions", () => {
    const draft = createRequirement({
      id: "r1",
      requirementDocumentId: "d1",
      kind: "business",
      description: "x",
    });
    const approved = approveRequirement(draft);
    expect(approved.status).toBe("approved");
    expect(draft.status).toBe("draft");

    const archived = archiveRequirement(approved);
    expect(archived.status).toBe("archived");
  });
});
