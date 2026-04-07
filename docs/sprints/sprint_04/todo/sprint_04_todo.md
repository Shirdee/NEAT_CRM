---
tags:
  - crm
  - sprint
  - sprint-04
  - todo
  - dev-handoff
aliases:
  - Sprint 04 Todo
---

# Sprint 04 Todo

## Status

Reviewed by PM and CTO.
This doc is the Sprint 4 execution handoff to DEV and QA.
Execution is pending founder approval.

## Sprint Goal

Make the CRM operational for daily sales follow-up by shipping interaction logging, follow-up task management, and inactivity-aware action views without expanding into Sprint 5 reporting work.

## Documentation Gate

- Sprint 4 index exists before implementation
- Sprint 4 review exists before implementation
- this Sprint 4 todo exists before implementation
- DEV and QA should treat these docs as the current Sprint 4 source of truth

## DEV Task List

### DEV-401: Extend Shared CRM Activity Data Access

- objective: add shared server-side data access for interactions, tasks, timeline reads, and inactivity summaries
- scope: Prisma queries, repository helpers, typed filters, relation lookups, and derived recency data for company and contact screens
- must include: one consistent access path for list views, detail views, quick-add flows, and follow-up creation from an interaction
- done when: Sprint 4 pages and actions use centralized activity services instead of embedding query logic

### DEV-402: Add Interactions List Flow

- objective: ship the first interactions table screen
- scope: protected route, chronological table-first list UI, default filters, empty state, and relation display
- must include: filters for interaction type, date range, company, contact, and creator where practical
- done when: authenticated users can browse and filter interaction history on desktop and mobile

### DEV-403: Add Interaction Detail And Form Flow

- objective: support create, read, and update behavior for interactions
- scope: interaction detail screen, create and edit form, relation picking, subject, summary, outcome, and date handling
- must include: company-only, contact-only, and company-plus-contact linkage paths plus read-only presentation for viewers
- done when: interaction records can be created and edited through the app without violating RBAC

### DEV-404: Add Mobile Quick-Add Interaction Flow

- objective: make interaction logging fast during daily outreach work
- scope: quick-add drawer or sheet, compact validated form, route entrypoints from company, contact, and top-level shell actions
- must include: mobile-first layout, relation prefill when launched from a record, and shared mutation logic with the full form
- done when: users can log an interaction in a low-friction flow on iPhone-width screens and desktop

### DEV-405: Add Follow-Ups Table Flow

- objective: ship the first operational follow-up queue
- scope: protected route, overdue and upcoming default views, status and priority filters, and relation display to company and contact
- must include: viewer-safe read access, mobile-safe stacked presentation, and clear overdue emphasis
- done when: authenticated users can browse and filter follow-up tasks for daily execution

### DEV-406: Add Task Detail And Form Flow

- objective: support create, read, update, and complete behavior for follow-up tasks
- scope: task detail screen, create and edit form, due date, priority, status, note fields, and completion controls
- must include: company-only, contact-only, and interaction-linked task paths plus consistent `completedAt` handling when task state changes to complete
- done when: follow-up tasks can be created and maintained through the app without violating RBAC

### DEV-407: Add Create-Follow-Up-From-Interaction Flow

- objective: connect activity logging to next-action execution
- scope: action entrypoint on interaction surfaces, prefilled task create path, related interaction linkage, and return-path UX
- must include: relation inheritance from the interaction and no duplicate relation re-entry for the common case
- done when: a user can log an interaction and immediately create the next follow-up from it

### DEV-408: Add Inactivity Indicators And Filters

- objective: surface stale records that need attention without introducing automation infrastructure
- scope: derived last-interaction recency, inactivity badges or labels, and company/contact filters or summaries where useful
- must include: one simple threshold rule documented in code or config and reuse of imported plus app-created interaction history
- done when: users can identify inactive companies and contacts from existing record workflows

### DEV-409: Navigation And Record-Surface Hardening

