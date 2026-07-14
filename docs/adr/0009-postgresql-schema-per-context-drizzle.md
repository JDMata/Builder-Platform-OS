# 0009 — PostgreSQL, schema-per-context, Drizzle ORM
Status: Proposed
Date: 2026-07-14

## Context
Each bounded context ([02-domain-model.md](../architecture/02-domain-model.md)) needs a hard data boundary so contexts evolve independently, while Sprint 0 should stay operationally simple (one database engine, one instance per environment) and multi-tenancy needs to be a first-class, not retrofitted, concern.

## Decision
Single PostgreSQL instance per environment. One Postgres schema per bounded context (`identity`, `project`, `requirements`, `capability_registry`, `workflow`, `llm_gateway`, `mcp_registry`, `generation`, `governance`). No foreign key crosses a schema boundary — cross-context references are plain ID columns. Every table carries `tenant_id`, with Row-Level Security policies written and tested from Sprint 0. Drizzle ORM + Drizzle Kit for schema definition and migrations, one Drizzle schema module per context, each owned by that context's `persistence-postgres/<context>` package.

## Consequences
- A context can be split into its own physical database later (if it graduates to its own service, per [ADR-0003](0003-modular-monolith-first.md)) via `pg_dump` of its schema — mechanical, because no cross-schema FK or join ever existed.
- Multi-tenant isolation via RLS is proven in Sprint 0 with the very first tables, not designed under pressure when a second tenant actually arrives.
- Drizzle's SQL-close output keeps generated schema/migrations portable and inspectable, consistent with the no-vendor-lock-in principle, at the cost of somewhat more manual schema-definition code than a higher-abstraction ORM would require.

## Alternatives considered
- **Database-per-context from Sprint 0**: rejected — no current operational or scaling need justifies N separate Postgres instances before there's a single real workload; schema-per-context gets the boundary benefit without the operational cost, and keeps the later split mechanical.
- **Prisma ORM**: considered — better developer ergonomics and a mature migration UX, but its proprietary schema DSL and binary query engine sit further from portable SQL; rejected in favor of Drizzle's closer-to-SQL approach for a platform expected to run 10 years and potentially change hands technically.
- **Single shared schema across all contexts**: rejected — removes the physical boundary that makes bounded-context independence enforceable rather than aspirational.

## Review update (2026-07-14)
Principal-architect self-review ([13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §1.1, §6.4) found this decision incomplete for target scale (500+ projects, hundreds of workflows) in two respects, both addressed as additions rather than a reversal of schema-per-context itself:

1. **No partitioning/archival plan.** A conservative estimate puts `agent_invocation` alone at 1M+ rows/year, tens of millions within the platform's 10-year horizon, with `audit_event` and `workflow_step` growing similarly. **Addition:** these three tables are created as monthly range-partitioned tables (partitioned on `created_at`) from their first migration, with per-data-class retention and object-storage archival before partition drop, per [ADR-0017](0017-data-retention-crypto-shredding.md). Designing this in now avoids a much harder live-table migration later.
2. **No HA/blast-radius mitigation, and no tenancy isolation beyond RLS.** One instance per environment is a single point of failure for every tenant, and RLS alone was the only tenant-isolation control (see the defense-in-depth addition in [02-domain-model.md](../architecture/02-domain-model.md)). **Addition:** streaming replication with automated failover (e.g., Patroni or a managed equivalent) is a required Sprint 1/2 operational capability, not a later nice-to-have; and tenants requiring stronger isolation than the shared instance provides are served by the Silo/Dedicated tiers in [ADR-0013](0013-tenancy-isolation-tiering.md) rather than by further hardening the pooled tier alone.

Schema-per-context itself, the no-cross-schema-FK rule, and Drizzle as the ORM choice were all re-confirmed under this review — see [13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §8.2.
