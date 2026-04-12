---
tags:
  - crm
  - sprint
  - sprint-05
  - todo
  - dev-handoff
  - frontend
  - ui
aliases:
  - Sprint 05 Todo
  - CRM Sprint 05 Todo
created: 2026-04-09
updated: 2026-04-12
---

# Sprint 05 Todo

## Source Context

- parent sprint hub: [[CRM Sprint 05 Index]]
- project context: [[CRM Context]]
- UI source of truth: [[CRM UI]]

## Status

Reviewed by PM and CTO.
This doc remains the Sprint 5 execution handoff record for DEV and QA.
Sprint 5 was approved as the frontend UI implementation pass for the existing CRM app.
DEV and QA treated `crm/docs/sprints/sprint_05/ui` as the source of truth for this sprint.
Sprint 5 is closed; this note is retained as the delivered task record.

Progress snapshot:

- DEV-501 completed
- DEV-502 completed
- DEV-503 completed
- DEV-504 completed
- DEV-505 completed
- DEV-506 completed
- DEV-507 completed
- DEV-508 completed
- DEV-509 completed
- DEV-510 completed
- DEV-511 completed
- DEV-512 completed
- Stitch phone review completed for the implemented mobile screens and fixes applied in code
- sprint closeout slice passed lint, typecheck, test, and build at commit `f42b4e0`
- PM, CTO, and Design QA closeout signoff completed on 2026-04-11
- post-close mobile hardening landed on 2026-04-12 in commits `041f043` and `bb09c4a`

## Sprint Goal

Ship the priority CRM UI pass across shared shell, tokens, primitives, and the in-scope screens without changing the underlying product rules owned by earlier sprints.

## Documentation Gate

- Sprint 5 index exists before implementation
- Sprint 5 review exists before implementation
- this Sprint 5 todo exists before implementation
- DEV and QA should treat `crm/docs/sprints/sprint_05/ui` as the current Sprint 5 source of truth

## DEV Task List

### DEV-501: Align UI Tokens With Approved CRM Direction

- objective: move the app onto the approved CRM token set and remove palette drift
- scope: `globals.css`, Tailwind-facing theme values, semantic color tokens, typography roles, radius, shadow, card padding, and shell gradient values
- must include: stable semantic tokens for `ink`, `teal`, `mint`, `coral`, `amber`, `lime`, `sand`, and `white`
- done when: shell, cards, buttons, chips, and tables read from shared tokens instead of route-local color choices

### DEV-502: Refactor Shared App Shell

- objective: align the protected app shell with the approved UI hierarchy
- scope: sidebar, top search, header action area, active-nav styling, hover states, desktop layout, mobile fallback, and RTL behavior
- must include: one reusable shell that supports all protected CRM routes
- done when: the shell reads as one consistent product layer on desktop, mobile, and RTL

### DEV-503: Build Shared Primitive Layer

- objective: create the minimal reusable primitive layer needed by the Sprint 5 screens
- scope: card primitives, KPI card, sticky filter bar, table shell and rows, status chips, summary header, activity timeline item, quick-add drawer or sheet, import review row, and reusable live-search picker for DB-backed record selection
- must include: narrow component APIs and no duplicate visual logic inside the route files
- done when: the priority screens are assembled mainly from shared primitives rather than one-off route markup

### DEV-504: Implement Login Screen

- objective: update the login experience to match the approved Sprint 5 UI direction
- scope: public login route, login form, locale visibility, hierarchy, spacing, and CTA treatment
- must include: stable desktop and mobile behavior
- done when: the login screen is visually aligned with the UI docs without over-decorating the page

### DEV-505: Implement Dashboard Screen

- objective: update the dashboard to answer what needs action today
- scope: KPI row, priority block, recent activity timeline, side insight rail, responsive layout, and hierarchy
- must include: clear action-first emphasis and support for current dashboard data behavior
- done when: dashboard structure matches the approved UI direction and remains usable in English and Hebrew

### DEV-506: Implement Companies And Contacts List Screens

- objective: update the core list screens into the approved table-first UI pattern
- scope: companies list, contacts list, sticky filters, dense readable rows, strong first-column pattern, top-right primary action, and mobile card fallback
- must include: preservation of existing search and filter behavior
- done when: both screens match the approved hierarchy and remain readable without horizontal scroll on mobile

### DEV-507: Implement Company Detail Screen

- objective: update company detail into the approved summary-and-activity layout
- scope: summary header, quick actions, latest activity, related sections, and desktop facts rail
- must include: clear prioritization of latest activity and next actions near the top of the screen
- done when: company detail feels scannable and operational on desktop and mobile

### DEV-508: Implement Tasks Screen

- objective: update the tasks page into the approved operational queue UI
- scope: grouped sections for overdue, today, upcoming, and done, stronger priority treatment, and low-friction status updates
- must include: one-hand mobile completion usability
- done when: overdue work is visually dominant and completion remains fast

### DEV-509: Implement Quick-Add Interaction Flow

- objective: update the interaction create flow into the approved fast-entry UI
- scope: interaction create page, interaction form layout, drawer or sheet behavior, field prioritization, and progressive reveal for optional fields
- must include: desktop drawer feel, mobile bottom-sheet or full-screen modal behavior, and live-search record pickers for existing company and contact selection
- done when: interaction logging is low-friction on desktop and iPhone-width screens without changing mutation rules

