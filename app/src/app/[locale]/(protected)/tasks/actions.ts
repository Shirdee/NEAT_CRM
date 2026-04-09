"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {createTask, normalizeTaskPayload, updateTask} from "@/lib/data/crm";

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
      actorUserId: session.id
    });

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

    redirect(`/${locale}/tasks/new?error=validation`);
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
      actorUserId: session.id
    });

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
