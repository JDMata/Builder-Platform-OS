-- Hand-written, not `drizzle-kit generate` output — see schema.ts's comment
-- for why (no first-class range-partitioning DSL in Drizzle Kit).
--
-- Monthly range partitioning on `created_at`, per the ADR-0009 revision and
-- ADR-0017: `audit_event` is one of the three fastest-growing tables at
-- target scale, created as a partitioned table from its first migration
-- rather than retrofitted under load later. The primary key must include
-- the partition column — Postgres requires this for any partitioned table.
CREATE SCHEMA "governance";
--> statement-breakpoint

CREATE TABLE "governance"."audit_events" (
	"id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"occurred_at" timestamptz NOT NULL,
	"created_at" timestamptz NOT NULL,
	PRIMARY KEY ("id", "created_at")
) PARTITION BY RANGE ("created_at");
--> statement-breakpoint

-- Seeded with the current month plus a two-month forward buffer. Creating
-- the *next* partition ahead of time is an ongoing operational task (a
-- scheduled job, not built in Sprint 0 — see README.md § Migration strategy)
-- — writes to a month with no matching partition fail outright rather than
-- silently landing in the wrong place, which is the correct fail-closed
-- behavior for a compliance-relevant, append-only table.
CREATE TABLE "governance"."audit_events_2026_07" PARTITION OF "governance"."audit_events"
	FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
--> statement-breakpoint
CREATE TABLE "governance"."audit_events_2026_08" PARTITION OF "governance"."audit_events"
	FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
--> statement-breakpoint
CREATE TABLE "governance"."audit_events_2026_09" PARTITION OF "governance"."audit_events"
	FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
--> statement-breakpoint

CREATE INDEX "audit_events_id_idx" ON "governance"."audit_events" ("id");