### DEV-510: Implement Import Review Screen

- objective: update the admin import review surface into the approved utilitarian UI
- scope: imports page, row review form, confidence banner, severity summary, raw-vs-cleaned comparison, and approve or fix actions
- must include: dense but clear review ergonomics for admin work
- done when: import review is easier to scan and act on without losing current data-review behavior

status: completed

### DEV-511: RTL, Mobile, And Acceptance Hardening

- objective: close the UI sprint with layout and parity hardening
- scope: English and Hebrew verification, RTL mirroring fixes, mixed-language wrapping fixes, iPhone-width checks, and capture of approved deviations
- must include: no horizontal scrolling on required mobile flows
- done when: the implemented Sprint 5 screens hold up in bilingual and mobile usage

status: completed
note: mobile treatment was reviewed against Stitch and corrected on the implemented list, detail, and quick-add screens; contact detail and interactions parity are complete; closeout completed on 2026-04-11

### DEV-512: Verify And Harden

- objective: complete Sprint 5 with regression checks and repository verification
- scope: route checks, visual regression by manual QA where practical, role-behavior review after UI changes, and repo verification commands
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 5 behavior is covered and the prior functional sprints still pass

status: completed
note: the sprint closeout slice passed `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`; post-close hardening later reconfirmed `npm run typecheck` on 2026-04-12

## Recommended Execution Order

1. DEV-501 Align UI Tokens With Approved CRM Direction
2. DEV-502 Refactor Shared App Shell
3. DEV-503 Build Shared Primitive Layer
4. DEV-504 through DEV-510 in screen priority order from the UI docs
5. DEV-511 RTL, Mobile, And Acceptance Hardening
6. DEV-512 Verify And Harden

## Non-Scope Guardrails

- no new opportunities module work in Sprint 5
- no new dashboard data logic beyond what the current UI needs to present
- no reporting feature expansion
- no schema redesign
- no auth-model changes
- no queue, cron, notification, or automation engine
- no one-off visual system outside shared tokens and primitives

## Definition Of Done

- the shared shell is aligned with the approved UI direction
- the shared primitive layer exists and is reused
- the priority screens are implemented from the UI docs
- English and Hebrew behavior is verified
- RTL is safe on the implemented screens
- iPhone-width layouts work on required flows
- approved deviations are documented
- tests and repo checks pass
- Sprint 5 has completed closeout signoff and is archived as delivered

## QA Execution Plan

- verify the shell on desktop, mobile, and RTL
- verify login, dashboard, companies, company detail, contacts, tasks, quick-add interaction, and import review against the approved UI hierarchy
- verify admin and editor mutation paths still work after UI changes
- verify viewer remains read-only where applicable
- verify English and Hebrew rendering on the implemented screens
- verify required iPhone-width flows do not require horizontal scroll
- run regression on Sprint 1 auth and locale behavior
- run regression on Sprint 2 import review behavior
- run regression on Sprint 3 company, contact, and search behavior
- run regression on Sprint 4 interaction, follow-up, and activity behavior

## CTO To DEV Handoff

DEV should treat the following as the approved Sprint 5 build direction:

1. UI docs are binding for this sprint
- use `crm/docs/sprints/sprint_05/ui` as the source of truth for hierarchy, layout, spacing, and screen priorities

2. preserve behavior while changing presentation
- keep current permissions, validation, mutation flows, and translations intact unless a real defect is found

3. build shared layers first
- tokens, shell, and primitives should land before route-heavy polish to avoid churn

4. keep primitives narrow
- shared components should remove duplication without hiding simple route logic behind unnecessary abstraction

5. verify RTL and mobile during implementation
- do not defer these checks until the end if screen-level fixes are already visible during build

6. treat live-search record linking as a default requirement
- any field used to find an existing CRM record in the database should use the shared live-search picker unless the option set is intentionally small and bounded like a lookup list

## PM Closeout Target

If DEV and QA complete the items above without scope drift, Sprint 5 should leave the CRM visually coherent and ready for the later opportunities and reporting sprint.

## PM Update

Sprint 5 documentation now reflects the delivered implementation state rather than the initial plan only.
The implemented phone UI was compared against the Stitch mobile screens and corrected to match the approved surface-led direction more closely.
The sprint closeout verification gates were green at `f42b4e0`.
Import review shipped in the Sprint 5 visual system.
Sprint closeout completed on 2026-04-11, with extra mobile hardening added on 2026-04-12 without changing sprint scope.

## Blockers And Approval Dependencies

- any conflict between older planning docs and Sprint 5 UI docs should be resolved in favor of the Sprint 5 UI docs
- intentional UI deviations need PM and CTO approval

## Related

- [[sprints/sprint_05/sprint_05_index|Sprint 05 Index]]
- [[sprints/sprint_05/reviews/sprint_05_review|Sprint 05 Review]]
- [[ROADMAP|Roadmap]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[sprints/sprint_05/ui/FRONTEND_IMPLEMENTATION_TASKS|Frontend Implementation Tasks]]
