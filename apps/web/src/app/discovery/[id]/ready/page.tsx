import { redirect } from "next/navigation";
import { fetchAuthenticatedSession } from "../../../../lib/api-gateway-client";
import { readCookieHeader } from "../../../../lib/cookie-header";

export const metadata = {
  title: "Project Created — SAP App Factory",
};

/**
 * Task 1.17 — the confirmation screen closing VS-1's journey. Product
 * Design Review Quick Win #7's "what happens next" panel is static content
 * (no generation capability exists to preview for real yet — Sprint 2+).
 * "View Project" is deliberately omitted rather than rendered as a link to
 * nowhere: docs/ux/sprint-1-discovery-workspace.md says it "links to
 * nothing yet beyond this confirmation," and a dead link is worse UX than
 * no link.
 */
export default async function ProjectReadyPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; projectName?: string; workspaceId?: string }>;
}) {
  const cookieHeader = await readCookieHeader();
  const session = await fetchAuthenticatedSession(cookieHeader);
  if (!session) {
    redirect("/login");
  }

  const { projectId, projectName, workspaceId } = await searchParams;
  if (!projectId || !projectName) {
    redirect("/discovery/new");
  }

  return (
    <main>
      <h1>Discovery Workspace · Project Created</h1>
      <p>✓ Project created: &ldquo;{projectName}&rdquo;</p>
      <dl>
        <dt>Workspace</dt>
        <dd>{workspaceId}</dd>
        <dt>Project ID</dt>
        <dd>{projectId}</dd>
        <dt>Discovery session</dt>
        <dd>Complete</dd>
      </dl>
      <section aria-label="What happens next">
        <h2>What happens next</h2>
        <p>
          Future sprints will generate documentation, applications, tests, and deployment pipelines
          from this Project.
        </p>
      </section>
    </main>
  );
}
