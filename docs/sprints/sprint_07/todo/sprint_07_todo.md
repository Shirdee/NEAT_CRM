---
tags:
  - crm
  - sprint
  - sprint-07
  - todo
  - dev-handoff
aliases:
  - Sprint 07 Todo
  - CRM Sprint 07 Todo
created: 2026-04-12
updated: 2026-04-14
---

# Sprint 07 Todo

## Status

Planned by PM and opened by CTO on 2026-04-12.
Prepared for DEV execution with explicit technical boundaries.
Implementation is complete as of 2026-04-14.
Sprint 7 is ready for QA closeout and PM closure.

## PM Model Strategy (2026-04-12)

- default planning and doc model: `gpt-5.4-mini` with `low` to `medium` reasoning for PM routing, doc cleanup, and task tracking
- default implementation model: `gpt-5.3-codex` with `medium` reasoning for routine DEV tickets
- higher-risk technical model: `gpt-5.4` with `low` to `medium` reasoning for state-model, permissions, or destructive bulk-edit decisions
- QA verification model: start with `gpt-5.4-mini` for broad regression setup and escalate to `gpt-5.4` when failures require deeper triage
- escalation rule: promote model strength only when blocked by ambiguity, bulk-edit risk, or failing verification
- continuity rule: keep one model per task thread unless a concrete blocker justifies a switch

## PM Execution Tracker (2026-04-12)

- DEV-701: completed
- DEV-702: completed
- DEV-703: completed
- DEV-704: completed
- DEV-705: completed
- DEV-706: completed
- DEV-707: completed

## PM Progress Update (2026-04-14)

