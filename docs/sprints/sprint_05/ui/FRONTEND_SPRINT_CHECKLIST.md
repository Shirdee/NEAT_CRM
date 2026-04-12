---
tags:
  - crm
  - frontend
  - sprint
  - checklist
  - sprint-05
aliases:
  - CRM Frontend Sprint Checklist
  - CRM Sprint 05 Frontend Sprint Checklist
created: 2026-04-09
updated: 2026-04-12
---

# CRM Frontend Sprint Checklist

## Source Context

- parent UI hub: [[CRM UI]]
- parent sprint hub: [[CRM Sprint 05 Index]]

## Status Key

- `todo`
- `in_progress`
- `blocked`
- `review`
- `done`

## Owner Key

- `PM`
- `CTO`
- `FE`
- `Design QA`
- `Full Stack`

## Source Of Truth

UI source of truth:

- Sprint 5 UI docs in this folder

Supporting docs:

- [FRONTEND_IMPLEMENTATION_TASKS.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/FRONTEND_IMPLEMENTATION_TASKS.md)
- [Design.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/Design.md)
- [UI_KIT.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/UI_KIT.md)

## Sprint 0: Alignment And Foundation

### 0.1 Source Alignment

- [x] Status: `done` | Owner: `PM` | Confirm Sprint 5 UI docs are the implementation baseline
- [x] Status: `done` | Owner: `CTO` | Confirm no frontend work should follow the old pre-Sprint-5 visual direction
- [x] Status: `done` | Owner: `PM` | Freeze list of in-scope screens for this frontend pass

### 0.2 Token And Theme Setup

- [x] Status: `done` | Owner: `FE` | Audit [globals.css](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/globals.css) for palette drift
- [x] Status: `done` | Owner: `FE` | Implement semantic color tokens for `ink`, `teal`, `mint`, `coral`, `amber`, `lime`, `sand`, `white`
- [x] Status: `done` | Owner: `FE` | Standardize radius, shadow, spacing, and shell gradient tokens
- [x] Status: `done` | Owner: `CTO` | Review token naming and confirm reuse strategy

### 0.3 Shell Baseline

- [x] Status: `done` | Owner: `FE` | Refactor [app-shell.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/shell/app-shell.tsx) to match the Sprint 5 shell hierarchy
- [x] Status: `done` | Owner: `FE` | Implement active nav state, top search treatment, and action area alignment
- [x] Status: `done` | Owner: `Design QA` | Compare shell against Sprint 5 UI docs on desktop
- [x] Status: `done` | Owner: `Design QA` | Compare shell against Sprint 5 UI docs on mobile and RTL

## Sprint 1: Shared Primitive Layer

### 1.1 Core Primitives

- [x] Status: `done` | Owner: `FE` | Build shared card primitive
- [x] Status: `done` | Owner: `FE` | Build KPI/stat card primitive
- [x] Status: `done` | Owner: `FE` | Build sticky filter bar primitive
- [x] Status: `done` | Owner: `FE` | Build table shell and row primitives
- [x] Status: `done` | Owner: `FE` | Build status chip primitive
- [x] Status: `done` | Owner: `FE` | Build summary header primitive
- [x] Status: `done` | Owner: `FE` | Build activity timeline item primitive
- [x] Status: `done` | Owner: `FE` | Build drawer or sheet primitive for quick-add flows
- [x] Status: `done` | Owner: `FE` | Build import review row primitive

### 1.2 Primitive QA

- [x] Status: `done` | Owner: `CTO` | Review primitive boundaries and avoid over-abstraction
- [x] Status: `done` | Owner: `Design QA` | Validate primitives against Sprint 5 UI docs

## Sprint 2: Public And Core Operational Screens

### 2.1 Login

- [x] Status: `done` | Owner: `FE` | Update [login page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(public)/login/page.tsx) to match `CRM Login (Updated)`
- [x] Status: `done` | Owner: `FE` | Update [login-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/auth/login-form.tsx)
- [x] Status: `done` | Owner: `Design QA` | Review desktop parity
- [x] Status: `done` | Owner: `Design QA` | Review mobile and RTL parity

### 2.2 Dashboard

- [x] Status: `done` | Owner: `FE` | Update [dashboard page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/dashboard/page.tsx) to match `CRM Dashboard (Updated)`
- [x] Status: `done` | Owner: `FE` | Implement KPI row, priority block, activity timeline, and insights rail
- [x] Status: `done` | Owner: `PM` | Validate dashboard hierarchy against “what needs action today”
- [x] Status: `done` | Owner: `Design QA` | Review visual parity with Sprint 5 UI docs

### 2.3 Companies List

- [x] Status: `done` | Owner: `FE` | Update [companies page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/companies/page.tsx) to match `Companies Directory (Updated)`
- [x] Status: `done` | Owner: `FE` | Implement sticky filters, dense rows, primary action, and mobile card fallback
- [x] Status: `done` | Owner: `CTO` | Review table density and reusable row strategy
- [x] Status: `done` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

