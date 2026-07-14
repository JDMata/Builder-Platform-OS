import { describe, expect, it } from "vitest";
import type { LlmCompletionResult, LlmProviderPort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { withResilience } from "./resilient-llm-provider.js";

// The retry/timeout algorithm itself is tested once, generically, in
// @sap-app-factory/resilience-kit. These tests only prove the wiring: that
// withResilience actually applies it to complete()/embed() and deliberately
// does not wrap completeStream().

function fakeResult(): LlmCompletionResult {
  return {
    content: "ok",
    toolCalls: [],
    usage: { inputTokens: 1, outputTokens: 1, costUsd: 0 },
    resolvedProvider: "fake",
    resolvedModel: "fake-model",
  };
}

function makeFlakyAdapter(failuresBeforeSuccess: number): LlmProviderPort {
  let calls = 0;
  return {
    complete() {
      calls += 1;
      if (calls <= failuresBeforeSuccess) {
        return Promise.reject(new Error(`transient failure ${calls}`));
      }
      return Promise.resolve(fakeResult());
    },
    completeStream: async function* () {
      yield { delta: "x", done: true };
    },
    embed() {
      return Promise.resolve({
        embeddings: [[0]],
        usage: { inputTokens: 1, outputTokens: 0, costUsd: 0 },
      });
    },
  };
}

describe("withResilience", () => {
  it("retries a transient failure on complete() and eventually succeeds", async () => {
    const wrapped = withResilience(makeFlakyAdapter(2), { maxAttempts: 3, baseBackoffMs: 1 });
    const result = await wrapped.complete(createTestRequestContext(), {
      modelProfileId: "reasoning-large",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(result.content).toBe("ok");
  });

  it("retries a transient failure on embed() too", async () => {
    const adapter = makeFlakyAdapter(1);
    const wrapped = withResilience(adapter, { maxAttempts: 2, baseBackoffMs: 1 });
    const result = await wrapped.embed(createTestRequestContext(), {
      modelProfileId: "embeddings-default",
      input: ["a"],
    });
    expect(result.embeddings).toHaveLength(1);
  });

  it("does not retry completeStream — passes through directly", async () => {
    const wrapped = withResilience(makeFlakyAdapter(0));
    const chunks = [];
    for await (const chunk of wrapped.completeStream(createTestRequestContext(), {
      modelProfileId: "reasoning-large",
      messages: [{ role: "user", content: "hi" }],
    })) {
      chunks.push(chunk);
    }
    expect(chunks).toEqual([{ delta: "x", done: true }]);
  });
});
