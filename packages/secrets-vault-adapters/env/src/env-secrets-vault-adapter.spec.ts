import { afterEach, describe, expect, it } from "vitest";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { EnvSecretsVaultAdapter } from "./env-secrets-vault-adapter.js";

describe("EnvSecretsVaultAdapter", () => {
  const ctx = createTestRequestContext();

  afterEach(() => {
    delete process.env.SAF_TEST_SECRET;
  });

  it("reads a secret previously set via setSecret", async () => {
    const adapter = new EnvSecretsVaultAdapter();
    await adapter.setSecret(ctx, { name: "SAF_TEST_SECRET" }, "sk-test-value");
    await expect(adapter.getSecret(ctx, { name: "SAF_TEST_SECRET" })).resolves.toBe(
      "sk-test-value",
    );
  });

  it("rejects when the secret is not set", async () => {
    const adapter = new EnvSecretsVaultAdapter();
    await expect(adapter.getSecret(ctx, { name: "SAF_TEST_SECRET" })).rejects.toThrow(/is not set/);
  });

  it("rejects when the secret is set to an empty string", async () => {
    const adapter = new EnvSecretsVaultAdapter();
    await adapter.setSecret(ctx, { name: "SAF_TEST_SECRET" }, "   ");
    await expect(adapter.getSecret(ctx, { name: "SAF_TEST_SECRET" })).rejects.toThrow(/is not set/);
  });
});
