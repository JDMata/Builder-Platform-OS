import { describe, expect, it } from "vitest";
import type { LlmCompletionResult, LlmProviderPort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { withResilience } from "./resilient-llm-provider.js";

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
    async complete() {
      calls += 1;
      if (calls <= failuresBeforeSuccess) {
        throw new Error(`transient failure ${calls}`);
      }
      return fakeResult();
    },
    async *completeStream() {
      yield { delta: "x", done: true };
    },
    async embed() {
      return { embeddings: [[0]], usage: { inputTokens: 1, outputTokens: 0, costUsd: 0 } };
    },
  };
}

describe("withResilience", () => {
  it("succeeds on the first attempt when the adapter doesn't fail", async () => {
    const wrapped = withResilience(makeFlakyAdapter(0), { baseBackoffMs: 1 });
    const result = await wrapped.complete(createTestRequestContext(), {
      modelProfileId: "reasoning-large",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(result.content).toBe("ok");
  });

  it("retries a transient failure and eventually succeeds", async () => {
    const wrapped = withResilience(makeFlakyAdapter(2), { maxAttempts: 3, baseBackoffMs: 1 });
    const result = await wrapped.complete(createTestRequestContext(), {
      modelProfileId: "reasoning-large",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(result.content).toBe("ok");
  });

  it("gives up after maxAttempts and surfaces the last error", async () => {
    const wrapped = withResilience(makeFlakyAdapter(5), { maxAttempts: 2, baseBackoffMs: 1 });
    await expect(
      wrapped.complete(createTestRequestContext(), {
        modelProfileId: "reasoning-large",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toThrow(/transient failure/);
  });

  it("times out a call that never resolves", async () => {
    const hangingAdapter: LlmProviderPort = {
      complete: () => new Promise(() => {}),
      completeStream: async function* () {
        yield { delta: "", done: true };
      },
      embed: () => new Promise(() => {}),
    };
    const wrapped = withResilience(hangingAdapter, {
      maxAttempts: 1,
      timeoutMs: 5,
      baseBackoffMs: 1,
    });

    await expect(
      wrapped.complete(createTestRequestContext(), {
        modelProfileId: "reasoning-large",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toThrow(/timed out/);
  });
});
