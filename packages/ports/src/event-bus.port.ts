import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0007 (event-driven core via transactional outbox). The envelope
 * shape mirrors docs/architecture/06-event-model.md exactly. Delivery is
 * at-least-once — every handler must be idempotent, keyed on `id`.
 */

export interface DomainEventEnvelope<TData = unknown> {
  readonly id: string;
  /** e.g. "workflow.run.completed.v1" — versioned, past tense. */
  readonly type: string;
  readonly source: string;
  readonly time: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly dataVersion: number;
  readonly data: TData;
}

export type DomainEventHandler<TData = unknown> = (
  event: DomainEventEnvelope<TData>,
) => Promise<void>;

export interface EventBusPort {
  publish(ctx: RequestContext, event: DomainEventEnvelope): Promise<void>;
  subscribe(eventType: string, handler: DomainEventHandler): void;
}
