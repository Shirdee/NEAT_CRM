"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {
  canManageAdminLists,
  getCurrentSession,
  isLocale,
  roles
} from "@/lib/auth/session";
import {createAdminUser, toggleAdminUserActive} from "@/lib/data/repository";

function isRole(value: string): value is (typeof roles)[number] {
  return roles.includes(value as (typeof roles)[number]);
}

function isLanguagePreference(value: string): value is "en" | "he" {
  return value === "en" || value === "he";
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

export async function createUserAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  await requireAdmin(locale);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleValue = String(formData.get("role") ?? "");
  const languagePreferenceValue = String(formData.get("languagePreference") ?? "en");

  if (!fullName || !email || !password || !isRole(roleValue)) {
    redirect(`/${locale}/admin/users?error=missing`);
  }

  if (password.length < 8) {
    redirect(`/${locale}/admin/users?error=password`);
  }

  if (!isLanguagePreference(languagePreferenceValue)) {
    redirect(`/${locale}/admin/users?error=locale`);
  }

  try {
    await createAdminUser({
      fullName,
      email,
      password,
      role: roleValue,
      languagePreference: languagePreferenceValue
    });
  } catch {
    redirect(`/${locale}/admin/users?error=email`);
  }

  revalidatePath(`/${locale}/admin/users`);
}

export async function toggleUserActiveAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  await requireAdmin(locale);

  const userId = String(formData.get("userId") ?? "");
  if (!userId) {
    redirect(`/${locale}/admin/users?error=missing`);
  }

  await toggleAdminUserActive(userId);
  revalidatePath(`/${locale}/admin/users`);
}
