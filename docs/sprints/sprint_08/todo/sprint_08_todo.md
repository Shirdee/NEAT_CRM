---
tags:
  - crm
  - sprint
  - sprint-08
  - todo
  - dev
aliases:
  - Sprint 08 Todo
  - CRM Sprint 08 Todo
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 08 Todo

## Sprint Goal

Build the smallest useful integration foundation first. No live sync until the boundary is stable.

## Active Tasks

- [x] DEV-801: add a provider-agnostic integration boundary with tests
  - scope: create a small `integrations` module with provider ids, labels, enabled state, and normalization helpers
  - must include: unit tests for the boundary contract
  - must not include: live Gmail, Outlook, or calendar sync
  - done when: the app has a tested integration primitive ready for later provider work
  - status: completed in `crm/app/src/lib/integrations/index.ts` with tests and a read-only admin stub

- [ ] PM-802: confirm the first provider target
  - scope: choose email or calendar as the first real integration lane
  - must include: a short approval note in sprint docs

- [x] CTO-803: define permission and storage rules
  - scope: set the narrow config shape for future provider work
  - must include: explicit no-go boundaries for automation and paid infra
  - status: documented in `crm/docs/ARCHITECTURE.md` and `crm/docs/DECISIONS.md`

## Notes

- keep the first slice cheap and reversible
- do not let integration work widen into automation
- use the Sprint 7 closeout as the baseline for current app quality
- boundary work is now in place; only provider choice approval remains open
