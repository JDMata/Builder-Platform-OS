import { randomUUID } from "node:crypto";
import { createServer as createHttpServer, type Server } from "node:http";
import { getTracer, runWithExtractedContext, withSpan } from "@sap-app-factory/observability";
import { handleCallback, handleLogin, handleMe } from "./auth-routes.js";
import type { ApiGatewayDependencies } from "./build-dependencies.js";
import {
  handleAnswerClarification,
  handleConfirmDiscovery,
  handleDiscoveryStart,
  handleGetDiscoveryState,
} from "./discovery-proxy-routes.js";

const tracer = getTracer("api-gateway");

/**
 * SAF-4 skeleton + SAF-17 wiring: `/health` (no AuthN needed), plus the real
 * Authorization Code + PKCE flow (`/auth/login`, `/auth/callback`) and a
 * minimal protected endpoint (`/me`) proving the session cookie a
 * successful login sets is actually enforced. See auth-routes.ts and
 * README.md for what's real vs. deliberately out of scope.
 *
 * SAF-16: `/health` is the receiving end of Sprint 0's one real inter-app
 * HTTP call (`apps/web`'s status page calls this exact endpoint) —
 * `runWithExtractedContext` picks up the `traceparent` header `web` injects,
 * so the span started here is a child of `web`'s span, not a new trace. The
 * business `x-correlation-id` header (set by the same caller) is reused as
 * this span's correlation id when present, so the same id ties both apps'
 * logs/traces together; an anonymous caller without one still gets a span,
 * with a freshly generated id instead.
 */
export function createServer(deps: ApiGatewayDependencies): Server {
  return createHttpServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      const correlationId =
        (Array.isArray(req.headers["x-correlation-id"])
          ? req.headers["x-correlation-id"][0]
          : req.headers["x-correlation-id"]) ?? randomUUID();
      runWithExtractedContext(req.headers, () => {
        void withSpan(tracer, "api-gateway.health", { correlationId }, async () => {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ status: "ok", service: "api-gateway" }));
        });
      });
      return;
    }

    if (req.method === "GET" && req.url === "/auth/login") {
      void handleLogin(deps, req, res);
      return;
    }

    if (req.method === "GET" && req.url?.startsWith("/auth/callback")) {
      void handleCallback(deps, req, res);
      return;
    }

    if (req.method === "GET" && req.url === "/me") {
      void handleMe(deps, req, res);
      return;
    }

    if (req.method === "POST" && req.url === "/discovery/start") {
      void handleDiscoveryStart(deps, req, res);
      return;
    }

    if (req.method === "POST" && req.url === "/discovery/answer-clarification") {
      void handleAnswerClarification(deps, req, res);
      return;
    }

    if (req.method === "POST" && req.url === "/discovery/confirm") {
      void handleConfirmDiscovery(deps, req, res);
      return;
    }

    if (req.method === "GET" && req.url?.startsWith("/discovery/")) {
      const requirementDocumentId = req.url.slice("/discovery/".length);
      void handleGetDiscoveryState(deps, requirementDocumentId, req, res);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
