/**
 * A named bundle of permission grants (ADR-0011 § hybrid RBAC) — the coarse
 * layer `PolicyRule`s narrow with attribute conditions on top.
 */
export type RoleStatus = "active" | "retired";

export interface Role {
  readonly id: string;
  readonly name: string;
  readonly permissionIds: readonly string[];
  readonly status: RoleStatus;
}

export function defineRole(input: {
  readonly id: string;
  readonly name: string;
  readonly permissionIds: readonly string[];
}): Role {
  if (input.name.trim().length === 0) {
    throw new Error("Role name must not be empty");
  }
  return {
    id: input.id,
    name: input.name,
    permissionIds: input.permissionIds,
    status: "active",
  };
}

export function retireRole(role: Role): Role {
  return { ...role, status: "retired" };
}
