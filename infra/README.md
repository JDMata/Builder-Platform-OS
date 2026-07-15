# Infrastructure (SAF-13)

Local development infrastructure for SAP App Factory's own platform (not the generated-application execution profiles — see [ADR-0019](../docs/adr/0019-execution-profiles-for-generated-applications.md), unrelated). `apps/*` run locally via `pnpm dev`, not containerized here — this compose file is infrastructure only.

## One-command startup / reset

```sh
pnpm infra:up     # docker compose up -d — starts Postgres, Keycloak, OTel Collector
pnpm infra:down   # docker compose down — stops and removes containers, keeps data
pnpm infra:reset  # docker compose down -v — also wipes the Postgres volume, for a clean slate
pnpm infra:logs   # follow all three services' logs
```

Copy `infra/docker-compose/.env.example` to `infra/docker-compose/.env` to override any port or credential (all default to dev-only values baked into `docker-compose.yml`).

## Services included, and why

Reviewed against what a **currently-scheduled** Sprint 0 story actually consumes, not the full target-scale stack — see [ARCHITECTURE_PRINCIPLES.md](../ARCHITECTURE_PRINCIPLES.md) and the "don't add infrastructure before it's needed" instruction this story was built under.

| Service | Consumed by | Health check |
|---|---|---|
| `postgres` (16) | SAF-11 (outbox — real), SAF-14 (repositories/RLS/partitioning — real), SAF-17 (identity roles/permissions schema — real), governance audit events | `pg_isready`, container-exec |
| `keycloak` (26, dev mode) | SAF-17 (`auth-core`'s dev adapter — real, realm imported via `--import-realm`) and SAF-21's "authenticate" step | `/health/ready` on the management port (9000), container-exec |
| `opa` (0.70.0) | SAF-17 (`PolicyEnginePort`'s real adapter, `infra/opa/policies/authz.rego`) and SAF-21's authorization step | see below — no container-exec check is possible on this image (distroless) |
| `otel-collector` (0.114.0) | SAF-16 (instrument ≥2 apps, still to come this sequence) and SAF-21's "generate correlated telemetry" step | see below — no container-exec check is possible on this image |

Every included service has a **named, already-scheduled** consumer later in this same execution sequence — not a hypothetical future one.

## Why Redis and MinIO aren't here yet

Both are real, documented future stack dependencies (Redis: BullMQ dispatch and Redis Streams event transport per the [ADR-0007 revision](../docs/adr/0007-event-driven-transactional-outbox.md); MinIO: `ObjectStorePort`'s S3-compatible dev adapter), but **nothing in the currently-scheduled Sprint 0 backlog consumes either yet**:

- The workflow engine adapter (SAF-8b) is deliberately in-memory, not BullMQ-backed — see its README for why (the Architecture Inventory Report's sunk-cost-before-the-Temporal-spike caution).
- Plugin invocation stays in-process in Sprint 0 by design ([05-plugin-architecture.md](../docs/architecture/05-plugin-architecture.md) § Isolation & Zero Trust) — no queue needed yet.
- No `object-storage-minio` adapter package exists yet, and SAF-21's vertical-slice demonstration explicitly permits "existing fake or reference adapters where appropriate" for exactly this kind of gap.

Documenting this here rather than adding both services "just in case": the moment a real consumer is scheduled (SAF-27 or later, per [12-risks-and-technical-debt.md](../docs/architecture/12-risks-and-technical-debt.md)), it's a small, additive edit to this same file — not a redesign.

## Sprint 0 simplifications, stated explicitly

- **Keycloak uses its own embedded dev storage, not the shared Postgres.** A production deployment would give Keycloak its own dedicated database; wiring that up now would add coupling with no Sprint 0 payoff. `start-dev` mode is explicitly dev/test-only — never used as-is beyond this sprint.
- **The OTel Collector's only exporter is `debug` (stdout logging), no real trace backend (Jaeger/Tempo/etc.).** Sufficient to prove "traces flow end-to-end" (SAF-16); a real backend is a later, additive change to `otel-collector-config.yaml`, not a redesign.
- **`otel-collector`'s official image (`otel/opentelemetry-collector`) is distroless** — confirmed by hand (`docker run --entrypoint="" ... ls /bin` fails with "executable file not found," i.e. there is no `ls`, `sh`, `wget`, or `curl` inside it). No command can therefore run *inside* the container to healthcheck it, which is why this is the one service in `docker-compose.yml` without a container-exec `healthcheck:` block. Its `health_check` extension is still enabled and published on port 13133 — verify readiness from the host: `curl http://localhost:13133/`, which should return `{"status":"Server available",...}`.
- **`opa`'s official image (`openpolicyagent/opa`) is also distroless**, same reasoning — no container-exec healthcheck; verify from the host instead: `curl http://localhost:8181/v1/data/sap_app_factory/authz/allow -d '{"input":{}}'` should return `{"result":false}` (deny-by-default). It's published for `linux/amd64` and runs under emulation on `arm64` hosts (works, just prints a platform-mismatch warning).
- **Keycloak imports `keycloak-import/sap-app-factory-realm.json` only on first container start** (fresh volume) — after editing the realm file, `pnpm infra:reset` (not `infra:down`/`infra:up`) is required to re-trigger the import.
- **Postgres defaults to host port 55432, not 5432.** Found by hand while verifying this story: this machine already has an unrelated project's Postgres container bound to 5432, and `docker compose up` fails with "address already in use" rather than a helpful collision warning. Defaulting elsewhere avoids that whole class of problem rather than assuming a clean machine; override via `SAF_POSTGRES_HOST_PORT` if 55432 also collides.

## Two Postgres roles, not one (SAF-14)

`postgres-init/01-create-app-role.sql` creates a second role, `saf_app`, on first container start — found to be necessary, not a preference: `SAF_POSTGRES_USER` (`saf`) is the container's bootstrap user and is a **superuser**, and Postgres superusers bypass Row-Level Security unconditionally, `FORCE ROW LEVEL SECURITY` included. Every `persistence-postgres/<context>` repository connects as `saf_app` (non-superuser, `LOGIN` only) at runtime; `saf` remains the migration-owning role. See `persistence-postgres/identity`'s README for the full RLS strategy this enables. `saf_app`'s password is fixed in the init script (`saf_app_dev_password`), not parameterized via `.env` — it's a dev-only role recreated from scratch on every `infra:reset`, so there's no persisted secret to protect.

## Verifying the stack is healthy

```sh
pnpm infra:up
docker compose -f infra/docker-compose/docker-compose.yml ps          # postgres, keycloak should show "healthy"
curl http://localhost:13133/                             # otel-collector — see note above
psql -h localhost -p 55432 -U saf -d sap_app_factory -c "select 1;"   # postgres, migration role
psql -h localhost -p 55432 -U saf_app -d sap_app_factory -c "select 1;"   # postgres, app role (password: saf_app_dev_password)
curl -o /dev/null -w '%{http_code}\n' http://localhost:8080/          # keycloak — expect a redirect (302)
curl http://localhost:8181/v1/data/sap_app_factory/authz/allow -d '{"input":{}}'  # opa — expect {"result":false}
```
