# 4. Sprint 0 Platform Readiness Report

Simulated as: a new senior developer, no prior context, joins tomorrow. Each step below was actually re-verified during this audit (not assumed from having built the platform).

| Task | Can they do it? | Evidence |
|---|---|---|
| Clone the repository | Yes | Standard git clone; no submodules, no external LFS dependency. |
| Install dependencies | Yes | `pnpm install` — verified fresh this audit, `packageManager: pnpm@10.20.0` pinned in root `package.json`, `.nvmrc` pins the exact Node version (`24.13.0`) this whole build was developed and tested against. |
| Run Docker | Yes | `pnpm run infra:up` — verified via a full `infra:reset`→`infra:up` cycle this audit; Postgres and Keycloak report real `healthy` status; OPA/otel-collector's lack of a container-exec healthcheck is explained in `infra/README.md` (distroless images, confirmed by hand) with a host-side `curl` alternative given. |
| Start the platform | Partially — and this is honestly documented, not hidden | Each `apps/*` has its own `pnpm dev` (via `tsx watch`) but there is no single "start everything" command. Real, working example of running two apps together and proving cross-process behavior lives in `packages/observability`'s README (the `web`↔`api-gateway` trace-propagation walkthrough) and `tools/sprint0-demo` (`pnpm run demo:sprint0`), which drives every backend seam through one command without needing four terminals. |
| Run tests | Yes | `pnpm run test` (non-gated suites, no infra needed) and `pnpm run demo:sprint0` (needs `infra:up` first) both verified fresh this audit. Real-infra-gated suites (`SAF_TEST_*` env vars) are documented in `CONTRIBUTING.md` and each gated package's own README. |
| Understand the architecture | Yes | `README.md`'s "Start here" table is a genuinely complete, ordered reading path (`00` through `18`), each doc cross-linking the ADR that decided it. Verified by walking the same path this audit did. |
| Locate documentation | Yes | Every governance doc (`CODING_STANDARDS.md`, `ARCHITECTURE_PRINCIPLES.md`, etc.) is linked from the root README's first table; every package has a README with Purpose + Ports (mechanically enforced by SAF-19's fitness check, 30/30 packages passing as of this audit). |
| Understand the bounded contexts | Yes | `02-domain-model.md`'s context map + `PROJECT_STRUCTURE.md`'s canonical tree, cross-referenced — with the one honest exception (`Notification`'s unresolved fate, named explicitly in the Technical Debt Report rather than left for a new engineer to discover and wonder about). |
| Understand the workflow engine | Yes | `07-workflow-engine.md` for the design, `packages/workflow-engine-adapters/in-memory`'s README for what's actually built and why it's deliberately not durable yet (with the SAF-24 Temporal-spike trigger stated), `tools/sprint0-demo` for a real, runnable example of starting and advancing a run. |
| Understand the plugin model | Yes | `05-plugin-architecture.md` for the design, `plugin-sdk`'s README for the real `execute()` seam, `plugins/fiori-generator`'s README for a real, minimal, working example a new plugin author could copy. |
| Understand the capability model | Yes | `18-capability-model.md` for the design (including the `CapabilityProvider`/`CapabilityBinding` naming-collision warning, documented specifically so it isn't rediscovered as confusion), `apps/orchestrator`'s README + `tools/sprint0-demo`'s README for real, running resolution logic. |
| Understand the Digital Twin | Yes, as a design | `16-project-digital-twin.md` fully explains the model even though nothing is built yet — a new engineer reading it would correctly understand "this is decided, not yet implemented," not mistake it for a working feature. |

## Gaps found and fixed during this audit

`CONTRIBUTING.md`'s "Environment setup" section — the very first thing a new engineer runs — pointed at a docker-compose file that doesn't exist (`infra/docker-compose/dev.yml`) and listed services (Redis, MinIO) that were never built, alongside real ones. **This would have been the first thing to fail for a genuinely new engineer.** Fixed as part of this audit (see the Completion Report). This is exactly the kind of gap a platform-readiness review exists to catch before it reaches someone who doesn't already know the right command by heart.

## Residual friction, honestly named

- Starting all four `apps/*` together for manual, interactive exploration takes four separate `pnpm dev` invocations — there's no `docker-compose`-style "up everything" for the application layer itself (only for infra). `tools/sprint0-demo` covers the "prove the backend works end to end" need without this, but a new engineer wanting to click through `web`'s UI while `api-gateway` is live still needs to start both by hand. Worth a root-level convenience script early in Sprint 1, not a Sprint 0 blocker.
- The `apps/web` status page is the only real UI; there is nothing yet resembling the eventual product surface. Expected at this stage, but worth being explicit that "run the platform" today means "prove the seams work," not "see the product."
