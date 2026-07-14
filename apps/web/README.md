# @sap-app-factory/web

## Purpose
Control-plane UI, BFF session-cookie handling ([04-service-boundaries.md](../../docs/architecture/04-service-boundaries.md)). Talks to `api-gateway` only — never another service or the database directly.

## Sprint 0 scope (SAF-3)
- A status page (`src/app/page.tsx`) that server-side fetches `api-gateway`'s `/health` endpoint and renders the result — proving the BFF wiring for real, not a static page that never calls the service it fronts. Gracefully reports "unreachable" rather than throwing if `api-gateway` isn't running.
- A BFF session-cookie handling **stub** (`src/app/api/session/route.ts`) — always reports `{ authenticated: false }`. Real OIDC session handling (`api-gateway` terminates the login flow and issues the cookie this route would read, per [08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md)) arrives with SAF-17; this stub exists so nothing downstream mistakes an unbuilt check for a real one.

**Deliberately not wired yet:** Tailwind and UI5 Web Components (both named in `PROJECT_STRUCTURE.md` for this app's eventual UI). Pulling in a design system for one plain-text status page would be complexity with no Sprint 0 payoff — they arrive with the first real UI work.

## `tsconfig.json` deviates from `tsconfig.base.json`, deliberately
Next.js's own bundler (SWC/webpack/Turbopack), not `tsc`, resolves imports at build time, and its conventions (extensionless relative imports, file-based routing) are incompatible with `tsconfig.base.json`'s `NodeNext` module resolution and `verbatimModuleSyntax`, which require explicit `.js` extensions on relative imports. This app overrides `module`/`moduleResolution`/`verbatimModuleSyntax` only — every strict-mode rule (`strict`, `noUncheckedIndexedAccess`) is inherited unchanged.

## Testing
`get-api-gateway-health.spec.ts` and `route.spec.ts` test the underlying logic (the health-fetch function, the session handler) directly as plain functions — no React rendering harness pulled in for two pieces of non-UI logic. The health-fetch logic lives in its own file (`get-api-gateway-health.ts`), separate from `page.tsx`, specifically so the test runner never has to parse JSX (Vitest's default esbuild transform errored on `tsconfig.json`'s `jsx: "preserve"` when it tried to load `page.tsx` directly — found while writing this story's tests). `next build`/`next dev` remain the way to actually see the rendered page.

**One more real, found-not-assumed constraint:** `page.tsx`'s own import of `get-api-gateway-health` is extensionless (`"./get-api-gateway-health"`), not `.js`-suffixed like every other relative import in this monorepo — Next's webpack build failed with "Module not found" on the `.js` form despite `moduleResolution: bundler` being exactly the mode TypeScript added `.js`-imports-resolve-to-`.ts` support for. Vitest's resolver (Vite) is more permissive and accepts either form, which is why `get-api-gateway-health.spec.ts` still uses the monorepo's normal `.js`-suffixed convention. Only production code actually built by `next build`/`next dev` needs the extensionless form.
