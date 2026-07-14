import type { RequestContext } from "./request-context.js";

/**
 * The platform's OWN operational secrets (IdP client secret, LLM/MCP provider
 * keys) — a distinct, lower-stakes concept from customer target-system
 * credentials. See ADR-0015: `TargetSystemConnection` is deliberately NOT
 * modeled through this port, to keep the two threat models visibly separate.
 */

export interface SecretRef {
  readonly name: string;
}

export interface SecretsVaultPort {
  getSecret(ctx: RequestContext, ref: SecretRef): Promise<string>;
  setSecret(ctx: RequestContext, ref: SecretRef, value: string): Promise<void>;
}
