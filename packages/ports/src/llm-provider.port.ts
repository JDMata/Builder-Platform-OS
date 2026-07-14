import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0005 (LLM abstraction layer) and ADR-0016 (mandatory resilience —
 * implemented by adapters behind this port, not part of the contract itself).
 * Application/workflow code references a model by logical `modelProfileId`
 * (e.g. "reasoning-large") — never a concrete provider/model string.
 */

export interface ModelMessage {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string;
}

export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  /** JSON Schema for the tool's input. */
  readonly inputSchema: Record<string, unknown>;
}

export interface ToolCallRequest {
  readonly toolName: string;
  readonly arguments: Record<string, unknown>;
}

export interface LlmUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number;
}

export interface LlmCompletionRequest {
  /** Logical name resolved to a concrete provider/model by the adapter — see ModelProfile, docs/architecture/02-domain-model.md. */
  readonly modelProfileId: string;
  readonly messages: readonly ModelMessage[];
  /** Pinned prompt reference — see aggregate design rule 6 (reproducibility). */
  readonly promptTemplateId?: string;
  readonly promptTemplateVersion?: number;
  readonly availableTools?: readonly ToolDefinition[];
  readonly maxOutputTokens?: number;
  readonly temperature?: number;
}

export interface LlmCompletionResult {
  readonly content: string;
  readonly toolCalls: readonly ToolCallRequest[];
  readonly usage: LlmUsage;
  /** The concrete provider/model that actually served this call — recorded for audit/reproducibility, never chosen by the caller. */
  readonly resolvedProvider: string;
  readonly resolvedModel: string;
}

export interface LlmCompletionChunk {
  readonly delta: string;
  readonly done: boolean;
}

export interface LlmEmbeddingRequest {
  readonly modelProfileId: string;
  readonly input: readonly string[];
}

export interface LlmEmbeddingResult {
  readonly embeddings: readonly (readonly number[])[];
  readonly usage: LlmUsage;
}

export interface LlmProviderPort {
  complete(ctx: RequestContext, request: LlmCompletionRequest): Promise<LlmCompletionResult>;
  completeStream(
    ctx: RequestContext,
    request: LlmCompletionRequest,
  ): AsyncIterable<LlmCompletionChunk>;
  embed(ctx: RequestContext, request: LlmEmbeddingRequest): Promise<LlmEmbeddingResult>;
}
