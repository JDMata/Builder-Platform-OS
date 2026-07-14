import { NextResponse } from "next/server";

/**
 * BFF session-cookie handling stub (SAF-3). `web` never talks to the IdP
 * directly — `api-gateway` terminates the OIDC login flow and issues the
 * session cookie this route would read (08-authentication-and-rbac.md).
 * That flow doesn't exist until SAF-17 delivers `auth-core`; this stub
 * always reports unauthenticated rather than faking a session, so nothing
 * downstream can mistake it for a real check.
 */
export function GET(): NextResponse {
  return NextResponse.json({ authenticated: false });
}
