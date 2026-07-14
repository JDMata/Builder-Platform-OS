import type { DomainEventEnvelope, DomainEventHandler } from "@sap-app-factory/ports";

/**
 * In-process event-type -> handler[] dispatch. Shared by every EventBusPort
 * adapter (postgres-outbox today, redis-streams later per the ADR-0007
 * revision) so this dispatch logic is written once, not once per transport.
 *
 * All handlers for an event type run even if one fails (each handler is
 * independent and must be idempotent per ADR-0007) — but if any failed, the
 * whole dispatch throws, so a relay never marks the event delivered.
 */
export class SubscriberRegistry {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  subscribe(eventType: string, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventType);
    if (existing) {
      existing.push(handler);
    } else {
      this.handlers.set(eventType, [handler]);
    }
  }

  async dispatch(event: DomainEventEnvelope): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.length === 0) {
      return;
    }
    const results = await Promise.allSettled(handlers.map((handler) => handler(event)));
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failures.length > 0) {
      throw new AggregateError(
        failures.map((failure): unknown => failure.reason),
        `${failures.length} of ${handlers.length} handler(s) failed for event ${event.id} (${event.type})`,
      );
    }
  }
}
