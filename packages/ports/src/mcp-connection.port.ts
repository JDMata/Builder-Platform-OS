import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0004 (MCP abstraction layer). Every MCP call goes through this one
 * choke point — the Zero Trust enforcement surface for tool access (see
 * docs/architecture/08-authentication-and-rbac.md and the scoped capability
 * token mechanism in ADR-0006).
 */

export interface McpToolSchema {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
}

export interface McpToolInvocationRequest {
  readonly serverId: string;
  readonly toolName: string;
  readonly arguments: Record<string, unknown>;
  /** The scoped capability token authorizing this specific invocation — see ADR-0006. */
  readonly capabilityTokenId: string;
}

export interface McpToolInvocationResult {
  readonly content: unknown;
  readonly isError: boolean;
}

export interface McpConnectionPort {
  listTools(ctx: RequestContext, serverId: string): Promise<readonly McpToolSchema[]>;
  invokeTool(
    ctx: RequestContext,
    request: McpToolInvocationRequest,
  ): Promise<McpToolInvocationResult>;
}
