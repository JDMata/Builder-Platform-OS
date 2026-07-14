# 01 — High-Level Architecture

## System context

```mermaid
graph TB
    User["Delivery team user<br/>(architect, developer, PM, reviewer)"]
    Admin["Platform admin"]
    IdP["External IdP<br/>(Entra ID / Okta / Keycloak / SAP IAS)"]
    GH["GitHub<br/>(source, PRs, Actions)"]
    LLMs["LLM Providers<br/>(Anthropic, OpenAI, Azure OpenAI, Bedrock, local)"]
    MCPs["MCP Servers<br/>(SAP-specific + general purpose, external)"]
    SAPBTP["Target SAP landscape<br/>(BTP, Cloud Foundry, Kyma, on-prem)"]

    User -->|uses| Platform["SAP App Factory"]
    Admin -->|configures| Platform
    Platform <-->|OIDC| IdP
    Platform <-->|repos, PRs, CI| GH
    Platform -->|LLM abstraction layer| LLMs
    Platform -->|MCP abstraction layer| MCPs
    Platform -->|generates into / deploys to| SAPBTP
```

The platform never talks to an LLM provider, an MCP server, or an SAP target system directly from domain code — every arrow crossing the platform boundary above passes through an abstraction layer defined in [ports](03-monorepo-and-packages.md) and implemented by adapters.

## Logical architecture (C4 container view)

```mermaid
graph TB
    subgraph Client
      Web["web (Next.js)<br/>Control plane UI"]
    end

    subgraph "Edge / API"
      GW["api-gateway<br/>BFF, AuthN/AuthZ enforcement, public API"]
    end

    subgraph "Application core (modular monolith)"
      Orchestrator["orchestrator<br/>Workflow + Agent Orchestration"]
      Worker["worker<br/>Async job execution"]
    end

    subgraph "Abstraction layers (library packages)"
      LLMCore["llm-core<br/>+ llm-adapters/*"]
      MCPCore["mcp-core<br/>+ mcp-adapters/*"]
      EventsCore["events-core<br/>+ events-adapters/*"]
      AuthCore["auth-core<br/>Policy engine port"]
    end

    subgraph "Capability plugins (SAP-specific, isolated)"
      Plugins["plugins/*<br/>Fiori / CAP / RAP / Integration generators<br/>(empty stubs in Sprint 0)"]
    end

    subgraph Data
      PG[("PostgreSQL")]
      Redis[("Redis")]
      MinIO[("MinIO")]
    end

    subgraph Observability
      Otel["OpenTelemetry Collector"]
    end

    Web --> GW
    GW --> Orchestrator
    Orchestrator --> LLMCore
    Orchestrator --> MCPCore
    Orchestrator --> EventsCore
    Orchestrator -->|invokes via plugin-sdk port| Plugins
    Worker --> LLMCore
    Worker --> MCPCore
    Worker --> Plugins
    GW --> AuthCore
    Orchestrator --> PG
    Worker --> Redis
    Orchestrator --> MinIO
    Web -. traces/metrics/logs .-> Otel
    GW -. traces/metrics/logs .-> Otel
    Orchestrator -. traces/metrics/logs .-> Otel
    Worker -. traces/metrics/logs .-> Otel
```

## Layering (Clean / Hexagonal)

Every package in `packages/` sits in exactly one of these layers. Dependencies only point inward; enforced mechanically (see [10](10-coding-standards-and-naming.md) and [12](12-risks-and-technical-debt.md)), not by convention alone.

```mermaid
graph LR
    subgraph "Layer 4: Adapters (outermost)"
      A1[llm-adapters/*]
      A2[mcp-adapters/*]
      A3[persistence-postgres]
      A4[object-storage-minio]
      A5[events-adapters/*]
      A6[plugins/*]
    end
    subgraph "Layer 3: Ports"
      P1[ports/* interfaces only]
    end
    subgraph "Layer 2: Application"
      U1[application/* use cases]
    end
    subgraph "Layer 1: Domain (innermost)"
      D1[domain/* entities, value objects, domain events]
    end

    A1 & A2 & A3 & A4 & A5 & A6 -->|implement| P1
    U1 -->|depends on| P1
    U1 -->|depends on| D1
    D1 -->|depends on nothing| D1
```

**Rule:** `domain/*` has zero dependencies on any other layer or any framework (no Express, no Prisma, no LLM SDK types). `application/*` depends only on `domain/*` and `ports/*` (interfaces), never on a concrete adapter package. Adapters are the only packages allowed to import a third-party SDK.

## Why a modular monolith, not microservices, for Sprint 0–2

Given the number of moving parts implied by the vision (agents, MCP, multiple LLMs, multiple SAP stacks), the instinct is to split everything into services immediately. That is a classic source of premature distributed-systems tax: network calls where a function call would do, duplicated cross-cutting concerns, and operational overhead with no user yet.

Instead: **one deployable application core (`orchestrator` + `worker`) with strict internal module boundaries**, extracted into separate services only when a concrete scaling or team-ownership need proves it (see [ADR-0003](../adr/0003-modular-monolith-first.md)). The hexagonal layering above is what makes that extraction cheap later — a package behind a port can become a service behind an API without touching its callers.

## Related documents
- Domain model and bounded contexts: [02-domain-model.md](02-domain-model.md)
- Monorepo/package strategy: [03-monorepo-and-packages.md](03-monorepo-and-packages.md)
- Service boundaries: [04-service-boundaries.md](04-service-boundaries.md)
