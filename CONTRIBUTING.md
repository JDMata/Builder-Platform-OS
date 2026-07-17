# Contributing

This project is built to be maintained for 10+ years. That changes how we work day to day: process here exists to keep the codebase legible to someone joining in year 5, not to slow down year 1. Read this before your first PR.

## Before you write any code

1. Read [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md) and [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md) — these are non-negotiable, not suggestions.
2. Find the bounded context your work belongs to in [docs/architecture/02-domain-model.md](docs/architecture/02-domain-model.md) and its package in [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).
3. Check [docs/adr/README.md](docs/adr/README.md) for any existing decision that already covers what you're about to do — don't re-litigate an Accepted ADR in a PR description; if you disagree with one, open a new ADR proposing to supersede it.
4. Confirm the story meets [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md). If it doesn't, fix that first — implementing an under-specified story wastes more time than clarifying it up front.

## Environment setup

```
pnpm install
pnpm run infra:up   # Postgres, Keycloak, OPA, OpenTelemetry Collector — see infra/README.md
pnpm run build
pnpm run test
```

Redis and MinIO are deliberately not part of the stack yet — nothing currently scheduled consumes either; see infra/README.md § "Why Redis and MinIO aren't here yet" before assuming they should be added.

### Runtime prerequisites

Everything above except one item has a working default matching the `infra:up` docker-compose stack — you don't need to set it yourself for local dev. The one real, mandatory exception:

| Variable | Required for | Local development | Testing | CI behavior |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | `apps/orchestrator` (real `structure-business-requirement` calls) | **Mandatory, no default.** `EnvSecretsVaultAdapter` reads it at process boot (`apps/orchestrator/src/main.ts`); if unset, the process throws and exits immediately — before it ever binds its port. | Real-API tests are gated on `SAF_TEST_ANTHROPIC_API_KEY` (a separate variable, `adapter-llm-anthropic`'s own tests and `tools/sprint1-demo`) — they skip cleanly, printing why, if it's unset. Never fake this key; an unset key should mean "this real-API path doesn't run," not a fabricated response. | **Deliberately not set** in `.github/workflows/ci.yml`'s `integration` job — a real, paid third-party credential is never provisioned automatically; see that job's own inline comment. |

Everything else (`SAF_POSTGRES_ADMIN_URL`/`SAF_POSTGRES_APP_URL`, `SAF_KEYCLOAK_ISSUER_URL`/`SAF_KEYCLOAK_CLIENT_ID`/`SAF_KEYCLOAK_CLIENT_SECRET`, `SAF_OPA_URL`, `SAF_SESSION_SECRET`, `SAF_ORCHESTRATOR_URL`, `SAF_OTEL_EXPORTER_URL`, per-app `SAF_*_PORT`) defaults to values matching the `infra:up` stack — override only for a non-default deployment. The `SAF_TEST_*` family (`SAF_TEST_POSTGRES_URL`, `SAF_TEST_POSTGRES_APP_URL`, `SAF_TEST_KEYCLOAK_ISSUER_URL`, `SAF_TEST_OPA_URL`, `SAF_TEST_ANTHROPIC_API_KEY`) gates real-infrastructure tests the same way: unset means that suite skips cleanly, never means a mocked stand-in runs silently in its place.

**Expected failure mode if `ANTHROPIC_API_KEY` is missing:** `pnpm dev` (or `node apps/orchestrator/dist/main.js`) exits immediately with `Error: Secret "ANTHROPIC_API_KEY" is not set in the environment` — a clear failure, not a hang or a silent degraded mode. If you only need `apps/api-gateway`/`apps/web` for UI work, you can still run those independently; only `apps/orchestrator` (and anything that depends on it, like `tools/sprint1-demo`) requires the key.

Use `tools/generators` to scaffold a new package, context, or plugin — it produces the correct `package.json`, `tsconfig`, lint config, dependency-cruiser registration, and README stub automatically. Don't hand-roll a new package's boilerplate; a hand-rolled package is how naming/layering conventions drift.

## Working on a change

- Branch from `main`: `feat/<ticket>-<slug>` or `fix/<ticket>-<slug>` (see naming table in [CODING_STANDARDS.md](CODING_STANDARDS.md)).
- Keep PRs small and single-purpose. A PR that mixes a feature with an unrelated refactor is harder to review and harder to revert if either half needs to come back out — see the Refactoring Policy in [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).
- Commit using Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`) — this drives changelog generation and release notes.
- If your change touches a published-meaningful package (`ports`, `plugin-sdk`, and anything else Changesets tracks), include a changeset describing the semver bump and why.
- If your change is cross-cutting or hard to reverse, write the ADR **before** or alongside the implementation, using [ADR_TEMPLATE.md](ADR_TEMPLATE.md) — not after the PR is already up for review.

## Opening a PR

- Fill out the PR template, including the `needs-adr` checklist item honestly — say no with a reason if it genuinely doesn't apply, don't just leave it unchecked.
- Make sure CI is green before requesting review: lint, typecheck, `dependency-cruiser`, unit/contract tests, build, security scan.
- Self-review your own diff first. A PR that clearly wasn't re-read by its author before submission is a signal to reviewers, and slows everyone down.
- Check your PR against [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) before requesting review — it's the same checklist your reviewer will use.

## Code review

- Every PR needs at least one approval from someone other than the author. A PR changing a port's public interface needs review from someone who represents its known consumers, not just the author's own team.
- Reviewers distinguish blocking comments from suggestions explicitly — see [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md) for what's always blocking (layering violations, missing ADRs, missing regression tests, anything on the prohibited list).
- Disagreements about an architectural rule are resolved by referring to the written principle, not by seniority or momentum — if the principle itself seems wrong for the situation, that's an ADR proposing to change it, not a one-off exception in review.

## Adding a plugin

Plugins are the primary extension point for SAP-specific capability and are expected to be authored by people who may not be core-platform maintainers. Start with [05-plugin-architecture.md](docs/architecture/05-plugin-architecture.md) and `plugin-sdk`'s own README. A plugin never needs to modify core code — if you find yourself wanting to, that's a sign the `plugin-sdk` contract is missing something, and that's a conversation to have via an ADR, not a one-off change to core.

## Getting help

- Architecture questions: check [docs/architecture/](docs/architecture/) and [docs/adr/](docs/adr/) first — most "why does it work this way" questions are answered there, with the reasoning, not just the rule.
- If something in this document or the linked governance docs is unclear or seems wrong, open an issue or raise it in review — these documents are maintained the same way the code is, not treated as immutable once written.
