"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  closeInteractionWithReason,
  createInteraction,
  createTask,
  deleteInteraction,
  DeleteBlockedError,
  getInteractionById,
  listLookupOptions,
  normalizeInteractionPayload,
  updateInteraction,
  validateCompanyContactMatch,
  ValidationError
} from "@/lib/data/crm";

async function requireWritableUser(locale: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (!canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  return session;
}

function buildInteractionRedirectParams(formData: FormData, error: string, fields: string[] = []) {
  const params = new URLSearchParams({error});
  const valueFields = [
    "interactionDate",
    "companyId",
    "contactId",
    "interactionTypeValueId",
    "subject",
    "summary",
    "outcomeStatusValueId",
    "compact"
  ];

  for (const field of valueFields) {
    const value = String(formData.get(field) ?? "").trim();

    if (value) {
      params.set(field, value);
    }
  }

  if (fields.length > 0) {
    params.set("invalidFields", fields.join(","));
  }

  return params.toString();
}

export async function createInteractionAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const autoFollowUp = String(formData.get("autoFollowUp") ?? "") === "1";

  try {
    const payload = normalizeInteractionPayload({
      interactionDate: String(formData.get("interactionDate") ?? ""),
      companyId: String(formData.get("companyId") ?? ""),
      contactId: String(formData.get("contactId") ?? ""),
      interactionTypeValueId: String(formData.get("interactionTypeValueId") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      outcomeStatusValueId: String(formData.get("outcomeStatusValueId") ?? ""),
      actorUserId: session.id
    });
    await validateCompanyContactMatch(payload.companyId, payload.contactId);

    const interaction = await createInteraction(payload);

    if (autoFollowUp) {
      const [taskTypes, priorities, statuses] = await Promise.all([
        listLookupOptions("task_type"),
        listLookupOptions("task_priority"),
        listLookupOptions("task_status")
      ]);
      const taskType = taskTypes.find((option) => option.key === "call") ?? taskTypes[0];
      const priority = priorities.find((option) => option.key === "medium") ?? priorities[0];
      const status = statuses.find((option) => option.key === "open") ?? statuses[0];

      if (!taskType || !priority || !status) {
        throw new ValidationError("Follow-up task lookup values are missing.", [
          "taskTypeValueId",
          "priorityValueId",
          "statusValueId"
        ]);
      }

      const dueDate = new Date(new Date(payload.interactionDate).getTime() + 7 * 24 * 60 * 60 * 1000);

      await createTask({
        companyId: interaction.companyId,
        contactId: interaction.contactId,
        relatedInteractionId: interaction.id,
        taskTypeValueId: taskType.id,
        dueDate: dueDate.toISOString(),
        priorityValueId: priority.id,
        statusValueId: status.id,
        notes: locale === "he" ? `מעקב: ${interaction.subject}` : `Follow up: ${interaction.subject}`,
        followUpEmail: null,
        actorUserId: session.id
      });
    }

    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/dashboard`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);

    redirect(`/${locale}/interactions/${interaction.id}?success=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const fields = error instanceof ValidationError ? error.fields : [];
    redirect(`/${locale}/interactions/new?${buildInteractionRedirectParams(formData, "validation", fields)}`);
  }
}

export async function updateInteractionAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const interactionId = String(formData.get("interactionId") ?? "");

  if (!interactionId) {
    redirect(`/${locale}/interactions?error=missing`);
  }

  try {
    const payload = normalizeInteractionPayload({
      interactionDate: String(formData.get("interactionDate") ?? ""),
      companyId: String(formData.get("companyId") ?? ""),
      contactId: String(formData.get("contactId") ?? ""),
      interactionTypeValueId: String(formData.get("interactionTypeValueId") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      outcomeStatusValueId: String(formData.get("outcomeStatusValueId") ?? ""),
      actorUserId: session.id
    });
    await validateCompanyContactMatch(payload.companyId, payload.contactId);

    await updateInteraction(interactionId, payload);

    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/interactions/${interactionId}?success=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      `/${locale}/interactions/${interactionId}/edit?${buildInteractionRedirectParams(formData, "validation")}`
    );
  }
}

export async function deleteInteractionAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const interactionId = String(formData.get("interactionId") ?? "");
  const confirm = String(formData.get("confirm") ?? "") === "1";

  if (!interactionId) {
    redirect(`/${locale}/interactions?error=missing`);
  }

  if (!confirm) {
    redirect(`/${locale}/interactions/${interactionId}/edit?error=confirm`);
  }

  try {
    const deleted = await deleteInteraction(interactionId, session.id);

    if (!deleted) {
      redirect(`/${locale}/interactions?error=missing`);
    }

    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/interactions?success=deleted`);
  } catch (error) {
    if (isRedirectError(error)) throw error;

    if (error instanceof DeleteBlockedError) {
      const params = new URLSearchParams({
        error: "blocked",
        blockedBy: error.blockedBy.join(",")
      });
      redirect(`/${locale}/interactions/${interactionId}/edit?${params.toString()}`);
    }

    redirect(`/${locale}/interactions/${interactionId}/edit?error=delete`);
  }
}

export async function closeInteractionAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const interactionId = String(formData.get("interactionId") ?? "");
  const closeReasonValueId = String(formData.get("closeReasonValueId") ?? "");

  if (!interactionId || !closeReasonValueId) {
    redirect(`/${locale}/interactions/${interactionId || ""}?error=validation`);
  }

  const interaction = await getInteractionById(interactionId);

  if (!interaction) {
    redirect(`/${locale}/interactions?error=missing`);
  }

  const closeOptions = await listLookupOptions("close_reason");
  const validReason = closeOptions.some((option) => option.id === closeReasonValueId);

  if (!validReason) {
    redirect(`/${locale}/interactions/${interactionId}?error=validation`);
  }

  await closeInteractionWithReason(interactionId, closeReasonValueId, session.id);

  revalidatePath(`/${locale}/interactions`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/companies`);
  revalidatePath(`/${locale}/contacts`);
  redirect(`/${locale}/interactions/${interactionId}?success=closed`);
}
