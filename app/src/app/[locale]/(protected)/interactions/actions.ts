"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  createInteraction,
  deleteInteraction,
  DeleteBlockedError,
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
  const intent = String(formData.get("intent") ?? "");

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

    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);

    if (intent === "create-and-add-follow-up") {
      const params = new URLSearchParams({
        relatedInteractionId: interaction.id
      });
      const compact = String(formData.get("compact") ?? "");

      if (interaction.companyId) {
        params.set("companyId", interaction.companyId);
      }

      if (interaction.contactId) {
        params.set("contactId", interaction.contactId);
      }

      if (compact) {
        params.set("compact", compact);
      }

      redirect(`/${locale}/tasks/new?${params.toString()}`);
    }

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
  await requireWritableUser(locale);
  const interactionId = String(formData.get("interactionId") ?? "");
  const confirm = String(formData.get("confirm") ?? "") === "1";

  if (!interactionId) {
    redirect(`/${locale}/interactions?error=missing`);
  }

  if (!confirm) {
    redirect(`/${locale}/interactions/${interactionId}/edit?error=confirm`);
  }

  try {
    const deleted = await deleteInteraction(interactionId);

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
