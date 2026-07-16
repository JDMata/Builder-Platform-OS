import { randomUUID } from "node:crypto";
import { createServer as createHttpServer, type Server } from "node:http";
import { getTracer, withSpan } from "@sap-app-factory/observability";
import type { OrchestratorDependencies } from "./build-dependencies.js";
import {
  handleAnswerClarification,
  handleConfirmDiscovery,
  handleGetDiscoveryState,
  handleStartDiscovery,
} from "./discovery-routes.js";

const tracer = getTracer("orchestrator");

/**
 * SAF-5 skeleton + VS-1 (Sprint 1): the status endpoint below is Sprint 0's
 * own; `/discovery/*` are the first real workflow-execution endpoints this
 * app has ever had, driving the Discovery `WorkflowDefinition`
 * (discovery-workflow.ts) end to end.
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
              policyEngine: "auth-core OpaPolicyEngineAdapter",
              capabilityResolver: "adapter-capability-resolver-in-memory",
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

    if (req.method === "POST" && req.url === "/discovery/start") {
      void handleStartDiscovery(deps, req, res);
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
