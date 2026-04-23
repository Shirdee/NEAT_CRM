---
tags:
  - crm
  - sprint
  - sprint-16
  - todo
  - auth
  - clerk
  - cto
aliases:
  - Sprint 16 Todo
  - CRM Sprint 16 Todo
created: 2026-04-23
updated: 2026-04-23
---

# Sprint 16 Todo — CTO Handoff To DEV

Parent: [[sprints/sprint_16/sprint_16_index|Sprint 16 Index]]

## Status

Planned and handed off by CTO on 2026-04-23.
DEV implementation complete on 2026-04-23.
Automated quality gates passed: `npm run typecheck`, `npm run lint`, `npm run test` (`44/44`), `npm run build`.
Sprint is ready for QA / PM closeout.

## Scope Slice In This Handoff

- included:
  - Clerk App Router integration
  - route/middleware auth migration
  - RBAC migration to Clerk-backed session metadata
  - login/logout flow replacement
  - admin user-management migration
  - deployment/env wiring and cutover checklist
- excluded:
  - Clerk Organizations
  - Microsoft OAuth in same sprint
  - external provider sync
  - unrelated UI or data-model refactors

## Technical Guardrails

- keep current CRM RBAC semantics: `admin`, `editor`, `viewer`
- preserve locale-prefixed routing and bilingual EN/HE behavior
- preserve server-side permission enforcement
- do not leave local password auth as long-term fallback after cutover
- keep CRM DB as canonical source for `role`, `languagePreference`, and `isActive`
- keep CRM `User.id` as canonical internal actor ID for audit fields and saved views
- Clerk user identity must map into existing CRM user row before app authorization runs

## CTO Decision Lock

- add `clerkUserId` to CRM `User` model as unique nullable linkage field
- remove local password dependence from active auth path, but do not remove CRM `User` records
- admin user-management UI should manage CRM role/locale/active state and Clerk identity linkage together
- email stays effectively unique across Clerk and CRM user record linkage

## Execution Order

1. [x] `CTO-1601` Approval gate: confirm Clerk timing and confirm Clerk replaces current identity flow
2. [x] `DEV-1601` Add Clerk SDK and provider wiring for Next.js App Router
3. [x] `DEV-1602` Replace custom `proxy.ts` auth gate with Clerk middleware while preserving locale routing
4. [x] `DEV-1603` Replace login/logout/session flow with Clerk-backed flow
5. [x] `DEV-1604` Build Clerk-backed role helper and migrate protected pages/actions/API routes
6. [x] `DEV-1605` Rework `/admin/users` for Clerk-backed create/activate/deactivate/role management
7. [x] `DEV-1606` Remove local password verification/session-token issuance paths after cutover path is verified
8. [x] `DEV-1607` Wire Vercel env setup and deployment checklist for local, preview, and production
9. [ ] `QA-1601` Run auth cutover verification gate

## Workstream A — Identity Integration

### DEV-1601 — Add Clerk core integration

**Files:**

- `crm/app/package.json`
- `crm/app/src/app/layout.tsx`
- any required Clerk init/provider files

**Do:**

- add Clerk Next.js SDK
- wrap app with `ClerkProvider`
- keep existing app shell and locale behavior intact

**Acceptance:**

- app boots with Clerk wiring in place
- no locale or layout regression introduced

---

### DEV-1602 — Migrate route protection

**Files:**

- `crm/app/src/proxy.ts`
- any Clerk middleware helpers

**Do:**

- replace custom cookie/session gate with Clerk middleware
- preserve redirects for localized login and protected routes

**Acceptance:**

- unauthenticated users redirect correctly
- authenticated users skip login route correctly
- EN/HE route handling still works

---

## Workstream B — Session And RBAC Migration

### DEV-1603 — Replace login/logout/session flow

**Files:**

- `crm/app/src/app/[locale]/(public)/login/page.tsx`
- `crm/app/src/app/[locale]/(public)/login/actions.ts`
- `crm/app/src/app/api/logout/route.ts`
- auth helpers that issue current custom session cookie

**Do:**

- move sign-in and sign-out flow to Clerk
- remove dependence on custom `crm_session` issuance for active path

**Acceptance:**

- login works through Clerk
- logout clears access correctly
- custom login action no longer owns primary auth path

---

### DEV-1604 — Migrate RBAC to Clerk-backed role lookup

**Files:**

- `crm/app/src/lib/auth/session.ts`
- `crm/app/src/lib/data/repository.ts`
- protected pages/actions/routes that read current session

**Do:**

- map Clerk session identity into linked CRM user row
- read `role`, `languagePreference`, and `isActive` from CRM DB, not Clerk metadata
- keep `admin` / `editor` / `viewer` behavior unchanged
- preserve server-side enforcement pattern

**Acceptance:**

