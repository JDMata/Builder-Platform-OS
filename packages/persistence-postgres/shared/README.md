# persistence-postgres-shared

## Purpose

Shared, generic helpers every `persistence-postgres/<context>` package's repositories need, extracted once real duplication appeared across a third-plus package rather than copied again — the same discipline `resilience-kit` (SAF-10) already established.

## Ports

Not a port implementation itself — a helper `persistence-postgres/*` adapters use internally. No `packages/ports` port corresponds to it.

## What's here

- `withTenantScope` — runs a callback inside a transaction with `app.tenant_id` set via session-scoped `set_config`, the mechanism every context's Row-Level Security policy reads. See its doc comment for the full RLS/tenant-isolation reasoning.
