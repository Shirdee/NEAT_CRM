---
tags:
  - crm
  - context
  - planning
aliases:
  - CRM Context
updated: 2026-04-09
---

# CRM Project Context

## Identity

- project name: CRM
- purpose: build an internal bilingual CRM for sales lead management and meeting booking
- status: Sprint 1 through Sprint 3 are complete in the repository; Sprint 4 is active and now includes interaction and follow-up create/edit flows, explicit interaction-type selection in the interaction form, direct follow-up creation from the interaction create flow, and verified QA coverage for the current slice; Sprint 5 is now initialized as the frontend UI implementation sprint with docs consolidated under `sprints/sprint_05/ui`; Sprint 6 planning remains the later PM and CTO handoff for opportunities, dashboard, reports, and launch readiness

## Working Assumptions

- this repository is the dedicated CRM workspace
- Sprint 4 has moved from planning into active implementation
- Sprint 5 UI docs are now the source of truth for the frontend implementation pass
- Sprint 6 planning is ready, but Sprint 6 should not begin implementation until Sprint 4 and the Sprint 5 UI pass are explicitly closed or deferred
- the workbook import is a major delivery dependency
- docs such as [[PRD]], [[ARCHITECTURE]], and [[DELIVERY_PLAN]] are the current planning source of truth
- the target deployment must remain compatible with Vercel Hobby and an otherwise free stack
- all project-owned Markdown docs should follow [[DOCUMENTATION_STANDARD|Documentation Standard]]

## Commands

- active stack: Next.js on Vercel with PostgreSQL, Prisma, and signed credentials auth
- implementation commands live in `crm/app/package.json`

## Definition Of Done

- requirements are captured in docs
- implementation matches approved scope
- verification is completed before handoff
- workbook import accuracy is approved before launch

## Related

- [[README|Project Home]]
- [[DOCUMENTATION_STANDARD|Documentation Standard]]
- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[DECISIONS|Decisions]]
- [[DELIVERY_PLAN|Delivery Plan]]
