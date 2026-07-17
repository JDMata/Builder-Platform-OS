import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createAccessTokenValidator,
  createOidcClient,
  OpaPolicyEngineAdapter,
} from "@sap-app-factory/auth-core";
import type { ApiGatewayDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const testKeycloakIssuerUrl = process.env.SAF_TEST_KEYCLOAK_ISSUER_URL;
const testOpaUrl = process.env.SAF_TEST_OPA_URL;

/**
 * Real integration tests against the docker-compose Keycloak/OPA — gated
 * behind the same env vars `auth-core`'s own specs use. `/health`/`/me`
 * (no live IdP needed) are covered separately in server.spec.ts with fakes;
 * this file is specifically the real Authorization Code + PKCE wiring.
 */
describe.skipIf(!testKeycloakIssuerUrl || !testOpaUrl)(
  "api-gateway auth routes (requires SAF_TEST_KEYCLOAK_ISSUER_URL and SAF_TEST_OPA_URL)",
  () => {
    let baseUrl: string;
    let close: () => Promise<void>;

    beforeEach(async () => {
      const oidcConfig = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: "sap-app-factory-api-gateway",
        clientSecret: "dev-only-client-secret",
      });
      const deps: ApiGatewayDependencies = {
        oidcConfig,
        policyEngine: new OpaPolicyEngineAdapter(testOpaUrl!),
        validateAccessToken: createAccessTokenValidator(oidcConfig),
        sessionSecret: "test-session-secret",
        orchestratorUrl: "http://127.0.0.1:0",
        webUrl: "http://127.0.0.1:0",
      };
      const server = createServer(deps);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${port}`;
      close = () => new Promise((resolve) => server.close(() => resolve()));
    });

    afterEach(async () => {
      await close();
    });

    it("GET /auth/login redirects to the real IdP with a real PKCE authorization request", async () => {
      const response = await fetch(`${baseUrl}/auth/login`, { redirect: "manual" });

      expect(response.status).toBe(302);
      const location = new URL(response.headers.get("location")!);
      expect(location.origin + location.pathname).toBe(
        new URL(testKeycloakIssuerUrl!).origin +
          "/realms/sap-app-factory/protocol/openid-connect/auth",
      );
      expect(location.searchParams.get("client_id")).toBe("sap-app-factory-api-gateway");
      expect(location.searchParams.get("code_challenge_method")).toBe("S256");
      expect(location.searchParams.get("redirect_uri")).toContain("/auth/callback");
    });

    it("GET /auth/callback returns 400 for a state it never issued", async () => {
      const response = await fetch(
        `${baseUrl}/auth/callback?code=irrelevant&state=never-issued-by-this-server`,
      );

      expect(response.status).toBe(400);
    });

    it("GET /auth/callback returns 401 when the code exchange fails against the real IdP", async () => {
      // First, get a real, server-issued `state` by actually starting a
      // login — then complete the callback with a fake `code`, which the
      // real Keycloak will genuinely reject.
      const loginResponse = await fetch(`${baseUrl}/auth/login`, { redirect: "manual" });
      const location = new URL(loginResponse.headers.get("location")!);
      const state = location.searchParams.get("state")!;

      const response = await fetch(`${baseUrl}/auth/callback?code=not-a-real-code&state=${state}`);

      expect(response.status).toBe(401);
    });
  },
);
