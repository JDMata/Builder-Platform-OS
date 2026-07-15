import type { RequestContext } from "@sap-app-factory/ports";

/**
 * The fields every span/log line carries. `correlationId` is always present —
 * every unit of work has one, even an anonymous request that has to generate
 * its own (see `apps/web`'s status page, which has no RequestContext yet).
 * The rest are attached only where a real one exists: `tenantId`/`actorId`
 * wherever a RequestContext exists; `workflowId` only inside a workflow run;
 * `executionId` only inside a generation job; `projectId` nowhere yet in
 * Sprint 0 — no call path threads a project scope through any port yet (see
 * each app's README for what's real today). This is the concrete shape of
 * "correlation id, workflow id, execution id, project id, tenant id where
 * appropriate" — optional fields are attached only when a caller actually has
 * one, never fabricated to fill out the set.
 */
export interface CorrelationFields {
  readonly correlationId: string;
  readonly tenantId?: string;
  readonly actorId?: string;
  readonly workflowId?: string;
  readonly executionId?: string;
  readonly projectId?: string;
}

/**
 * Maps a full `RequestContext` (every port method's first parameter) down to
 * the correlation fields a span or log line needs — `tenancyTier` is
 * deliberately dropped, it's an authorization concept, not a correlation one.
 * `extra` lets a caller attach a `workflowId`/`executionId`/`projectId` it has
 * on hand that isn't part of `RequestContext` itself.
 */
export function correlationFromRequestContext(
  ctx: RequestContext,
  extra: Pick<CorrelationFields, "workflowId" | "executionId" | "projectId"> = {},
): CorrelationFields {
  return {
    correlationId: ctx.correlationId,
    tenantId: ctx.tenantId,
    actorId: ctx.actorId,
    ...extra,
  };
}
