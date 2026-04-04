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
- status: planning phase, awaiting founder approval on PM and CTO delivery plan

## Working Assumptions

- this repository is the dedicated CRM workspace
- implementation must not begin until the founder approves the plan
- the workbook import is a major delivery dependency
- docs such as [[docs/PRD]], [[docs/ARCHITECTURE]], and [[docs/DELIVERY_PLAN]] are the current planning source of truth
- the target deployment must remain compatible with Vercel Hobby and an otherwise free stack

## Skill Routing

- keep project role skills in `.codex/skills/`
- support explicit skill calls with `$pm`, `$cto`, `$dev`, and `$qa`
- prefer PM for sequencing, CTO for architecture, DEV for implementation, and QA for verification

## Commands

- pending approval: Next.js on Vercel with PostgreSQL, Prisma, and Auth.js
- implementation commands will be added after Sprint 1 starts

## Definition Of Done

- requirements are captured in docs
- implementation matches approved scope
- verification is completed before handoff
- workbook import accuracy is approved before launch

## Prompt Examples

- `$pm turn the CRM brief into milestone docs and sprint 1`
- `$cto propose the CRM architecture and call out risks`
- `$dev implement the approved CRM task and add tests`
- `$qa verify the delivered CRM slice and list regressions`

## Related

- [[README|Project Home]]
- [[AGENTS|Project Agents]]
- [[docs/PRD|PRD]]
- [[docs/ARCHITECTURE|Architecture]]
- [[docs/DECISIONS|Decisions]]
- [[docs/DELIVERY_PLAN|Delivery Plan]]
