import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestRequestContext, policyEngineContractTests } from "@sap-app-factory/testing-kit";
import { OpaPolicyEngineAdapter } from "./opa-policy-engine-adapter.js";
import { testOpaUrl } from "./test-support.js";

describe("OpaPolicyEngineAdapter — OPA unreachable", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws a clear error when OPA responds with a non-2xx status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: "Internal Server Error" }),
    );
    const adapter = new OpaPolicyEngineAdapter("http://opa.invalid");
    const ctx = createTestRequestContext();

    await expect(
      adapter.evaluate(ctx, { resource: "test-resource", action: "test-action" }),
    ).rejects.toThrow(/OPA evaluation failed: 500/);
  });
});

/**
 * Real integration tests against the docker-compose OPA server (SAF-17) and
 * its loaded policy bundle (infra/opa/policies/authz.rego) — gated behind
 * SAF_TEST_OPA_URL.
 */
describe.skipIf(!testOpaUrl)("OpaPolicyEngineAdapter (requires SAF_TEST_OPA_URL)", () => {
  policyEngineContractTests(() => new OpaPolicyEngineAdapter(testOpaUrl!));

  it("allows a non-prod workflow approval for a DeliveryLead", async () => {
    const adapter = new OpaPolicyEngineAdapter(testOpaUrl!);
    const ctx = createTestRequestContext();

    const result = await adapter.evaluate(ctx, {
      resource: "workflow",
      action: "workflow:approve",
      attributes: { environment_kind: "dev", roles: ["DeliveryLead"] },
    });

    expect(result.allowed).toBe(true);
  });

  it("denies a prod workflow approval when the approver triggered the run themselves (separation of duties)", async () => {
    const adapter = new OpaPolicyEngineAdapter(testOpaUrl!);
    const ctx = createTestRequestContext();

    const result = await adapter.evaluate(ctx, {
      resource: "workflow",
      action: "workflow:approve",
      attributes: {
        environment_kind: "prod",
        roles: ["DeliveryLead"],
        approver_id: "user-1",
        triggered_by_id: "user-1",
      },
    });

    expect(result.allowed).toBe(false);
  });

  it("allows a prod workflow approval by a distinct second approver", async () => {
    const adapter = new OpaPolicyEngineAdapter(testOpaUrl!);
    const ctx = createTestRequestContext();

    const result = await adapter.evaluate(ctx, {
      resource: "workflow",
      action: "workflow:approve",
      attributes: {
        environment_kind: "prod",
        roles: ["DeliveryLead"],
        approver_id: "user-2",
        triggered_by_id: "user-1",
      },
    });

    expect(result.allowed).toBe(true);
  });

  it("evaluates a plain resource:action permission grant", async () => {
    const adapter = new OpaPolicyEngineAdapter(testOpaUrl!);
    const ctx = createTestRequestContext();

    const granted = await adapter.evaluate(ctx, {
      resource: "project",
      action: "create",
      attributes: { permissions: ["project:create"] },
    });
    const denied = await adapter.evaluate(ctx, {
      resource: "project",
      action: "create",
      attributes: { permissions: ["project:read"] },
    });

    expect(granted.allowed).toBe(true);
    expect(denied.allowed).toBe(false);
  });

  it("returns the policy id and version alongside the decision", async () => {
    const adapter = new OpaPolicyEngineAdapter(testOpaUrl!);
    const ctx = createTestRequestContext();

    const result = await adapter.evaluate(ctx, {
      resource: "workflow",
      action: "workflow:approve",
      attributes: { environment_kind: "dev", roles: ["DeliveryLead"] },
    });

    expect(result.policyId).toBe("sap_app_factory.authz");
    expect(result.policyVersion).toBe(1);
  });
});
