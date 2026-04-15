---
tags:
  - crm
  - sprint
  - sprint-12
  - copy
  - cto
aliases:
  - Sprint 12 Index
  - CRM Sprint 12 Index
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 12 Index — NEAT Copy Sweep

Parent: [[sprints/README|CRM Sprints]]

## Status

**PLANNED — 2026-04-15**

Sprint 12 prepares repo-wide user-facing copy cleanup.
Goal: product text sounds finished, calm, and evergreen.
Rule: no user-facing text should expose sprint numbers, QA language, internal delivery state, or "in progress" signals.

## Objective

Replace delivery-flavored UI text with stable product copy across app shell, route metadata, and translation bundles.

## NEAT Standard

NEAT copy should be:

- natural
- evergreen
- action-oriented
- tidy

## Hard Rules

- no `in progress` wording in user-facing copy
- no `Sprint X`, `WSX`, `QA`, `PM`, `DEV`, `founder`, `MVP`, `foundation`, or `cutover` clues in user-facing copy unless screen is explicitly internal-admin technical tooling
- no delivery-history phrasing such as `late fix`, `baseline`, `pre-implemented`, `phase`, or `closeout`
- keep meaning intact in both English and Hebrew
- preserve RTL-safe phrasing

## Scope

### Lane A — Translation Bundles

- audit `crm/app/src/messages/en.json`
- audit `crm/app/src/messages/he.json`
- rewrite delivery-flavored strings into evergreen product copy

### Lane B — Route Metadata

- audit app metadata titles and descriptions
- remove sprint-era labels such as `Foundation`

### Lane C — App Surface Sweep

- scan user-visible route and component text outside translation bundles
- fix any remaining sprint or status clues

### Lane D — Parity Review

- compare English and Hebrew meaning after rewrite
- verify no side leaks remain through placeholders, helper text, or restricted-state copy

## Initial Leak Set

- `crm/app/src/messages/en.json`
- `crm/app/src/messages/he.json`
- `crm/app/src/app/layout.tsx`

Known examples already found:

- `late QA fix`
- `Sprint 1 application shell`
- `Admin list foundation`
- `Focused MVP reporting views`
- `Sprint 2 imports and Sprint 3 CRM forms`

## Out Of Scope

- product naming changes
- new UX flows
- visual redesign
- doc cleanup outside user-facing app copy
- test names, seeds, env defaults, and internal code comments unless they surface in UI

## Definition Of Done

- user-facing English copy has no sprint or delivery clues
- user-facing Hebrew copy has no sprint or delivery clues
- metadata titles and descriptions read like shipped product copy
- search sweep finds no remaining banned phrases in user-facing app text
- lint, typecheck, and build pass after copy changes

## Linked Sprint Docs

- [[sprints/sprint_12/todo/sprint_12_todo|Sprint 12 Todo]]
- [[sprints/open_tasks|Open Tasks]]

## Related

- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[CODEX|CRM Context]]
