---
tags:
  - crm
  - frontend
  - sprint
  - checklist
  - sprint-05
aliases:
  - CRM Frontend Sprint Checklist
created: 2026-04-09
updated: 2026-04-09
---

# CRM Frontend Sprint Checklist

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

- [ ] Status: `todo` | Owner: `PM` | Confirm Sprint 5 UI docs are the implementation baseline
- [ ] Status: `todo` | Owner: `CTO` | Confirm no frontend work should follow the old pre-Sprint-5 visual direction
- [ ] Status: `todo` | Owner: `PM` | Freeze list of in-scope screens for this frontend pass

### 0.2 Token And Theme Setup

- [ ] Status: `todo` | Owner: `FE` | Audit [globals.css](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/globals.css) for palette drift
- [ ] Status: `todo` | Owner: `FE` | Implement semantic color tokens for `ink`, `teal`, `mint`, `coral`, `amber`, `lime`, `sand`, `white`
- [ ] Status: `todo` | Owner: `FE` | Standardize radius, shadow, spacing, and shell gradient tokens
- [ ] Status: `todo` | Owner: `CTO` | Review token naming and confirm reuse strategy

### 0.3 Shell Baseline

- [ ] Status: `todo` | Owner: `FE` | Refactor [app-shell.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/shell/app-shell.tsx) to match the Sprint 5 shell hierarchy
- [ ] Status: `todo` | Owner: `FE` | Implement active nav state, top search treatment, and action area alignment
- [ ] Status: `todo` | Owner: `Design QA` | Compare shell against Sprint 5 UI docs on desktop
- [ ] Status: `todo` | Owner: `Design QA` | Compare shell against Sprint 5 UI docs on mobile and RTL

## Sprint 1: Shared Primitive Layer

### 1.1 Core Primitives

- [ ] Status: `todo` | Owner: `FE` | Build shared card primitive
- [ ] Status: `todo` | Owner: `FE` | Build KPI/stat card primitive
- [ ] Status: `todo` | Owner: `FE` | Build sticky filter bar primitive
- [ ] Status: `todo` | Owner: `FE` | Build table shell and row primitives
- [ ] Status: `todo` | Owner: `FE` | Build status chip primitive
- [ ] Status: `todo` | Owner: `FE` | Build summary header primitive
- [ ] Status: `todo` | Owner: `FE` | Build activity timeline item primitive
- [ ] Status: `todo` | Owner: `FE` | Build drawer or sheet primitive for quick-add flows
- [ ] Status: `todo` | Owner: `FE` | Build import review row primitive

### 1.2 Primitive QA

- [ ] Status: `todo` | Owner: `CTO` | Review primitive boundaries and avoid over-abstraction
- [ ] Status: `todo` | Owner: `Design QA` | Validate primitives against Sprint 5 UI docs

## Sprint 2: Public And Core Operational Screens

### 2.1 Login

- [ ] Status: `todo` | Owner: `FE` | Update [login page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(public)/login/page.tsx) to match `CRM Login (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Update [login-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/auth/login-form.tsx)
- [ ] Status: `todo` | Owner: `Design QA` | Review desktop parity
- [ ] Status: `todo` | Owner: `Design QA` | Review mobile and RTL parity

### 2.2 Dashboard

- [ ] Status: `todo` | Owner: `FE` | Update [dashboard page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/dashboard/page.tsx) to match `CRM Dashboard (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Implement KPI row, priority block, activity timeline, and insights rail
- [ ] Status: `todo` | Owner: `PM` | Validate dashboard hierarchy against “what needs action today”
- [ ] Status: `todo` | Owner: `Design QA` | Review visual parity with Sprint 5 UI docs

### 2.3 Companies List

- [ ] Status: `todo` | Owner: `FE` | Update [companies page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/companies/page.tsx) to match `Companies Directory (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Implement sticky filters, dense rows, primary action, and mobile card fallback
- [ ] Status: `todo` | Owner: `CTO` | Review table density and reusable row strategy
- [ ] Status: `todo` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

### 2.4 Company Detail

- [ ] Status: `todo` | Owner: `FE` | Update [company detail page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/companies/[companyId]/page.tsx) to match `Company Profile (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Implement summary header, quick actions, latest activity, related sections, and desktop side rail
- [ ] Status: `todo` | Owner: `PM` | Review action hierarchy and content prioritization
- [ ] Status: `todo` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

## Sprint 3: Remaining Core Screens

### 3.1 Contacts List

- [ ] Status: `todo` | Owner: `FE` | Update [contacts page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/contacts/page.tsx) to match `Contacts Directory (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Implement sticky filters, dense row layout, and mobile fallback
- [ ] Status: `todo` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

### 3.2 Tasks

- [ ] Status: `todo` | Owner: `FE` | Update [tasks page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/tasks/page.tsx) to match `Tasks Management (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Implement segmented groups: overdue, today, upcoming, done
- [ ] Status: `todo` | Owner: `FE` | Implement fast status change interactions
- [ ] Status: `todo` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

### 3.3 Quick-Add Interaction

- [ ] Status: `todo` | Owner: `FE` | Update [interactions new page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/interactions/new/page.tsx) to match `Log Interaction (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Update [interaction-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/crm/interaction-form.tsx)
- [ ] Status: `todo` | Owner: `FE` | Keep essential fields first and optional fields behind progressive reveal
- [ ] Status: `todo` | Owner: `Design QA` | Review desktop drawer feel and mobile sheet behavior against Sprint 5 UI docs

### 3.4 Import Review

- [ ] Status: `todo` | Owner: `FE` | Update [imports page](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/admin/imports/page.tsx) to match `Import Review (Updated)`
- [ ] Status: `todo` | Owner: `FE` | Update [row-review-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/admin/imports/row-review-form.tsx)
- [ ] Status: `todo` | Owner: `FE` | Implement confidence banner, severity summary, raw vs cleaned values, and clear approve or fix actions
- [ ] Status: `todo` | Owner: `CTO` | Review utilitarian admin UX and information density
- [ ] Status: `todo` | Owner: `Design QA` | Review parity with Sprint 5 UI docs

## Sprint 4: Localization, Responsiveness, And Acceptance

### 4.1 Bilingual And RTL QA

- [ ] Status: `todo` | Owner: `FE` | Verify all implemented screens in English
- [ ] Status: `todo` | Owner: `FE` | Verify all implemented screens in Hebrew
- [ ] Status: `todo` | Owner: `FE` | Fix RTL mirroring issues
- [ ] Status: `todo` | Owner: `FE` | Fix mixed-language truncation and wrapping issues
- [ ] Status: `todo` | Owner: `Design QA` | Review Hebrew and RTL parity

### 4.2 Mobile QA

- [ ] Status: `todo` | Owner: `FE` | Verify all priority screens on iPhone-width layouts
- [ ] Status: `todo` | Owner: `FE` | Remove horizontal scroll from required mobile flows
- [ ] Status: `todo` | Owner: `FE` | Verify bottom-sheet and quick-action usability
- [ ] Status: `todo` | Owner: `Design QA` | Review mobile parity with Sprint 5 intent

### 4.3 Final Acceptance

- [ ] Status: `todo` | Owner: `PM` | Approve feature completeness against scope
- [ ] Status: `todo` | Owner: `CTO` | Approve frontend architecture and reuse quality
- [ ] Status: `todo` | Owner: `Design QA` | Approve visual parity against Sprint 5 UI docs
- [ ] Status: `todo` | Owner: `Full Stack` | Capture screenshots for release documentation
- [ ] Status: `todo` | Owner: `Full Stack` | Document any intentional deviations from Sprint 5 UI docs

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
