# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # start dev server (port 3000)
npm run build          # prisma generate + next build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run test           # vitest run
npx vitest run <file>  # run a single test file
npm run db:migrate     # prisma migrate deploy
npm run db:seed        # seed from prisma/seed.mjs
npm run import:local   # CLI import (src/lib/import/run-local.ts)
```

## Architecture

**Full-stack Next.js 16 App Router** with TypeScript, Prisma → PostgreSQL, and `next-intl` for bilingual (en/he) UI.

All routes live under `src/app/[locale]/` — the locale prefix is always present. Protected routes are nested under `(protected)/`. Auth is handled in `src/proxy.ts` (not `middleware.ts`) via a custom HMAC-SHA256 JWT stored in the `crm_session` cookie.

### Data Layer

`src/lib/data/crm.ts` is the main read/write surface for all CRM entities. It delegates to either Prisma (when `DATABASE_URL` is set) or the in-memory fallback store (`src/lib/data/fallback-store.ts`). This dual-path pattern lets the app run fully without a database during local dev. All data functions check `hasDatabaseUrl()` and branch accordingly — maintain both paths when adding new queries.

### Server Actions

Mutations happen in `src/lib/actions/` via `"use server"` functions. Actions validate the session, check RBAC, call the data layer, then call `revalidatePath()`. Never mutate data from client components.

### Auth & RBAC

- Session token: `base64url(payload).HMAC-SHA256-signature`, 12-hour TTL
- Three roles: `admin`, `editor`, `viewer`
- Role checks: `canManageAdminLists()` (admin only), `canEditRecords()` (admin/editor)
- Key files: `src/lib/auth/session.ts`, `src/lib/auth/authenticate.ts`

### i18n

- Locales: `en`, `he` — always included in URL (prefix: `always`)
- Translations: `src/messages/{locale}.json`
- Navigation helpers: `src/i18n/navigation.ts` — use these instead of raw `next/navigation`
- All admin lookup values have bilingual labels (`labelEn` / `labelHe`) in the `ListValue` table

### Key Entities (Prisma)

`Company` → `Contact` (many) → `ContactEmail` / `ContactPhone` (multi-value)  
`Company` → `Interaction`, `Task`, `Opportunity`  
`Contact` → `Interaction`, `Task`  
`ListCategory` → `ListValue` — drives all dropdown fields (bilingual)  
`ImportBatch` → `ImportRow` → `ImportIssue` — three-table import pipeline  
`SavedView` — user-scoped JSON filter presets per module  

All PKs are UUIDs.

### Import Flow

Admin-only, multi-step: upload → staging → validation → conflict review → commit. The browser-side path parses the workbook with `xlsx` and POSTs normalized chunks to avoid Vercel Hobby's 4.5 MB function body limit. Fallback: `npm run import:local`.

### Component Conventions

- `src/components/crm/searchable-option-field.tsx` — use for any field that selects an existing record (live DB-backed search, not static dropdown)
- `src/components/shell/` — app chrome (nav, layout wrapper)
- Forms use React Hook Form + Zod; live search pattern replaces static selects

### Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL — triggers real DB mode |
| `DATABASE_URL_UNPOOLED` | Direct connection (migrations, seeds) |
| `SESSION_SECRET` | HMAC signing key (has a local dev fallback) |
