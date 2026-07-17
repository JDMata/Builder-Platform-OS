import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { unsealSession } from "@sap-app-factory/auth-core";
import { readJsonBody, stringField } from "@sap-app-factory/http-server-kit";
import { getTracer, injectTraceContext, withSpan } from "@sap-app-factory/observability";
import type { ApiGatewayDependencies } from "./build-dependencies.js";
import { readSessionCookie } from "./auth-routes.js";

const tracer = getTracer("api-gateway");

/**
 * VS-1's identity boundary (ADR-0010/Zero Trust): `web` never sees or
 * forwards `tenantId`/`actorId` itself — every Discovery proxy route here
 * re-derives them from the sealed session cookie, exactly like `handleMe`,
 * and it is *this* layer, not `web`, that attaches identity to the request
 * sent on to `apps/orchestrator`. `orchestrator` still runs its own
 * `PolicyEnginePort`/OPA check per action; this proxy only establishes who
 * is asking.
 *
 * No claims-to-permission mapping exists on the dev Keycloak realm yet
 * (same known simplification as auth-routes.ts's `tenantId` default), so
 * every authenticated session is granted exactly the three `requirement:*`
 * permissions VS-1's use cases check — tracked as the same class of gap,
 * not a new one.
 */
const DEFAULT_ACTOR_PERMISSIONS = [
  "requirement:submit",
  "requirement:clarify",
  "requirement:approve",
];

interface AuthenticatedSession {
  readonly tenantId: string;
  readonly actorId: string;
}

function requireSession(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
): AuthenticatedSession | undefined {
  const cookie = readSessionCookie(req);
  return cookie ? unsealSession(cookie, deps.sessionSecret) : undefined;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * Without this, an unreachable `orchestrator` or a non-JSON response
 * (`forwardToOrchestrator`'s `response.json()` throwing) is an unhandled
 * rejection that crashes this entire process — taking down every other
 * in-flight request, not just the one that hit the bad response. 502, not
 * 400: the client did nothing wrong, the failure is this gateway's upstream.
 * Mirrors `apps/orchestrator`'s own `discovery-routes.ts`'s
 * `withErrorHandling` in shape; not yet extracted to `http-server-kit`
 * (this is only its second occurrence) — a candidate for the next
 * extraction round alongside `CIP-001`'s `readJsonBody`/`stringField`.
 */
async function withErrorHandling(res: ServerResponse, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    sendJson(res, 502, { error: `orchestrator request failed: ${message}` });
  }
}

async function forwardToOrchestrator(
  deps: ApiGatewayDependencies,
  path: string,
  init: { method: string; body?: unknown; extraHeaders?: Record<string, string> },
): Promise<{ status: number; body: unknown }> {
  const correlationId = randomUUID();
  const headers = injectTraceContext({
    "content-type": "application/json",
    "x-correlation-id": correlationId,
    ...init.extraHeaders,
  });
  const response = await fetch(`${deps.orchestratorUrl}${path}`, {
    method: init.method,
    headers,
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  const body = await response.json();
  return { status: response.status, body };
}

export async function handleDiscoveryStart(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(
    tracer,
    "api-gateway.discovery.start",
    { correlationId: randomUUID() },
    async () => {
      await withErrorHandling(res, async () => {
        const session = requireSession(deps, req);
        if (!session) {
          sendJson(res, 401, { error: "not_authenticated" });
          return;
        }
        const body = await readJsonBody(req);
        const { status, body: responseBody } = await forwardToOrchestrator(
          deps,
          "/discovery/start",
          {
            method: "POST",
            body: {
              tenantId: session.tenantId,
              actorId: session.actorId,
              workspaceId: stringField(body.workspaceId),
              ideaText: stringField(body.ideaText),
              actorPermissions: DEFAULT_ACTOR_PERMISSIONS,
            },
          },
        );
        sendJson(res, status, responseBody);
      });
    },
  );
}

export async function handleAnswerClarification(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(
    tracer,
    "api-gateway.discovery.answer-clarification",
    { correlationId: randomUUID() },
    async () => {
      await withErrorHandling(res, async () => {
        const session = requireSession(deps, req);
        if (!session) {
          sendJson(res, 401, { error: "not_authenticated" });
          return;
        }
        const body = await readJsonBody(req);
        const { status, body: responseBody } = await forwardToOrchestrator(
          deps,
          "/discovery/answer-clarification",
          {
            method: "POST",
            body: {
              tenantId: session.tenantId,
              actorId: session.actorId,
              runId: body.runId,
              requirementDocumentId: body.requirementDocumentId,
              clarificationId: body.clarificationId,
              answer: body.answer,
              round: body.round,
              actorPermissions: DEFAULT_ACTOR_PERMISSIONS,
            },
          },
        );
        sendJson(res, status, responseBody);
      });
    },
  );
}

export async function handleConfirmDiscovery(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(
    tracer,
    "api-gateway.discovery.confirm",
    { correlationId: randomUUID() },
    async () => {
      await withErrorHandling(res, async () => {
        const session = requireSession(deps, req);
        if (!session) {
          sendJson(res, 401, { error: "not_authenticated" });
          return;
        }
        const body = await readJsonBody(req);
        const { status, body: responseBody } = await forwardToOrchestrator(
          deps,
          "/discovery/confirm",
          {
            method: "POST",
            body: {
              tenantId: session.tenantId,
              actorId: session.actorId,
              runId: body.runId,
              requirementDocumentId: body.requirementDocumentId,
              actorPermissions: DEFAULT_ACTOR_PERMISSIONS,
            },
          },
        );
        sendJson(res, status, responseBody);
      });
    },
  );
}

export async function handleGetDiscoveryState(
  deps: ApiGatewayDependencies,
  requirementDocumentId: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(
    tracer,
    "api-gateway.discovery.get-state",
    { correlationId: randomUUID() },
    async () => {
      await withErrorHandling(res, async () => {
        const session = requireSession(deps, req);
        if (!session) {
          sendJson(res, 401, { error: "not_authenticated" });
          return;
        }
        const { status, body: responseBody } = await forwardToOrchestrator(
          deps,
          `/discovery/${requirementDocumentId}`,
          { method: "GET", extraHeaders: { "x-tenant-id": session.tenantId } },
        );
        sendJson(res, status, responseBody);
      });
    },
  );
}
