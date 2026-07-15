import { randomUUID } from "node:crypto";
import { getTracer, injectTraceContext, withSpan } from "@sap-app-factory/observability";

const tracer = getTracer("web");

/**
 * Split out from page.tsx so this plain-function logic can be unit tested
 * without the test runner needing to parse JSX (page.tsx renders it).
 *
 * SAF-16: the one real inter-app HTTP call in Sprint 0 — `web` has no
 * RequestContext of its own yet (this status page has no session), so it
 * generates a fresh correlationId and injects the active span's `traceparent`
 * into the request; `api-gateway`'s `/health` handler extracts both, so the
 * two apps' spans land in the same trace (verified in both packages' own
 * tests and, for real, by running both apps and checking the Collector's
 * `debug` output for one trace ID covering both spans).
 */
export async function getApiGatewayHealth(): Promise<{ ok: boolean; body: unknown }> {
  const baseUrl = process.env.SAF_API_GATEWAY_URL ?? "http://localhost:3001";
  const correlationId = randomUUID();

  return withSpan(tracer, "web.get-api-gateway-health", { correlationId }, async () => {
    try {
      const headers = injectTraceContext({ "x-correlation-id": correlationId });
      const response = await fetch(`${baseUrl}/health`, { cache: "no-store", headers });
      return { ok: response.ok, body: (await response.json()) as unknown };
    } catch {
      return { ok: false, body: { error: "api-gateway unreachable" } };
    }
  });
}
