"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {canManageAdminLists, getCurrentSession, isLocale} from "@/lib/auth/session";
import {listLookupOptions} from "@/lib/data/crm";
import {applyBatchEdit, type BatchEditEntity, type BatchEditField} from "@/lib/data/maintenance";

function isBatchEntity(value: string): value is BatchEditEntity {
  return value === "companies" || value === "tasks" || value === "opportunities";
}

function isBatchField(entity: BatchEditEntity, field: string): field is BatchEditField {
  if (entity === "companies") {
    return field === "sourceValueId" || field === "stageValueId";
  }

  if (entity === "tasks") {
    return field === "taskTypeValueId" || field === "priorityValueId" || field === "statusValueId";
  }

  return field === "opportunityStageValueId" || field === "opportunityTypeValueId" || field === "statusValueId";
}

async function requireAdmin(locale: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (!canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  return session;
}

export async function applyBatchEditAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  const session = await requireAdmin(locale);
  const entityValue = String(formData.get("entity") ?? "companies");
  const fieldValue = String(formData.get("field") ?? "");
  const valueId = String(formData.get("valueId") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "") === "1";
  const q = String(formData.get("q") ?? "");
  const ids = formData
    .getAll("ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!isBatchEntity(entityValue)) {
    redirect(`/${locale}/admin/batch?error=entity`);
  }

  if (!isBatchField(entityValue, fieldValue) || !valueId) {
    redirect(`/${locale}/admin/batch?entity=${entityValue}&q=${encodeURIComponent(q)}&error=field`);
  }

  const allowedValues = await listLookupOptions(
    entityValue === "companies"
      ? fieldValue === "sourceValueId"
        ? "lead_source"
        : "company_stage"
      : entityValue === "tasks"
        ? fieldValue === "taskTypeValueId"
          ? "task_type"
          : fieldValue === "priorityValueId"
            ? "task_priority"
            : "task_status"
        : fieldValue === "opportunityStageValueId"
          ? "opportunity_stage"
          : fieldValue === "opportunityTypeValueId"
            ? "opportunity_type"
            : "opportunity_status"
  );

  if (!allowedValues.some((item) => item.id === valueId)) {
    redirect(`/${locale}/admin/batch?entity=${entityValue}&q=${encodeURIComponent(q)}&error=value`);
  }

  if (!confirm) {
    redirect(`/${locale}/admin/batch?entity=${entityValue}&q=${encodeURIComponent(q)}&error=confirm`);
  }

  try {
    const result = await applyBatchEdit({
      entity: entityValue,
      field: fieldValue,
      valueId,
      ids,
      actorUserId: session.id
    });

    revalidatePath(`/${locale}/admin/batch`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/opportunities`);
    revalidatePath(`/${locale}/dashboard`);
    redirect(
      `/${locale}/admin/batch?entity=${entityValue}&q=${encodeURIComponent(q)}&success=${result.count}`
    );
  } catch (error) {
    const message = error instanceof Error ? encodeURIComponent(error.message) : "Batch%20update%20failed";
    redirect(`/${locale}/admin/batch?entity=${entityValue}&q=${encodeURIComponent(q)}&error=${message}`);
  }
}
