"use server";

import { redirect } from "next/navigation";
import { stringField } from "@sap-app-factory/http-server-kit";
import {
  answerClarifications,
  confirmDiscovery,
  startDiscovery,
} from "../../lib/api-gateway-client";
import { readCookieHeader } from "../../lib/cookie-header";

export async function startDiscoveryAction(formData: FormData): Promise<void> {
  const ideaText = stringField(formData.get("ideaText")).trim();
  const workspaceId = stringField(formData.get("workspaceId"), "default-workspace");

  if (ideaText.length === 0) {
    redirect(
      `/discovery/new?error=${encodeURIComponent("Describe your business idea before starting.")}`,
    );
    return;
  }

  const cookieHeader = await readCookieHeader();
  const result = await startDiscovery(cookieHeader, { workspaceId, ideaText });

  if (!result.ok || !result.value) {
    redirect(
      `/discovery/new?error=${encodeURIComponent(result.error ?? "Could not start discovery.")}`,
    );
    return;
  }

  redirect(
    `/discovery/${result.value.document.id}?runId=${encodeURIComponent(result.value.runId)}&round=1`,
  );
}

export async function answerClarificationsAction(formData: FormData): Promise<void> {
  const requirementDocumentId = stringField(formData.get("requirementDocumentId"));
  const runId = stringField(formData.get("runId"));
  const round = Number(stringField(formData.get("round"), "1"));
  const clarificationIds = formData.getAll("clarificationId").map((value) => stringField(value));

  const answers = clarificationIds.map((clarificationId) => ({
    clarificationId,
    answer: stringField(formData.get(`answer-${clarificationId}`)).trim(),
  }));

  const missing = answers.some((a) => a.answer.length === 0);
  if (missing) {
    redirect(
      `/discovery/${requirementDocumentId}?runId=${encodeURIComponent(runId)}&round=${round}` +
        `&error=${encodeURIComponent("Answer every question before continuing.")}`,
    );
    return;
  }

  const cookieHeader = await readCookieHeader();
  const result = await answerClarifications(cookieHeader, {
    runId,
    requirementDocumentId,
    round,
    answers,
  });

  if (!result.ok) {
    redirect(
      `/discovery/${requirementDocumentId}?runId=${encodeURIComponent(runId)}&round=${round}` +
        `&error=${encodeURIComponent(result.error ?? "Could not submit answers.")}`,
    );
    return;
  }

  redirect(
    `/discovery/${requirementDocumentId}?runId=${encodeURIComponent(runId)}&round=${round + 1}`,
  );
}

export async function confirmDiscoveryAction(formData: FormData): Promise<void> {
  const requirementDocumentId = stringField(formData.get("requirementDocumentId"));
  const runId = stringField(formData.get("runId"));

  const cookieHeader = await readCookieHeader();
  const result = await confirmDiscovery(cookieHeader, { runId, requirementDocumentId });

  if (!result.ok || !result.value) {
    redirect(
      `/discovery/${requirementDocumentId}?runId=${encodeURIComponent(runId)}` +
        `&error=${encodeURIComponent(result.error ?? "Could not create the project.")}`,
    );
    return;
  }

  const { project } = result.value;
  const params = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
    workspaceId: project.workspaceId,
  });
  redirect(`/discovery/${requirementDocumentId}/ready?${params.toString()}`);
}
