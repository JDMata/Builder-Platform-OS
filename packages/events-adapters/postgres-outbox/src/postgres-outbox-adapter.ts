import { clearInterval, setInterval } from "node:timers";
import type { Pool, PoolClient } from "pg";
import type {
  DomainEventEnvelope,
  DomainEventHandler,
  EventBusPort,
  RequestContext,
} from "@sap-app-factory/ports";
import { SubscriberRegistry } from "@sap-app-factory/events-core";

const NOTIFY_CHANNEL = "saf_outbox_events";
const DEFAULT_POLL_INTERVAL_MS = 200;

export interface PostgresOutboxAdapterOptions {
  /** How often the polling fallback runs, catching anything missed while disconnected (06-event-model.md). */
  readonly pollIntervalMs?: number;
}

interface OutboxRow {
  readonly id: string;
  readonly event_type: string;
  readonly source: string;
  readonly occurred_at: Date;
  readonly tenant_id: string;
  readonly correlation_id: string;
  readonly data_version: number;
  readonly data: unknown;
}

/**
 * Sprint 0's only EventBusPort adapter (ADR-0007). Writes to `outbox.events`
 * in its own transaction and relays via Postgres LISTEN/NOTIFY with a
 * polling fallback (docs/architecture/06-event-model.md).
 *
 * Claim semantics use `SELECT ... FOR UPDATE SKIP LOCKED` on one row per
 * transaction, so a relay that crashes between claiming a row and marking it
 * delivered leaves that row's lock released on rollback — it becomes
 * claimable again, giving at-least-once delivery. This also means a handler
 * that always throws for one event blocks only that event's own delivery
 * mark, not a whole batch's — no dead-letter/poison-pill isolation is built
 * yet (a stuck event retries every poll interval forever); that is a known,
 * documented Sprint 0 limitation, not an oversight.
 *
 * Combining the outbox INSERT with a real aggregate write in one shared
 * transaction (the other half of the "transactional" guarantee) will be
 * exercised for real once SAF-14 delivers the first repository — `publish()`
 * manages its own transaction for now since no repository exists yet to
 * share one with.
 */
export class PostgresOutboxAdapter implements EventBusPort {
  private readonly registry = new SubscriberRegistry();
  private readonly pollIntervalMs: number;
  private listenClient: PoolClient | undefined;
  private pollTimer: ReturnType<typeof setInterval> | undefined;
  private claiming = false;
  private lastClaimLoop: Promise<void> = Promise.resolve();

  constructor(
    private readonly pool: Pool,
    options: PostgresOutboxAdapterOptions = {},
  ) {
    this.pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  }

