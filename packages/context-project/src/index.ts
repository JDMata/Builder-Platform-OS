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
