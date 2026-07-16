export const metadata = {
  title: "Sign In — SAP App Factory",
};

/**
 * Task 1.1 (Product Design Review Quick Win #2): a minimal login screen —
 * one action, wired to the existing real Authorization Code + PKCE flow
 * `api-gateway` already terminates. `/auth/login` is same-origin here via
 * `next.config.mjs`'s rewrite, so the session cookie `api-gateway` seals on
 * callback lands on this app's own origin.
 */
export default function LoginPage() {
  return (
    <main>
      <h1>SAP App Factory</h1>
      <p>Sign in to start a new Discovery session.</p>
      <a href="/auth/login">Sign in</a>
    </main>
  );
}
