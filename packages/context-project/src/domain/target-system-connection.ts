/**
 * See ADR-0015. This aggregate carries only an opaque, envelope-encrypted
 * reference — deliberately no plaintext credential field exists on this type,
 * structurally, not just by convention.
 */
export type TargetSystemConnectionStatus = "active" | "revoked";

export interface TargetSystemConnection {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly encryptedConnectionRef: string;
  readonly status: TargetSystemConnectionStatus;
}

export function createTargetSystemConnection(input: {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly encryptedConnectionRef: string;
}): TargetSystemConnection {
  if (input.encryptedConnectionRef.trim().length === 0) {
    throw new Error("encryptedConnectionRef must not be empty");
  }
  return {
    id: input.id,
    projectId: input.projectId,
    name: input.name,
    encryptedConnectionRef: input.encryptedConnectionRef,
    status: "active",
  };
}

export function revokeTargetSystemConnection(
  connection: TargetSystemConnection,
): TargetSystemConnection {
  return { ...connection, status: "revoked" };
}
