import type {
  McpConnectionPort,
  McpToolInvocationRequest,
  McpToolInvocationResult,
  McpToolSchema,
  RequestContext,
} from "@sap-app-factory/ports";

/**
 * Sprint 0 stub — returns a fixed, typed mocked tool list and a mocked
 * invocation result. No real subprocess is spawned; that's a later feature,
 * not part of proving the McpConnectionPort contract. See ADR-0004.
 */
export class StdioMcpAdapter implements McpConnectionPort {
  listTools(_ctx: RequestContext, _serverId: string): Promise<readonly McpToolSchema[]> {
    return Promise.resolve([
      {
        name: "echo",
        description:
          "Echoes back its input — a stub tool proving the contract, not a real capability.",
        inputSchema: { type: "object", properties: { message: { type: "string" } } },
      },
    ]);
  }

  invokeTool(
    _ctx: RequestContext,
    request: McpToolInvocationRequest,
  ): Promise<McpToolInvocationResult> {
    return Promise.resolve({
      content: { echoed: request.arguments },
      isError: false,
    });
  }
}
