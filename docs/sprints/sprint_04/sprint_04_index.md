---
tags:
  - crm
  - sprint
  - sprint-04
  - planning
  - dev-handoff
aliases:
  - Sprint 04 Index
updated: 2026-04-09
---

# Sprint 04 Index

## Status

Sprint 4 planning was re-reviewed by CTO against the finished Sprint 3 repository state.
Sprint 4 is now active implementation work.
The current Sprint 4 slice in the repository includes shared interactions and tasks reads and writes, interaction and follow-up create/edit routes, explicit interaction-type selection on the interaction form, direct follow-up creation from the interaction create flow, create-follow-up-from-interaction behavior, activity summaries on company and contact detail, and a green QA verification pass on 2026-04-09.

## Objective

Make the CRM operational for daily follow-up work by shipping interactions, follow-ups, and inactivity-aware action views on top of the completed foundation, import, and core record layers.

## PM Summary

- Sprint 4 is where the CRM becomes a daily action tool rather than only a record system.
- Scope should stay on operational activity and follow-up execution.
- Dashboard expansion and opportunities should remain outside this sprint except for data links that Sprint 4 needs.
- Mobile quick-add matters in this sprint because interaction logging is expected to happen during or right after outreach.

## CTO Summary

- The schema and import layer already support interactions and tasks, so Sprint 4 should prefer shared data-access and UI delivery over schema redesign.
- Interaction and task workflows should reuse the existing RBAC, i18n, and table-first route patterns from Sprint 3.
- Inactivity logic should be derived from existing interaction data before adding any new background system or automation.
- Quick-add flows should be built as thin product surfaces on top of centralized server-side mutations.
- Sprint 3 completion was revalidated in the repository before this approval was renewed.

## Sprint 4 Deliverables

- interactions list view with core filters
- interaction detail view
- create and edit interaction flow
- mobile quick-add interaction sheet or drawer
- follow-ups table with overdue and upcoming views
- task detail view
- create and edit follow-up flow
- create follow-up from interaction flow
- inactivity indicators for company and contact workflows
- navigation and mobile-action entrypoints for the new Sprint 4 routes

## Current Implementation Read

- completed in repository: shared activity read and write layer, fallback seed coverage for interactions and tasks, interactions list/detail/create/edit, explicit interaction-type selection in the interaction form, direct interaction-create to follow-up-create handoff, follow-up list/detail/create/edit, create-follow-up-from-interaction path, company/contact activity summaries, shell nav links, locale strings, Sprint 4 fallback tests
- next build slice: mobile quick-add UX and any remaining mobile-entry polish needed for Sprint 4 closeout

## Main Carry-Ins

- Sprint 1 provides auth, RBAC, locale handling, shell, and deployment
- Sprint 2 provides imported interactions and tasks data shape plus shared import behavior
- Sprint 3 provides companies, contacts, search, and reusable CRM list-detail form patterns

## Definition Of Done

- users can create, edit, and review interactions
- users can create, edit, complete, and filter follow-up tasks
- a follow-up can be created directly from an interaction
- overdue and upcoming task views are usable on desktop and mobile
- company and contact workflows expose inactivity using derived interaction recency
- viewers remain read-only across Sprint 4 routes
- tests and repo verification targets pass, or any tooling blocker is documented explicitly

Current verification read:

- passed: `npm test`
- passed: `npm run typecheck`
- passed: `npm run build`

## Linked Sprint Docs

- [[sprints/sprint_04/reviews/sprint_04_review|Sprint 04 Review]]
- [[sprints/sprint_04/reports/sprint_04_report|Sprint 04 Report]]
- [[sprints/sprint_04/todo/sprint_04_todo|Sprint 04 Todo]]

## Related

- [[ROADMAP|Roadmap]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
- [[PERMISSIONS|Permissions]]
