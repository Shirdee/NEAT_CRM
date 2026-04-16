# Sprint 1 Closeout Runbook

Use this runbook only after real PostgreSQL and Vercel access are available.

## Required Environment Variables

- `DATABASE_URL`
- `SESSION_SECRET`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Database Closeout

1. Generate the Prisma client if needed:
   - `npm run prisma:generate`
2. Apply the existing migration to the real database:
   - `npm run db:migrate`
3. Seed the baseline Sprint 1 users and lookup values:
   - `npm run db:seed`
4. Smoke-test the live data path:
   - log in with `ShirAdmin` / `shir1994`
   - confirm admin lists load and edits persist

## Preview Deployment Closeout

1. Install or log into the Vercel CLI if it is not already configured.
2. Link the project:
   - `vercel link`
3. Set the required environment variables for preview and production.
4. Create a preview deployment:
   - `vercel`
5. Smoke-test:
   - `/en/login`
   - `/en/dashboard`
   - `/en/admin/lists`
   - `/he/login`

## Evidence To Capture For QA

- migration command output
- seed command output
- preview deployment URL
- confirmation that login and admin lists work against database-backed data
