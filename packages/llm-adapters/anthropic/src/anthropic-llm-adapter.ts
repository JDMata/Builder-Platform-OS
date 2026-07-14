import type {
  LlmCompletionChunk,
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmEmbeddingRequest,
  LlmEmbeddingResult,
  LlmProviderPort,
  RequestContext,
} from "@sap-app-factory/ports";

/**
 * Sprint 0 stub — returns a typed, deterministic mocked response. No real
 * network call to Anthropic's API; that's a later feature, not part of
 * proving the LlmProviderPort contract. See ADR-0005.
 */
export class AnthropicLlmAdapter implements LlmProviderPort {
  complete(_ctx: RequestContext, request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    const lastMessage = request.messages.at(-1);
    return Promise.resolve({
      content: `[stub] response to: ${lastMessage?.content ?? ""}`,
      toolCalls: [],
      usage: { inputTokens: request.messages.length, outputTokens: 1, costUsd: 0 },
      resolvedProvider: "anthropic",
      resolvedModel: "claude-stub",
    });
  }

  async *completeStream(
    ctx: RequestContext,
    request: LlmCompletionRequest,
  ): AsyncIterable<LlmCompletionChunk> {
    const result = await this.complete(ctx, request);
    yield { delta: result.content, done: true };
  }

  embed(_ctx: RequestContext, request: LlmEmbeddingRequest): Promise<LlmEmbeddingResult> {
    return Promise.resolve({
      embeddings: request.input.map(() => [0, 0, 0]),
      usage: { inputTokens: request.input.length, outputTokens: 0, costUsd: 0 },
    });
  }
}
