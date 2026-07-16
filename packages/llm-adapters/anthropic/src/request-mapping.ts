import type { ModelMessage } from "@sap-app-factory/ports";

/**
 * `modelProfileId` (ADR-0005/02-domain-model.md `ModelProfile`) resolves to a
 * concrete Anthropic model here, in the one place that's allowed to know a
 * real model name — application/workflow code never does. Extend this map
 * rather than letting a logical name leak into caller code.
 */
const MODEL_PROFILE_MAP: Record<string, string> = {
  "reasoning-large": "claude-opus-4-8",
  "reasoning-standard": "claude-sonnet-5",
};
const DEFAULT_MODEL = "claude-sonnet-5";

export function resolveModel(modelProfileId: string): string {
  return MODEL_PROFILE_MAP[modelProfileId] ?? DEFAULT_MODEL;
}

/** Anthropic's Messages API takes `system` as a separate top-level string, not a message role. */
export function splitSystemPrompt(messages: readonly ModelMessage[]): {
  system: string | undefined;
  rest: readonly ModelMessage[];
} {
  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
  const rest = messages.filter((m) => m.role !== "system");
  return { system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined, rest };
}

/**
 * `role: "tool"` isn't a message role in Anthropic's API (tool results are a
 * content block within a user message) — VS-1's `structure-business-requirement`
 * capability never uses tool-calling, so this maps it to a plain user message
 * rather than building unused tool-result content-block handling now.
 */
export function toAnthropicRole(role: ModelMessage["role"]): "user" | "assistant" {
  return role === "assistant" ? "assistant" : "user";
}
