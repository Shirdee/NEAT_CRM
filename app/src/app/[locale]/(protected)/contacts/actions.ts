"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {createContact, normalizeContactPayload, updateContact} from "@/lib/data/crm";

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

export async function createContactAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);

  try {
    const payload = normalizeContactPayload({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      roleTitle: String(formData.get("roleTitle") ?? ""),
      companyId: String(formData.get("companyId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      emailsText: formData.get("emailsText"),
      primaryEmail: String(formData.get("primaryEmail") ?? ""),
      phonesText: formData.get("phonesText"),
      primaryPhone: String(formData.get("primaryPhone") ?? ""),
      actorUserId: session.id
    });

    const contact = await createContact(payload);

    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/contacts/${contact.id}?success=created`);
  } catch {
    redirect(`/${locale}/contacts/new?error=validation`);
  }
}

export async function updateContactAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const contactId = String(formData.get("contactId") ?? "");

  if (!contactId) {
    redirect(`/${locale}/contacts?error=missing`);
  }

  try {
    const payload = normalizeContactPayload({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      roleTitle: String(formData.get("roleTitle") ?? ""),
      companyId: String(formData.get("companyId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      emailsText: formData.get("emailsText"),
      primaryEmail: String(formData.get("primaryEmail") ?? ""),
      phonesText: formData.get("phonesText"),
      primaryPhone: String(formData.get("primaryPhone") ?? ""),
      actorUserId: session.id
    });

    await updateContact(contactId, payload);

    revalidatePath(`/${locale}/contacts`);
    redirect(`/${locale}/contacts/${contactId}?success=updated`);
  } catch {
    redirect(`/${locale}/contacts/${contactId}/edit?error=validation`);
  }
}
