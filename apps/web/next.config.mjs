/**
 * `web` never calls the IdP or sets the session cookie itself (ADR-0010) —
 * `api-gateway` does. But `api-gateway` runs on its own port in dev
 * (SAF_API_GATEWAY_PORT, default 3001), and the session cookie it seals has
 * no explicit `Domain=`, so a browser redirected back from `/auth/callback`
 * would store it against api-gateway's origin, not `web`'s — useless for any
 * page `web` itself serves. Rewriting `/auth/*` here makes the whole login
 * round-trip appear same-origin to the browser (it only ever talks to
 * `web`'s own port), so the cookie lands on the right origin without either
 * app doing any CORS/cross-origin cookie handling.
 */
const apiGatewayUrl = process.env.SAF_API_GATEWAY_URL ?? "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/auth/:path*", destination: `${apiGatewayUrl}/auth/:path*` }];
  },
};

export default nextConfig;
