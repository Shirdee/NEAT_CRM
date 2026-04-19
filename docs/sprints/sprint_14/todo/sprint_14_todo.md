---
tags:
  - crm
  - sprint
  - sprint-14
  - todo
  - dev-handoff
aliases:
  - Sprint 14 Todo
  - CRM Sprint 14 Todo
created: 2026-04-19
updated: 2026-04-19
---

# Sprint 14 Todo — CTO Handoff To DEV

Parent: [[sprints/sprint_14/sprint_14_index|Sprint 14 Index]]

## Status

Planned and handed off by CTO on 2026-04-19.
Execution opened for DEV.
DEV implementation complete on 2026-04-19 in commit `1be1e4d`.
Sprint is now in QA/PM closeout phase.

## Scope Slice In This Handoff

- included: UI/theme tokens, shell redesign, dashboard, companies list, company detail, tasks, opportunities (pipeline), interactions/contacts/reports/admin styling pass, login redesign, i18n key updates
- excluded: backend contracts, API shape changes, auth/routing/i18n architecture changes

## Technical Guardrails

- keep data access functions and server actions behaviorally intact
- keep RBAC gates exactly where they are; restyle wrappers only
- preserve RTL (`dir`) and `next-intl` routing behavior
- use existing design tokens only: `ink`, `teal`, `mint`, `coral`, `amber`, `lime`, `sand`, `mist`, `white`
- preserve accessibility: keyboard focus, visible focus ring, semantic buttons/links

## Execution Order

1. [x] `DEV-1401` Foundation tokens and primitives (`tailwind.config.ts`, `globals.css`, `status-chip.tsx`, `surface-card.tsx`, add `metric-card.tsx`, `activity-feed.tsx`, `avatar-initial.tsx`)
2. [x] `DEV-1402` Shell redesign (`app-shell.tsx`, new `sidebar-nav-item.tsx`, remove old desktop header/glass aside, preserve mobile header + bottom nav)
3. [x] `DEV-1403` Dashboard rebuild + `period-toggle` + recent activity read layer (`src/lib/data/activity.ts`) with no API contract break
4. [x] `DEV-1404` Companies list styling + company detail 2-column + activity panel
5. [x] `DEV-1405` Tasks grouped card layout + `task-card.tsx`
6. [x] `DEV-1406` Opportunities table/pipeline toggle + `kanban-board.tsx` + `view-toggle.tsx`
7. [x] `DEV-1407` Fast styling pass: interactions, contacts, reports, admin pages + login redesign
8. [x] `DEV-1408` i18n completion (`en.json`, `he.json`), parity QA fixes, final verification gate

## Done Conditions (Per Unit)

- `DEV-1401`: new tokens compile; status tones include `lime`; amber contrast fixed
- `DEV-1402`: desktop shell switched to dark sidebar; no route break; mobile shell unchanged
- `DEV-1403`: dashboard sections render from existing data paths; activity panel populated; role buttons correct
- `DEV-1404`: companies/detail pages match new layout; tab functionality unchanged
- `DEV-1405`: tasks grouped in cards by overdue/today/upcoming/done; links/actions still work
- `DEV-1406`: opportunities supports `?view=table|pipeline`; stage columns render and link correctly
- `DEV-1407`: listed pages adopt new spacing/cards without logic regressions
- `DEV-1408`: translation keys complete and both locales render without missing-key errors

## Verification Expectations (QA Gate Input)

- run: `npm run typecheck`
- run: `npm run lint`
- run: `npm run test`
- run: `npm run build`
- manual desktop checks on all touched routes
- manual mobile check at 390px viewport (bottom nav present, no overflow traps)
- manual RTL/Hebrew sweep on dashboard, companies, company detail, tasks, opportunities, login
- role checks: `admin` sees admin section; `viewer` has no create/edit actions

## Verification Evidence (DEV, 2026-04-19)

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test` (`44/44`)
- [x] `npm run build`
- [ ] manual desktop route sweep
- [ ] manual mobile 390px sweep
- [ ] manual RTL/Hebrew sweep
- [ ] role-visibility sweep (`admin` vs `viewer`)

## Refinement Slice (Main_CRM, 2026-04-19)

- [x] `DEV-1409` Login/accessibility high-priority fixes from `todo/DESIGN_FIXES.md`:
  - [x] viewport zoom lock removed in locale layout
  - [x] login wrapper descendant selector styling removed
  - [x] duplicate tagline removed in login aside logo row
  - [x] non-standard opacity replaced (`text-white/72` -> `text-white/70`)
  - [x] EN/HE login copy updated (`identifier/password` labels and placeholders)
  - [x] focus ring restored on login inputs/button; `ring-0` suppression removed
- files updated:
  - `app/src/app/[locale]/layout.tsx`
  - `app/src/app/[locale]/(public)/login/page.tsx`
  - `app/src/components/auth/login-form.tsx`
  - `app/src/messages/en.json`
  - `app/src/messages/he.json`
- checks:
  - [x] `npm run typecheck`
  - [x] `npx eslint src/app/[locale]/layout.tsx src/app/[locale]/(public)/login/page.tsx src/components/auth/login-form.tsx`

## Risks / Blockers

- source sprint package incomplete (missing sprint-14 review doc)
- `openDealValue` may not exist in current dashboard snapshot; fallback needed to count-only display
- broad visual refactor touches many routes; sequencing discipline required to avoid regressions

## [DEV] Visible Start

- sprint: Sprint 14
- approved build scope: UI redesign only (no backend/API contract work)
- next concrete implementation action: start `DEV-1401` by adding token/shadow updates and primitive component updates, then run `npm run typecheck`

## PM Sync Note

PM logged DEV completion and moved sprint into QA/PM closeout.
