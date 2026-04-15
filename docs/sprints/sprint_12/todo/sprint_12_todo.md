---
tags:
  - crm
  - sprint
  - sprint-12
  - todo
  - cto
aliases:
  - Sprint 12 Todo
  - CRM Sprint 12 Todo
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 12 Todo

Parent: [[sprints/sprint_12/sprint_12_index|Sprint 12 Index]]

## Task Date Tracking

- added: `2026-04-15`

## Workstream A — English Copy Sweep

### DEV-1201 — Rewrite delivery-flavored English strings

**Files:**

- `crm/app/src/messages/en.json`

**Do:**

- replace sprint, QA, MVP, foundation, baseline, and rollout language
- keep product meaning same
- keep labels short

**Acceptance:**

- no user-facing delivery clues remain in English bundle

---

## Workstream B — Hebrew Copy Sweep

### DEV-1202 — Rewrite delivery-flavored Hebrew strings

**Files:**

- `crm/app/src/messages/he.json`

**Do:**

- mirror English cleanup in natural Hebrew
- keep RTL-safe, product-facing tone
- remove sprint, QA, and rollout clues

**Acceptance:**

- no user-facing delivery clues remain in Hebrew bundle
- English/Hebrew intent still matches

---

## Workstream C — Metadata + Surface Sweep

### DEV-1203 — Replace route metadata and stray UI copy

**Files:**

- `crm/app/src/app/layout.tsx`
- any other app file that contains user-visible sprint or status wording

**Do:**

- replace `CRM Foundation` / `Sprint 1 application shell` style metadata
- sweep route-local helper text and placeholders outside message bundles

**Acceptance:**

- metadata reads like finished product copy
- no stray sprint clues remain in app surface

---

## Workstream D — Verification

### QA-1201 — Copy leak gate

**Run:**

- search for banned delivery phrases in user-facing app files
- `npm run lint`
- `npm run typecheck`
- `npm run build`

**Banned examples for sweep:**

- `in progress`
- `Sprint `
- `QA`
- `MVP`
- `foundation`
- `late fix`
- `baseline`
- `cutover`

**Acceptance:**

- banned phrases removed from user-facing app text
- verification commands pass
