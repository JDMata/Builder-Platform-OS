import type { ClarificationView, RequirementView } from "./api-gateway-client";

export type ConfidenceLabel = "High confidence" | "Clarified";

/**
 * Product Design Review Quick Win #8: a presentation-only confidence badge,
 * derived from existing data, no schema change. The review's stated design
 * is per-`Requirement` (via `Clarification.relatedRequirementIds`) — but
 * `structure-business-requirement`'s prompt never populates
 * `relatedRequirementIds` (a clarification is raised about the idea text in
 * general, not tied to one already-extracted requirement), so that field is
 * always empty today. Deriving per-document instead — "Clarified" if this
 * `RequirementDocument` ever had any `Clarification` raised at all, applied
 * uniformly to every requirement in it — is the honest version of the same
 * "derived, no schema change" recommendation given what the capability
 * actually produces, disclosed here rather than faked as per-requirement
 * precision the data doesn't support.
 */
export function deriveConfidenceLabel(
  clarifications: readonly ClarificationView[],
): ConfidenceLabel {
  return clarifications.length > 0 ? "Clarified" : "High confidence";
}

export interface RequirementGroup {
  readonly kind: RequirementView["kind"];
  readonly requirements: readonly RequirementView[];
}

const KIND_ORDER: readonly RequirementView["kind"][] = [
  "business",
  "functional",
  "non-functional",
  "user-story",
];

/** Groups by kind (Project Charter wireframe) in a stable, readable order rather than insertion order. */
export function groupRequirementsByKind(
  requirements: readonly RequirementView[],
): readonly RequirementGroup[] {
  return KIND_ORDER.map((kind) => ({
    kind,
    requirements: requirements.filter((r) => r.kind === kind),
  })).filter((group) => group.requirements.length > 0);
}

export function formatKindLabel(kind: RequirementView["kind"]): string {
  switch (kind) {
    case "business":
      return "Business";
    case "functional":
      return "Functional";
    case "non-functional":
      return "Non-functional";
    case "user-story":
      return "User Story";
  }
}
