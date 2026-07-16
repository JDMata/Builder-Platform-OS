import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createProject, type Project } from "@sap-app-factory/context-project";
import { FioriGeneratorPlugin } from "@sap-app-factory/plugin-fiori-generator";
import type { OrchestratorDependencies } from "./build-dependencies.js";
import { registerAgentCapabilities, registerPluginCapabilities } from "./plugin-loader.js";
import { createServer } from "./server.js";
import {
  buildFakeDependencies,
  fakeLlmProvider,
  fakeRepository,
} from "./test-fake-dependencies.js";
import { deterministicProjectId } from "./discovery-workflow.js";

async function startServer(
  overrides: Partial<OrchestratorDependencies> = {},
): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server: Server = createServer(buildFakeDependencies(overrides));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

describe("orchestrator server", () => {
  let close: () => Promise<void>;

  afterEach(async () => {
    await close();
  });

  it("GET /health reports the wired dependencies and loaded plugin's capability", async () => {
    const plugins = [new FioriGeneratorPlugin()];
    const server = await startServer({
      plugins,
      capabilityProviders: [...registerPluginCapabilities(plugins), ...registerAgentCapabilities()],
    });
    close = server.close;

    const response = await fetch(`${server.baseUrl}/health`);
    const body = (await response.json()) as {
      status: string;
      plugins: string[];
      capabilities: { id: string; providerId: string }[];
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.plugins).toEqual(["fiori-generator"]);
    expect(body.capabilities.length).toBeGreaterThan(0);
    expect(body.capabilities[0]?.providerId).toBe("fiori-generator");
  });

  it("returns 404 for an unknown route", async () => {
    const server = await startServer();
    close = server.close;

    const response = await fetch(`${server.baseUrl}/no-such-route`);

    expect(response.status).toBe(404);
  });

  it("POST /discovery/start captures an idea and returns the Discovery session state", async () => {
    const server = await startServer();
    close = server.close;

    const response = await fetch(`${server.baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        workspaceId: "workspace-1",
        ideaText: "We need a way to reconcile stock counts.",
        actorPermissions: ["requirement:submit"],
      }),
    });
    const body = (await response.json()) as {
      runId: string;
      document: { status: string };
      unansweredClarifications: unknown[];
    };

    expect(response.status).toBe(200);
    expect(body.document.status).toBe("draft");
    expect(body.unansweredClarifications).toEqual([]);
  });

  it("POST /discovery/start returns 400 when the idea text is empty", async () => {
    const server = await startServer();
    close = server.close;

    const response = await fetch(`${server.baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        workspaceId: "workspace-1",
        ideaText: "   ",
        actorPermissions: ["requirement:submit"],
      }),
    });

    expect(response.status).toBe(400);
  });

  it("POST /discovery/answer-clarification records an answer and returns updated state", async () => {
    const server = await startServer({
      llmProvider: fakeLlmProvider(() =>
        JSON.stringify({
          suggestedProjectName: "x",
          requirements: [],
          clarifications: [
            { question: "What counts as a discrepancy?", sourceFragment: "discrepancies" },
          ],
        }),
      ),
    });
    close = server.close;

    const startResponse = await fetch(`${server.baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        workspaceId: "workspace-1",
        ideaText: "We need a way to reconcile stock counts.",
        actorPermissions: ["requirement:submit"],
      }),
    });
    const started = (await startResponse.json()) as {
      runId: string;
      document: { id: string };
      unansweredClarifications: { id: string }[];
    };

    const response = await fetch(`${server.baseUrl}/discovery/answer-clarification`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        runId: started.runId,
        requirementDocumentId: started.document.id,
        clarificationId: started.unansweredClarifications[0]!.id,
        answer: "Over 5 units or 2%, whichever is greater",
        actorPermissions: ["requirement:clarify"],
        round: 1,
      }),
    });

    expect(response.status).toBe(200);
  });

  it("POST /discovery/confirm approves the document and returns the Project once it exists", async () => {
    const projects = fakeRepository<Project>();
    const server = await startServer({ projects });
    close = server.close;

    const startResponse = await fetch(`${server.baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        workspaceId: "workspace-1",
        ideaText: "We need a way to reconcile stock counts.",
        actorPermissions: ["requirement:submit"],
      }),
    });
    const started = (await startResponse.json()) as { runId: string; document: { id: string } };

    const project = createProject({
      id: deterministicProjectId(started.document.id),
      workspaceId: "workspace-1",
      name: "Shift-End Stock Reconciliation",
      description: "We need a way to reconcile stock counts.",
      sourceRequirementDocumentId: started.document.id,
    });
    projects.store.set(project.id, project);

    const response = await fetch(`${server.baseUrl}/discovery/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        runId: started.runId,
        requirementDocumentId: started.document.id,
        actorPermissions: ["requirement:approve"],
      }),
    });
    const body = (await response.json()) as { project: { id: string } };

    expect(response.status).toBe(200);
    expect(body.project.id).toBe(project.id);
  });

  it("GET /discovery/:id returns the current Discovery session state", async () => {
    const server = await startServer();
    close = server.close;

    const startResponse = await fetch(`${server.baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-1",
        actorId: "user-1",
        workspaceId: "workspace-1",
        ideaText: "We need a way to reconcile stock counts.",
        actorPermissions: ["requirement:submit"],
      }),
    });
    const started = (await startResponse.json()) as { document: { id: string } };

    const response = await fetch(`${server.baseUrl}/discovery/${started.document.id}`, {
      headers: { "x-tenant-id": "tenant-1" },
    });
    const body = (await response.json()) as { document: { id: string } };

    expect(response.status).toBe(200);
    expect(body.document.id).toBe(started.document.id);
  });

  it("GET /discovery/:id returns 404 for an unknown RequirementDocument", async () => {
    const server = await startServer();
    close = server.close;

    const response = await fetch(`${server.baseUrl}/discovery/no-such-document`, {
      headers: { "x-tenant-id": "tenant-1" },
    });

    expect(response.status).toBe(404);
  });
});
