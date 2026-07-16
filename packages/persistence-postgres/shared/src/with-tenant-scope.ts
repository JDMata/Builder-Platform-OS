import type { Pool, PoolClient } from "pg";
import type { RequestContext } from "@sap-app-factory/ports";

/**
 * Extracted from `TenantRepository`/`AuditEventRepository`, which had each
 * hand-rolled this identical transaction wrapper (Sprint 0) — the same
 * "extract on second occurrence" discipline already applied to
 * `resilience-kit` (SAF-10), triggered here by the fourth-and-fifth
 * repository needing it (VS-1's Requirements/Project persistence).
 *
 * Runs `fn` inside its own transaction with `app.tenant_id` set via
 * `set_config(..., true)` — the `true` (`is_local`) argument scopes the
 * setting to *this transaction only*, so it can never leak onto a pooled
 * connection reused by a different tenant's request afterward. This is the
 * session variable every `persistence-postgres/*` package's RLS policy reads
 * via `current_setting('app.tenant_id', true)` (fail-closed: an unset value
 * compares as NULL, never true, against `tenant_id`).
 */
export async function withTenantScope<T>(
  pool: Pool,
  ctx: RequestContext,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [ctx.tenantId]);
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
