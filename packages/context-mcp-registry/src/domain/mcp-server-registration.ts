export type McpTransport = "stdio" | "http-sse" | "websocket";
export type McpServerRegistrationStatus = "active" | "disabled";

export interface McpServerRegistration {
  readonly id: string;
  readonly name: string;
  readonly transport: McpTransport;
  readonly status: McpServerRegistrationStatus;
}

export function registerMcpServer(input: {
  readonly id: string;
  readonly name: string;
  readonly transport: McpTransport;
}): McpServerRegistration {
  if (input.name.trim().length === 0) {
    throw new Error("McpServerRegistration name must not be empty");
  }
  return { id: input.id, name: input.name, transport: input.transport, status: "active" };
}

export function disableMcpServer(registration: McpServerRegistration): McpServerRegistration {
  return { ...registration, status: "disabled" };
}
