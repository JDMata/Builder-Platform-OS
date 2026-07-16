import { redirect } from "next/navigation";
import { fetchAuthenticatedSession } from "../../../lib/api-gateway-client";
import { readCookieHeader } from "../../../lib/cookie-header";
import { startDiscoveryAction } from "../actions";

export const metadata = {
  title: "Discovery Workspace — SAP App Factory",
};

/**
 * Task 1.9 — VS-1's entry point after login, no dashboard step in between
 * (Product Design Review). One free-text field, deliberately unstructured
 * on input since structuring is the `requirements-analyst` agent's job, not
 * a form's (docs/ux/sprint-1-discovery-workspace.md).
 *
 * `Workspace` has no selection UI this sprint — no workspace-management
 * capability exists yet, so a single fixed workspace is used rather than
 * building a dropdown backed by no real data source.
 */
export default async function NewDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieHeader = await readCookieHeader();
  const session = await fetchAuthenticatedSession(cookieHeader);
  if (!session) {
    redirect("/login");
  }

  const { error } = await searchParams;

  return (
    <main>
      <h1>SAP App Factory · Discovery Workspace</h1>
      {error ? <p role="alert">{error}</p> : null}
      <form action={startDiscoveryAction}>
        <label htmlFor="ideaText">Describe your business idea</label>
        <br />
        <textarea id="ideaText" name="ideaText" required rows={6} cols={60} />
        <p>Workspace: Default Workspace</p>
        <input type="hidden" name="workspaceId" value="default-workspace" />
        <button type="submit">Start Discovery</button>
      </form>
    </main>
  );
}
