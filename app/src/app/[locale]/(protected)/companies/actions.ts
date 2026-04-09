"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {createCompany, normalizeCompanyPayload, updateCompany, ValidationError} from "@/lib/data/crm";

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

function buildCompanyRedirectParams(formData: FormData, fields: string[] = []) {
  const params = new URLSearchParams({error: "validation"});
  const values = ["companyName", "website", "sourceValueId", "stageValueId", "notes"];

  for (const field of values) {
    const value = String(formData.get(field) ?? "");
    if (value) params.set(field, value);
  }

  if (fields.length > 0) {
    params.set("invalidFields", fields.join(","));
  }

  return params.toString();
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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const fields = error instanceof ValidationError ? error.fields : [];
    redirect(`/${locale}/companies/new?${buildCompanyRedirectParams(formData, fields)}`);
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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(`/${locale}/companies/${companyId}/edit?error=validation`);
  }
}
