/**
 * Threaded through every port method as the first parameter. Added post-review
 * (see docs/architecture/13-principal-architect-self-review.md §2.1) as an
 * application-layer tenant-isolation control independent of database RLS, and
 * as the natural home for the correlation ID that ties a chain of domain
 * events back to one WorkflowRun (docs/architecture/06-event-model.md) and the
 * actor identity every AuditEvent needs.
 */

/** See ADR-0013 — Pooled/Silo/Dedicated tenant isolation tiers. */
export type TenancyTier = "pooled" | "silo" | "dedicated";

export interface RequestContext {
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly tenancyTier: TenancyTier;
}
