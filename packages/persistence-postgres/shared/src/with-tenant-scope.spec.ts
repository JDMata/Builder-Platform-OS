import { describe, expect, it } from "vitest";
import type { Pool, PoolClient } from "pg";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { withTenantScope } from "./with-tenant-scope.js";

/**
 * A fake `pg.Pool`/`PoolClient` recording every query — proves the
 * transaction lifecycle (BEGIN, set_config, COMMIT/ROLLBACK, release)
 * without needing a real Postgres instance. Real tenant-isolation/RLS
 * behavior is proven end to end by every `persistence-postgres/*` package's
 * real-Postgres repository specs that call this function indirectly; this
 * test is about the wrapper's own control flow.
 */
function fakePool(): { pool: Pool; queries: string[]; released: boolean[] } {
  const queries: string[] = [];
  const released: boolean[] = [];
  const client = {
    query: (sql: string) => {
      queries.push(sql);
      return Promise.resolve();
    },
    release: () => {
      released.push(true);
    },
  } as unknown as PoolClient;
  const pool = {
    connect: () => Promise.resolve(client),
  } as unknown as Pool;
  return { pool, queries, released };
}

describe("withTenantScope", () => {
  const ctx = createTestRequestContext({ tenantId: "tenant-42" });

  it("runs BEGIN, sets app.tenant_id, then COMMITs and releases the client on success", async () => {
    const { pool, queries, released } = fakePool();

    const result = await withTenantScope(pool, ctx, (client) => {
      return Promise.resolve(client === undefined ? "no-client" : "ran");
    });

    expect(result).toBe("ran");
    expect(queries[0]).toBe("BEGIN");
    expect(queries[1]).toContain("set_config('app.tenant_id'");
    expect(queries[2]).toBe("COMMIT");
    expect(released).toEqual([true]);
  });

  it("passes ctx.tenantId as the set_config parameter", async () => {
    const { pool } = fakePool();
    let capturedParams: unknown[] = [];
    const client = {
      query: (sql: string, params?: unknown[]) => {
        if (params) capturedParams = params;
        return Promise.resolve();
      },
      release: () => undefined,
    } as unknown as PoolClient;
    (pool as unknown as { connect: () => Promise<PoolClient> }).connect = () =>
      Promise.resolve(client);

    await withTenantScope(pool, ctx, () => Promise.resolve(undefined));

    expect(capturedParams).toEqual(["tenant-42"]);
  });

  it("ROLLBACKs and still releases the client when the callback throws", async () => {
    const { pool, queries, released } = fakePool();

    await expect(
      withTenantScope(pool, ctx, () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(queries).toContain("ROLLBACK");
    expect(queries).not.toContain("COMMIT");
    expect(released).toEqual([true]);
  });
});
