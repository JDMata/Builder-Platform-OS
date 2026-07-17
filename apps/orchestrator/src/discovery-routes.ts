import type { IncomingMessage, ServerResponse } from "node:http";
import { readJsonBody, stringField } from "@sap-app-factory/http-server-kit";
import { getTracer, withSpan } from "@sap-app-factory/observability";
import type { RequestContext } from "@sap-app-factory/ports";
import type { OrchestratorDependencies } from "./build-dependencies.js";
import {
  answerDiscoveryClarification,
  confirmDiscoveryWorkflow,
  startDiscoveryWorkflow,
  type DiscoverySessionState,
} from "./discovery-workflow.js";

const tracer = getTracer("orchestrator");

function toRequestContext(body: Record<string, unknown>): RequestContext {
  return {
    tenantId: stringField(body.tenantId, "default-tenant"),
    actorId: stringField(body.actorId, "unknown-actor"),
    correlationId: stringField(body.correlationId),
    tenancyTier: "pooled",
  };
}

function serializeSessionState(state: DiscoverySessionState): Record<string, unknown> {
  return {
    runId: state.runId,
    document: state.document,
    requirements: state.requirements.map((requirement) => ({
      ...requirement,
      acceptanceCriteria: state.acceptanceCriteriaByRequirementId.get(requirement.id) ?? [],
    })),
    unansweredClarifications: state.unansweredClarifications,
  };
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function withErrorHandling(res: ServerResponse, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    sendJson(res, 400, { error: message });
  }
}

export async function handleStartDiscovery(
  deps: OrchestratorDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(tracer, "orchestrator.discovery.start", { correlationId: "" }, async () => {
    await withErrorHandling(res, async () => {
      const body = await readJsonBody(req);
      const ctx = toRequestContext(body);
      const state = await startDiscoveryWorkflow(ctx, deps, {
        workspaceId: stringField(body.workspaceId),
        ideaText: stringField(body.ideaText),
        actorPermissions: Array.isArray(body.actorPermissions)
          ? (body.actorPermissions as string[])
          : [],
      });
      sendJson(res, 200, serializeSessionState(state));
    });
  });
}

export async function handleAnswerClarification(
  deps: OrchestratorDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(
    tracer,
    "orchestrator.discovery.answer-clarification",
    { correlationId: "" },
    async () => {
      await withErrorHandling(res, async () => {
        const body = await readJsonBody(req);
        const ctx = toRequestContext(body);
        const state = await answerDiscoveryClarification(ctx, deps, {
          runId: stringField(body.runId),
          requirementDocumentId: stringField(body.requirementDocumentId),
          clarificationId: stringField(body.clarificationId),
          answer: stringField(body.answer),
          actorPermissions: Array.isArray(body.actorPermissions)
            ? (body.actorPermissions as string[])
            : [],
          round: typeof body.round === "number" ? body.round : 1,
        });
        sendJson(res, 200, serializeSessionState(state));
      });
    },
  );
}

export async function handleConfirmDiscovery(
  deps: OrchestratorDependencies,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(tracer, "orchestrator.discovery.confirm", { correlationId: "" }, async () => {
    await withErrorHandling(res, async () => {
      const body = await readJsonBody(req);
      const ctx = toRequestContext(body);
      const project = await confirmDiscoveryWorkflow(ctx, deps, {
        runId: stringField(body.runId),
        requirementDocumentId: stringField(body.requirementDocumentId),
        actorPermissions: Array.isArray(body.actorPermissions)
          ? (body.actorPermissions as string[])
          : [],
      });
      sendJson(res, 200, { project });
    });
  });
}

export async function handleGetDiscoveryState(
  deps: OrchestratorDependencies,
  requirementDocumentId: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withSpan(tracer, "orchestrator.discovery.get-state", { correlationId: "" }, async () => {
    await withErrorHandling(res, async () => {
      const ctx: RequestContext = {
        tenantId: stringField(req.headers["x-tenant-id"], "default-tenant"),
        actorId: "unknown-actor",
        correlationId: "",
        tenancyTier: "pooled",
      };
      const document = await deps.requirementDocuments.findById(ctx, requirementDocumentId);
      if (!document) {
        sendJson(res, 404, { error: `RequirementDocument "${requirementDocumentId}" not found` });
        return;
      }
      const requirements = await deps.requirements.findByRequirementDocumentId(
        ctx,
        requirementDocumentId,
      );
      const clarifications = await deps.clarifications.findByRequirementDocumentId(
        ctx,
        requirementDocumentId,
      );
      const requirementsWithCriteria = await Promise.all(
        requirements.map(async (requirement) => ({
          ...requirement,
          acceptanceCriteria: await deps.acceptanceCriteria.findByRequirementId(
            ctx,
            requirement.id,
          ),
        })),
      );
      sendJson(res, 200, {
        document,
        requirements: requirementsWithCriteria,
        // Full history (answered + unanswered), not just what's outstanding
        // — the Project Charter screen needs to know whether a requirement
        // was ever clarified at all to derive its confidence badge, which
        // `unansweredClarifications` alone (correctly) can't answer once a
        // clarification is resolved.
        clarifications,
        unansweredClarifications: clarifications.filter((c) => c.status === "unanswered"),
      });
    });
  });
}
