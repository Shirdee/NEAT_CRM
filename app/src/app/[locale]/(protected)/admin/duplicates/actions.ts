"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {canManageAdminLists, getCurrentSession, isLocale} from "@/lib/auth/session";
import {mergeDuplicateRecord, type DuplicateKind} from "@/lib/data/maintenance";

function isDuplicateKind(value: string): value is DuplicateKind {
  return value === "companies" || value === "contacts";
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

export async function mergeDuplicateRecordAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  const session = await requireAdmin(locale);

  const entityValue = String(formData.get("entity") ?? "");
  const primaryId = String(formData.get("primaryId") ?? "").trim();
  const duplicateId = String(formData.get("duplicateId") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "") === "1";

  if (!isDuplicateKind(entityValue) || !primaryId || !duplicateId) {
    redirect(`/${locale}/admin/duplicates?error=missing`);
  }

  if (primaryId === duplicateId) {
    redirect(`/${locale}/admin/duplicates?error=${encodeURIComponent("Select two different records.")}`);
  }

  if (!confirm) {
    redirect(`/${locale}/admin/duplicates?error=confirm`);
  }

  try {
    await mergeDuplicateRecord({
      entity: entityValue,
      primaryId,
      duplicateId,
      actorUserId: session.id
    });

    revalidatePath(`/${locale}/admin/duplicates`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/opportunities`);
    revalidatePath(`/${locale}/dashboard`);
    redirect(`/${locale}/admin/duplicates?success=merged`);
  } catch (error) {
    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Merge%20failed";
    redirect(`/${locale}/admin/duplicates?error=${message}`);
  }
}
