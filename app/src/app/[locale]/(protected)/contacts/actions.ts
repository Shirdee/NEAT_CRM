"use server";

import {revalidatePath} from "next/cache";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {redirect} from "next/navigation";

import {canEditRecords, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  createContact,
  deleteContact,
  DeleteBlockedError,
  normalizeContactPayload,
  updateContact,
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

function buildContactRedirectParams(formData: FormData, fields: string[] = []) {
  const params = new URLSearchParams({error: "validation"});
  const values = [
    "firstName",
    "lastName",
    "roleTitle",
    "companyId",
    "notes",
    "emailsText",
    "primaryEmail",
    "phonesText",
    "primaryPhone"
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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const fields = error instanceof ValidationError ? error.fields : [];
    redirect(`/${locale}/contacts/new?${buildContactRedirectParams(formData, fields)}`);
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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(`/${locale}/contacts/${contactId}/edit?error=validation`);
  }
}

export async function deleteContactAction(boundLocale: string, formData: FormData) {
  const locale = isLocale(boundLocale) ? boundLocale : "en";
  const session = await requireWritableUser(locale);
  const contactId = String(formData.get("contactId") ?? "");
  const confirm = String(formData.get("confirm") ?? "") === "1";

  if (!contactId) {
    redirect(`/${locale}/contacts?error=missing`);
  }

  if (!confirm) {
    redirect(`/${locale}/contacts/${contactId}/edit?error=confirm`);
  }

  if (session.role !== "admin") {
    redirect(`/${locale}/access-denied`);
  }

  try {
    const deleted = await deleteContact(contactId, session.id);

    if (!deleted) {
      redirect(`/${locale}/contacts?error=missing`);
    }

    revalidatePath(`/${locale}/contacts`);
    revalidatePath(`/${locale}/interactions`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/opportunities`);
    redirect(`/${locale}/contacts?success=deleted`);
  } catch (error) {
    if (isRedirectError(error)) throw error;

    if (error instanceof DeleteBlockedError) {
      const params = new URLSearchParams({
        error: "blocked",
        blockedBy: error.blockedBy.join(",")
      });
      redirect(`/${locale}/contacts/${contactId}/edit?${params.toString()}`);
    }

    redirect(`/${locale}/contacts/${contactId}/edit?error=delete`);
  }
}
