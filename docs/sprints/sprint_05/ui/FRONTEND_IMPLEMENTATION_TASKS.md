---
tags:
  - crm
  - frontend
  - sprint-05
  - implementation
  - tasks
aliases:
  - CRM Frontend Implementation Tasks
created: 2026-04-09
updated: 2026-04-09
---

# CRM Frontend Implementation Tasks

## Status

Implementation planning document for Sprint 5.
Frontend execution should follow this file and treat the Sprint 5 UI docs as the source of truth.

## Decision

The Sprint 5 UI docs are the UI source of truth for frontend implementation.

That means:

- engineers implement from the approved Sprint 5 UI docs first
- local code should not invent a competing visual system
- `UI_KIT.md` and `Design.md` define intent and constraints
- when code and design differ, the Sprint 5 UI docs win unless product or engineering explicitly approves a deviation

## Scope

This plan covers frontend implementation for the CRM app in `crm/app`.

Primary screens in scope:

1. `CRM Dashboard (Updated)`
2. `CRM Login (Updated)`
3. `Companies Directory (Updated)`
4. `Company Profile (Updated)`
5. `Contacts Directory (Updated)`
6. `Tasks Management (Updated)`
7. `Log Interaction (Updated)`
8. `Import Review (Updated)`

## PM Goals

- ship the highest-value operational screens first
- preserve visual consistency with the approved UI direction
- keep mobile and RTL in scope from day one
- avoid rework caused by ad hoc UI decisions in code

## CTO Goals

- keep implementation table-first and reusable
- separate UI primitives from route-level feature code
- keep translation, accessibility, and responsive behavior testable
- avoid high-polish one-off components that slow delivery

## Non-Negotiable Rules

- the Sprint 5 UI docs are the visual reference for layout, hierarchy, spacing, and tone
- the CRM palette must follow the approved UI kit direction
- all protected screens must support English and Hebrew
- layouts must remain RTL-safe
- mobile behavior is required for dashboard actions, tables, detail screens, and quick-add flows

## Workstreams

### 1. UI Token Alignment

Objective:
Move the current codebase onto a token set that matches the CRM UI kit and approved Sprint 5 direction.

Tasks:

- audit `globals.css` and Tailwind tokens against the CRM palette
- define stable semantic tokens for `ink`, `teal`, `mint`, `coral`, `amber`, `lime`, `sand`, and `white`
- ensure typography tokens support heading/body/data roles
- standardize radius, card padding, shadow, and shell gradient tokens
- remove color drift that conflicts with the CRM UI kit

Definition of done:

- code tokens match the approved CRM palette
- shell, cards, buttons, chips, and tables all read from shared tokens

### 2. App Shell Refactor

Objective:
Bring the global shell into line with the Sprint 5 UI direction and make it reusable across protected screens.

Tasks:

- refactor [app-shell.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/shell/app-shell.tsx) to match the approved shell hierarchy
- align sidebar, top search, action area, and card surfaces with the approved shell
- add active-nav styling and hover states that match the CRM UI direction
- ensure shell works in both LTR and RTL
- verify mobile-safe fallback for nav and header actions

Definition of done:

- one shared shell supports all protected CRM routes
- shell behavior is visually consistent with the Sprint 5 UI docs on desktop and mobile

### 3. Shared Primitive Layer

Objective:
Build a minimal component layer that supports the Sprint 5 screens without creating parallel design logic.

Tasks:

- create reusable card primitives
- create KPI/stat card primitive
- create filter bar primitive
- create table shell and row primitives
- create status chip primitive
- create summary header primitive for detail screens
- create activity timeline item primitive
- create drawer or sheet primitive for quick-add flows
- create admin review row primitive for import review

Definition of done:

- route screens assemble from shared primitives
- primitives are narrow and implementation-friendly

### 4. Login Screen Implementation

Objective:
Implement the public login screen to match `CRM Login (Updated)`.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(public)/login/page.tsx)
- update [login-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/auth/login-form.tsx)
- align structure, hierarchy, spacing, and CTA treatment with the Sprint 5 UI docs
- keep locale switching visible and stable
- ensure the screen remains lightweight and not over-decorated

Definition of done:

- login screen is visually aligned with the Sprint 5 UI docs
- desktop and mobile layouts both work

### 5. Dashboard Implementation

Objective:
Implement the operational dashboard from `CRM Dashboard (Updated)`.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/dashboard/page.tsx)
- implement KPI row
- implement “do now” priority block
- implement recent activity timeline block
- implement side insight block without overloading the layout
- ensure hierarchy answers “what needs action today”

Definition of done:

