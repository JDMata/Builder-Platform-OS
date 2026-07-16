export { createRequirement, approveRequirement, archiveRequirement } from "./domain/requirement.js";
export type { Requirement, RequirementKind, RequirementStatus } from "./domain/requirement.js";

export { createRequirementDocument, suggestProjectName } from "./domain/requirement-document.js";
export type {
  RequirementDocument,
  RequirementDocumentStatus,
} from "./domain/requirement-document.js";

export { raiseClarification } from "./domain/clarification.js";
export type { Clarification, ClarificationStatus } from "./domain/clarification.js";

export {
  createAcceptanceCriterion,
  confirmAcceptanceCriterion,
} from "./domain/acceptance-criterion.js";
export type {
  AcceptanceCriterion,
  AcceptanceCriterionOrigin,
  AcceptanceCriterionStatus,
} from "./domain/acceptance-criterion.js";

export { structureBusinessRequirement } from "./application/structure-business-requirement.js";
export type {
  StructureBusinessRequirementInput,
  StructureBusinessRequirementResult,
} from "./application/structure-business-requirement.js";

export { submitBusinessIdea } from "./application/submit-business-idea.js";
export type {
  SubmitBusinessIdeaDependencies,
  SubmitBusinessIdeaInput,
} from "./application/submit-business-idea.js";

export { answerClarification } from "./application/answer-clarification.js";
export type {
  AnswerClarificationDependencies,
  AnswerClarificationInput,
} from "./application/answer-clarification.js";

export { approveRequirementDocument } from "./application/approve-requirement-document.js";
export type {
  ApproveRequirementDocumentDependencies,
  ApproveRequirementDocumentInput,
  ClarificationLookup,
  RequirementsDocumentCapturedEventData,
} from "./application/approve-requirement-document.js";
