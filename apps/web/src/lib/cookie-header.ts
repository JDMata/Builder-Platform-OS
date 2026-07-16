import { cookies } from "next/headers";

/** Thin `next/headers` call site, kept out of api-gateway-client.ts so that file stays testable without a Next.js request context. */
export async function readCookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
