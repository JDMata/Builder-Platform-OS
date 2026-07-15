import { createServer as createHttpServer, type Server } from "node:http";
import { handleCallback, handleLogin, handleMe } from "./auth-routes.js";
import type { ApiGatewayDependencies } from "./build-dependencies.js";

/**
 * SAF-4 skeleton + SAF-17 wiring: `/health` (no AuthN needed), plus the real
 * Authorization Code + PKCE flow (`/auth/login`, `/auth/callback`) and a
 * minimal protected endpoint (`/me`) proving the session cookie a
 * successful login sets is actually enforced. See auth-routes.ts and
 * README.md for what's real vs. deliberately out of scope.
 */
export function createServer(deps: ApiGatewayDependencies): Server {
  return createHttpServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "api-gateway" }));
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
      handleMe(deps, req, res);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