- dashboard reflects the approved Sprint 5 structure
- highest-priority actions are obvious at first glance

### 6. Companies And Contacts List Screens

Objective:
Implement the two main table-first list screens from the Sprint 5 UI docs.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/companies/page.tsx)
- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/contacts/page.tsx)
- implement sticky filter bar
- implement dense but readable rows
- implement strong first-column pattern with title and subtext
- implement visible primary action
- implement mobile stacked-card fallback
- preserve search and filter behavior

Definition of done:

- companies and contacts screens match the approved hierarchy
- list density stays readable
- mobile fallback does not require horizontal scroll

### 7. Company Detail Screen

Objective:
Implement `Company Profile (Updated)` with clear action hierarchy.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/companies/[companyId]/page.tsx)
- implement summary header card
- surface latest activity high on the page
- group related contacts, tasks, interactions, and opportunities
- add quick actions for log interaction, add follow-up, and edit
- implement side facts rail for desktop

Definition of done:

- latest activity and next actions are visible without deep scrolling
- related data remains scannable on mobile

### 8. Tasks Screen

Objective:
Implement `Tasks Management (Updated)` as a fast operational screen.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/tasks/page.tsx)
- group tasks into overdue, today, upcoming, and done
- make priority visually stronger than metadata
- keep status change interactions fast
- support one-hand mobile completion

Definition of done:

- overdue work is visually dominant
- task completion and updates are low-friction

### 9. Quick-Add Interaction Flow

Objective:
Implement `Log Interaction (Updated)` as the fast-entry workflow.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/interactions/new/page.tsx)
- update [interaction-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/components/crm/interaction-form.tsx)
- make desktop use a drawer-style layout
- make mobile use a bottom-sheet or full-screen modal pattern
- keep essential fields first
- hide optional fields behind progressive reveal

Definition of done:

- interaction logging is fast on desktop and iPhone
- optional details do not clutter the primary path

### 10. Import Review Screen

Objective:
Implement `Import Review (Updated)` as a utilitarian admin workflow.

Tasks:

- update [page.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/admin/imports/page.tsx)
- update [row-review-form.tsx](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/app/src/app/[locale]/(protected)/admin/imports/row-review-form.tsx)
- implement confidence banner
- implement severity summary
- implement side-by-side raw vs cleaned values
- make approve and fix actions obvious and repeatable
- keep admin UI more utilitarian than sales-facing screens

Definition of done:

- import review is easy to scan under data density
- admin actions remain clear and low-risk

### 11. RTL And Localization QA

Objective:
Make the implemented UI actually safe for bilingual use.

Tasks:

- verify all updated screens in English and Hebrew
- verify layout mirroring in RTL
- verify chips, filters, tables, and forms with mixed-language content
- verify iconography does not break in RTL
- verify table and card truncation rules with long Hebrew and English strings

Definition of done:

- no layout breakage in Hebrew
- no broken mixed-language rows or forms

### 12. Frontend QA And Acceptance

Objective:
Create a clean acceptance pass before handoff.

Tasks:

- capture implementation screenshots for each core screen
- compare code output against the Sprint 5 UI docs screen-by-screen
- track approved deviations explicitly
- run responsive checks for desktop and iPhone widths
- run accessibility pass on forms, focus states, labels, and contrast
- verify no horizontal scroll on required mobile flows

Definition of done:

- each implemented screen has been checked against the Sprint 5 UI docs
- deviations are documented and intentional

## Delivery Order

Recommended implementation order:

1. UI token alignment
2. app shell refactor
3. shared primitives
4. login
5. dashboard
6. companies table
7. company detail
8. contacts table
9. tasks
10. quick-add interaction
11. import review
12. localization and QA pass

## Screen Review Gate

Before marking any frontend screen complete:

- compare against the Sprint 5 UI docs
- compare against `Design.md`
- confirm CRM palette usage is correct
- confirm the screen still supports RTL and mobile
- confirm no new one-off visual pattern was introduced without reason

## Explicit Risks

- older planning language may still describe a Stitch-first source of truth
- route implementation can drift if teams skip the Sprint 5 UI docs and work directly from old markup
- if engineering starts from old route markup without shared primitives, visual drift will return quickly
- if mobile and RTL are deferred, rework cost will increase materially

## Source Files

- [Design.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/Design.md)
- [UI_KIT.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/UI_KIT.md)

## Related

- [[sprints/sprint_05/sprint_05_index|Sprint 05 Index]]
- [[sprints/sprint_05/ui/Design|Design]]
- [[sprints/sprint_05/ui/UI_KIT|UI Kit]]
