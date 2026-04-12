---
tags:
  - crm
  - sprint
  - sprint-06
  - todo
  - dev-handoff
aliases:
  - Sprint 06 Todo
  - CRM Sprint 06 Todo
created: 2026-04-09
updated: 2026-04-12
---

# Sprint 06 Todo

## Status

Reviewed by PM and CTO.
This doc now reflects the implemented Sprint 6 slice and the follow-up QA remediation pass completed on 2026-04-12.
Sprint 6 moved from planning into active delivery and verification on 2026-04-12.
The current state is implementation complete, QA-reviewed, and remediated for the issues raised in the Sprint 6 QA pass.

## PM Model Strategy (2026-04-12)

- default implementation model: `gpt-5.3-codex` with `medium` reasoning for normal DEV tickets
- high-risk technical model: `gpt-5.4` with `high` reasoning for data-model, query-performance, or irreversible boundary decisions
- cost-efficient coordination model: `gpt-5.4-mini` with `low` to `medium` reasoning for PM documentation, progress updates, and checklist maintenance
- QA verification model: start with `gpt-5.4-mini` for broad regression pass setup; escalate to `gpt-5.4` when failures require deeper triage
- escalation rule: promote model strength only when blocked by ambiguity, failing tests, or architecture risk; otherwise keep cheaper defaults
- continuity rule: keep one model per task thread unless a concrete blocker justifies a switch

## PM Execution Tracker (2026-04-12)

- DEV-601: completed
- DEV-602: completed
- DEV-603: completed
- DEV-604: completed
- DEV-605: completed
- DEV-606: completed
- DEV-607: completed with QA remediation follow-up
- DEV-608: completed
- DEV-609: completed

## CTO Execution Handoff (2026-04-12)

- handoff owner: CTO
- handoff target: DEV
- sprint: Sprint 6
- build scope: opportunities module, dashboard KPI views, reporting views, permission hardening, production-readiness checks
- execution start condition: PM and CTO explicitly open Sprint 6 execution and founder approvals for KPI formulas and periods are confirmed or explicitly deferred with documented fallback behavior
- first concrete implementation action: start `DEV-601` by creating or tightening the shared opportunity data-access surface used by list, detail, create, edit, dashboard, and report consumers
- immediate sequencing after first action: `DEV-602` then `DEV-603`, before dashboard and reporting surfaces
- hard technical guardrails: keep server-side business logic centralized, keep dashboard formulas explicit and auditable, keep role enforcement server-side, do not add BI, queues, cron, or paid services
- unresolved blockers to keep explicit during build: dashboard formula approvals, inactive-threshold wording, viewer note-visibility policy
- PM routing note: after DEV completes `DEV-601` through `DEV-603`, PM should publish a short progress update and confirm whether Sprint 6 dashboard and reports can proceed with final formulas or with documented interim defaults

## QA Remediation Closeout (2026-04-12)

- dashboard KPI loading was tightened to fetch opportunity status lookups directly instead of resolving full opportunity form options
- leads-by-source reporting now uses aggregated source counts rather than loading the full company list into the report page
- mobile bottom navigation now includes direct opportunities and reports access on small screens
- Prisma seed data now includes `opportunity_type` and `opportunity_status` lookup categories to match the fallback and form assumptions
- Sprint 6 docs were updated to reflect implementation completion and QA remediation status

## Sprint Goal

Complete the MVP business layer and launch-preparation work by shipping opportunities, dashboard metrics, core reports, permission hardening, and release-readiness validation.

## Documentation Gate

- Sprint 6 index exists before implementation
- Sprint 6 review exists before implementation
- this Sprint 6 todo exists before implementation
- DEV and QA should treat these docs as the Sprint 6 planning source of truth

## Product Approval Dependencies

- finalize opportunity stages and status definitions
- finalize dashboard periods
- finalize conversion formulas
- finalize inactive-threshold wording
- confirm whether viewer users should see all notes and interaction summaries or a limited subset

## DEV Task List

### DEV-601: Finalize Shared Opportunity Data Access

- objective: add centralized server-side opportunity queries, relation-loading helpers, filters, and mutations
- scope: Prisma queries, typed filters, company and contact linkage loading, stage and status handling, and reusable form-option loaders
- must include: one consistent access path for list, detail, create, edit, dashboard, and reporting consumers
- done when: Sprint 6 pages and actions use shared opportunity services rather than page-local data logic

### DEV-602: Add Opportunities List Flow

- objective: ship the first opportunity table screen
- scope: protected route, table-first UI, default filters, relation display, and empty state
- must include: filters for stage, status, company, contact, owner if present, and query where practical
- done when: authenticated users can browse and filter opportunities on desktop and mobile

### DEV-603: Add Opportunity Detail And Form Flow

- objective: support create, read, and update behavior for opportunities
- scope: opportunity detail screen, create and edit form, company linkage, optional contact linkage, estimated value, target close date, status or stage, and notes
- must include: required company relationship enforcement, viewer-safe read-only presentation, and shared validation with list and detail surfaces
- done when: opportunity records can be created and edited through the app without violating RBAC or the approved data model

### DEV-604: Add Dashboard KPI Summary View

