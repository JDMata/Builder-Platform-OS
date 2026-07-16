import { describe, expect, it } from "vitest";
import { withResilience } from "@sap-app-factory/llm-core";
import { createTestRequestContext, llmProviderContractTests } from "@sap-app-factory/testing-kit";
import { AnthropicLlmAdapter } from "./anthropic-llm-adapter.js";

/**
 * Real Anthropic API tests, gated behind SAF_TEST_ANTHROPIC_API_KEY — same
 * env-gated-real-provider convention as persistence-postgres/*'s
 * SAF_TEST_POSTGRES_URL (SAF-11). Skips cleanly with no key configured;
 * exercised for real, deliberately, when one is. `embed()` is not covered
 * here — Anthropic has no embeddings endpoint and no VS-1 capability calls
 * it (see the adapter's own doc comment).
 */
const apiKey = process.env.SAF_TEST_ANTHROPIC_API_KEY;

describe.skipIf(!apiKey)("AnthropicLlmAdapter (requires SAF_TEST_ANTHROPIC_API_KEY)", () => {
  it("complete() returns a real completion from a real Anthropic model", async () => {
    const adapter = new AnthropicLlmAdapter(apiKey!);
    const result = await adapter.complete(createTestRequestContext(), {
      modelProfileId: "reasoning-standard",
      messages: [{ role: "user", content: "Reply with exactly the single word: acknowledged" }],
      maxOutputTokens: 16,
    });

    expect(result.content.toLowerCase()).toContain("acknowledged");
    expect(result.resolvedProvider).toBe("anthropic");
    expect(result.resolvedModel.length).toBeGreaterThan(0);
    expect(result.usage.inputTokens).toBeGreaterThan(0);
    expect(result.usage.outputTokens).toBeGreaterThan(0);
  });

  it("resilience (llm-core's withResilience) still wraps a real completion cleanly", async () => {
    const adapter = withResilience(new AnthropicLlmAdapter(apiKey!));
    const result = await adapter.complete(createTestRequestContext(), {
      modelProfileId: "reasoning-standard",
      messages: [{ role: "user", content: "Reply with exactly the single word: acknowledged" }],
      maxOutputTokens: 16,
    });
    expect(result.content.toLowerCase()).toContain("acknowledged");
  });

  llmProviderContractTests(() => new AnthropicLlmAdapter(apiKey!));
});

describe("AnthropicLlmAdapter construction", () => {
  it("constructs without throwing given any string api key (validity is checked by the API call itself, not the constructor)", () => {
    expect(() => new AnthropicLlmAdapter("sk-placeholder-for-construction-only")).not.toThrow();
  });
});
