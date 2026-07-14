# 0004 — MCP abstraction layer (mcp-core + mcp-adapters)
Status: Accepted
Date: 2026-07-14

## Context
The platform must call MCP servers over multiple transports (stdio, HTTP/SSE, WebSocket) and across both SAP-specific and general-purpose servers, from orchestration code that should not need to know transport details or change when a new MCP server type appears.

## Decision
Define `ports/mcp-connection.port.ts` as the only interface orchestration/application code depends on for MCP access. `packages/mcp-core` holds the MCP Registry domain/application logic (server registration, tool discovery, capability binding — see [02-domain-model.md](../architecture/02-domain-model.md)). `packages/mcp-adapters/{stdio,http-sse,websocket}` implement the port per transport. Capability bindings (which plugin/step may call which tool) are enforced at this layer, making it the Zero Trust control point for tool access.

## Consequences
- Adding a new MCP transport or a new MCP server is an adapter addition, not a change to orchestration code.
- Every MCP call passes through one auditable choke point, which is where usage logging, capability-token enforcement, and tracing spans attach uniformly.
- Sprint 0 ships the port and one stub adapter only (no real MCP server integration) — see non-goals in [00-vision-and-principles.md](../architecture/00-vision-and-principles.md).

## Alternatives considered
- **Direct MCP client SDK usage inside `orchestrator`/plugins**: rejected — couples core/plugin code to a specific client library and transport, violating the MCP abstraction and no-vendor-lock-in principles, and removes the single choke point needed for Zero Trust capability enforcement.
- **One adapter per (transport × server) combination with no shared port**: rejected — loses the swappability and contract-testability that the port provides; would require every consumer to special-case each combination.
