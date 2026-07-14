/**
 * Aggregate design rule 5 (docs/architecture/02-domain-model.md): no hard
 * deletes on aggregates that may be referenced cross-context — a Tenant
 * transitions to `archived`, it is never removed.
 */
export type TenantStatus = "active" | "suspended" | "archived";

export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly status: TenantStatus;
}

export function createTenant(input: { readonly id: string; readonly name: string }): Tenant {
  if (input.name.trim().length === 0) {
    throw new Error("Tenant name must not be empty");
  }
  return { id: input.id, name: input.name, status: "active" };
}

export function suspendTenant(tenant: Tenant): Tenant {
  return { ...tenant, status: "suspended" };
}

export function archiveTenant(tenant: Tenant): Tenant {
  return { ...tenant, status: "archived" };
}
