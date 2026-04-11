---
tags:
  - crm
  - sprint
  - sprint-05
  - planning
  - frontend
  - ui
aliases:
  - Sprint 05 Index
  - CRM Sprint 05 Index
created: 2026-04-09
updated: 2026-04-11
---

# Sprint 05 Index

## Status

Sprint 5 is in active implementation.
Sprint 5 is the approved frontend UI implementation slice that follows the existing CRM product and data flows already in the repository.
For Sprint 5, the docs in `crm/docs/sprints/sprint_05/ui` are the source of truth for implementation scope, visual direction, and acceptance criteria.
Sprint 4 remains the current backend and workflow implementation reference for interactions and follow-up behavior until PM closes or defers any remaining Sprint 4 polish.

Implemented so far:

- shared UI tokens and shell foundation
- shared card, metric, filter, chip, and info primitives
- login and dashboard UI pass
- responsive companies list
- responsive contacts list
- responsive tasks view
- responsive company detail
- responsive quick-add interaction flow
- responsive import review UI pass
- Stitch-aligned phone surface pass across the implemented mobile screens

Still open:

- interactions list and interaction detail responsive polish
- contact detail responsive polish
- final RTL and iPhone-width hardening across all Sprint 5 screens
- final sprint-wide closeout after the remaining screens and acceptance pass

## Objective

Implement the CRM UI layer across the priority screens in `crm/app` using the approved UI documentation as the controlling reference.

## Source Of Truth

Sprint 5 implementation must follow these docs in order:

1. [FRONTEND_IMPLEMENTATION_TASKS.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/FRONTEND_IMPLEMENTATION_TASKS.md)
2. [FRONTEND_SPRINT_CHECKLIST.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/FRONTEND_SPRINT_CHECKLIST.md)
3. [Design.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/Design.md)
4. [UI_KIT.md](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/sprints/sprint_05/ui/UI_KIT.md)

If route code, older sprint planning, and UI docs disagree on presentation, the UI docs win unless PM and CTO approve a deviation.

## PM Summary

- Sprint 5 exists to turn the working CRM into a coherent product UI instead of a collection of functional screens.
- Scope should stay on shell, tokens, shared primitives, screen implementation, RTL, and mobile acceptance.
- Sprint 5 should not absorb new business modules or backend scope that belongs to the later opportunities and reporting slice.
- The priority is a usable, consistent, bilingual interface on desktop and iPhone-width layouts.

## CTO Summary

- Sprint 5 should build on the existing Next.js route structure and CRM feature modules rather than re-architect them.
- Shared tokens, shell primitives, and reusable screen sections should be introduced before heavy route-by-route restyling.
- UI work must preserve RBAC, i18n, validation, and current mutation behavior from earlier sprints.
- Route components should consume a narrow primitive layer and avoid one-off visual logic when a shared pattern already exists.
- Any DB-backed record picker should use a consistent live-search pattern rather than route-local static selects.

## Sprint 5 Deliverables

- token alignment with the approved CRM UI direction
- shared app shell aligned with the UI docs
- shared primitive layer for cards, KPI blocks, filters, tables, status chips, summary headers, timelines, and quick-add surfaces
- updated login screen
- updated dashboard
- updated companies list
- updated company detail
- updated contacts list
- updated tasks view
- updated quick-add interaction flow
- updated import review screen
- bilingual, RTL-safe, and mobile-safe verification across the priority screens
- standardized live-search behavior for all DB-backed record pickers on the implemented screens

Current completion note:

- login, dashboard, companies, contacts, tasks, company detail, quick-add interaction, and import review are implemented
- the implemented phone UI has been reviewed against the Stitch mobile work and corrected toward the approved warm layered surface system
- the remaining work is now the last responsive parity screens plus final hardening

## Main Carry-Ins

- Sprint 1 provides auth, locale handling, shell baseline, and deployment
- Sprint 2 provides import-review data structures and admin review flows
- Sprint 3 provides companies, contacts, search, and table-first record patterns
- Sprint 4 provides interactions, follow-ups, and activity surfaces that the new UI layer must preserve

## Dependencies

- the docs in `crm/docs/sprints/sprint_05/ui` remain the implementation baseline for Sprint 5
- PM and CTO approve any intentional deviation from the UI docs
- Sprint 4 residual quick-add or mobile behavior is either reused directly or folded into the Sprint 5 UI pass without changing business rules

## Definition Of Done

- the priority screens listed in Sprint 5 UI docs are implemented in code against the approved UI direction
- shell, cards, buttons, filters, chips, and tables read from shared tokens and primitives
- English and Hebrew layouts both render correctly
- RTL mirroring is safe on the implemented screens
- required mobile flows work without horizontal scroll
- any deviation from the UI docs is documented and approved
- repo verification commands pass, or blockers are documented explicitly

## Latest Validation Snapshot

- latest delivered slice commit: `feb1b9d`
- passed: `npm run lint`
- passed: `npm run typecheck`
- passed: `npm test`
- passed: `npm run build`
- remaining validation work is tied to unfinished Sprint 5 scope, not current repo gate failures

## Linked Sprint Docs

- [[sprints/sprint_05/reviews/sprint_05_review|Sprint 05 Review]]
- [[sprints/sprint_05/todo/sprint_05_todo|Sprint 05 Todo]]

## Related

- [[ROADMAP|Roadmap]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
- [[sprints/sprint_05/ui/FRONTEND_IMPLEMENTATION_TASKS|Frontend Implementation Tasks]]
