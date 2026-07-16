import { randomUUID } from "node:crypto";
import { getTracer, injectTraceContext, withSpan } from "@sap-app-factory/observability";

const tracer = getTracer("web");

/**
 * Every function here takes the caller's cookie header as a plain string
 * rather than reading `next/headers`'s `cookies()` itself — keeps this file
 * testable with a stubbed `fetch` and no Next.js server-request context,
 * the same split SAF-16's `get-api-gateway-health.ts` established. Callers
 * (page/action files, not unit-tested per that same precedent) read
 * `cookies()` and pass the header through.
 */
function apiGatewayBaseUrl(): string {
  return process.env.SAF_API_GATEWAY_URL ?? "http://localhost:3001";
}

export interface AuthenticatedSession {
  readonly tenantId: string;
  readonly actorId: string;
}

export async function fetchAuthenticatedSession(
  cookieHeader: string,
): Promise<AuthenticatedSession | undefined> {
  const correlationId = randomUUID();
  return withSpan(tracer, "web.get-authenticated-session", { correlationId }, async () => {
    try {
      const response = await fetch(`${apiGatewayBaseUrl()}/me`, {
        cache: "no-store",
        headers: injectTraceContext({ cookie: cookieHeader, "x-correlation-id": correlationId }),
      });
      if (!response.ok) {
        return undefined;
      }
      return (await response.json()) as AuthenticatedSession;
    } catch {
      return undefined;
    }
  });
}

export interface AcceptanceCriterionView {
  readonly id: string;
  readonly requirementId: string;
  readonly description: string;
  readonly origin: "extracted" | "ai-suggested";
  readonly status: "proposed" | "confirmed";
}

export interface RequirementView {
  readonly id: string;
  readonly requirementDocumentId: string;
  readonly kind: "business" | "functional" | "non-functional" | "user-story";
  readonly description: string;
  readonly status: string;
  readonly acceptanceCriteria: readonly AcceptanceCriterionView[];
}

export interface ClarificationView {
  readonly id: string;
  readonly requirementDocumentId: string;
  readonly question: string;
  readonly sourceFragment: string;
  readonly answer: string | null | undefined;
  readonly status: "unanswered" | "answered";
}

export interface DiscoveryDocumentView {
  readonly id: string;
  readonly workspaceId: string;
  readonly ideaText: string;
  readonly suggestedProjectName: string;
  readonly status: "draft" | "approved";
}

export interface DiscoveryStateView {
  readonly document: DiscoveryDocumentView;
  readonly requirements: readonly RequirementView[];
  readonly clarifications: readonly ClarificationView[];
  readonly unansweredClarifications: readonly ClarificationView[];
}

export async function fetchDiscoveryState(
  cookieHeader: string,
  requirementDocumentId: string,
): Promise<DiscoveryStateView | undefined> {
  const correlationId = randomUUID();
  const response = await fetch(
    `${apiGatewayBaseUrl()}/discovery/${encodeURIComponent(requirementDocumentId)}`,
    {
      cache: "no-store",
      headers: injectTraceContext({ cookie: cookieHeader, "x-correlation-id": correlationId }),
    },
  );
  if (!response.ok) {
    return undefined;
  }
  return (await response.json()) as DiscoveryStateView;
}

export interface ActionResult<T> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: string;
}

async function postJson<T>(
  path: string,
  cookieHeader: string,
  body: unknown,
): Promise<ActionResult<T>> {
  const correlationId = randomUUID();
  const response = await fetch(`${apiGatewayBaseUrl()}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: injectTraceContext({
      "content-type": "application/json",
      cookie: cookieHeader,
      "x-correlation-id": correlationId,
    }),
    body: JSON.stringify(body),
  });
  const parsed = (await response.json()) as (T & { error?: string }) | { error: string };
  if (!response.ok) {
    return { ok: false, error: (parsed as { error?: string }).error ?? "Request failed." };
  }
  return { ok: true, value: parsed as T };
}

export interface StartDiscoveryResponse {
  readonly runId: string;
  readonly document: DiscoveryDocumentView;
  readonly unansweredClarifications: readonly ClarificationView[];
}

export async function startDiscovery(
  cookieHeader: string,
  input: { readonly workspaceId: string; readonly ideaText: string },
): Promise<ActionResult<StartDiscoveryResponse>> {
  return postJson<StartDiscoveryResponse>("/discovery/start", cookieHeader, input);
}

export interface AnswerClarificationResponse {
  readonly document: DiscoveryDocumentView;
  readonly unansweredClarifications: readonly ClarificationView[];
}

export async function answerClarification(
  cookieHeader: string,
  input: {
    readonly runId: string;
    readonly requirementDocumentId: string;
    readonly clarificationId: string;
    readonly answer: string;
    readonly round: number;
  },
): Promise<ActionResult<AnswerClarificationResponse>> {
  return postJson<AnswerClarificationResponse>(
    "/discovery/answer-clarification",
    cookieHeader,
    input,
  );
}

/**
 * The proxy/orchestrator API answers one Clarification per call — this
 * submits every answer in the current round sequentially, returning the
 * final call's result (the state after the last answer is what determines
 * whether the round is now complete).
 */
export async function answerClarifications(
  cookieHeader: string,
  input: {
    readonly runId: string;
    readonly requirementDocumentId: string;
    readonly round: number;
    readonly answers: readonly { readonly clarificationId: string; readonly answer: string }[];
  },
): Promise<ActionResult<AnswerClarificationResponse>> {
  let last: ActionResult<AnswerClarificationResponse> | undefined;
  for (const answer of input.answers) {
    last = await answerClarification(cookieHeader, {
      runId: input.runId,
      requirementDocumentId: input.requirementDocumentId,
      clarificationId: answer.clarificationId,
      answer: answer.answer,
      round: input.round,
    });
    if (!last.ok) {
      return last;
    }
  }
  return (
    last ?? {
      ok: false,
      error: "No clarification answers were submitted.",
    }
  );
}

export interface ProjectView {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description: string;
  readonly sourceRequirementDocumentId: string;
}

export async function confirmDiscovery(
  cookieHeader: string,
  input: { readonly runId: string; readonly requirementDocumentId: string },
): Promise<ActionResult<{ project: ProjectView }>> {
  return postJson<{ project: ProjectView }>("/discovery/confirm", cookieHeader, input);
}