  /**
   * Bootstraps `outbox.events` with `CREATE TABLE IF NOT EXISTS` — still a
   * hand-managed bootstrap, not a Drizzle migration; SAF-14 introduced that
   * pattern for `identity`/`governance` but didn't move this table onto it.
   *
   * Must be called with a connection that can run DDL and GRANT (the
   * superuser/migration role, e.g. `main.ts`'s admin pool) — the actual
   * adapter otherwise runs as the non-superuser `saf_app` role (SAF-14: a
   * Postgres superuser bypasses Row-Level Security unconditionally, so
   * everything reading/writing `outbox.events` for real must not be one).
   * `saf_app` didn't exist yet when this table was first created (SAF-11
   * predates SAF-14), so the grant below is added here rather than assumed
   * — found the hard way, running `orchestrator` (SAF-5) against this table
   * as `saf_app` for the first time and hitting "permission denied for
   * schema outbox."
   */
  async ensureSchema(): Promise<void> {
    // Issued as separate statements rather than one semicolon-joined string:
    // node-postgres's driver-side handling of a multi-statement batch can
    // misreport an error for a later statement that references an object
    // (e.g. a column) an earlier statement in the *same* batch just created,
    // even though the DDL itself lands correctly server-side. Splitting them
    // removes that ambiguity entirely — found while verifying this adapter
    // against a real Postgres instance, not a theoretical concern.
    await this.pool.query("CREATE SCHEMA IF NOT EXISTS outbox");
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS outbox.events (
        seq bigserial PRIMARY KEY,
        id text NOT NULL UNIQUE,
        event_type text NOT NULL,
        source text NOT NULL,
        occurred_at timestamptz NOT NULL,
        tenant_id text NOT NULL,
        correlation_id text NOT NULL,
        data_version integer NOT NULL,
        data jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        delivered_at timestamptz
      )
    `);
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS events_undelivered_idx
        ON outbox.events (seq)
        WHERE delivered_at IS NULL
    `);
    await this.pool.query("GRANT USAGE ON SCHEMA outbox TO saf_app");
    await this.pool.query("GRANT SELECT, INSERT, UPDATE ON outbox.events TO saf_app");
    // `seq bigserial` implicitly creates a sequence object — granting
    // privileges on the table alone does not include it. Without this,
    // saf_app can't call nextval() on INSERT, failing with "permission
    // denied for sequence events_seq_seq" — found running `worker` (SAF-6)
    // for the first time, since neither the identity/governance migrations
    // (SAF-14) nor orchestrator's earlier run (SAF-5, health-check only,
    // never actually called publish()) ever exercised this INSERT path as
    // saf_app before.
    await this.pool.query("GRANT USAGE, SELECT ON SEQUENCE outbox.events_seq_seq TO saf_app");
  }

  async publish(_ctx: RequestContext, event: DomainEventEnvelope): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await insertOutboxRow(client, event);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    // NOTIFY's payload must be a string literal, not a bind parameter — pg_notify() is the
    // parameterized equivalent (https://www.postgresql.org/docs/current/sql-notify.html).
    await this.pool.query("SELECT pg_notify($1, $2)", [NOTIFY_CHANNEL, event.id]);
  }

  subscribe(eventType: string, handler: DomainEventHandler): void {
    this.registry.subscribe(eventType, handler);
  }

  /** Starts the relay: a dedicated LISTEN connection plus a polling fallback. Idempotent. */
  async start(): Promise<void> {
    if (this.listenClient) {
      return;
    }
    const client = await this.pool.connect();
    this.listenClient = client;
    await client.query(`LISTEN ${NOTIFY_CHANNEL}`);
    client.on("notification", () => {
      this.lastClaimLoop = this.claimAndDispatch();
    });
    this.pollTimer = setInterval(() => {
      this.lastClaimLoop = this.claimAndDispatch();
    }, this.pollIntervalMs);
    await this.claimAndDispatch();
  }

  /**
   * Stops the relay: clears the poll timer, UNLISTENs and detaches the
   * notification handler before releasing the LISTEN connection back to the
   * pool, then waits for whatever claim loop was already in flight to finish.
   *
   * Both the UNLISTEN and the explicit listener removal matter — releasing a
   * client that has ever run LISTEN does not itself unsubscribe it, and the
   * JS `"notification"` listener stays attached to that client object. If
   * the pool later hands that same underlying connection to unrelated code,
   * a stray notification would still invoke this ("stopped") adapter's
   * handler, racing with whatever rows belong to that unrelated caller. This
   * is exactly how it was found: as real cross-test contamination while
   * verifying this adapter, not a hypothetical race.
   */
  async stop(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
    if (this.listenClient) {
      const client = this.listenClient;
      this.listenClient = undefined;
      await client.query(`UNLISTEN ${NOTIFY_CHANNEL}`);
      client.removeAllListeners("notification");
      client.release();
    }
    await this.lastClaimLoop;
  }

  /** Drains every currently-undelivered row. Exposed so tests can drive one relay pass deterministically. */
  async claimAndDispatch(): Promise<void> {
    if (this.claiming) {
      return;
    }
    this.claiming = true;
    try {
      let claimedOne = true;
      while (claimedOne) {
        claimedOne = await this.claimOneAndDispatch();
      }
    } finally {
      this.claiming = false;
    }
  }

  private async claimOneAndDispatch(): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<OutboxRow>(
        `SELECT id, event_type, source, occurred_at, tenant_id, correlation_id, data_version, data
         FROM outbox.events
         WHERE delivered_at IS NULL
         ORDER BY seq ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED`,
      );
      const row = rows[0];
      if (!row) {
        await client.query("COMMIT");
        return false;
      }
      await this.registry.dispatch(toEnvelope(row));
      await client.query("UPDATE outbox.events SET delivered_at = now() WHERE id = $1", [row.id]);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

function toEnvelope(row: OutboxRow): DomainEventEnvelope {
  return {
    id: row.id,
    type: row.event_type,
    source: row.source,
    time: row.occurred_at.toISOString(),
    tenantId: row.tenant_id,
    correlationId: row.correlation_id,
    dataVersion: row.data_version,
    data: row.data,
  };
}

/** Exported so rollback-behavior tests exercise the exact production write path, not a duplicated copy of the SQL. */
export async function insertOutboxRow(
  client: PoolClient,
  event: DomainEventEnvelope,
): Promise<void> {
  await client.query(
    `INSERT INTO outbox.events
       (id, event_type, source, occurred_at, tenant_id, correlation_id, data_version, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      event.id,
      event.type,
      event.source,
      event.time,
      event.tenantId,
      event.correlationId,
      event.dataVersion,
      JSON.stringify(event.data),
    ],
  );
}
