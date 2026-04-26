"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  closeTaskWithReason,
  createTask,
  deleteTask,
  getTaskById,
  listLookupOptions,
  normalizeTaskPayload,
  updateTask,
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

function buildTaskRedirectParams(formData: FormData, fields: string[] = []) {
  const params = new URLSearchParams({error: "validation"});
  const values = [
    "compact",
    "companyId",
    "contactId",
    "relatedInteractionId",
    "taskTypeValueId",
    "dueDate",
    "priorityValueId",
    "statusValueId",
    "notes",
    "followUpEmail"
  ];

  for (const field of values) {
    const value = String(formData.get(field) ?? "");
    if (value) params.set(field, value);
  }

  if (fields.length > 0) {
    params.set("invalidFields", fields.join(","));
  }

  return params.toString();
}

export async function createTaskAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);

  try {
    const payload = normalizeTaskPayload({
      companyId: String(formData.get("companyId") ?? ""),
      contactId: String(formData.get("contactId") ?? ""),
      relatedInteractionId: String(formData.get("relatedInteractionId") ?? ""),
      taskTypeValueId: String(formData.get("taskTypeValueId") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
      priorityValueId: String(formData.get("priorityValueId") ?? ""),
      statusValueId: String(formData.get("statusValueId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      followUpEmail: String(formData.get("followUpEmail") ?? ""),
      actorUserId: session.id
    });
    await validateCompanyContactMatch(payload.companyId, payload.contactId);

    const task = await createTask(payload);

    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);

    redirect(`/${locale}/tasks/${task.id}?success=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const fields = error instanceof ValidationError ? error.fields : [];
    redirect(`/${locale}/tasks/new?${buildTaskRedirectParams(formData, fields)}`);
  }
}

export async function updateTaskAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const taskId = String(formData.get("taskId") ?? "");

  if (!taskId) {
    redirect(`/${locale}/tasks?error=missing`);
  }

  try {
    const payload = normalizeTaskPayload({
      companyId: String(formData.get("companyId") ?? ""),
      contactId: String(formData.get("contactId") ?? ""),
      relatedInteractionId: String(formData.get("relatedInteractionId") ?? ""),
      taskTypeValueId: String(formData.get("taskTypeValueId") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
      priorityValueId: String(formData.get("priorityValueId") ?? ""),
      statusValueId: String(formData.get("statusValueId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      followUpEmail: String(formData.get("followUpEmail") ?? ""),
      actorUserId: session.id
    });
    await validateCompanyContactMatch(payload.companyId, payload.contactId);

    await updateTask(taskId, payload);

    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/tasks/${taskId}?success=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`/${locale}/tasks/${taskId}/edit?error=validation`);
  }
}

export async function deleteTaskAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const confirm = String(formData.get("confirm") ?? "") === "1";

  if (!taskId) {
    redirect(`/${locale}/tasks?error=missing`);
  }

  if (!confirm) {
    redirect(`/${locale}/tasks/${taskId}/edit?error=confirm`);
  }

  const deleted = await deleteTask(taskId, session.id);

  if (!deleted) {
    redirect(`/${locale}/tasks?error=missing`);
  }

  revalidatePath(`/${locale}/tasks`);
  revalidatePath(`/${locale}/interactions`);
  revalidatePath(`/${locale}/companies`);
  revalidatePath(`/${locale}/contacts`);
  redirect(`/${locale}/tasks?success=deleted`);
}

export async function closeTaskAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const closeReasonValueId = String(formData.get("closeReasonValueId") ?? "");
  const meetingDate = String(formData.get("meetingDate") ?? "");

  if (!taskId || !closeReasonValueId) {
    redirect(`/${locale}/tasks/${taskId || ""}?error=validation`);
  }

  const task = await getTaskById(taskId);

  if (!task) {
    redirect(`/${locale}/tasks?error=missing`);
  }

  const closeOptions = await listLookupOptions("close_reason");
  const closeReason = closeOptions.find((option) => option.id === closeReasonValueId);
  const validReason = Boolean(closeReason);

  if (!validReason) {
    redirect(`/${locale}/tasks/${taskId}?error=validation`);
  }

  if (closeReason?.key === "meeting" && !meetingDate) {
    redirect(`/${locale}/tasks/${taskId}?error=meeting-date`);
  }

  await closeTaskWithReason(taskId, closeReasonValueId, session.id, {
    meetingDate
  });

  revalidatePath(`/${locale}/tasks`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/interactions`);
  revalidatePath(`/${locale}/companies`);
  revalidatePath(`/${locale}/contacts`);
  redirect(`/${locale}/tasks/${taskId}?success=closed`);
}
