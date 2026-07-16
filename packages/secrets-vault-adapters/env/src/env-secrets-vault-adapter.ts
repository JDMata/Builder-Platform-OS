import type { RequestContext, SecretRef, SecretsVaultPort } from "@sap-app-factory/ports";

/**
 * The dev-only `.env`-default adapter [BASELINE.md](../../../BASELINE.md)'s
 * accepted technical debt already describes ("every secret today is a
 * dev-only `.env` default in a composition root") — this is that default,
 * finally made to satisfy `SecretsVaultPort` explicitly instead of
 * composition-root code reading `process.env` directly and bypassing the
 * port. Not a real secrets-management adapter (no rotation, no audit trail
 * beyond process env) — that remains triggered by a second provider type or
 * secret rotation need, neither of which VS-1 introduces (see the Sprint 1
 * VS-1 Readiness Review).
 */
export class EnvSecretsVaultAdapter implements SecretsVaultPort {
  getSecret(_ctx: RequestContext, ref: SecretRef): Promise<string> {
    const value = process.env[ref.name];
    if (value === undefined || value.trim().length === 0) {
      return Promise.reject(new Error(`Secret "${ref.name}" is not set in the environment`));
    }
    return Promise.resolve(value);
  }

  setSecret(_ctx: RequestContext, ref: SecretRef, value: string): Promise<void> {
    process.env[ref.name] = value;
    return Promise.resolve();
  }
}
