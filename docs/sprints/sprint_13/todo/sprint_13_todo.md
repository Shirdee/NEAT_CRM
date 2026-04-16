---
tags:
  - crm
  - sprint
  - sprint-13
  - todo
  - cto
aliases:
  - Sprint 13 Todo
  - CRM Sprint 13 Todo
created: 2026-04-16
updated: 2026-04-16
---

# Sprint 13 Todo

Parent: [[sprints/sprint_13/sprint_13_index|Sprint 13 Index]]

## Task Date Tracking

- added: `2026-04-16`

## Workstream A — Login Cleanup

### DEV-1301 — Remove debug login cues

**Files:**

- `crm/app/src/components/auth/login-form.tsx`
- `crm/app/src/messages/en.json`
- `crm/app/src/messages/he.json`

**Do:**

- remove prefilled demo credentials
- remove demo-account hint copy
- keep clear login errors for missing and invalid credentials

**Acceptance:**

- login screen has no demo/debug credentials in copy or defaults

---

## Workstream B — Admin Credentials

### DEV-1302 — Update seeded admin login

**Files:**

- `crm/app/src/lib/data/seed.ts`
- `crm/app/prisma/seed.mjs`
- `crm/app/DEPLOYMENT.md`

**Do:**

- seed admin user as `ShirAdmin`
- set admin password to `shir1994`
- update deployment/runbook login note

**Acceptance:**

- seed + fallback auth match founder credentials

---

## Workstream C — User Management

### DEV-1303 — Add admin user management flow

**Files:**

- `crm/app/src/app/[locale]/(protected)/admin/users/page.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/users/actions.ts`
- `crm/app/src/lib/data/repository.ts`
- `crm/app/src/lib/data/fallback-store.ts`
- `crm/app/src/components/shell/app-shell.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/lists/page.tsx`
- `crm/app/src/messages/en.json`
- `crm/app/src/messages/he.json`

**Do:**

- add admin users route
- create user with role + locale + password
- allow activate/deactivate user
- add navigation and admin entrypoint link

**Acceptance:**

- admin can create and manage user access without code changes

---

## Workstream D — Microsoft Auth Boundary

### CTO-1301 — Define Microsoft auth follow-up boundary

**Files:**

- `crm/docs/DECISIONS.md`

**Do:**

- keep credentials auth as current system
- record Microsoft auth as optional next step
- define approval gate before provider migration

**Acceptance:**

- decision log reflects current state and explicit next decision

---

## Workstream E — Verification

### QA-1301 — Auth and admin-user gate

**Run:**

- `npx vitest run src/lib/data/repository.test.ts src/lib/auth/session.test.ts`
- `npm run typecheck`

**Acceptance:**

- updated auth and user-management paths pass checks
