import { notFound, redirect } from "next/navigation";
import { fetchAuthenticatedSession, fetchDiscoveryState } from "../../../lib/api-gateway-client";
import { readCookieHeader } from "../../../lib/cookie-header";
import {
  deriveConfidenceLabel,
  formatKindLabel,
  groupRequirementsByKind,
} from "../../../lib/discovery-view";
import { answerClarificationsAction, confirmDiscoveryAction } from "../actions";

export const metadata = {
  title: "Discovery Workspace — SAP App Factory",
};

/**
 * One route covers both Task 1.11 (Clarification Q&A) and Task 1.15
 * (Project Charter) — which screen renders is determined entirely by
 * `unansweredClarifications.length`, exactly the same condition the backend
 * workflow itself branches on (docs/ux/sprint-1-discovery-workspace.md's
 * journey diagram). `runId`/`round` are threaded through the URL rather
 * than stored server-side: `apps/orchestrator` never persists a
 * document-id-to-run-id lookup anywhere queryable after `start`/`answer`
 * responses, so the caller (this app) is the only place that association
 * can live for a fully server-rendered, no-client-state flow.
 */
export default async function DiscoverySessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ runId?: string; round?: string; error?: string }>;
}) {
  const cookieHeader = await readCookieHeader();
  const session = await fetchAuthenticatedSession(cookieHeader);
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const { runId, round, error } = await searchParams;
  if (!runId) {
    redirect("/discovery/new");
  }

  const state = await fetchDiscoveryState(cookieHeader, id);
  if (!state) {
    notFound();
  }

  if (state.unansweredClarifications.length > 0) {
    return (
      <main>
        <h1>Discovery Workspace · Clarifications needed</h1>
        {error ? <p role="alert">{error}</p> : null}
        <p>The assistant needs a bit more detail before continuing:</p>
        <form action={answerClarificationsAction}>
          <input type="hidden" name="requirementDocumentId" value={id} />
          <input type="hidden" name="runId" value={runId} />
          <input type="hidden" name="round" value={round ?? "1"} />
          <ol>
            {state.unansweredClarifications.map((clarification) => (
              <li key={clarification.id}>
                <label htmlFor={`answer-${clarification.id}`}>
                  {clarification.question}
                  <br />
                  <em>&ldquo;{clarification.sourceFragment}&rdquo;</em>
                </label>
                <br />
                <input type="hidden" name="clarificationId" value={clarification.id} />
                <textarea
                  id={`answer-${clarification.id}`}
                  name={`answer-${clarification.id}`}
                  required
                />
              </li>
            ))}
          </ol>
          <button type="submit">Submit Answers</button>
        </form>
      </main>
    );
  }

  const confidence = deriveConfidenceLabel(state.clarifications);
  const groups = groupRequirementsByKind(state.requirements);

  return (
    <main>
      <h1>Discovery Workspace · Project Charter</h1>
      {error ? <p role="alert">{error}</p> : null}
      <p>Structured from your idea:</p>
      {groups.map((group) => (
        <section key={group.kind} aria-label={formatKindLabel(group.kind)}>
          <h2>{formatKindLabel(group.kind)}</h2>
          {group.requirements.map((requirement) => (
            <article key={requirement.id}>
              <h3>
                {requirement.description} — {confidence}
              </h3>
              {requirement.acceptanceCriteria.length > 0 ? (
                <ul>
                  {requirement.acceptanceCriteria.map((criterion) => (
                    <li key={criterion.id}>
                      {criterion.description}
                      {criterion.origin === "ai-suggested" ? " (AI-suggested)" : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      ))}
      <form action={confirmDiscoveryAction}>
        <input type="hidden" name="requirementDocumentId" value={id} />
        <input type="hidden" name="runId" value={runId} />
        <button type="submit">Approve & Create Project</button>
      </form>
    </main>
  );
}