- role gates behave same as current app
- actor ID used by mutations and saved views remains CRM `User.id`
- no client-only authorization path introduced

---

## Workstream C — User Management Migration

### DEV-1605 — Rework admin user-management surface

**Files:**

- `/admin/users` route files
- relevant data/admin auth helpers

**Do:**

- make admin user-management Clerk-backed
- support create user, role assignment, activate/deactivate
- create/update linked CRM user row for role/locale/active state
- keep Clerk as credential owner and CRM DB as app-permission owner

**Acceptance:**

- admin can manage CRM users without local password store
- role assignment path stays explicit and auditable

---

### DEV-1606 — Remove deprecated local-auth paths

**Files:**

- `crm/app/src/lib/auth/authenticate.ts`
- custom session issuance and password-verification code
- any obsolete seed or admin credential notes

**Do:**

- remove dead local-auth primary-path code after Clerk path is verified
- keep codebase free of long-term dual-auth drift
- keep only migration-safe code needed to map and maintain CRM user records

**Acceptance:**

- primary auth path is Clerk only
- no stale local password flow remains in active app behavior

---

## Workstream D — Deployment And Verification

### DEV-1607 — Wire deployment/env plan

**Files:**

- deployment docs and env guidance as needed

**Do:**

- document required Clerk env vars for local, preview, production
- define preview/prod separation and cutover checklist
- keep DB env requirements intact

**Acceptance:**

- deployment checklist is explicit
- environment ownership is clear before release

---

### QA-1601 — Auth cutover gate

**Run:**

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- manual sign-in/sign-out sweep on `/en/login` and `/he/login`
- protected-route sweep by role: `admin`, `editor`, `viewer`
- manual mobile width sweep
- manual Hebrew RTL sweep

**Acceptance:**

- auth works on EN and HE routes
- role gating matches current permission model
- no lockout on admin routes
- build and verification commands pass

## Risks / Blockers

- auth cutover can lock out admin access if role mapping or middleware migration is incomplete
- keeping both local auth and Clerk too long will create drift
- locale preference can drift if both Clerk metadata and CRM DB remain writable
- production cutover needs correct environment separation between preview and prod Clerk instances

## [DEV] Visible Start

- sprint: Sprint 16
- approved build scope: Clerk integration, route protection migration, Clerk-backed RBAC bridge, and admin-user migration
- first owned implementation slice:
  - `DEV-1601` on `crm/app/package.json`, `crm/app/src/app/layout.tsx`, and new client provider wrapper
  - `DEV-1602` on `crm/app/src/proxy.ts`
- first concrete implementation action:
  - add `@clerk/nextjs`
  - wire `ClerkProvider` through root app layout using a client wrapper
  - then migrate `proxy.ts` carefully to preserve localized login redirects

## DEV Start Outcome (2026-04-23)

- DEV subagent reviewed first slice and confirmed root `app/layout.tsx` is clean seam for Clerk provider wiring
- likely first diff set:
  - `crm/app/package.json`
  - `crm/app/package-lock.json`
  - `crm/app/src/app/layout.tsx`
  - new `crm/app/src/app/providers.tsx`
  - `crm/app/src/proxy.ts`
- explicit implementation risks:
  - redirect loops or lockout if Clerk middleware order breaks locale/login behavior
  - `ClerkProvider` must stay in client wrapper, not raw server layout path
  - DEV-1601 and DEV-1602 are scaffolding only; full cutover still depends on later session/RBAC slices

## PM Update (2026-04-23)

- Sprint 16 implementation complete
- delivered scope:
  - Clerk provider wiring
  - Clerk-aware proxy with localized redirects and API coverage
  - Clerk-backed login form
  - Clerk-backed session adapter resolving to CRM `User` row
  - admin-user provisioning through Clerk while CRM DB remains canonical for `role`, `languagePreference`, and `isActive`
  - logout control migration
  - Prisma schema + migration for `clerkUserId` and nullable `passwordHash`
- verification:
  - `npm run typecheck` pass
  - `npm run lint` pass
  - `npm run test` pass (`44/44`)
  - `npm run build` pass

## Verification Evidence (DEV, 2026-04-23)

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test` (`44/44`)
- [x] `npm run build`
- [ ] manual sign-in/sign-out sweep on `/en/login` and `/he/login`
- [ ] role sweep: `admin`, `editor`, `viewer`
- [ ] manual mobile width sweep
- [ ] manual Hebrew RTL sweep
- [ ] environment/deployment wiring verification

## PM Sync Note

PM should treat Sprint 16 as implementation-complete and awaiting QA / manual closeout evidence.

## Related

- [[sprints/sprint_16/sprint_16_index|Sprint 16 Index]]
- [[CLERK_DEPLOYMENT_PLAN|Clerk Deployment Plan]]
- [[DECISIONS|Decisions]]
- [[PERMISSIONS|Permissions]]
