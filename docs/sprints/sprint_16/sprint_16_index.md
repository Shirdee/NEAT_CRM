---
tags:
  - crm
  - sprint
  - sprint-16
  - auth
  - clerk
  - cto
aliases:
  - Sprint 16 Index
  - CRM Sprint 16 Index
created: 2026-04-23
updated: 2026-04-26
---

# Sprint 16 Index — Clerk Auth Cutover Planning

Parent: [[sprints/README|CRM Sprints]]

## Status

**READY FOR QA / PM CLOSEOUT — 2026-04-23**

## Objective

Prepare CRM for Clerk-based auth cutover as next dedicated auth sprint.

This sprint packages migration scope, deployment wiring, RBAC migration, and verification gate into one controlled execution plan.

## Scope (Approved Planning Package)

- replace current custom identity/session flow with Clerk as primary identity source
- keep current CRM roles: `admin`, `editor`, `viewer`
- migrate route protection and server auth reads to Clerk
- migrate admin user-management flow to Clerk-backed lifecycle
- define environment/deployment cutover path for local, preview, and production
- define QA gate for auth cutover across EN/HE, desktop/mobile, and role access

## Non-Scope (Hard Guardrails)

- no Clerk Organizations in first cut
- no Microsoft OAuth in same sprint unless separately approved
- no provider sync, automation, or unrelated feature work
- no long-term dual-auth steady state with both local passwords and Clerk sign-in

## Why This Sprint Exists

- live app already has working custom auth, so Clerk is migration work, not simple add-on
- auth cutover touches middleware, login flow, admin access, and deployment secrets
- this work needs explicit sequencing to avoid lockout or role regressions

## Delivery Shape

Sprint 16 is planning + execution handoff package for Clerk cutover.
Implementation should start only after founder approval of Clerk timing.

## CTO Technical Decisions Locked

- keep CRM `User` table as internal domain and audit identity
- add Clerk linkage to CRM user records rather than replacing all internal `user.id` references with Clerk IDs
- keep `role`, `languagePreference`, and `isActive` authoritative in CRM database
- Clerk becomes source of credentials/session identity, not source of audit-row foreign keys
- server auth path must resolve Clerk user -> CRM user before permission checks and mutations

## Done When

- Clerk cutover scope is broken into executable DEV and QA tasks
- migration boundaries and non-scope are explicit
- deployment env requirements are documented
- role model and user-management expectations are locked
- sprint package is ready for DEV execution without reopening architecture debate

## DEV Delivery Update (2026-04-23)

- Sprint 16 implementation complete
- delivered:
  - Clerk provider wiring
  - Clerk-aware proxy with localized redirects and API coverage
  - Clerk-backed login form
  - Clerk-backed session adapter resolving to CRM `User` row
  - admin-user provisioning through Clerk while CRM DB remains canonical for `role`, `languagePreference`, and `isActive`
  - logout control migration
  - Prisma schema + migration for `clerkUserId` and nullable `passwordHash`

## Verification Evidence (DEV, 2026-04-23)

- `npm run typecheck` pass
- `npm run lint` pass
- `npm run test` pass (`44/44`)
- `npm run build` pass
- pending QA/manual closeout:
  - Clerk-auth sign-in/sign-out sweep on `/en/login` and `/he/login`
  - role sweep: `admin`, `editor`, `viewer`
  - mobile width sweep
  - RTL/Hebrew sweep
  - environment/deployment wiring verification

## PM / DEV Smoke Update (2026-04-26)

- local smoke found a Clerk login page crash on EN/HE routes
- fixed by replacing Clerk button wrappers with a small client action component
- `/en/login` and `/he/login` now return `200`
- protected dashboard redirects signed-out users to `/en/login`
- unauthenticated export API returns `403`
- full Clerk sign-in, role, mobile, RTL, and deployment-env sweep remains open under `QA-1601`

## Linked Sprint Docs

- [[sprints/sprint_16/todo/sprint_16_todo|Sprint 16 Todo]]
- [[CLERK_DEPLOYMENT_PLAN|Clerk Deployment Plan]]

## Related

- [[DECISIONS|Decisions]]
- [[ROADMAP|Roadmap]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
- [[sprints/sprint_13/sprint_13_index|Sprint 13 Index]]
