"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  createOpportunity,
  normalizeOpportunityPayload,
  updateOpportunity,
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

function buildOpportunityRedirectParams(formData: FormData, fields: string[] = []) {
  const params = new URLSearchParams({error: "validation"});
  const values = [
    "companyId",
    "contactId",
    "opportunityName",
    "opportunityStageValueId",
    "opportunityTypeValueId",
    "estimatedValue",
    "statusValueId",
    "targetCloseDate",
    "notes"
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

export async function createOpportunityAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);

  try {
    const payload = normalizeOpportunityPayload({
      companyId: String(formData.get("companyId") ?? ""),
      contactId: String(formData.get("contactId") ?? ""),
      opportunityName: String(formData.get("opportunityName") ?? ""),
      opportunityStageValueId: String(formData.get("opportunityStageValueId") ?? ""),
      opportunityTypeValueId: String(formData.get("opportunityTypeValueId") ?? ""),
      estimatedValue: String(formData.get("estimatedValue") ?? ""),
      statusValueId: String(formData.get("statusValueId") ?? ""),
      targetCloseDate: String(formData.get("targetCloseDate") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      actorUserId: session.id
    });
    await validateCompanyContactMatch(payload.companyId, payload.contactId);

    const opportunity = await createOpportunity(payload);

    revalidatePath(`/${locale}/opportunities`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/opportunities/${opportunity.id}?success=created`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const fields = error instanceof ValidationError ? error.fields : [];
    redirect(`/${locale}/opportunities/new?${buildOpportunityRedirectParams(formData, fields)}`);
  }
}

export async function updateOpportunityAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const opportunityId = String(formData.get("opportunityId") ?? "");

  if (!opportunityId) {
    redirect(`/${locale}/opportunities?error=missing`);
  }

  try {
    const payload = normalizeOpportunityPayload({
      companyId: String(formData.get("companyId") ?? ""),
      contactId: String(formData.get("contactId") ?? ""),
      opportunityName: String(formData.get("opportunityName") ?? ""),
      opportunityStageValueId: String(formData.get("opportunityStageValueId") ?? ""),
      opportunityTypeValueId: String(formData.get("opportunityTypeValueId") ?? ""),
      estimatedValue: String(formData.get("estimatedValue") ?? ""),
      statusValueId: String(formData.get("statusValueId") ?? ""),
      targetCloseDate: String(formData.get("targetCloseDate") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      actorUserId: session.id
    });
    await validateCompanyContactMatch(payload.companyId, payload.contactId);

    await updateOpportunity(opportunityId, payload);

    revalidatePath(`/${locale}/opportunities`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/opportunities/${opportunityId}?success=updated`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const fields = error instanceof ValidationError ? error.fields : [];
    const params = new URLSearchParams({error: "validation"});
    if (fields.length > 0) params.set("invalidFields", fields.join(","));
    redirect(`/${locale}/opportunities/${opportunityId}/edit?${params.toString()}`);
  }
}