- saved views foundation and UI are delivered on `companies`, `tasks`, and `opportunities`
- dashboard period presets are delivered and explicit via route state
- mobile quick entry now covers interactions, follow-ups, and opportunities
- limited admin-only batch edit is delivered for companies and opportunities
- non-destructive duplicate review tooling is delivered for existing records
- verification suite is green: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`

## Agent Flow

- PM owns scope, sequencing, doc truth, and closeout
- CTO owns technical boundaries where saved-state, bulk edit, or cleanup behavior could create risk
- DEV owns implementation once ticket scope is approved
- QA owns verification, regression review, and release confidence
- after CTO, DEV, or QA completes meaningful work, the outcome returns to PM for doc and status updates

## CTO Technical Decisions (2026-04-12)

- persisted named saved views should be stored server-side per user, not in client-only local storage
- transient filter state should continue to use route search params as the immediate source of truth for list state
- Sprint 7 should add one shared saved-view model and parser path that wraps existing list filter params rather than replacing them
- the first UI adoption wave for saved views is `companies`, `tasks`, and `opportunities`; `contacts` and `interactions` should use the shared primitives later in the sprint after the first wave is stable
- saved views are private to the current user in Sprint 7; cross-user sharing is out of scope
- dashboard preset work in `DEV-703` should use explicit preset keys and route state; persisted named dashboard views are out of scope for this sprint
- batch edit is implemented as admin-only and restricted to a small allowlist of structured fields
- duplicate cleanup is implemented as non-destructive admin review tooling; merge/destructive cleanup remains out of scope

## CTO Execution Handoff

- handoff owner: CTO
- handoff target: DEV
- sprint: Sprint 7
- build scope: saved views, dashboard preset refinement, mobile quick-entry polish, limited batch edits, and duplicate cleanup improvements
- execution start condition: Sprint 7 is open for implementation on the narrowed saved-view first slice; later tasks keep their documented blockers
- first concrete implementation action: start `DEV-701` by defining the shared saved-view storage model and query-state parser used by `companies`, `tasks`, and `opportunities`
- immediate sequencing after first action: finish `DEV-701`, then move to `DEV-702` for the first-wave UI adoption before starting dashboard preset work in `DEV-703`
- hard technical guardrails: keep state auditable and URL-safe where practical, keep permissions enforced server-side, reuse existing search-param naming where possible, keep destructive operations explicit and reversible where possible, do not add integrations, queues, cron, notifications, or paid services
- unresolved blockers to keep explicit during build: final dashboard default presets, final batch-edit allowlist, and exact duplicate-resolution affordances
- PM routing note: after `DEV-701`, PM should publish a short progress update and confirm whether the same shared model should expand to `contacts` and `interactions` before the sprint moves further down the queue
- PM routing note: Sprint 7 should stay marked in progress until `DEV-707` and QA closeout finish, even if later scope priorities are refined mid-sprint

## Sprint Goal

Reduce repeated user friction in the shipped CRM by improving reuse of filters and views, tightening dashboard defaults, shortening high-frequency mobile actions, and adding safe cleanup tools for admins.

## Documentation Gate

- Sprint 7 index exists before implementation
- Sprint 7 review exists before implementation
- this Sprint 7 todo exists before implementation
- DEV and QA should treat these docs as the Sprint 7 planning source of truth

## Product Approval Dependencies

- confirm the priority list screens for saved views
- confirm default dashboard periods and preset labels
- confirm which structured fields are safe for batch edit
- confirm the allowed duplicate-cleanup actions and audit expectations
- confirm that Sprint 7 remains optimization-only and excludes integrations, notifications, and automation

## DEV Task List

### DEV-701: Define Shared Saved-View State

- objective: create the shared state and persistence path for reusable filters and views
- scope: Prisma model changes if needed, server-side parsing helpers, storage approach, and typed view definitions for the first-wave list screens
- must include: one consistent path that wraps existing search-param conventions for `companies`, `tasks`, and `opportunities` without page-local reinvention
- done when: the app has a shared saved-view contract and persistence model that the first-wave screens can consume safely

### DEV-702: Ship Saved Filters And Saved Views

- objective: let users reopen common filtered list states quickly
- scope: UI affordances for save, load, apply, rename, and remove on approved list screens
- must include: role-correct behavior, clear empty states, and safe defaults when a saved view becomes partially stale
- done when: repeated list workflows no longer require rebuilding the same filters manually

### DEV-703: Refine Dashboard Presets And KPI Defaults

- objective: make the dashboard faster to trust and reuse after Sprint 6 delivery
- scope: founder-approved preset periods, KPI wording cleanup, and dashboard state polish
- must include: explicit metric definitions, locale-safe labels, and predictable default behavior on first load
- done when: the dashboard opens with approved defaults and users can switch between useful preset views without confusion

### DEV-704: Polish Mobile Quick-Entry Flows

- objective: reduce friction on the highest-frequency mobile actions
- scope: quick-add and edit flows for interactions, follow-ups, and approved opportunity actions
- must include: fewer taps where practical, preserved validation clarity, and iPhone-width usability
- done when: the main field workflows remain fast and usable on mobile without regressing desktop behavior

### DEV-705: Add Limited Batch Edit Support

- objective: allow safe bulk updates for narrowly approved structured values
- scope: selection behavior, guarded bulk actions, confirmation states, and mutation handling
- must include: explicit field allowlist, role enforcement, and clear result reporting
- done when: admins or approved roles can batch update selected structured fields without unsafe write paths

### DEV-706: Improve Duplicate Cleanup And Admin Review

- objective: reduce manual cleanup friction for imported and edited records
- scope: duplicate review affordances, merge or resolve helpers if approved, and clearer admin workflows for existing data cleanup
- must include: non-destructive review states or explicit confirmation for destructive actions
- done when: admin users can handle common duplicate-cleanup cases with less manual navigation

### DEV-707: Verify, Harden, And Regress

- objective: close Sprint 7 with confidence and without destabilizing the MVP baseline
- scope: repository verification, mobile checks, permission checks, saved-view correctness, and batch-edit safety validation
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 7 behavior is covered and Sprint 1 through Sprint 6 workflows still pass regression checks

## Recommended Execution Order

1. freeze founder priorities for saved views, dashboard defaults, and allowed batch actions
2. DEV-701 Define Shared Saved-View State
3. DEV-702 Ship Saved Filters And Saved Views
4. DEV-703 Refine Dashboard Presets And KPI Defaults
5. DEV-704 Polish Mobile Quick-Entry Flows
6. DEV-705 Add Limited Batch Edit Support
7. DEV-706 Improve Duplicate Cleanup And Admin Review
8. DEV-707 Verify, Harden, And Regress

## Non-Scope Guardrails

- no Gmail, Outlook, or calendar integration
- no notification engine
- no cron, queue, or automation engine
- no external analytics or BI tooling
- no ownership model expansion
- no major UI redesign beyond workflow polish
- no new paid service unless a concrete blocker forces explicit approval

## Definition Of Done

- saved views work on approved list screens
- dashboard preset behavior is clearer and founder-approved
- key mobile actions are faster and still valid
- limited batch edit is safe, explicit, and role-correct
- duplicate cleanup is easier for admins
- tests and repo checks pass

## QA Execution Plan

- verify saved views persist and reopen the expected filters
- verify stale or invalid saved-view states fail safely
- verify dashboard presets match approved periods and wording
- verify mobile quick-entry remains usable on iPhone width
- verify batch edit only touches approved fields and roles
- verify duplicate cleanup flows do not create accidental destructive changes
- verify bilingual rendering on changed surfaces
- run regression on Sprint 3 company and contact workflows
- run regression on Sprint 4 interactions, follow-ups, and inactivity workflows
- run regression on Sprint 5 delivered UI baseline
- run regression on Sprint 6 opportunities, dashboard, and report behavior
- run full repo verification commands

## CTO To DEV Handoff

DEV should treat the following as the approved Sprint 7 build direction once founder approval opens execution:

1. centralize reusable state
- saved-view behavior should come from shared modules, not duplicated page logic

2. keep defaults explicit
- dashboard presets, batch-edit allowlists, and cleanup rules should be declared clearly in code

3. prefer reversible operations
- destructive cleanup or bulk changes should require visible confirmation and safe failure behavior

4. preserve the current platform
- reuse Next.js, Prisma, RBAC, and existing app patterns rather than introducing services or infrastructure

5. optimize workflows, not scope
- remove repeated friction from real usage, but do not turn Sprint 7 into integrations or automation work

6. design for QA validation
- saved states, presets, and bulk actions should be easy to test and reconcile

## PM Closeout Target

If DEV and QA complete the items above without scope drift, Sprint 7 should leave the CRM easier to operate day to day while preserving the MVP baseline established by Sprint 6.

## Blockers And Approval Dependencies

- if founder wants different dashboard presets, adjust the preset keys and labels before sprint closeout
- if non-admin roles should batch edit, expand role scope intentionally after review
- if destructive merge is desired, add an explicit merge workflow sprint rather than extending Sprint 7 silently

## Related

- [[sprints/sprint_07/sprint_07_index|Sprint 07 Index]]
