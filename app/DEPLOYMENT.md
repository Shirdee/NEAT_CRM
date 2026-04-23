# Deployment Runbook (Vercel + Clerk)

Use this runbook for current CRM deployments from `crm/app`.

## Required Environment Variables

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `SESSION_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## One-Time Link

1. Log in and link the project:
   - `npx vercel login`
   - `npx vercel link`

## Environment Setup

1. Add DB and session vars in all environments:
   - `npx vercel env add DATABASE_URL production`
   - `npx vercel env add DATABASE_URL preview`
   - `npx vercel env add DATABASE_URL_UNPOOLED production`
   - `npx vercel env add DATABASE_URL_UNPOOLED preview`
   - `npx vercel env add SESSION_SECRET production`
   - `npx vercel env add SESSION_SECRET preview`
2. Add Clerk vars in all environments:
   - `npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production`
   - `npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview`
   - `npx vercel env add CLERK_SECRET_KEY production`
   - `npx vercel env add CLERK_SECRET_KEY preview`
3. Verify env matrix:
   - `npx vercel env ls`

## Deploy

1. Preview:
   - from repo `crm` root: `npx vercel`
2. Production:
   - from repo `crm` root: `npx vercel --prod`

## Smoke Checklist

- `/en/login` renders Clerk sign-in UI
- unauthenticated `/en/dashboard` redirects to `/en/login`
- `/he/login` renders and keeps RTL layout
- authenticated admin reaches `/en/admin/users`

## QA Evidence

- `npx vercel env ls` output showing Clerk vars on Development/Preview/Production
- preview deployment URL
- production deployment URL (if promoted)
