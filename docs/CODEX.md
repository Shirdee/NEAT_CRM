---
tags:
  - crm
  - context
  - planning
aliases:
  - CRM Context
updated: 2026-04-12
---

# CRM Project Context

## Identity

- project name: CRM
- purpose: build an internal bilingual CRM for sales lead management and meeting booking
- status: Sprint 1 through Sprint 6 are functionally in place in the repository; Sprint 6 is closed as the MVP business-layer and launch-readiness baseline on 2026-04-12; Sprint 7 is the next planned slice for post-MVP workflow optimization and usability hardening

## Working Assumptions

- this repository is the dedicated CRM workspace
- Sprint 4 behavior should be preserved as the workflow reference, and Sprint 5 delivered the current UI baseline
- Sprint 5 UI docs remain the source of truth for the delivered frontend baseline and closeout record
- Sprint 7 is now the active implementation track, opened on the narrowed saved-view first slice with `DEV-701` in progress
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
- latest closed implementation handoff: [[CRM Sprint 06 Todo]]
- latest closed review gate: [[CRM Sprint 06 Review]]
- next planned implementation handoff: [[CRM Sprint 07 Todo]]
- next planned review gate: [[CRM Sprint 07 Review]]

## Agent Launch Routes

- PM: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 07 Review]]
- CTO: [[CRM Home]] -> [[CRM Architecture]] -> [[CRM Sprint 07 Review]]
- DEV: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 07 Todo]]
- QA: [[CRM Home]] -> [[CRM Sprints]] -> [[CRM Sprint 07 Review]]

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
