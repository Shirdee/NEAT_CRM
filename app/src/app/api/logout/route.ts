import {NextResponse} from "next/server";

import {SESSION_COOKIE} from "@/lib/auth/session";

export async function POST(request: Request) {
  const referer = request.headers.get("referer");
  const refererUrl = referer ? new URL(referer) : null;
  const [, maybeLocale] = refererUrl?.pathname.split("/") ?? [];
  const locale = maybeLocale === "he" || maybeLocale === "en" ? maybeLocale : "en";
  const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));

  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete("__session");

  return response;
}
