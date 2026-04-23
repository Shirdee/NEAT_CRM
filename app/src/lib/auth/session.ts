import {createHmac, timingSafeEqual} from "node:crypto";

import {auth, currentUser} from "@clerk/nextjs/server";
import {cookies} from "next/headers";

import type {AppLocale} from "@/i18n/routing";
import {getUserByClerkUserId, linkUserToClerkIdentity} from "@/lib/data/repository";

export const SESSION_COOKIE = "crm_session";
export const roles = ["admin", "editor", "viewer"] as const;

export type UserRole = (typeof roles)[number];

export type UserSession = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  languagePreference: AppLocale;
};

type SessionPayload = UserSession & {
  exp: number;
};

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

export function hasClerkAuth() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && process.env.CLERK_SECRET_KEY?.trim()
  );
}

function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || "crm-sprint-1-local-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(session: UserSession) {
  const payload: SessionPayload = {
    ...session,
    exp: Date.now() + SESSION_DURATION_MS
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readSessionToken(token: string | undefined | null): UserSession | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = signPayload(encodedPayload);

  if (expected.length !== signature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
  } catch {
    return null;
  }

  if (payload.exp < Date.now() || !roles.includes(payload.role)) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    languagePreference: payload.languagePreference
  };
}

export async function getCurrentSession(): Promise<UserSession | null> {
  if (hasClerkAuth()) {
    const authState = await auth();

    if (!authState.userId) {
      return null;
    }

    let user = await getUserByClerkUserId(authState.userId);

    if (!user) {
      const clerkUser = await currentUser();
      const primaryEmail =
        clerkUser?.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ??
        clerkUser?.emailAddresses[0]?.emailAddress ??
        null;

      if (!primaryEmail) {
        return null;
      }

      user = await linkUserToClerkIdentity({
        clerkUserId: authState.userId,
        email: primaryEmail
      });
    }

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      languagePreference: user.languagePreference
    };
  }

  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function canManageAdminLists(role: UserRole) {
  return role === "admin";
}

export function canEditRecords(role: UserRole) {
  return role === "admin" || role === "editor";
}

export function isLocale(value: string): value is AppLocale {
  return value === "en" || value === "he";
}
