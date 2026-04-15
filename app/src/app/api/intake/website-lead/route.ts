import {NextResponse} from "next/server";

import {stageWebsiteLeadSubmission, validateWebsiteLeadSubmission} from "@/lib/intake/website-lead";

type RateLimitBucket = {count: number; windowStartMs: number};

const globalForRateLimit = globalThis as typeof globalThis & {
  crmWebsiteLeadRateLimit?: Map<string, RateLimitBucket>;
};

const rateLimitStore = globalForRateLimit.crmWebsiteLeadRateLimit ?? new Map<string, RateLimitBucket>();
globalForRateLimit.crmWebsiteLeadRateLimit = rateLimitStore;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() ? realIp.trim() : null;
}

function parseAllowedOrigins() {
  const raw = process.env.CRM_WEBSITE_INTAKE_ALLOWED_ORIGINS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyCors(response: NextResponse, requestOrigin: string | null) {
  const allowedOrigins = parseAllowedOrigins();
  if (!requestOrigin || allowedOrigins.length === 0) {
    return response;
  }

  if (!allowedOrigins.includes(requestOrigin)) {
    return response;
  }

  response.headers.set("access-control-allow-origin", requestOrigin);
  response.headers.set("access-control-allow-methods", "POST,OPTIONS");
  response.headers.set("access-control-allow-headers", "content-type,x-crm-intake-token");
  response.headers.set("access-control-max-age", "86400");
  response.headers.set("vary", "origin");
  return response;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxPerWindow = 10;

  const existing = rateLimitStore.get(key);
  if (!existing || now - existing.windowStartMs >= windowMs) {
    rateLimitStore.set(key, {count: 1, windowStartMs: now});
    return false;
  }

  if (existing.count >= maxPerWindow) {
    return true;
  }

  existing.count += 1;
  return false;
}

async function resolveUploadedByIdForPublicIntake() {
  const configured = process.env.CRM_PUBLIC_INTAKE_UPLOADED_BY_ID?.trim();
  if (configured) {
    return configured;
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return "user_admin";
  }

  const {prisma} = await import("@/lib/prisma/client");
  const user = await prisma.user.findFirst({
    where: {
      role: "admin",
      isActive: true
    },
    select: {
      id: true
    }
  });

  if (!user?.id) {
    throw new Error("No active admin user exists to own public intake batches.");
  }

  return user.id;
}

export async function OPTIONS(request: Request) {
  const requestOrigin = request.headers.get("origin");
  const response = new NextResponse(null, {status: 204});
  return applyCors(response, requestOrigin);
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      const response = NextResponse.json({error: "Expected application/json"}, {status: 415});
      return applyCors(response, requestOrigin);
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength && contentLength > 20_000) {
      const response = NextResponse.json({error: "Payload too large"}, {status: 413});
      return applyCors(response, requestOrigin);
    }

    const tokenRequired = process.env.CRM_WEBSITE_INTAKE_TOKEN?.trim();
    if (tokenRequired) {
      const provided = request.headers.get("x-crm-intake-token")?.trim();
      if (!provided || provided !== tokenRequired) {
        const response = NextResponse.json({error: "Forbidden"}, {status: 403});
        return applyCors(response, requestOrigin);
      }
    }

    const ip = getClientIp(request);
    if (ip && isRateLimited(`ip:${ip}`)) {
      const response = NextResponse.json({error: "Too many requests"}, {status: 429});
      return applyCors(response, requestOrigin);
    }

    const body = (await request.json()) as unknown;
    const validation = validateWebsiteLeadSubmission(body);

    if (!validation.ok) {
      const response = NextResponse.json({error: validation.error}, {status: 400});
      return applyCors(response, requestOrigin);
    }

    if (validation.value.isHoneypotTripped) {
      // Deliberately behave like success to avoid giving bots feedback.
      const response = NextResponse.json({ok: true}, {status: 202});
      return applyCors(response, requestOrigin);
    }

    const uploadedById = await resolveUploadedByIdForPublicIntake();
    await stageWebsiteLeadSubmission({
      uploadedById,
      intake: validation.value,
      requestMeta: {
        origin: requestOrigin,
        referer: request.headers.get("referer"),
        ip,
        userAgent: request.headers.get("user-agent")
      }
    });

    const response = NextResponse.json({ok: true}, {status: 201});
    return applyCors(response, requestOrigin);
  } catch (error) {
    console.error("Failed to stage website lead submission", error);
    const response = NextResponse.json(
      {error: error instanceof Error ? error.message : "Failed to stage website lead submission."},
      {status: 500}
    );
    return applyCors(response, requestOrigin);
  }
}

