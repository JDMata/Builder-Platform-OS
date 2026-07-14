# Folder Structure

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
│   ├── domain/                          # Layer 1 — pure domain, zero framework deps
│   │   ├── identity/
│   │   ├── project/
│   │   ├── requirements/
│   │   ├── capability-registry/
│   │   ├── workflow/
│   │   ├── llm-gateway/
│   │   ├── mcp-registry/
│   │   ├── generation/
│   │   └── governance/
│   ├── application/                     # Layer 2 — use cases, orchestrates domain + ports
│   │   └── <mirrors domain/ subfolders>
│   ├── ports/                           # Layer 3 — interfaces only, no implementation
│   │   ├── llm-provider.port.ts
│   │   ├── mcp-connection.port.ts
│   │   ├── event-bus.port.ts
│   │   ├── repository.port.ts
│   │   ├── object-store.port.ts
│   │   ├── secrets-vault.port.ts
│   │   ├── workflow-engine.port.ts
│   │   └── policy-engine.port.ts
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
│   │   └── redis-streams/               # future swap-in, not built in Sprint 0
│   │
│   ├── persistence-postgres/            # Repository implementations (Drizzle), one module per schema
│   ├── object-storage-minio/
│   ├── auth-core/                       # AuthN session handling + policy-engine port + OPA/Cedar adapter
│   │
│   ├── plugin-sdk/                      # The ONLY package allowed to define the CapabilityPlugin contract
│   │
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
