import { describe, expect, it } from "vitest";
import type { LlmProviderPort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Any adapter (real or fake) behind LlmProviderPort must pass this suite.
 * See CODING_STANDARDS.md § Testing and ADR-0005.
 */
export function llmProviderContractTests(
  createAdapter: () => LlmProviderPort | Promise<LlmProviderPort>,
): void {
  describe("LlmProviderPort contract", () => {
    it("complete() resolves a concrete provider/model and returns usage", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const result = await adapter.complete(ctx, {
        modelProfileId: "reasoning-large",
        messages: [{ role: "user", content: "hello" }],
      });

      expect(typeof result.content).toBe("string");
      expect(result.resolvedProvider.length).toBeGreaterThan(0);
      expect(result.resolvedModel.length).toBeGreaterThan(0);
      expect(result.usage.inputTokens).toBeGreaterThanOrEqual(0);
      expect(result.usage.outputTokens).toBeGreaterThanOrEqual(0);
    });

    it("embed() returns one embedding vector per input string", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const result = await adapter.embed(ctx, {
        modelProfileId: "embeddings-default",
        input: ["a", "b", "c"],
      });

      expect(result.embeddings).toHaveLength(3);
    });
  });
}
