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

Two distinct surfaces:
- `src/lib/data/crm.ts` — all CRM entity reads/writes (companies, contacts, interactions, tasks, opportunities, saved views)
- `src/lib/data/repository.ts` — user and admin queries (user management, lookup lists)

Both delegate to either Prisma (when `DATABASE_URL` is set) or the in-memory fallback store (`src/lib/data/fallback-store.ts`). All data functions check `hasDatabaseUrl()` and branch accordingly — maintain both paths when adding new queries.

**Prisma client** is a singleton: `globalThis.prisma` in `src/lib/prisma/client.ts`, lazy-imported via `await import("@/lib/prisma/client")` only when `DATABASE_URL` exists.

### Server Actions vs API Routes

- **Mutations** (create/update/delete CRM records) → `src/lib/actions/` using `"use server"`. Actions validate session, check RBAC, call data layer, then `revalidatePath()`.
- **API routes** (`src/app/api/`) → only for: logout, import pipeline (multi-step chunked upload), and any operation that can't be a server action (e.g., streaming, external webhooks).
- Never mutate data from client components.

### Auth & RBAC

- Session token: `base64url(payload).HMAC-SHA256-signature`, 12-hour TTL
- Payload contains: `{id, email, fullName, role, languagePreference, exp}`
- Three roles: `admin`, `editor`, `viewer`
- Role checks: `canManageAdminLists()` (admin only), `canEditRecords()` (admin/editor)
- Key files: `src/lib/auth/session.ts`, `src/lib/auth/authenticate.ts`
- RBAC enforced in server actions, API routes, and server components (for UI gating)

### Error Handling Pattern

- Server actions return `{ok: true; id: string} | {ok: false; message: string}` — client renders `result.message` on failure
- API routes return `NextResponse.json({error: "..."}, {status: 400|403|500})`
- Data layer throws on unexpected DB errors; actions catch and return `{ok: false}`

### i18n

- Locales: `en`, `he` — always included in URL (prefix: `always`)
- Translations: `src/messages/{locale}.json`
- Navigation helpers: `src/i18n/navigation.ts` — use these instead of raw `next/navigation`
- Server components/actions: `getTranslations()` from `next-intl/server`
- Client components: `useTranslations()` from `next-intl`
- All admin lookup values have bilingual labels (`labelEn` / `labelHe`) in the `ListValue` table

### Key Entities (Prisma)

`Company` → `Contact` (many) → `ContactEmail` / `ContactPhone` (multi-value)  
`Company` → `Interaction`, `Task`, `Opportunity`  
`Contact` → `Interaction`, `Task`  
`ListCategory` → `ListValue` — drives all dropdown fields (bilingual)  
`ImportBatch` → `ImportRow` → `ImportIssue` — three-table import pipeline  
`SavedView` — user-scoped JSON filter presets per module (unique on `userId + module + name`)  

All PKs are UUIDs. Major entities carry `createdById` / `updatedById` audit fields.

### Import Flow

Admin-only, multi-step: upload → staging → validation → conflict review → commit. The browser-side path parses the workbook with `xlsx` and POSTs normalized chunks to avoid Vercel Hobby's 4.5 MB function body limit. Fallback: `npm run import:local`.

### Component Conventions

- `src/components/crm/searchable-option-field.tsx` — use for any field that selects an existing record (live DB-backed search, not static dropdown)
- `src/components/shell/` — app chrome (nav, layout wrapper)
- Forms use React Hook Form + Zod; live search pattern replaces static selects

### Tests

Tests live alongside source in `src/`. Naming: `*.test.ts`. Key coverage areas:
- `src/lib/auth/session.test.ts` — token creation, validation, tamper detection
- `src/lib/data/crm.test.ts` / `repository.test.ts` — data layer (tests against fallback store)
- `src/lib/import/workbook.test.ts` — import parsing
- `src/lib/data/saved-views.test.ts` — filter serialization

Tests use the fallback store (no real DB needed). Vitest config at `vitest.config.ts` with path alias `@: ./src`.

### Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL — triggers real DB mode |
| `DATABASE_URL_UNPOOLED` | Direct connection (migrations, seeds) |
| `SESSION_SECRET` | HMAC signing key (has a local dev fallback) |
