import { createServer as createHttpServer, type Server } from "node:http";
import type { OrchestratorDependencies } from "./build-dependencies.js";

/**
 * SAF-5 skeleton: a status endpoint reporting what the composition root
 * actually wired, proving the dependency-injection graph is real rather
 * than asserting it in a comment. No workflow-execution endpoints yet — no
 * `Step`/`WorkflowDefinition` loader exists (18-capability-model.md), so
 * there is nothing real for one to call yet.
 */
export function createServer(deps: OrchestratorDependencies): Server {
  return createHttpServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
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
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
