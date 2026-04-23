---
tags:
  - crm
  - auth
  - clerk
  - deployment
  - cto
  - planning
aliases:
  - Clerk Deployment Plan
  - CRM Clerk Deployment Plan
created: 2026-04-23
updated: 2026-04-23
---

# Clerk Deployment Plan

## Source Context

- parent project hub: [[CRM Home]]
- project context: [[CRM Context]]

## Status

CTO recommendation prepared and implemented on 2026-04-23.
Repo implementation is complete; environment/deployment verification remains a QA closeout item.

## Recommendation

Do not add Clerk as a permanent parallel sign-in option beside current custom auth.
If Clerk is approved, use it as a full identity-provider cutover for the CRM.

Recommended sequence:

1. finish current closeout and keep current credentials auth stable
2. approve Clerk as next auth-platform decision
3. execute Clerk in a dedicated migration sprint

## Why

- live app already has working custom auth, RBAC, and admin user management
- partial dual-auth adds account ambiguity and migration risk
- Clerk is useful if project wants better auth UX and future provider extensibility
- current CRM does not need Clerk Organizations yet; single-tenant internal RBAC is enough

## Current State To Replace

Live code currently uses:

- custom HMAC cookie session in `app/src/lib/auth/session.ts`
- route gate in `app/src/proxy.ts`
- credentials verification in `app/src/lib/auth/authenticate.ts`
- local user management through app data layer and `/admin/users`

## Scope If Approved

- Clerk becomes source of identity
- CRM keeps app-level roles: `admin`, `editor`, `viewer`
- role is stored in Clerk metadata or session claims, then enforced in app server paths
- protected routes migrate from custom cookie checks to Clerk middleware/server auth helpers
- production and preview deployments use environment-specific Clerk instances/keys

## Non-Scope

- no Clerk Organizations in first cut
- no Microsoft OAuth in same change unless separately approved
- no long-term mixed auth model with both local passwords and Clerk identities
- no provider sync or automation expansion

## Architecture Delta

### Identity

- from: CRM-local credentials + signed cookie
- to: Clerk-hosted identity + Clerk session

### Authorization

- keep CRM RBAC semantics unchanged
- resolve Clerk session identity into CRM user row
- keep `role`, `languagePreference`, and `isActive` authoritative in CRM DB
- keep server-side enforcement in route handlers, server actions, and protected pages

### User Management

- Clerk owns sign-in UX, password reset, and account identity lifecycle
- CRM app keeps role, locale, active-state, and domain-specific gating logic
- `/admin/users` becomes Clerk-backed admin surface, not second identity store

## Deployment Plan

### Phase 0: Approval Gate

- approve Clerk as replacement identity source for CRM sign-in
- confirm timing: now vs after current auth closeout/stabilization
- confirm first Clerk rollout stays credentials-first

### Phase 1: Dev Integration

- add Clerk Next.js SDK
- replace custom `proxy.ts` auth gate with `clerkMiddleware()`
- wrap app root with `ClerkProvider`
- replace login route flow with Clerk sign-in
- replace server session reads with Clerk `auth()` or `currentUser()`
- preserve locale-prefixed routing and bilingual UX

### Phase 2: RBAC Migration

- define canonical role shape in Clerk metadata
- create helper that maps Clerk session data to `admin` / `editor` / `viewer`
- update protected pages, actions, and API routes to use Clerk-backed role checks
- keep current permission model from [[PERMISSIONS|Permissions]]

### Phase 3: Admin Surface Migration

- rework `/admin/users` to create, activate, deactivate, and role-manage Clerk users
- stop writing or verifying local password hashes
- decide single source for locale preference: Clerk metadata or CRM DB

### Phase 4: Deployment Wiring

- configure Clerk development instance for local and preview
- configure Clerk production instance for production
- add Vercel environment variables per environment
- verify redirect URLs and domain configuration before cutover

### Phase 5: Cutover

- create/import internal users into Clerk
- assign founder/admin role
- switch production auth to Clerk
- remove custom login/session creation/password verification code
- run post-cutover smoke on login, logout, protected routes, and admin role gating

## Environment Requirements

Expected Vercel wiring:

- Clerk publishable key
- Clerk secret key
- Clerk redirect settings as needed
- existing `DATABASE_URL`
- existing `DATABASE_URL_UNPOOLED`

Operational notes:

- production must use Clerk production keys
- preview should stay isolated from production auth state
- production should use owned domain, not depend on `*.vercel.app`

## Acceptance Criteria

- users can sign in through Clerk on `/en/login` and `/he/login`
- protected routes reject unauthenticated users correctly
- role gates still enforce `admin` / `editor` / `viewer`
- admin can manage user access without local password storage
- `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` pass
- manual smoke passes on desktop, mobile width, and Hebrew RTL

## Risks

- partial migration can leave two identity systems live at once
- current docs still describe older auth architecture in places; doc drift must be cleaned during cutover
- moving role/locale fields to Clerk metadata needs one canonical source to avoid sync bugs
- auth cutover can break locale redirects or admin access if middleware migration is incomplete
- Clerk feature choice can change pricing if project later adopts advanced B2B or org capabilities

## CTO Recommendation

- if goal is only internal CRM stability: keep current auth for now
- if goal is stronger long-term auth platform: approve Clerk cutover as dedicated next sprint

## Related

- [[DECISIONS|Decisions]]
- [[ROADMAP|Roadmap]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
- [[sprints/sprint_16/sprint_16_index|Sprint 16 Index]]
- [[sprints/sprint_13/sprint_13_index|Sprint 13 Index]]
