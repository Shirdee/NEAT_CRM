import {clerkMiddleware} from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import {NextFetchEvent, NextRequest, NextResponse} from "next/server";

import {routing} from "@/i18n/routing";

const SESSION_COOKIE = "crm_session";

const intlMiddleware = createMiddleware(routing);

const publicPages = new Set(["/login", "/access-denied"]);
const hasClerkAuth =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) &&
  Boolean(process.env.CLERK_SECRET_KEY?.trim());

function stripLocale(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (routing.locales.includes(maybeLocale as "en" | "he")) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname;
}

function hasLikelyValidSession(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  try {
    const normalizedPayload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalizedPayload);
    const payload = JSON.parse(json) as {
      exp?: number;
      role?: string;
    };

    return Boolean(
      payload.exp &&
        payload.exp > Date.now() &&
        (payload.role === "admin" || payload.role === "editor" || payload.role === "viewer")
    );
  } catch {
    return false;
  }
}

function legacyProxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = stripLocale(pathname);
  const hasSession = hasLikelyValidSession(request.cookies.get(SESSION_COOKIE)?.value);
  const locale = routing.locales.find((candidate) => pathname.startsWith(`/${candidate}`));
  const activeLocale = locale ?? routing.defaultLocale;

  if (!hasSession && !publicPages.has(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${activeLocale}/login`, request.url));
  }

  if (hasSession && pathnameWithoutLocale === "/login") {
    return NextResponse.redirect(new URL(`/${activeLocale}/dashboard`, request.url));
  }

  return response;
}

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const pathnameWithoutLocale = stripLocale(request.nextUrl.pathname);
  const locale = routing.locales.find((candidate) => request.nextUrl.pathname.startsWith(`/${candidate}`));
  const activeLocale = locale ?? routing.defaultLocale;
  const {isAuthenticated} = await auth();

  if (!isAuthenticated && !publicPages.has(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${activeLocale}/login`, request.url));
  }

  if (isAuthenticated && pathnameWithoutLocale === "/login") {
    return NextResponse.redirect(new URL(`/${activeLocale}/dashboard`, request.url));
  }

  return intlMiddleware(request);
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (hasClerkAuth) {
    return clerkProxy(request, event);
  }

  return legacyProxy(request);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/(api)(.*)"
  ]
};
