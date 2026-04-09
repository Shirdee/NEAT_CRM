"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  createInteraction,
  normalizeInteractionPayload,
  updateInteraction
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

function buildInteractionRedirectParams(formData: FormData, error: string) {
  const params = new URLSearchParams({error});
  const fields = [
    "interactionDate",
    "companyId",
    "contactId",
    "interactionTypeValueId",
    "subject",
    "summary",
    "outcomeStatusValueId",
    "compact"
  ];

  for (const field of fields) {
    const value = String(formData.get(field) ?? "").trim();

    if (value) {
      params.set(field, value);
    }
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

    const interaction = await createInteraction(payload);

    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/contacts`);

    if (intent === "create-and-add-follow-up") {
      const params = new URLSearchParams({
        relatedInteractionId: interaction.id
      });

      if (interaction.companyId) {
        params.set("companyId", interaction.companyId);
      }

      if (interaction.contactId) {
        params.set("contactId", interaction.contactId);
      }

      redirect(`/${locale}/tasks/new?${params.toString()}`);
    }

    redirect(`/${locale}/interactions/${interaction.id}?success=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`/${locale}/interactions/new?${buildInteractionRedirectParams(formData, "validation")}`);
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
