import { describe, expect, it } from "vitest";
import { buildDependencies } from "./build-dependencies.js";

const testKeycloakIssuerUrl = process.env.SAF_TEST_KEYCLOAK_ISSUER_URL;
const testOpaUrl = process.env.SAF_TEST_OPA_URL;

/**
 * Real integration test — buildDependencies() reads the same env vars
 * (SAF_KEYCLOAK_ISSUER_URL, SAF_OPA_URL) main.ts does, defaulting to the
 * docker-compose stack. Gated the same way as auth-core's own specs since
 * it performs real discovery.
 */
describe.skipIf(!testKeycloakIssuerUrl || !testOpaUrl)(
  "buildDependencies (requires SAF_TEST_KEYCLOAK_ISSUER_URL and SAF_TEST_OPA_URL)",
  () => {
    it("wires a real, working OIDC config, policy engine, and token validator", async () => {
      const deps = await buildDependencies();

      expect(deps.oidcConfig.serverMetadata().issuer).toBe(testKeycloakIssuerUrl);
      expect(typeof deps.validateAccessToken).toBe("function");

      const decision = await deps.policyEngine.evaluate(
        { tenantId: "t1", actorId: "u1", correlationId: "c1", tenancyTier: "pooled" },
        { resource: "project", action: "create", attributes: { permissions: ["project:create"] } },
      );
      expect(decision.allowed).toBe(true);
    });

    it("falls back to an obviously-a-placeholder session secret when none is configured", async () => {
      const deps = await buildDependencies();

      expect(deps.sessionSecret).toContain("dev-only");
    });
  },
);
