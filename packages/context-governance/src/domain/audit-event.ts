/**
 * Append-only by design (docs/architecture/02-domain-model.md § Governance &
 * Audit): derived from domain events elsewhere in the platform, never
 * updated or deleted once recorded — ITIL/PMO integrity depends on this.
 * There is deliberately no `update`/`mutate` function here, unlike every
 * other aggregate in this codebase — that omission is the whole point.
 *
 * The fastest-growing table in the system at target scale (ADR-0009
 * revision, ADR-0017) — this is the aggregate the monthly-partitioned-table
 * pattern (SAF-14) exists to prove, not `Tenant` or `Risk`.
 */
export interface AuditEvent {
  readonly id: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly action: string;
  readonly occurredAt: string;
}

export function recordAuditEvent(input: {
  readonly id: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly action: string;
  readonly occurredAt: string;
}): AuditEvent {
  if (input.action.trim().length === 0) {
    throw new Error("AuditEvent action must not be empty");
  }
  return { ...input };
}
