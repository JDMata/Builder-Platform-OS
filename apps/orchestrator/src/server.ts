import { randomUUID } from "node:crypto";
import { createServer as createHttpServer, type Server } from "node:http";
import { getTracer, withSpan } from "@sap-app-factory/observability";
import type { OrchestratorDependencies } from "./build-dependencies.js";

const tracer = getTracer("orchestrator");

/**
 * SAF-5 skeleton: a status endpoint reporting what the composition root
 * actually wired, proving the dependency-injection graph is real rather
 * than asserting it in a comment. No workflow-execution endpoints yet — no
 * `Step`/`WorkflowDefinition` loader exists (18-capability-model.md), so
 * there is nothing real for one to call yet — no real `workflowId` exists
 * anywhere in this app for the same reason (see this app's README and
 * `packages/observability`'s README § "where appropriate").
 */
export function createServer(deps: OrchestratorDependencies): Server {
  return createHttpServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      void withSpan(tracer, "orchestrator.health", { correlationId: randomUUID() }, async () => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            status: "ok",
            service: "orchestrator",
            wiring: {
              llmProvider: "adapter-llm-anthropic (resilience-wrapped)",
              mcpConnection: "adapter-mcp-stdio (resilience-wrapped)",
              eventBus: "adapter-events-postgres-outbox",
              workflowEngine: "adapter-workflow-engine-in-memory",
            },
            plugins: deps.plugins.map((plugin) => plugin.manifest.id),
            capabilities: deps.capabilityProviders.map((registration) => ({
              id: registration.capability.id,
              providerId: registration.provider.providerId,
            })),
          }),
        );
      });
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
