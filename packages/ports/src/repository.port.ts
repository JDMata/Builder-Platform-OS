import type { RequestContext } from "./request-context.js";

/**
 * An aggregate is loaded and saved as a whole through one repository
 * (docs/architecture/02-domain-model.md, aggregate design rule 1).
 *
 * Deliberately has no generic `delete` — aggregates that may be referenced
 * cross-context are never hard-deleted (rule 5); a deletion is a status
 * transition (e.g. `archived`) persisted through `save`, not a separate
 * repository operation.
 */
export interface Repository<TAggregate, TId = string> {
  findById(ctx: RequestContext, id: TId): Promise<TAggregate | undefined>;
  save(ctx: RequestContext, aggregate: TAggregate): Promise<void>;
}
