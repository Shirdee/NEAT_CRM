"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {createCompany, normalizeCompanyPayload, updateCompany} from "@/lib/data/crm";

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

export async function createCompanyAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);

  try {
    const payload = normalizeCompanyPayload({
      companyName: String(formData.get("companyName") ?? ""),
      website: String(formData.get("website") ?? ""),
      sourceValueId: String(formData.get("sourceValueId") ?? ""),
      stageValueId: String(formData.get("stageValueId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      actorUserId: session.id
    });
    const company = await createCompany(payload);

    revalidatePath(`/${locale}/companies`);
    redirect(`/${locale}/companies/${company.id}?success=created`);
  } catch {
    redirect(`/${locale}/companies/new?error=validation`);
  }
}

export async function updateCompanyAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const companyId = String(formData.get("companyId") ?? "");

  if (!companyId) {
    redirect(`/${locale}/companies?error=missing`);
  }

  try {
    const payload = normalizeCompanyPayload({
      companyName: String(formData.get("companyName") ?? ""),
      website: String(formData.get("website") ?? ""),
      sourceValueId: String(formData.get("sourceValueId") ?? ""),
      stageValueId: String(formData.get("stageValueId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      actorUserId: session.id
    });

    await updateCompany(companyId, payload);

    revalidatePath(`/${locale}/companies`);
    redirect(`/${locale}/companies/${companyId}?success=updated`);
  } catch {
    redirect(`/${locale}/companies/${companyId}/edit?error=validation`);
  }
}
