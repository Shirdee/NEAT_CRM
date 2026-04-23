---
tags:
  - crm
  - ui
  - guide
aliases:
  - CRM UI
  - CRM UI Guide
created: 2026-04-09
updated: 2026-04-20
---

# CRM UI

## Current Focus

- Sprint 14 defined the redesign direction
- Sprint 15 hardened usability and consistency
- this note is the stable UI hub and rulebook for implementation and QA

## Start Here

- [Sprint 14 UI Redesign Spec](../sprints/sprint_14/SPRINT_14_UI_REDESIGN.md)
- [Sprint 14 Index](../sprints/sprint_14/sprint_14_index.md)
- [Sprint 15 Index](../sprints/sprint_15/sprint_15_index.md)
- [Sprint 15 Todo](../sprints/sprint_15/todo/sprint_15_todo.md)

## Active UI Directives

### Global Spacing and Frame

- all protected pages must keep consistent outer margins/padding
- maintain clear padding between page frame and content boxes/cards
- avoid crowded edge-to-edge layouts unless explicitly required

### Readability and Contrast

- no low-contrast text on similar backgrounds
- avoid white text on light cards or panels
- use higher contrast defaults for titles, labels, and secondary text

### Controls and Components

- buttons in the same action row should use consistent visual size and corner radius
- keep corner rounding consistent across cards, inputs, and action controls
- all dropdown/list-select fields should support live search where practical
- selected value in live-search dropdowns must persist after blur/click-outside

### List and Detail Consistency

- list pages should follow the stronger "Companies" readability pattern, not the denser "Contacts" pattern
- keep row spacing, typography hierarchy, and action affordances consistent across list modules
- in contacts views, present company near role/title where both appear
- in interactions views, keep expand/collapse affordance compact and explicit

### Dashboard Rules

- activity and recent interactions rows: first line should be person + company, not subject
- subject should appear on the second line
- cards/widgets must keep proper corners and padding
- dashboard headings should not use low-contrast white text on light backgrounds

## QA Gate (UI)

- verify spacing and contrast in local preview before commit
- verify dropdown selection persistence on click-outside/blur
- verify list-page consistency across companies/contacts/interactions/tasks/opportunities
- do not deploy to vercel as part of routine UI fix loops unless explicitly requested

## Related

- [CRM Home](../README.md)
- [CRM Sprints](../sprints/README.md)
- [Sprint 14 UI Redesign Spec](../sprints/sprint_14/SPRINT_14_UI_REDESIGN.md)
- [Roadmap](../ROADMAP.md)
