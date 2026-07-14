import { getApiGatewayHealth } from "./get-api-gateway-health";

/**
 * SAF-3 skeleton: a status page proving the BFF wiring for real — `web`
 * fetches `api-gateway`'s health endpoint server-side and renders whatever
 * it gets, rather than a static page that never actually calls the service
 * it's meant to front. Per 04-service-boundaries.md, `web` talks to
 * `api-gateway` only, never another service or the database directly.
 */
export default async function StatusPage() {
  const health = await getApiGatewayHealth();

  return (
    <main>
      <h1>SAP App Factory — Status</h1>
      <p>api-gateway: {health.ok ? "reachable" : "unreachable"}</p>
      <pre>{JSON.stringify(health.body, null, 2)}</pre>
    </main>
  );
}
