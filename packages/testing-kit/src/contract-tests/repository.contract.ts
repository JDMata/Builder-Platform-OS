import { describe, expect, it } from "vitest";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Fixtures a caller supplies so this suite can stay generic across every
 * aggregate type, per docs/architecture/09-database-proposal.md and
 * ADR-0013's tenant-isolation requirement.
 */
export interface RepositoryContractFixtures<TAggregate, TId> {
  /** Generates a fresh id each call — must not collide across test runs against a real, persistent database. */
  makeId(): TId;
  /** Builds a new aggregate owned by `ctx.tenantId`, whatever field on TAggregate that ends up as. */
  buildAggregate(id: TId, ctx: RequestContext): TAggregate;
  /**
   * Returns a changed copy — proves `save()` updates in place rather than
   * only ever inserting. Omit this for append-only aggregates (e.g.
   * `AuditEvent`) that are never updated after creation; the suite then
   * asserts re-saving identical content is idempotent instead.
   */
  mutateAggregate?: (aggregate: TAggregate) => TAggregate;
  /** A plain-data snapshot for equality comparison, excluding anything a real round-trip may legitimately not preserve verbatim (e.g. object identity). */
  toComparable(aggregate: TAggregate): unknown;
}

/**
 * Any implementation of `Repository<TAggregate, TId>` must pass this suite —
 * see docs/architecture/09-database-proposal.md and ADR-0013 (tenant
 * isolation tiering). The tenant-isolation test is the one this factory
 * exists for: it proves cross-tenant reads are rejected regardless of
 * *how* the adapter enforces it (Postgres RLS, an application-layer
 * `WHERE tenant_id = ...`, or both — this suite doesn't know or care which).
 */
export function repositoryContractTests<TAggregate, TId>(
  createRepo: () => Repository<TAggregate, TId> | Promise<Repository<TAggregate, TId>>,
  fixtures: RepositoryContractFixtures<TAggregate, TId>,
): void {
  describe("Repository contract", () => {
    it("findById returns undefined for an id that was never saved", async () => {
      const repo = await createRepo();
      const ctx = createTestRequestContext();

      expect(await repo.findById(ctx, fixtures.makeId())).toBeUndefined();
    });

    it("save() then findById() round-trips the aggregate", async () => {
      const repo = await createRepo();
      const ctx = createTestRequestContext();
      const id = fixtures.makeId();
      const aggregate = fixtures.buildAggregate(id, ctx);

      await repo.save(ctx, aggregate);
      const found = await repo.findById(ctx, id);

      expect(found && fixtures.toComparable(found)).toEqual(fixtures.toComparable(aggregate));
    });

    if (fixtures.mutateAggregate) {
      const mutateAggregate = fixtures.mutateAggregate;
      it("save() called twice with the same id updates in place, not duplicates", async () => {
        const repo = await createRepo();
        const ctx = createTestRequestContext();
        const id = fixtures.makeId();
        const original = fixtures.buildAggregate(id, ctx);

        await repo.save(ctx, original);
        const mutated = mutateAggregate(original);
        await repo.save(ctx, mutated);
        const found = await repo.findById(ctx, id);

        expect(found && fixtures.toComparable(found)).toEqual(fixtures.toComparable(mutated));
      });
    } else {
      it("save() called twice with identical content is idempotent (append-only aggregate)", async () => {
        const repo = await createRepo();
        const ctx = createTestRequestContext();
        const id = fixtures.makeId();
        const aggregate = fixtures.buildAggregate(id, ctx);

        await repo.save(ctx, aggregate);
        await repo.save(ctx, aggregate);
        const found = await repo.findById(ctx, id);

        expect(found && fixtures.toComparable(found)).toEqual(fixtures.toComparable(aggregate));
      });
    }

    it("never returns another tenant's aggregate by id (tenant isolation)", async () => {
      const repo = await createRepo();
      const ownerCtx = createTestRequestContext({ tenantId: "contract-tenant-owner" });
      const otherTenantCtx = createTestRequestContext({ tenantId: "contract-tenant-other" });
      const id = fixtures.makeId();
      const aggregate = fixtures.buildAggregate(id, ownerCtx);

      await repo.save(ownerCtx, aggregate);
      const foundByOtherTenant = await repo.findById(otherTenantCtx, id);

      expect(foundByOtherTenant).toBeUndefined();
    });

    it("the owning tenant can still read its own aggregate after the isolation check", async () => {
      const repo = await createRepo();
      const ownerCtx = createTestRequestContext({ tenantId: "contract-tenant-owner-2" });
      const id = fixtures.makeId();
      const aggregate = fixtures.buildAggregate(id, ownerCtx);

      await repo.save(ownerCtx, aggregate);
      const found = await repo.findById(ownerCtx, id);

      expect(found).toBeDefined();
    });
  });
}