### 2.4 Company Detail

- [x] Status: `done` | Owner: `FE` | Update [company detail page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/companies/[companyId]/page.tsx) to match `Company Profile (Updated)`
- [x] Status: `done` | Owner: `FE` | Implement summary header, quick actions, latest activity, related sections, and desktop side rail
- [x] Status: `done` | Owner: `PM` | Review action hierarchy and content prioritization
- [x] Status: `done` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

## Sprint 3: Remaining Core Screens

### 3.1 Contacts List

- [x] Status: `done` | Owner: `FE` | Update [contacts page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/contacts/page.tsx) to match `Contacts Directory (Updated)`
- [x] Status: `done` | Owner: `FE` | Implement sticky filters, dense row layout, and mobile fallback
- [x] Status: `done` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

### 3.2 Tasks

- [x] Status: `done` | Owner: `FE` | Update [tasks page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/tasks/page.tsx) to match `Tasks Management (Updated)`
- [x] Status: `done` | Owner: `FE` | Implement segmented groups: overdue, today, upcoming, done
- [x] Status: `done` | Owner: `FE` | Implement fast status change interactions
- [x] Status: `done` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

### 3.3 Quick-Add Interaction

- [x] Status: `done` | Owner: `FE` | Update [interactions new page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/interactions/new/page.tsx) to match `Log Interaction (Updated)`
- [x] Status: `done` | Owner: `FE` | Update [interaction-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/crm/interaction-form.tsx)
- [x] Status: `done` | Owner: `FE` | Keep essential fields first and optional fields behind progressive reveal
- [x] Status: `done` | Owner: `Design QA` | Review desktop drawer feel and mobile sheet behavior against Sprint 5 UI docs

### 3.4 Import Review

- [x] Status: `done` | Owner: `FE` | Update [imports page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/admin/imports/page.tsx) to match `Import Review (Updated)`
- [x] Status: `done` | Owner: `FE` | Update [row-review-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/admin/imports/row-review-form.tsx)
- [x] Status: `done` | Owner: `FE` | Implement confidence banner, severity summary, raw vs cleaned values, and clear approve or fix actions
- [x] Status: `done` | Owner: `CTO` | Review utilitarian admin UX and information density
- [x] Status: `done` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

## Sprint 4: Localization, Responsiveness, And Acceptance

### 4.1 Bilingual And RTL QA

- [x] Status: `done` | Owner: `FE` | Verify all implemented screens in English
- [x] Status: `done` | Owner: `FE` | Verify all implemented screens in Hebrew
- [x] Status: `done` | Owner: `FE` | Fix RTL mirroring issues
- [x] Status: `done` | Owner: `FE` | Fix mixed-language truncation and wrapping issues
- [x] Status: `done` | Owner: `Design QA` | Review Hebrew and RTL parity

### 4.2 Mobile QA

- [x] Status: `done` | Owner: `FE` | Verify all priority screens on iPhone-width layouts — viewport meta + safe-area + bottom sheet implemented
- [x] Status: `done` | Owner: `FE` | Remove horizontal scroll from required mobile flows — contacts column hiding fixed, no overflow-x on required flows
- [x] Status: `done` | Owner: `FE` | Verify bottom-sheet and quick-action usability — BottomSheet component implemented with native dialog
- [x] Status: `done` | Owner: `Design QA` | Review mobile parity with Sprint 5 intent

### 4.3 Final Acceptance

- [x] Status: `done` | Owner: `PM` | Approve feature completeness against scope — PM: CLOSED (2026-04-11)
- [x] Status: `done` | Owner: `CTO` | Approve frontend architecture and reuse quality — CTO: APPROVED WITH NOTES (2026-04-11)
- [x] Status: `done` | Owner: `Design QA` | Approve visual parity against Sprint 5 UI docs — QA: PASS WITH NOTES (2026-04-11)
- [x] Status: `done` | Owner: `Full Stack` | Capture screenshots or equivalent closeout evidence for release documentation
- [x] Status: `done` | Owner: `Full Stack` | Document any intentional deviations from Sprint 5 UI docs

## Blocking Conditions

- Sprint 5 UI reference is unclear for a target screen
- token system is not aligned before route implementation starts
- RTL or mobile issues are deferred during core screen build
- route code introduces one-off visual patterns outside shared primitives

## Exit Criteria

- all priority screens implemented from the Sprint 5 UI docs
- CRM palette aligned with the approved UI kit direction
- bilingual and RTL-safe behavior verified
- mobile-safe behavior verified on required flows
- deviations from Sprint 5 UI docs documented and approved

## Related

- [[sprints/sprint_05/sprint_05_index|Sprint 05 Index]]
- [[sprints/sprint_05/ui/FRONTEND_IMPLEMENTATION_TASKS|Frontend Implementation Tasks]]
- [[sprints/sprint_05/ui/Design|Design]]
