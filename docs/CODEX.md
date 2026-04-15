---
tags:
  - crm
  - context
  - planning
aliases:
  - CRM Context
updated: 2026-04-15
---

# CRM Project Context

<<<<<<< HEAD
CRM project context and working assumptions.

## Current Focus

- Sprint 7 is awaiting final QA and PM closeout
- Sprint 8 is the active planning slice
=======
## Identity

- project name: CRM
- purpose: build an internal bilingual CRM for sales lead management and meeting booking
- status: Sprint 1 through Sprint 5 are functionally in place in the repository; Sprint 5 is closed with post-close mobile hardening delivered on 2026-04-12; Sprint 6 execution is now opened as the active slice for opportunities, dashboard completion, reports, and launch readiness

## Working Assumptions

- this repository is the dedicated CRM workspace
- Sprint 4 behavior should be preserved as the workflow reference, and Sprint 5 delivered the current UI baseline
- Sprint 5 UI docs remain the source of truth for the delivered frontend baseline and closeout record
- Sprint 6 is now active for implementation, with DEV starting at DEV-601 and following the Sprint 6 execution order
- any field used to find an existing CRM record in the database should use live search instead of a long static select
- the workbook import is a major delivery dependency
- docs such as [[PRD]], [[ARCHITECTURE]], and [[DELIVERY_PLAN]] are the current planning source of truth
- the target deployment must remain compatible with Vercel Hobby and an otherwise free stack
- all project-owned Markdown docs should follow [[DOCUMENTATION_STANDARD|Documentation Standard]]

## Commands

- active stack: Next.js on Vercel with PostgreSQL, Prisma, and signed credentials auth
- implementation commands live in `crm/app/package.json`

## Current Focus

- current project home: [[CRM Home]]
- active sprint hub: [[CRM Sprints]]
- active UI hub: [[CRM UI]]
- latest closed implementation handoff: [[CRM Sprint 05 Todo]]
- latest review and closeout record: [[CRM Sprint 05 Review]]
- active implementation handoff: [[CRM Sprint 06 Todo]]
- active review gate: [[CRM Sprint 06 Review]]
>>>>>>> parent of a915d98 (Sprint 7: saved views, dashboard presets, mobile quick entry)

## Start Here

<<<<<<< HEAD
- [CRM Home](README.md)
- [CRM Sprints](sprints/README.md)
- [CRM UI](ui/README.md)
- [Engineering Docs](Engineering%20Docs/README.md)
=======
- PM: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 06 Review]]
- CTO: [[CRM Home]] -> [[CRM Architecture]] -> [[CRM Sprint 06 Review]]
- DEV: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 06 Todo]]
- QA: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 06 Review]]
>>>>>>> parent of a915d98 (Sprint 7: saved views, dashboard presets, mobile quick entry)

## Core References

- [CRM PRD](PRD.md)
- [CRM Architecture](ARCHITECTURE.md)
- [Delivery Plan](DELIVERY_PLAN.md)
- [Documentation Standard](DOCUMENTATION_STANDARD.md)
