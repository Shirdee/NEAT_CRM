---
tags:
  - crm
  - context
  - planning
aliases:
  - CRM Context
updated: 2026-04-11
---

# CRM Project Context

## Identity

- project name: CRM
- purpose: build an internal bilingual CRM for sales lead management and meeting booking
- status: Sprint 1 through Sprint 4 are functionally in place in the repository; Sprint 5 is the active implementation slice for the UI pass and now owns the current documentation focus; Sprint 6 remains the approved later slice for opportunities, dashboard completion, reports, and launch readiness

## Working Assumptions

- this repository is the dedicated CRM workspace
- Sprint 4 behavior should be preserved, but Sprint 5 is the active implementation focus
- Sprint 5 UI docs are the source of truth for the current frontend implementation pass
- Sprint 6 planning is ready, but Sprint 6 should not begin implementation until Sprint 4 and the Sprint 5 UI pass are explicitly closed or deferred
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
- current DEV handoff: [[CRM Sprint 05 Todo]]
- current QA/review handoff: [[CRM Sprint 05 Review]]

## Agent Launch Routes

- PM: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 05 Review]]
- CTO: [[CRM Home]] -> [[CRM Architecture]] -> [[CRM Sprint 05 Review]]
- DEV: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 05 Todo]]
- QA: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 05 Review]]

## Definition Of Done

- requirements are captured in docs
- implementation matches approved scope
- verification is completed before handoff
- workbook import accuracy is approved before launch

## Related

- [[CRM Home]]
- [[CRM Sprints]]
- [[CRM UI]]
- [[DOCUMENTATION_STANDARD|Documentation Standard]]
- [[CRM PRD]]
- [[CRM Architecture]]
