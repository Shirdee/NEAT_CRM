"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {canManageAdminLists, getCurrentSession, isLocale} from "@/lib/auth/session";
import {
  createListCategory,
  createListValue,
  toggleListValueActive,
  updateListValue
} from "@/lib/data/repository";

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function requireAdmin(locale: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (!canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }
}

export async function createCategoryAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  await requireAdmin(locale);

  const key = normalizeKey(String(formData.get("key") ?? ""));
  const name = String(formData.get("name") ?? "").trim();

  if (!key || !name) {
    redirect(`/${locale}/admin/lists?error=category`);
  }

  await createListCategory({key, name});
  revalidatePath(`/${locale}/admin/lists`);
}

export async function createValueAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  await requireAdmin(locale);

  const categoryId = String(formData.get("categoryId") ?? "");
  const key = normalizeKey(String(formData.get("key") ?? ""));
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const labelHe = String(formData.get("labelHe") ?? "").trim();

  if (!categoryId || !key || !labelEn || !labelHe) {
    redirect(`/${locale}/admin/lists?error=value`);
  }

  await createListValue({categoryId, key, labelEn, labelHe});
  revalidatePath(`/${locale}/admin/lists`);
}

export async function updateValueAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  await requireAdmin(locale);

  const id = String(formData.get("id") ?? "");
  const key = normalizeKey(String(formData.get("key") ?? ""));
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const labelHe = String(formData.get("labelHe") ?? "").trim();

  if (!id || !key || !labelEn || !labelHe) {
    redirect(`/${locale}/admin/lists?error=update`);
  }

  await updateListValue({id, key, labelEn, labelHe});
  revalidatePath(`/${locale}/admin/lists`);
}

export async function toggleValueAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  await requireAdmin(locale);

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(`/${locale}/admin/lists?error=toggle`);
  }

  await toggleListValueActive(id);
  revalidatePath(`/${locale}/admin/lists`);
}
