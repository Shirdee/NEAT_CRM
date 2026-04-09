"use server";

import {revalidatePath} from "next/cache";
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

export async function createInteractionAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);

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
    redirect(`/${locale}/interactions/${interaction.id}?success=created`);
  } catch {
    redirect(`/${locale}/interactions/new?error=validation`);
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
  } catch {
    redirect(`/${locale}/interactions/${interactionId}/edit?error=validation`);
  }
}
