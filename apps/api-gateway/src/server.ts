import { createServer as createHttpServer, type Server } from "node:http";

/**
 * Sprint 0 skeleton (SAF-4, [04-service-boundaries.md](../../../docs/architecture/04-service-boundaries.md)):
 * a health endpoint only. No framework dependency yet — plain `node:http` is
 * enough for one route, and choosing a framework (Fastify/Express/etc.) is
 * an undecided, unreviewed architectural choice this story doesn't need to
 * force. AuthN wiring to `auth-core` (this app's other SAF-4 acceptance
 * criterion) is deferred until SAF-17 delivers that package — building a
 * fake auth check now would be thrown away, not reused, once the real one
 * lands.
 */
export function createServer(): Server {
  return createHttpServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "api-gateway" }));
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