- objective: integrate Sprint 4 routes into the existing shell cleanly
- scope: nav entrypoints, record detail links to interactions and tasks, page headings, sticky primary actions, and empty states
- must include: consistent pathing from company and contact detail into activity and follow-up work
- done when: Sprint 4 surfaces feel like one coherent layer of the CRM instead of isolated routes

### DEV-410: Verify And Harden

- objective: complete Sprint 4 with tests and regression checks
- scope: repository tests, route and action coverage where practical, form validation checks, filter checks, and full repo verification commands
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 4 behavior is covered and prior sprint behavior still passes

## Recommended Execution Order

1. DEV-401 Extend Shared CRM Activity Data Access
2. DEV-402 Add Interactions List Flow
3. DEV-403 Add Interaction Detail And Form Flow
4. DEV-404 Add Mobile Quick-Add Interaction Flow
5. DEV-405 Add Follow-Ups Table Flow
6. DEV-406 Add Task Detail And Form Flow
7. DEV-407 Add Create-Follow-Up-From-Interaction Flow
8. DEV-408 Add Inactivity Indicators And Filters
9. DEV-409 Navigation And Record-Surface Hardening
10. DEV-410 Verify And Harden

## Non-Scope Guardrails

- no opportunities UI
- no dashboard or reporting delivery
- no email reminders or notifications
- no background jobs, cron, or automation engine
- no ownership rules
- no import-pipeline redesign unless Sprint 4 exposes a real compatibility defect
- no new paid service

## Definition Of Done

- interactions list and detail exist
- create and edit flows exist for interactions
- mobile quick-add interaction flow exists
- follow-ups list and detail exist
- create, edit, and complete flows exist for tasks
- follow-up can be created from an interaction
- inactivity is surfaced in company or contact workflows
- viewer remains read-only
- mobile layouts are usable on iPhone width
- tests and repo checks pass

## QA Execution Plan

- verify role behavior: admin and editor can mutate, viewer cannot
- verify interaction create and edit across company-only, contact-only, and linked relation cases
- verify quick-add interaction flow from shell and record detail entrypoints
- verify task create, edit, reschedule, and complete behavior
- verify create-follow-up-from-interaction keeps the correct related entities
- verify overdue and upcoming task filters behave consistently
- verify inactivity labels and filters reflect interaction recency correctly
- verify English and Hebrew rendering on the new routes
- verify mobile interaction and task flows at iPhone width
- run regression on Sprint 1 auth, locale, and admin-list behavior
- run regression on Sprint 2 imported interaction and task visibility
- run regression on Sprint 3 companies, contacts, and search behavior

## CTO To DEV Handoff

DEV should treat the following as the approved Sprint 4 build direction:

1. keep activity logic centralized
- list queries, detail queries, mutations, quick-add flows, and inactivity derivation should share server-side modules

2. treat quick-add as a UX variant, not a separate system
- the quick-add path should reuse the same validation and persistence rules as the standard create flow

3. keep inactivity derived and simple
- start from last interaction date
- do not add scheduled jobs or notifications in this sprint

4. preserve relation optionality
- interactions and tasks may link to a company, a contact, or both
- do not force a company when a contact-only workflow is valid

5. preserve role boundaries everywhere
- read access for all authenticated users
- mutation paths only for admin and editor

6. optimize for table-first desktop use and thumb-friendly mobile entry
- the queue views should stay fast to scan on desktop and practical to update on mobile

## PM Closeout Target

If DEV and QA complete the items above without scope drift, Sprint 4 should be ready to close as the roadmap’s daily sales workflow slice and Sprint 5 can focus on opportunities, dashboard, reporting, and launch hardening.

## Blockers And Approval Dependencies

- founder approval is still required before Sprint 4 execution begins
- inactivity threshold wording may need founder confirmation if a specific business rule is preferred over a simple default

## Related

- [[sprints/sprint_04/sprint_04_index|Sprint 04 Index]]
- [[sprints/sprint_04/reviews/sprint_04_review|Sprint 04 Review]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
