import { describe, expect, it } from "vitest";
import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProviderPort,
} from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { createRequirementDocument } from "../domain/requirement-document.js";
import { structureBusinessRequirement } from "./structure-business-requirement.js";

/** No network — proves the parsing/mapping logic, the actual risk in this task, without depending on a real Anthropic call. */
function fakeLlmProvider(responseContent: string): LlmProviderPort {
  return {
    complete(_ctx, _request: LlmCompletionRequest): Promise<LlmCompletionResult> {
      return Promise.resolve({
        content: responseContent,
        toolCalls: [],
        usage: { inputTokens: 10, outputTokens: 10, costUsd: 0 },
        resolvedProvider: "fake",
        resolvedModel: "fake-model",
      });
    },
    completeStream: async function* () {
      yield { delta: "", done: true };
    },
    embed() {
      return Promise.resolve({
        embeddings: [],
        usage: { inputTokens: 0, outputTokens: 0, costUsd: 0 },
      });
    },
  };
}

function makeIdGenerator(): () => string {
  let n = 0;
  return () => `id-${n++}`;
}

describe("structureBusinessRequirement", () => {
  const ctx = createTestRequestContext();
  const document = createRequirementDocument({
    id: "doc-1",
    workspaceId: "workspace-1",
    ideaText:
      "We need a way for warehouse staff to reconcile physical stock counts against SAP inventory records at the end of each shift, and flag discrepancies over a threshold.",
  });

  it("maps a well-formed response into real Requirement/AcceptanceCriterion/Clarification domain objects", async () => {
    const llmProvider = fakeLlmProvider(
      JSON.stringify({
        suggestedProjectName: "Shift-End Stock Reconciliation",
        requirements: [
          {
            kind: "functional",
            description: "Reconcile physical stock counts against SAP inventory at shift end.",
            acceptanceCriteria: [
              {
                description: "System compares counted vs. system quantity per SKU.",
                origin: "extracted",
              },
              { description: "Discrepancies are logged with a timestamp.", origin: "ai-suggested" },
            ],
          },
        ],
        clarifications: [
          {
            question: "What counts as a discrepancy over threshold?",
            sourceFragment: "flag discrepancies over a threshold",
          },
        ],
      }),
    );

    const result = await structureBusinessRequirement(ctx, llmProvider, {
      document,
      answeredClarifications: [],
      generateId: makeIdGenerator(),
    });

    expect(result.suggestedProjectName).toBe("Shift-End Stock Reconciliation");
    expect(result.requirements).toHaveLength(1);
    expect(result.requirements[0]?.kind).toBe("functional");
    const criteria = result.acceptanceCriteriaByRequirementId.get(result.requirements[0]!.id);
    expect(criteria).toHaveLength(2);
    expect(criteria?.[0]?.status).toBe("confirmed");
    expect(criteria?.[1]?.status).toBe("proposed");
    expect(result.clarifications).toHaveLength(1);
    expect(result.clarifications[0]?.sourceFragment).toBe("flag discrepancies over a threshold");
  });

  it("strips a markdown code fence if the model wraps its JSON in one", async () => {
    const llmProvider = fakeLlmProvider(
      "```json\n" +
        JSON.stringify({
          suggestedProjectName: "x",
          requirements: [],
          clarifications: [{ question: "q", sourceFragment: "f" }],
        }) +
        "\n```",
    );

    const result = await structureBusinessRequirement(ctx, llmProvider, {
      document,
      answeredClarifications: [],
      generateId: makeIdGenerator(),
    });

    expect(result.clarifications).toHaveLength(1);
  });

  it("throws on invalid JSON rather than silently producing an empty result", async () => {
    const llmProvider = fakeLlmProvider("not json at all");
    await expect(
      structureBusinessRequirement(ctx, llmProvider, {
        document,
        answeredClarifications: [],
        generateId: makeIdGenerator(),
      }),
    ).rejects.toThrow(/not valid JSON/);
  });

  it("throws when the response is missing required fields", async () => {
    const llmProvider = fakeLlmProvider(JSON.stringify({ requirements: [] }));
    await expect(
      structureBusinessRequirement(ctx, llmProvider, {
        document,
        answeredClarifications: [],
        generateId: makeIdGenerator(),
      }),
    ).rejects.toThrow(/missing required fields/);
  });

  it("throws rather than accept a response with zero requirements and zero clarifications (never a silent empty result)", async () => {
    const llmProvider = fakeLlmProvider(
      JSON.stringify({ suggestedProjectName: "x", requirements: [], clarifications: [] }),
    );
    await expect(
      structureBusinessRequirement(ctx, llmProvider, {
        document,
        answeredClarifications: [],
        generateId: makeIdGenerator(),
      }),
    ).rejects.toThrow(/neither requirements nor clarifications/);
  });

  it("includes previously answered clarifications in the prompt for a re-structuring pass", async () => {
    let capturedPrompt = "";
    const llmProvider: LlmProviderPort = {
      complete(_ctx, request) {
        capturedPrompt = request.messages.map((m) => m.content).join("\n");
        return Promise.resolve({
          content: JSON.stringify({
            suggestedProjectName: "x",
            requirements: [{ kind: "business", description: "d", acceptanceCriteria: [] }],
            clarifications: [],
          }),
          toolCalls: [],
          usage: { inputTokens: 1, outputTokens: 1, costUsd: 0 },
          resolvedProvider: "fake",
          resolvedModel: "fake-model",
        });
      },
      completeStream: async function* () {
        yield { delta: "", done: true };
      },
      embed() {
        return Promise.resolve({
          embeddings: [],
          usage: { inputTokens: 0, outputTokens: 0, costUsd: 0 },
        });
      },
    };

    const { answerClarification, raiseClarification } = await import("../domain/clarification.js");
    const answered = answerClarification(
      raiseClarification({
        id: "c1",
        requirementDocumentId: "doc-1",
        question: "What counts as a discrepancy over threshold?",
        sourceFragment: "flag discrepancies over a threshold",
      }),
      "Over 5 units or 2%, whichever is greater",
    );

    await structureBusinessRequirement(ctx, llmProvider, {
      document,
      answeredClarifications: [answered],
      generateId: makeIdGenerator(),
    });

    expect(capturedPrompt).toContain("What counts as a discrepancy over threshold?");
    expect(capturedPrompt).toContain("Over 5 units or 2%, whichever is greater");
  });
});
