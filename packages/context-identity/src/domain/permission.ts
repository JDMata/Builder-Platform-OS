/**
 * A coarse-grained `resource:action` permission (ADR-0011 § hybrid RBAC).
 * `PolicyRule`s add attribute-based conditions on top of grants like this
 * one — evaluated by the policy engine (`auth-core`'s `OpaPolicyEngineAdapter`),
 * never scattered `if` checks in application code.
 */
export interface Permission {
  readonly id: string;
  readonly resource: string;
  readonly action: string;
}

export function definePermission(input: {
  readonly id: string;
  readonly resource: string;
  readonly action: string;
}): Permission {
  if (input.resource.trim().length === 0) {
    throw new Error("Permission resource must not be empty");
  }
  if (input.action.trim().length === 0) {
    throw new Error("Permission action must not be empty");
  }
  return { ...input };
}

/** The `resource:action` string form policy bundles reference (see infra/opa/policies/authz.rego). */
export function permissionKey(permission: Permission): string {
  return `${permission.resource}:${permission.action}`;
}
