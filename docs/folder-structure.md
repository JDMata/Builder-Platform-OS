# Folder Structure

> Revised after principal-architect self-review ([architecture/13-principal-architect-self-review.md](architecture/13-principal-architect-self-review.md)): bounded-context packages collapsed from domain+application pairs to one package per context (ADR-0018), and `ports/`, `packages/`, and `plugins/` gained a few entries the original Sprint 0 pass missed (rate limiter and tenant-connection-resolver ports, read-models, target-system connections, plugin isolation). Everything below reflects the revised state, not the original Sprint 0 draft.

Proposed monorepo layout. Everything under `plugins/` and the `*-adapters` directories is stub-only in Sprint 0 — the goal is to prove the seams exist and are enforced, not to implement capability.

```
sap-app-factory/
├── apps/                                # Deployable units only
│   ├── web/                             # Next.js control-plane UI (React, TS, Tailwind, UI5 Web Components)
│   ├── api-gateway/                     # BFF + public API, AuthN/AuthZ enforcement point
│   ├── orchestrator/                    # Owns Workflow/Agent Orchestration context
│   └── worker/                          # Async job execution (BullMQ consumers, plugin invocations)
│
├── packages/
│   ├── context-identity/                # One package per bounded context (revised — see ADR-0018)
│   │   └── src/{domain,application}/    # Layers 1-2 as folders, not separate packages; layering enforced by folder-scoped dependency-cruiser rules
│   ├── context-project/                 # includes TargetSystemConnection (ADR-0015)
│   ├── context-requirements/
│   ├── context-capability-registry/
│   ├── context-workflow/
│   ├── context-llm-gateway/
│   ├── context-mcp-registry/
│   ├── context-generation/
│   ├── context-governance/              # includes PII vault / crypto-shredding concerns (ADR-0017)
│   │
│   ├── ports/                           # Layer 3 — interfaces only, no implementation
│   │   ├── llm-provider.port.ts
│   │   ├── mcp-connection.port.ts
│   │   ├── event-bus.port.ts
│   │   ├── repository.port.ts
│   │   ├── object-store.port.ts
│   │   ├── secrets-vault.port.ts
│   │   ├── workflow-engine.port.ts
│   │   ├── policy-engine.port.ts
│   │   ├── rate-limiter.port.ts         # Added post-review — per-tenant/provider/plugin quotas (13-principal-architect-self-review.md §9)
│   │   └── tenant-connection-resolver.port.ts  # Added post-review — resolves tenant → physical DB/schema/region (ADR-0013)
│   │
│   ├── llm-core/                        # LLM Gateway domain/application logic
│   ├── llm-adapters/
│   │   ├── anthropic/
│   │   ├── openai/
│   │   ├── azure-openai/
│   │   └── bedrock/
│   │
│   ├── mcp-core/                        # MCP Registry domain/application logic
│   ├── mcp-adapters/
│   │   ├── stdio/
│   │   ├── http-sse/
│   │   └── websocket/
│   │
│   ├── events-core/                     # CloudEvents envelope, outbox contract, bus port impl helpers
│   ├── events-adapters/
│   │   ├── postgres-outbox/             # Sprint 0 default
│   │   └── redis-streams/               # Brought forward to Sprint 1-2 (ADR-0007 revision) — NOTIFY doesn't hold at target event volume
│   │
│   ├── persistence-postgres/            # Repository implementations (Drizzle), one module per schema
│   ├── object-storage-minio/
│   ├── auth-core/                       # AuthN session handling + policy-engine port + OPA/Cedar adapter
│   │
│   ├── plugin-sdk/                      # The ONLY package allowed to define the CapabilityPlugin contract
│   │                                     #   execute() seam now required to run plugins in an isolated process/container (ADR-0006 revision) before any real plugin ships
│   │
│   ├── read-models/                     # Added post-review — event-fed projections for cross-aggregate reporting (ADR-0014)
│   ├── ui-kit/                          # Shared design system (React + UI5 Web Components wrappers)
│   ├── observability/                   # OpenTelemetry SDK setup, shared logger, tracing helpers
│   ├── config/                          # Typed env/config loader
│   └── testing-kit/                     # Shared fixtures, contract-test harness for ports/adapters
│
├── plugins/                             # SAP-specific capability plugins — OUT of core, dynamically loaded
│   ├── fiori-generator/                 # Sprint 0: manifest + no-op generate(), contract test only
│   ├── cap-node-generator/
│   ├── cap-java-generator/
│   ├── abap-rap-generator/
│   ├── integration-suite-generator/
│   └── README.md                        # How to author a plugin against plugin-sdk
│
├── infra/
│   ├── docker-compose/                  # postgres, redis, minio, otel-collector, keycloak (dev IdP)
│   ├── github-actions/                  # Reusable/composite workflow definitions
│   └── otel-collector/                  # Collector config
│
├── docs/
│   ├── architecture/                    # This document set
│   ├── adr/                             # Architecture Decision Records
│   └── backlog/                         # Sprint backlogs
│
├── tools/
│   ├── scripts/                         # Repo maintenance scripts
│   └── generators/                      # Plop/Hygen templates for new packages/plugins (consistency by default)
│
├── .github/workflows/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── dependency-cruiser.config.cjs        # Enforces the layering rules mechanically
└── README.md
```

## Placement rules (quick reference)

- **"Is this SAP-specific?"** → `plugins/<name>/`. Never `packages/domain` or `packages/application`.
- **"Does this talk to a third-party SDK (LLM, MCP transport, cloud storage)?"** → an `*-adapters/<vendor>` folder, behind the matching port.
- **"Is this a business rule with no I/O?"** → `packages/domain/<context>/`.
- **"Is this a use case coordinating domain + ports?"** → `packages/application/<context>/`.
- **"Is this a runnable process with its own deploy lifecycle?"** → `apps/*`, and it must be listed in [04-service-boundaries.md](architecture/04-service-boundaries.md).
- **"Is this a cross-aggregate/cross-context read query for a dashboard or list view?"** → `packages/read-models/*`, queried directly — never bent into an aggregate repository call. See [ADR-0014](adr/0014-cqrs-read-models.md).
- **"Does this touch a credential for a customer's own SAP system (not the platform's own secrets)?"** → the Connection Management concept in `context-project`, behind `TargetSystemConnection`, never the generic `secrets-vault` port. See [ADR-0015](adr/0015-target-system-credential-management.md).
