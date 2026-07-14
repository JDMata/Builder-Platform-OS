import { randomUUID } from "node:crypto";
import type { DomainEventEnvelope, RequestContext } from "@sap-app-factory/ports";

export interface CreateEnvelopeInput<TData> {
  readonly type: string;
  readonly source: string;
  readonly dataVersion: number;
  readonly data: TData;
}

/**
 * Fills in `id`/`time`/`tenantId`/`correlationId` from the request context so
 * producers never hand-roll the CloudEvents envelope's plumbing fields —
 * only the business-meaningful ones (docs/architecture/06-event-model.md).
 */
export function createEnvelope<TData>(
  ctx: RequestContext,
  input: CreateEnvelopeInput<TData>,
): DomainEventEnvelope<TData> {
  return {
    id: randomUUID(),
    type: input.type,
    source: input.source,
    time: new Date().toISOString(),
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    dataVersion: input.dataVersion,
    data: input.data,
  };
}
