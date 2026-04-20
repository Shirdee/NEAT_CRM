---
tags:
  - crm
  - sprint
  - sprint-15
  - cto
  - ux
aliases:
  - Sprint 15 Index
  - CRM Sprint 15 Index
created: 2026-04-20
updated: 2026-04-20
---

# Sprint 15 Index — Lifecycle And Usability Hardening

Parent: [[sprints/README|CRM Sprints]]

## Status

**READY FOR PM CLOSEOUT — 2026-04-20**

## Objective

Ship CRM lifecycle controls and usability fixes that unblock daily operations:

- close interaction and follow-up with explicit cause
- archive records with clear cascade behavior
- improve list productivity and filter reliability
- raise UI contrast and finish spacing consistency

## Scope (Approved)

- interaction and follow-up close-reason support
- archive action:
  - contact archive cascades to contact interactions and follow-ups
  - company archive cascades to child contacts and their interactions/follow-ups
- dashboard: direct open flow for follow-ups
- companies list: select rows and export
- right-click context menu for core row actions
- search/filter fixes:
  - companies search should not reset on outside click
  - live-search selects must persist selected value after close
- UI polish:
  - increase contrast across key surfaces/text
  - spacing/margins/paddings consistency

## Non-Scope (Hard Guardrails)

- no rewrite of auth architecture or route middleware
- no external sync providers (Gmail/Outlook) in this sprint
- no BI layer or analytics platform work
- no large schema redesign unrelated to archive/close-reason behavior

## Dependencies

- existing server-side RBAC checks stay source of truth
- existing bilingual (`en`/`he`) behavior and RTL support must remain intact
- export format and permission gate must align with current role model

## Done When

- close-reason and archive flows work end-to-end with verified cascade rules
- list productivity items (context menu, select+export) are functional
- filter/search persistence bugs are fixed
- contrast and spacing updates pass manual UX sweep on desktop + mobile
- quality gates pass: typecheck, lint, tests, build

## Implementation Handoff

DEV handoff lives in [[sprints/sprint_15/todo/sprint_15_todo|Sprint 15 Todo]].

## DEV Delivery Update (2026-04-20)

- backend lifecycle contract delivered:
  - soft-archive with cascade for companies/contacts/interactions/tasks
  - close-with-cause actions for interactions and follow-ups
- dashboard follow-up open flow delivered
- companies productivity delivered:
  - row select + CSV export
  - right-click context menu actions
- search/filter persistence fixes delivered
- UI contrast + spacing hardening delivered on shared primitives and key detail routes
- verification evidence:
  - `npm run typecheck` pass
  - `npm run lint` pass
  - `npm run test` pass (`44/44`)
  - `npm run build` pass

## PM Update (2026-04-20)

- PM captured QA fail result and moved sprint to blocked state
- P1 fix delivered by DEV; sprint moved to QA recheck

## QA Update (2026-04-20)

- result: **FAIL**
- P1 finding: company archive cascade does not include opportunities, leaving live opportunities linked to archived companies
- evidence:
  - `app/src/lib/data/crm.ts:1144`
  - `app/src/lib/data/fallback-store.ts:986`
- verification run:
  - `npm run typecheck` pass
  - `npm run lint` pass
  - `npm run test` pass (`44/44`)
- recheck status:
  - result: **PASS**
  - P1 patch verified in Prisma and fallback archive cascade paths
  - verification:
    - `npm run typecheck` pass
    - `npm run lint` pass
    - `npm run test` pass (`44/44`)
    - `npm run build` pass

## Related

- [[sprints/sprint_15/todo/sprint_15_todo|Sprint 15 Todo]]
- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[DECISIONS|Decisions]]
