/**
 * Split out from page.tsx so this plain-function logic can be unit tested
 * without the test runner needing to parse JSX (page.tsx renders it).
 */
export async function getApiGatewayHealth(): Promise<{ ok: boolean; body: unknown }> {
  const baseUrl = process.env.SAF_API_GATEWAY_URL ?? "http://localhost:3001";
  try {
    const response = await fetch(`${baseUrl}/health`, { cache: "no-store" });
    return { ok: response.ok, body: await response.json() };
  } catch {
    return { ok: false, body: { error: "api-gateway unreachable" } };
  }
}
