---
tags:
  - crm
  - context
  - planning
aliases:
  - CRM Context
---

# CRM Project Context

## Identity

- project name: CRM
- purpose: build an internal bilingual CRM for sales lead management and meeting booking
- status: Sprint 1 is complete in the repository, deployed on Vercel, and verified against a live PostgreSQL database

## Working Assumptions

- this repository is the dedicated CRM workspace
- implementation must not begin until the founder approves the plan
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
