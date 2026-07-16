export { createWorkspace, archiveWorkspace } from "./domain/workspace.js";
export type { Workspace, WorkspaceStatus } from "./domain/workspace.js";
export {
  createTargetSystemConnection,
  revokeTargetSystemConnection,
} from "./domain/target-system-connection.js";
export type {
  TargetSystemConnection,
  TargetSystemConnectionStatus,
} from "./domain/target-system-connection.js";
export { createProject } from "./domain/project.js";
export type { Project } from "./domain/project.js";

export { createProjectFromCapturedRequirements } from "./application/create-project-from-captured-requirements.js";
export type {
  CapturedRequirementsEventData,
  CreateProjectFromCapturedRequirementsDependencies,
} from "./application/create-project-from-captured-requirements.js";
