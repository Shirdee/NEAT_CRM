---
tags:
  - crm
  - sprint
  - sprint-15
  - todo
  - dev-handoff
aliases:
  - Sprint 15 Todo
  - CRM Sprint 15 Todo
created: 2026-04-20
updated: 2026-04-20
---

# Sprint 15 Todo — CTO Handoff To DEV

Parent: [[sprints/sprint_15/sprint_15_index|Sprint 15 Index]]

## Status

Planned and handed off by CTO on 2026-04-20.
Execution opened for DEV.
DEV implementation complete on 2026-04-20.
Sprint is ready for PM closeout on 2026-04-20 after QA recheck PASS.

## PM Update (2026-04-20)

- PM logged QA fail and marked sprint blocked
- P1 archive-cascade defect fixed by DEV
- next required action: QA recheck and closeout decision

## QA Update (2026-04-20)

- result: **FAIL**
- [P1] company archive cascade does not archive company-linked opportunities
- affected code:
  - `app/src/lib/data/crm.ts:1144`
  - `app/src/lib/data/fallback-store.ts:986`

## Scope Slice In This Handoff

- included:
  - close-reason support for interactions and follow-ups
  - archive flows with cascade behavior for contacts and companies
  - dashboard follow-up direct-open UX
  - companies select-and-export
  - row right-click context menu
  - filter/search persistence fixes
  - contrast + spacing improvements
- excluded:
  - auth architecture changes
  - external provider sync
  - non-related data model rewrites

## Technical Guardrails

- keep server-side RBAC as authority (`admin`/`editor`/`viewer`)
- keep existing data access boundaries and avoid route/middleware regressions
- preserve bilingual (`en`/`he`) and RTL behavior
- maintain accessibility: visible focus, keyboard flow, clear contrast
- archive must be reversible only if current data model supports soft-archive; do not hard-delete child records by default

## Execution Order

1. [x] `DEV-1501` Domain model + actions for close-reason and archive cascade rules
2. [x] `DEV-1502` Interaction/follow-up UI updates for close-reason capture and display
3. [x] `DEV-1503` Contact/company archive UX + confirmation flows + server enforcement
4. [x] `DEV-1504` Dashboard follow-up open flow and action polish
5. [x] `DEV-1505` Companies list select-and-export implementation
6. [x] `DEV-1506` Row right-click context menu for supported list pages
7. [x] `DEV-1507` Search/filter persistence bug fixes (companies search + live-search selects)
8. [x] `DEV-1508` Contrast and spacing hardening pass across touched routes
9. [x] `DEV-1509` Final verification gates and cleanup

## Done Conditions (Per Unit)

- `DEV-1501`: close-reason fields and archive semantics implemented without breaking existing reads
- `DEV-1502`: users can close interaction/follow-up with cause; cause visible in detail/list views
- `DEV-1503`: archive from contact/company applies expected cascade and respects role permissions
- `DEV-1504`: dashboard follow-up item opens target quickly and consistently
- `DEV-1505`: multi-select export works for companies and respects active filters
- `DEV-1506`: context menu actions execute correctly and remain accessible
- `DEV-1507`: filter/search values persist correctly after focus loss/close
- `DEV-1508`: measurable contrast and spacing improvements on core screens
- `DEV-1509`: all quality gates pass and regression notes captured

## Verification Expectations (QA Gate Input)

- run: `npm run typecheck`
- run: `npm run lint`
- run: `npm run test`
- run: `npm run build`
- manual desktop flow checks for archive/close-reason/context menu/export
- manual mobile sweep (390px): no overflow, actions usable
- manual RTL/Hebrew sweep on touched pages
- role checks:
  - `viewer`: read-only, no archive/close mutating actions
  - `editor`: allowed mutating CRM actions per existing policy
  - `admin`: full admin behavior unchanged

## Risks / Blockers

- archive cascade behavior may require explicit product decision on soft-archive vs hard-delete
- export payload size and shape may need constraints for hobby-tier runtime safety
- context menu parity across mouse/touch may require fallback action UI
- contrast uplift may require token-level updates with wider UI impact

## [DEV] Visible Start

- sprint: Sprint 15
- approved build scope: lifecycle controls + usability hardening (including contrast uplift)
- next concrete implementation action:
  - start `DEV-1501` by defining close-reason + archive data contract and server action boundaries,
  - then run `npm run typecheck`

## PM Sync Note

PM should track Sprint 15 as active and treat Sprint 14 as completed baseline.

## Verification Evidence (DEV, 2026-04-20)

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test` (`44/44`)
- [x] `npm run build`
- [ ] manual desktop flow checks (QA)
- [ ] manual mobile 390px sweep (QA)
- [ ] manual RTL/Hebrew sweep (QA)
- [ ] role-visibility sweep (`admin`/`editor`/`viewer`) (QA)

## Verification Evidence (QA, 2026-04-20)

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test` (`44/44`)
- [x] P1 code patch delivered (DEV)
- [x] P1 re-verified by QA (PASS)
- [x] `npm run build`
