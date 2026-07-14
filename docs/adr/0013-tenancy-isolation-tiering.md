# 0013 — Tenant isolation tiering and deployment topology
Status: Proposed
Date: 2026-07-14 (added in principal-architect review, see [13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §1.1, §7)

## Context
Sprint 0 assumed one deployment topology: one PostgreSQL instance per environment, schema-per-context, `tenant_id` + RLS for tenant separation ([ADR-0009](0009-postgresql-schema-per-context-drizzle.md)). That is a reasonable default for SMB/mid-market tenants, but enterprise SAP customers routinely require guarantees this topology cannot give: physical data isolation, data-residency pinning to a specific region/country, customer-managed encryption keys, or even fully dedicated/on-prem deployment. Treating "SaaS multi-tenant, shared instance" as the only topology would either lose enterprise deals outright or force a bespoke, undocumented exception architecture the first time one is signed.

## Decision
Define three tenancy isolation tiers, all running the *same* application code (per the no-vendor-lock-in / everything-configurable principles — this is a deployment/config decision, not a fork):

1. **Pooled** (default): shared Postgres instance, schema-per-context, RLS-enforced `tenant_id` isolation — as originally designed in [ADR-0009](0009-postgresql-schema-per-context-drizzle.md).
2. **Silo**: dedicated schema set (or dedicated Postgres instance) per tenant, same shared application deployment — stronger logical/physical isolation without a fully dedicated runtime.
3. **Dedicated**: fully separate deployment of the modular monolith (`apps/*`) plus its own Postgres/Redis/MinIO, potentially in a customer-specified region or the customer's own cloud tenancy — for regulated or on-prem-requiring customers.

A new `ports/tenant-connection-resolver.port.ts` resolves, given a `tenantId`, which physical connection (database, schema, region) the current request should use. `application/*` code never hardcodes a connection — it always resolves through this port, which is what makes moving a tenant between tiers an operational/data-migration task rather than a code change.

## Consequences
- Enterprise sales conversations about data residency or physical isolation have a real answer instead of an architectural gap.
- Adds real operational cost: Silo/Dedicated tenants need their own migration runs, monitoring, and backup verification — tracked per-tenant, not per-environment.
- The connection-resolver port must be exercised by every context's `persistence-postgres/<context>` module from the start, even though only the Pooled tier exists at Sprint 0/1 — retrofitting this indirection after direct connection-string wiring exists everywhere would be a much larger change.
- BYOK (customer-managed encryption keys) is only offered at the Dedicated tier initially, tying into [ADR-0015](0015-target-system-credential-management.md).

## Alternatives considered
- **SaaS-only, one topology for all tenants**: rejected — fails the stated "enterprise customers" requirement outright for any customer with a data-residency or on-prem mandate, which is common in SAP's customer base specifically.
- **Fork the codebase for on-prem/dedicated customers**: rejected — directly violates the no-vendor-lock-in/everything-configurable principles and creates two codebases to maintain for a decade; the tiering model keeps one codebase with a resolved-at-runtime connection topology instead.
- **Per-tenant database from day one for every tenant (no Pooled tier)**: rejected — massive operational overhead for the common case (most tenants don't need it), and undermines the very reason schema-per-context in one instance was chosen for Sprint 0 (operational simplicity until proven otherwise).
