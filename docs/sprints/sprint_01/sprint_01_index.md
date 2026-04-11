---
tags:
  - crm
  - sprint
  - sprint-01
  - planning
aliases:
  - Sprint 01 Index
  - CRM Sprint 01 Index
---

# Sprint 01 Index

## Status

Sprint 1 implementation is complete in the repository and has passed QA.
Sprint 1 closeout is complete: Vercel deployment, PostgreSQL migration, and baseline seed verification are all done.

## Objective

Establish the secure app shell, core schema, permissions framework, bilingual foundation, and deployment pipeline for the CRM MVP.

## PM Review Summary

- Sprint 1 is the correct starting point because it unlocks every later sprint.
- Scope should stay tightly focused on foundation only.
- No business module CRUD should be built yet beyond admin-list scaffolding needed for the system backbone.

## CTO Review Summary

- The stack direction is sound for the free-tier constraint.
- The most important technical boundaries are auth, schema, RBAC, localization, and deployability.
- The main risk in Sprint 1 is accidental overbuilding before the foundation is proven.

## Sprint 1 Deliverables

- working Next.js app shell
- credentials-based login flow
- admin, editor, and viewer authorization
- base Prisma schema and migrations
- bilingual infrastructure for Hebrew and English
- admin list management foundation
- Vercel deployment with free-tier-compatible setup

## Current Closure Read

- application-side scope is complete
- no blocking code findings remain from QA
- GitHub-connected Vercel deployment is live and route-smoke-tested
- Neon PostgreSQL migration and Sprint 1 seed have been applied successfully
- Sprint 1 has no remaining delivery blockers

## Verified Hosted Delivery

- production deployment is live on `https://neat-crm.vercel.app`
- GitHub-driven Vercel deployment is working from commit `18a7d98`
- hosted `/en/login` and `/he/login` both returned `200`
- Hebrew hosted route renders with RTL layout
- real PostgreSQL env vars are now connected through Vercel and Neon
- Prisma migration `20260404190000_sprint1_foundation` was applied successfully
- seeded database counts were verified: 3 users, 4 categories, 8 list values

## Sprint 1 Outcome

- Sprint 1 is complete
- Sprint 2 can begin without reopening Sprint 1 foundation work

## Linked Sprint Docs

- [[sprints/sprint_01/todo/sprint_01_todo|Sprint 01 Todo]]
- [[sprints/sprint_01/reports/sprint_01_report|Sprint 01 Report]]
- [[sprints/sprint_01/reviews/sprint_01_review|Sprint 01 Review]]

## Related

- [[DELIVERY_PLAN|Delivery Plan]]
- [[ROADMAP|Roadmap]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
- [[DATA_MODEL|Data Model]]
- [[DECISIONS|Decisions]]
