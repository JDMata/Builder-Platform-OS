export type WorkspaceStatus = "active" | "archived";

export interface Workspace {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly status: WorkspaceStatus;
}

export function createWorkspace(input: {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
}): Workspace {
  if (input.name.trim().length === 0) {
    throw new Error("Workspace name must not be empty");
  }
  return { id: input.id, tenantId: input.tenantId, name: input.name, status: "active" };
}

export function archiveWorkspace(workspace: Workspace): Workspace {
  return { ...workspace, status: "archived" };
}
