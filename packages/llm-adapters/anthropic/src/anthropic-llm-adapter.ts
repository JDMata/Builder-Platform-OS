import Anthropic from "@anthropic-ai/sdk";
import type {
  LlmCompletionChunk,
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmEmbeddingRequest,
  LlmEmbeddingResult,
  LlmProviderPort,
  RequestContext,
} from "@sap-app-factory/ports";
import { resolveModel, splitSystemPrompt, toAnthropicRole } from "./request-mapping.js";

/**
 * Real implementation of `LlmProviderPort` for Anthropic (ADR-0005), first
 * exercised for real by VS-1's `structure-business-requirement` capability
 * (Sprint 1) — previously a deterministic stub (Sprint 0), proving only the
 * contract shape.
 *
 * `embed()` remains the Sprint 0 stub deliberately, not "made real" — the
 * Anthropic Messages API has no embeddings endpoint, and no Sprint 1
 * capability calls `embed()` on this adapter. `LlmProviderPort` stays
 * correctly shaped for adapters that do support it (a future embeddings
 * provider); this is a documented, narrow adapter limitation, not a port
 * design flaw, so it doesn't trigger the "stop and recommend an ADR" rule —
 * see the VS-1 Readiness Review and the Vertical Slice Exit Gate Report's
 * Known Limitations.
 */
export class AnthropicLlmAdapter implements LlmProviderPort {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(
    _ctx: RequestContext,
    request: LlmCompletionRequest,
  ): Promise<LlmCompletionResult> {
    const { system, rest } = splitSystemPrompt(request.messages);
    const response = await this.client.messages.create({
      model: resolveModel(request.modelProfileId),
      max_tokens: request.maxOutputTokens ?? 4096,
      ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
      ...(system === undefined ? {} : { system }),
      messages: rest.map((m) => ({ role: toAnthropicRole(m.role), content: m.content })),
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    return {
      content: textBlock?.text ?? "",
      toolCalls: [],
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        costUsd: 0,
      },
      resolvedProvider: "anthropic",
      resolvedModel: response.model,
    };
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
