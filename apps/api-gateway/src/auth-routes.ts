import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  beginAuthorizationRequest,
  exchangeAuthorizationCode,
  sealSession,
  unsealSession,
} from "@sap-app-factory/auth-core";
import { createLogger, getTracer, withSpan } from "@sap-app-factory/observability";
import type { ApiGatewayDependencies } from "./build-dependencies.js";

const tracer = getTracer("api-gateway");
const logger = createLogger("api-gateway");

const SESSION_COOKIE_NAME = "saf_session";
/** Matches ADR-0010's "short-lived signed access tokens" — a short session, not a long-lived one. */
const SESSION_TTL_MS = 15 * 60 * 1000;

interface PendingAuthorizationRequest {
  readonly state: string;
  readonly codeVerifier: string;
  readonly nonce: string;
}

/**
 * In-memory only — one `api-gateway` replica's own pending logins. A real
 * multi-replica deployment needs this in Redis (already a documented,
 * near-term stack dependency — see infra/README.md) keyed the same way by
 * `state`; acceptable for Sprint 0's single-process scope. See README.md
 * § Known Sprint 0 limitation.
 */
const pendingRequests = new Map<string, PendingAuthorizationRequest>();

function redirectUriFor(req: IncomingMessage): string {
  const host = req.headers.host ?? "localhost:3001";
  return `http://${host}/auth/callback`;
}

/** Starts the real Authorization Code + PKCE flow (ADR-0010) against the configured IdP. */
export async function handleLogin(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const request = await beginAuthorizationRequest(deps.oidcConfig, {
    redirectUri: redirectUriFor(req),
  });
  pendingRequests.set(request.state, {
    state: request.state,
    codeVerifier: request.codeVerifier,
    nonce: request.nonce,
  });

  res.writeHead(302, { location: request.url.toString() });
  res.end();
}

/** Exchanges the callback's code for tokens, then seals a session cookie — the BFF pattern (ADR-0010): tokens never reach the browser. */
export async function handleCallback(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const correlationId = randomUUID();
  await withSpan(tracer, "api-gateway.auth.callback", { correlationId }, async () => {
    const callbackUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost:3001"}`);
    const state = callbackUrl.searchParams.get("state");
    const pending = state ? pendingRequests.get(state) : undefined;

    if (!pending) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "unknown_or_expired_state" }));
      return;
    }
    pendingRequests.delete(pending.state);

    try {
      const tokens = await exchangeAuthorizationCode(deps.oidcConfig, {
        callbackUrl,
        expectedState: pending.state,
        codeVerifier: pending.codeVerifier,
        expectedNonce: pending.nonce,
      });
      const claims = await deps.validateAccessToken(tokens.access_token);
      // No tenant-id claim mapper is configured on the dev Keycloak realm yet
      // (SAF-17 scope: prove the flow, not multi-tenant Keycloak configuration)
      // — every session defaults to one tenant until that mapper exists.
      const tenantId = typeof claims.tenant_id === "string" ? claims.tenant_id : "default-tenant";
      const actorId = typeof claims.sub === "string" ? claims.sub : "unknown-actor";
      const sealed = sealSession(
        { tenantId, actorId, expiresAt: Date.now() + SESSION_TTL_MS },
        deps.sessionSecret,
      );
      logger.info("session established", { correlationId, tenantId, actorId });
      res.writeHead(302, {
        // Lands the user directly on VS-1's Discovery entry point — the
        // approved journey has no dashboard/landing step between login and
        // idea submission (Product Design Review, Quick Win #2).
        location: "/discovery/new",
        "set-cookie": `${SESSION_COOKIE_NAME}=${sealed}; HttpOnly; Path=/; SameSite=Lax`,
      });
      res.end();
    } catch (error) {
      const reason = error instanceof Error ? error.message : "auth_failed";
      logger.warn("authorization code exchange failed", { correlationId }, { reason });
      res.writeHead(401, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: reason }));
    }
  });
}

/** Exported for reuse by discovery-proxy-routes.ts — every protected route reads the same cookie the same way. */
export function readSessionCookie(req: IncomingMessage): string | undefined {
  const header = req.headers.cookie;
  if (!header) {
    return undefined;
  }
  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    if (part.slice(0, separatorIndex).trim() === SESSION_COOKIE_NAME) {
      return part.slice(separatorIndex + 1).trim();
    }
  }
  return undefined;
}

/** A minimal protected endpoint proving the whole chain works: no valid session cookie, no access. */
export async function handleMe(
  deps: ApiGatewayDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const cookie = readSessionCookie(req);
  const session = cookie ? unsealSession(cookie, deps.sessionSecret) : undefined;
  const correlationId = randomUUID();

  if (!session) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_authenticated" }));
    return;
  }

  await withSpan(
    tracer,
    "api-gateway.me",
    { correlationId, tenantId: session.tenantId, actorId: session.actorId },
    async () => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ tenantId: session.tenantId, actorId: session.actorId }));
    },
  );
}
