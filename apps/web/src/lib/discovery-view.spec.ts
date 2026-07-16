import { describe, expect, it } from "vitest";
import type { ClarificationView, RequirementView } from "./api-gateway-client";
import { deriveConfidenceLabel, formatKindLabel, groupRequirementsByKind } from "./discovery-view";

function requirement(overrides: Partial<RequirementView>): RequirementView {
  return {
    id: "req-1",
    requirementDocumentId: "doc-1",
    kind: "functional",
    description: "desc",
    status: "draft",
    acceptanceCriteria: [],
    ...overrides,
  };
}

function clarification(overrides: Partial<ClarificationView>): ClarificationView {
  return {
    id: "clar-1",
    requirementDocumentId: "doc-1",
    question: "q",
    sourceFragment: "f",
    answer: "a",
    status: "answered",
    ...overrides,
  };
}

describe("deriveConfidenceLabel", () => {
  it("returns High confidence when the document never had any clarification", () => {
    expect(deriveConfidenceLabel([])).toBe("High confidence");
  });

  it("returns Clarified when the document had at least one clarification, even if now answered", () => {
    expect(deriveConfidenceLabel([clarification({ status: "answered" })])).toBe("Clarified");
  });
});

describe("groupRequirementsByKind", () => {
  it("groups requirements by kind in a stable business/functional/non-functional/user-story order", () => {
    const requirements = [
      requirement({ id: "r1", kind: "non-functional" }),
      requirement({ id: "r2", kind: "business" }),
      requirement({ id: "r3", kind: "functional" }),
      requirement({ id: "r4", kind: "functional" }),
    ];

    const groups = groupRequirementsByKind(requirements);

    expect(groups.map((g) => g.kind)).toEqual(["business", "functional", "non-functional"]);
    expect(groups.find((g) => g.kind === "functional")?.requirements).toHaveLength(2);
  });

  it("omits kinds with zero requirements rather than rendering an empty section", () => {
    const groups = groupRequirementsByKind([requirement({ kind: "business" })]);

    expect(groups).toHaveLength(1);
    expect(groups[0]!.kind).toBe("business");
  });
});

describe("formatKindLabel", () => {
  it("formats every kind as a readable label", () => {
    expect(formatKindLabel("business")).toBe("Business");
    expect(formatKindLabel("functional")).toBe("Functional");
    expect(formatKindLabel("non-functional")).toBe("Non-functional");
    expect(formatKindLabel("user-story")).toBe("User Story");
  });
});
