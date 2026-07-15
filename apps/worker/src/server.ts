import { randomUUID } from "node:crypto";
import { createServer as createHttpServer, type Server, type ServerResponse } from "node:http";
import type { GenerationInput } from "@sap-app-factory/plugin-sdk";
import type { EventBusPort, RequestContext } from "@sap-app-factory/ports";
import type { WorkerDependencies } from "./build-dependencies.js";
import { invokePlugin } from "./invoke-plugin.js";

const TRIVIAL_INPUT: GenerationInput = {
  requirementRefs: [],
  targetEnvironmentRef: "dev",
  targetExecutionProfile: "local-poc",
  parameters: {},
};

/**
 * SAF-6 skeleton: `POST /invoke` drives one real, in-process plugin
 * execution end to end (HTTP → `invokePlugin()` → `plugin-sdk`'s `execute()`
 * → the plugin's full lifecycle → real `generation.job.*` events). No real
 * request AuthN exists yet (SAF-17) — `buildRequestContext()` below is a
 * fixed development context, the same deferral `api-gateway` already
 * documents, not a fake auth check trying to look real.
 */
function buildRequestContext(): RequestContext {
  return {
    tenantId: "dev-tenant",
    actorId: "dev-actor",
    correlationId: randomUUID(),
    tenancyTier: "pooled",
  };
}

export function createServer(deps: WorkerDependencies): Server {
  return createHttpServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "worker",
          plugins: deps.plugins.map((plugin) => plugin.manifest.id),
        }),
      );
      return;
    }

    if (req.method === "POST" && req.url === "/invoke") {
      void handleInvoke(deps.eventBus, deps, res);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}

async function handleInvoke(
  eventBus: EventBusPort,
  deps: WorkerDependencies,
  res: ServerResponse,
): Promise<void> {
  const plugin = deps.plugins[0];
  if (!plugin) {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "no_plugin_loaded" }));
    return;
  }

  try {
    const artifacts = await invokePlugin(eventBus, plugin, buildRequestContext(), TRIVIAL_INPUT);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ pluginId: plugin.manifest.id, artifacts }));
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "unknown_error" }));
  }
}
