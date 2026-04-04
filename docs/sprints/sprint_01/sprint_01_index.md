---
tags:
  - crm
  - sprint
  - sprint-01
  - planning
aliases:
  - Sprint 01 Index
---

# Sprint 01 Index

## Status

Sprint 1 implementation is complete in the repository and has passed the current QA pass.
Sprint 1 remains open only for external delivery closeout: live PostgreSQL migration verification and Vercel preview verification.

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
- Vercel preview deployment with free-tier-compatible setup

## Current Closure Read

- application-side scope is complete
- no blocking code findings remain from QA
- sprint closure is blocked only by unverified external delivery steps

## Remaining Closeout Work

1. apply the Prisma migration against the real PostgreSQL provider and confirm the schema lands cleanly
2. seed the baseline users and lookup values into the real database, then smoke-test login and admin lists against live data
3. connect the repository to Vercel, configure preview and production environment variables, and verify one preview deployment

## DEV Boundary For Closeout

- no new product features
- no UI reshaping
- no extra CRUD beyond the current Sprint 1 foundation
- focus only on infra completion, data seeding, and release verification

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
