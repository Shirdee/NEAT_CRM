"use server";

import {cookies} from "next/headers";

import {redirect} from "next/navigation";

import {authenticateUser} from "@/lib/auth/authenticate";
import {createSessionToken, isLocale, SESSION_COOKIE} from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const safeLocale = isLocale(locale) ? locale : "en";

  if (!email || !password) {
    redirect(`/${safeLocale}/login?error=missing`);
  }

  const session = await authenticateUser(email, password);

  if (!session) {
    redirect(`/${safeLocale}/login?error=invalid`);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  redirect(`/${safeLocale}/dashboard`);
}
