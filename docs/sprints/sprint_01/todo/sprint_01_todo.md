---
tags:
  - crm
  - sprint
  - sprint-01
  - todo
  - dev-handoff
aliases:
  - Sprint 01 Todo
---

# Sprint 01 Todo

## Status

Reviewed by PM and CTO.
Application implementation is complete.
Hosted deployment is complete on Vercel.
Live database closeout is complete on real infrastructure.

## Sprint Goal

Stand up the secure, bilingual, free-tier-friendly foundation for the CRM so later module work can build on stable auth, schema, localization, and deployment primitives.

## DEV Task List

### DEV-001: Initialize Application Shell

- objective: create the Next.js App Router TypeScript app inside the CRM workspace
- scope: app shell, route groups, basic layout, global styles, project config
- must include: clean folder structure that matches [[ARCHITECTURE|Architecture]]
- done when: the app runs locally and has a base authenticated layout shell
- dependencies: founder approval of Sprint 1

### DEV-002: Set Up Database And Prisma

- objective: establish the PostgreSQL connection and Prisma schema baseline
- scope: environment config, Prisma setup, initial migrations, base entities from [[DATA_MODEL|Data Model]]
- must include: users, list categories, list values, import batches, import issues, and placeholders for CRM core tables
- done when: migrations run cleanly and Prisma client can read and write the base schema
- dependencies: DEV-001, database provider credentials

### DEV-003: Implement Credentials Auth

- objective: implement credentials-based login using the approved free-tier-friendly auth approach
- scope: login page, session handling, password storage, protected routes
- must include: no magic-link dependency by default, aligned with [[ARCHITECTURE|Architecture]]
- done when: authenticated users can sign in and unauthenticated users are blocked from app routes
- dependencies: DEV-001, founder confirmation of auth method

### DEV-004: Implement Role-Based Access Control

- objective: enforce `admin`, `editor`, and `viewer` permissions server-side
- scope: route protection, mutation guards, role helpers, admin-only areas
- must include: behavior aligned with [[PERMISSIONS|Permissions]]
- done when: viewer cannot mutate data, editor cannot access admin settings, admin can access all Sprint 1 areas
- dependencies: DEV-003

### DEV-005: Add Bilingual Infrastructure

- objective: set up Hebrew and English UI infrastructure
- scope: locale routing or switching, translation files, base RTL support, shared translated UI strings
- must include: app shell, login flow, and admin list pages translated at the framework level
- done when: the shell can switch between English and Hebrew without breaking layout
- dependencies: DEV-001

### DEV-006: Build App Shell And Navigation

- objective: create the reusable shell that all future CRM modules will live inside
- scope: top navigation, mobile action area, page container, responsive layout primitives
- must include: mobile-friendly behavior aligned with [[SCREENS_AND_FLOWS|Screens And Flows]]
- done when: iPhone-width layout is usable and future module pages can plug into the shell
- dependencies: DEV-003, DEV-005

### DEV-007: Build Admin List Framework

- objective: create the first working admin-managed structured values surface
- scope: list categories index, list values CRUD, bilingual labels, activation state
- must include: categories needed later in Sprint 2 and Sprint 3
- done when: admin can manage lookup values without code changes
- dependencies: DEV-002, DEV-004, DEV-005, DEV-006

### DEV-008: Set Up Preview Deployment Pipeline

- objective: make the foundation deployable on Vercel Hobby
- scope: env var setup, GitHub to Vercel connection assumptions, preview build readiness
- must include: free-tier-safe defaults and no paid add-ons
- done when: the project can produce a successful preview deployment path
- dependencies: DEV-001, DEV-002, DEV-003

## Recommended Execution Order

1. DEV-001 Initialize Application Shell
2. DEV-002 Set Up Database And Prisma
3. DEV-003 Implement Credentials Auth
4. DEV-005 Add Bilingual Infrastructure
5. DEV-004 Implement Role-Based Access Control
6. DEV-006 Build App Shell And Navigation
7. DEV-007 Build Admin List Framework
8. DEV-008 Set Up Preview Deployment Pipeline

## Definition Of Done

- Next.js app structure exists and is stable
- Prisma schema and migrations are working
- credentials-based login works
- admin, editor, and viewer permissions are enforced
- Hebrew and English shell infrastructure works
- admin list management is operational
- preview deployment path is working on Vercel Hobby

## QA Targets For DEV

- auth route protection
- password login happy path and invalid login behavior
- role restriction behavior
- locale switch behavior
- mobile shell responsiveness
- admin list CRUD smoke test

## Blockers And Approval Dependencies

- founder must approve Sprint 1 start
- founder must confirm credentials login is accepted for MVP
- database provider credentials are still needed

## Sprint 1 Closeout Plan

### DEV-CLOSEOUT-001: Verify Live Database Migration

- objective: run the existing Prisma migration against the chosen PostgreSQL provider
- scope: database connection, migration execution, migration success confirmation
- done when: the live database schema matches the Sprint 1 Prisma baseline without manual patching
- dependencies: database provider credentials

### DEV-CLOSEOUT-002: Seed Baseline Foundation Data

- objective: load the initial Sprint 1 users and lookup values into the real database
- scope: admin user, editor user, viewer user, core list categories, core list values
- done when: live login and admin list screens work against database-backed records
- dependencies: DEV-CLOSEOUT-001

### DEV-CLOSEOUT-003: Verify Vercel Preview Path

- objective: complete the preview deployment path on Vercel Hobby
- scope: environment variables, preview build, route smoke test
- done when: one preview deployment succeeds and core Sprint 1 routes load correctly
- dependencies: DEV-CLOSEOUT-001, DEV-CLOSEOUT-002

Status update:

- completed on 2026-04-04 through the GitHub-connected `neat-crm` Vercel project
- production deployment is live on `https://neat-crm.vercel.app`
- hosted `/en/login` and `/he/login` were verified after deploy
- completed on 2026-04-04 against the Neon production database
- migration `20260404190000_sprint1_foundation` applied successfully
- seed completed successfully
- verified database counts: 3 users, 4 categories, 8 list values

## Final Remaining Work

- none for Sprint 1 closeout

Closeout evidence:

- Vercel production env was pulled on 2026-04-04 and included `DATABASE_URL`
- `npm run db:migrate` succeeded against the real Neon database
- `npm run db:seed` succeeded against the real Neon database
- direct database verification confirmed seeded foundation records

## Related

- [[sprints/sprint_01/sprint_01_index|Sprint 01 Index]]
- [[sprints/sprint_01/reviews/sprint_01_review|Sprint 01 Review]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[PERMISSIONS|Permissions]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