- objective: deliver the MVP dashboard surface for daily action and business visibility
- scope: protected route, KPI cards or equivalent summary modules, and responsive layout
- must include: overdue follow-ups, upcoming follow-ups, meetings by approved period, inactive records by approved threshold, and open opportunity summary
- done when: users can open the dashboard and see approved headline metrics sourced from the database

### DEV-605: Add Reporting Views

- objective: ship the minimum report set required by the PRD and delivery plan
- scope: protected report views or route sections for leads by source, meetings by period, and approved conversion summaries
- must include: explicit empty states, locale-safe labels, and a clear explanation when a report depends on an unresolved founder definition
- done when: MVP business questions can be answered in-app without exporting data back to spreadsheets

### DEV-606: Permissions And Read-Only Hardening

- objective: enforce the Sprint 6 permission model across opportunities, dashboard, and reports
- scope: route guards, action guards, UI affordances, and regression review of role-gated actions
- must include: admin and editor write access, viewer read-only access, and no accidental write entrypoints on read-only surfaces
- done when: role behavior matches `PERMISSIONS.md` across the new Sprint 6 modules

### DEV-607: Performance, Audit, And Error-Handling Polish

- objective: keep Sprint 6 usable and supportable on the free-tier deployment target
- scope: query tuning, indexes where needed, error presentation, logging surfaces already available in the app, and audit-field review for new mutations
- must include: review of aggregate-query cost against realistic repository data volume
- done when: core Sprint 6 routes stay operationally light and errors are not silent or ambiguous

### DEV-608: Production Readiness And Launch Checks

- objective: prepare the MVP for internal rollout
- scope: deployment checklist items, environment review, migration readiness, and release-candidate smoke verification
- must include: rollback notes and explicit documentation of any unresolved non-blocking issues
- done when: PM and founder can review a credible release candidate rather than a feature-only build

### DEV-609: Verify And Harden

- objective: complete Sprint 6 with tests, metric validation, and regression checks
- scope: repository tests, route and action coverage where practical, aggregate-query validation, role checks, and full repo verification commands
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 6 behavior is covered and prior sprint behavior still passes

## Recommended Execution Order

1. freeze product definitions for opportunity stages and dashboard metrics
2. DEV-601 Finalize Shared Opportunity Data Access
3. DEV-602 Add Opportunities List Flow
4. DEV-603 Add Opportunity Detail And Form Flow
5. DEV-604 Add Dashboard KPI Summary View
6. DEV-605 Add Reporting Views
7. DEV-606 Permissions And Read-Only Hardening
8. DEV-607 Performance, Audit, And Error-Handling Polish
9. DEV-608 Production Readiness And Launch Checks
10. DEV-609 Verify And Harden

## Non-Scope Guardrails

- no external BI or warehouse tooling
- no email reminders or notification system
- no queue, cron, or automation engine
- no Gmail, Outlook, or calendar integration
- no ownership-based permission model
- no new paid service unless a concrete launch blocker forces an explicit approval decision
- no post-MVP workflow optimization work such as saved views, batch editing, or deeper mobile redesign

## Definition Of Done

- opportunities list and detail exist
- create and edit flows exist for opportunities
- dashboard shows approved KPI views
- reports answer the MVP business questions
- viewer remains read-only
- production deployment checklist and launch notes exist
- tests and repo checks pass

## QA Execution Plan

- verify admin and editor can create and edit opportunities
- verify viewer remains read-only across opportunities, dashboard, and reports
- verify opportunities cannot be saved without a company
- verify optional contact linkage behaves correctly
- verify dashboard KPI values reconcile with source data
- verify leads-by-source and meetings-by-period reports match approved definitions
- verify conversion views only ship if the definitions are approved and testable
- verify bilingual rendering on the new routes
- verify desktop and iPhone-width usability on dashboard and opportunity flows
- run regression on Sprint 1 auth and locale behavior
- run regression on Sprint 2 import compatibility
- run regression on Sprint 3 company, contact, and search behavior
- run regression on Sprint 4 interaction, follow-up, and inactivity workflows
- run regression on the Sprint 5 delivered UI baseline and mobile hardening surfaces
- run production build and deployment smoke checks

## CTO To DEV Handoff

DEV should treat the following as the approved Sprint 6 build direction:

1. keep opportunities and reporting logic centralized
- list queries, detail queries, mutations, dashboard aggregates, and report views should share server-side modules

2. keep dashboard formulas explicit
- metric definitions should live in auditable server-side code, not be inferred inside UI components

3. stay within the existing platform
- reuse Next.js, Prisma, RBAC, and current infrastructure rather than introducing a reporting stack or background worker

4. enforce the current data model
- opportunity creation must require a company and may optionally link a contact

5. design for validation and reconciliation
- every KPI or report added in Sprint 6 should be easy for QA to compare against underlying data

6. treat launch hardening as real scope
- performance tuning, error handling, deployment checks, and rollback readiness are part of done, not optional cleanup

## PM Closeout Target

If DEV and QA complete the items above without scope drift, Sprint 6 should leave the CRM ready for founder launch review as the MVP release candidate.

## Blockers And Approval Dependencies

- founder approval is still required for dashboard periods, conversion formulas, inactive-threshold wording, and the viewer note-visibility decision

## Related

- [[sprints/sprint_06/sprint_06_index|Sprint 06 Index]]
- [[sprints/sprint_06/reviews/sprint_06_review|Sprint 06 Review]]
- [[ROADMAP|Roadmap]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
