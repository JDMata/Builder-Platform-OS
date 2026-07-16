import type { LlmProviderPort, RequestContext } from "@sap-app-factory/ports";
import {
  createAcceptanceCriterion,
  type AcceptanceCriterion,
  type AcceptanceCriterionOrigin,
} from "../domain/acceptance-criterion.js";
import { raiseClarification, type Clarification } from "../domain/clarification.js";
import type { RequirementDocument } from "../domain/requirement-document.js";
import {
  createRequirement,
  type Requirement,
  type RequirementKind,
} from "../domain/requirement.js";

/**
 * Real implementation of the `structure-business-requirement` capability
 * (VS-1) — the first application-layer code in the platform. Invoked via
 * `CapabilityResolverPort`, never called directly by a workflow step (the
 * Capability Model, ADR-0022). Kept in sync with
 * `.ai/prompts/requirements-analyst/v1/system.md` — the pinned prompt this
 * capability's output-format contract depends on; a change to one without
 * the other silently breaks parsing, so both must move together.
 */
const REQUIREMENTS_ANALYST_SYSTEM_PROMPT = `You are the Requirements Analyst agent for SAP App Factory. Your job is to turn a raw business requirement into a structured RequirementDocument: discrete, testable Requirement entries, each with explicit AcceptanceCriterions.

Rules:
- If any part of the input is ambiguous, contradictory, or missing information you'd need to write a testable acceptance criterion, raise a Clarification question instead of guessing.
- Do not propose a technical solution, target technology, or specific product choice - that decision belongs to a later capability, not this one.
- Emit your output in the structured RequirementDocument shape - never as free-form prose summary.
- You may also suggest an acceptance criterion the input implies but doesn't state outright - mark it distinctly ("origin": "ai-suggested") so the platform can present it to the human as a proposal, never as an added fact.
- Suggest a short, human-readable project name for what's being described (suggestedProjectName) - a business stakeholder should never have to type this by hand.

Respond with only a single JSON object, no prose before or after, no markdown code fence, matching exactly:
{
  "suggestedProjectName": "string",
  "requirements": [
    { "kind": "business" | "functional" | "non-functional" | "user-story", "description": "string",
      "acceptanceCriteria": [ { "description": "string", "origin": "extracted" | "ai-suggested" } ] }
  ],
  "clarifications": [
    { "question": "string", "sourceFragment": "string (a short quote from the input idea text that triggered this question)" }
  ]
}
If you have no open questions, clarifications must be an empty array - never omit the field. If you are not yet confident enough in any requirement to state one, requirements may be empty, but clarifications must then be non-empty - never emit an empty response.`;

export interface StructureBusinessRequirementInput {
  readonly document: RequirementDocument;
  readonly answeredClarifications: readonly Clarification[];
  /** Domain functions take ids as input (existing platform convention) — the caller (a use case) owns id generation. */
  readonly generateId: () => string;
}

export interface StructureBusinessRequirementResult {
  readonly suggestedProjectName: string;
  readonly requirements: readonly Requirement[];
  readonly acceptanceCriteriaByRequirementId: ReadonlyMap<string, readonly AcceptanceCriterion[]>;
  readonly clarifications: readonly Clarification[];
}

interface RawStructuringResponse {
  readonly suggestedProjectName: string;
  readonly requirements: ReadonlyArray<{
    readonly kind: RequirementKind;
    readonly description: string;
    readonly acceptanceCriteria: ReadonlyArray<{
      readonly description: string;
      readonly origin: AcceptanceCriterionOrigin;
    }>;
  }>;
  readonly clarifications: ReadonlyArray<{
    readonly question: string;
    readonly sourceFragment: string;
  }>;
}

export async function structureBusinessRequirement(
  ctx: RequestContext,
  llmProvider: LlmProviderPort,
  input: StructureBusinessRequirementInput,
): Promise<StructureBusinessRequirementResult> {
  const completion = await llmProvider.complete(ctx, {
    modelProfileId: "reasoning-standard",
    messages: [
      { role: "system", content: REQUIREMENTS_ANALYST_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    promptTemplateId: "requirements-analyst",
    promptTemplateVersion: 1,
  });

  const parsed = parseRawResponse(completion.content);

  const requirements: Requirement[] = [];
  const acceptanceCriteriaByRequirementId = new Map<string, readonly AcceptanceCriterion[]>();

  for (const raw of parsed.requirements) {
    const requirement = createRequirement({
      id: input.generateId(),
      requirementDocumentId: input.document.id,
      kind: raw.kind,
      description: raw.description,
    });
    requirements.push(requirement);
    acceptanceCriteriaByRequirementId.set(
      requirement.id,
      raw.acceptanceCriteria.map((c) =>
        createAcceptanceCriterion({
          id: input.generateId(),
          requirementId: requirement.id,
          description: c.description,
          origin: c.origin,
        }),
      ),
    );
  }

  const clarifications = parsed.clarifications.map((c) =>
    raiseClarification({
      id: input.generateId(),
      requirementDocumentId: input.document.id,
      question: c.question,
      sourceFragment: c.sourceFragment,
    }),
  );

  if (requirements.length === 0 && clarifications.length === 0) {
    throw new Error(
      "requirements-analyst produced neither requirements nor clarifications — refusing to treat this as a valid structuring result",
    );
  }

  return {
    suggestedProjectName: parsed.suggestedProjectName,
    requirements,
    acceptanceCriteriaByRequirementId,
    clarifications,
  };
}

function buildUserPrompt(input: StructureBusinessRequirementInput): string {
  const parts = [`Business idea:\n${input.document.ideaText}`];
  if (input.answeredClarifications.length > 0) {
    const qa = input.answeredClarifications
      .map((c) => `Q: ${c.question}\nA: ${c.answer ?? ""}`)
      .join("\n\n");
    parts.push(`Previously answered clarifications:\n${qa}`);
  }
  return parts.join("\n\n");
}

function parseRawResponse(content: string): RawStructuringResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(content));
  } catch {
    throw new Error("requirements-analyst response was not valid JSON");
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("requirements" in parsed) ||
    !("clarifications" in parsed) ||
    !("suggestedProjectName" in parsed) ||
    !Array.isArray((parsed as RawStructuringResponse).requirements) ||
    !Array.isArray((parsed as RawStructuringResponse).clarifications)
  ) {
    throw new Error("requirements-analyst response missing required fields");
  }
  return parsed as RawStructuringResponse;
}

function stripCodeFence(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  return fenceMatch ? (fenceMatch[1] ?? trimmed) : trimmed;
}
