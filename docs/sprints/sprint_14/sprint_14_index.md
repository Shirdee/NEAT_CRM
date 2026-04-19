---
tags:
  - crm
  - sprint
  - sprint-14
  - ui
  - cto
aliases:
  - Sprint 14 Index
  - CRM Sprint 14 Index
created: 2026-04-19
updated: 2026-04-19
---

# Sprint 14 Index — UI Redesign Focused Clarity

Parent: [[sprints/README|CRM Sprints]]

## Status

**READY FOR DEV — 2026-04-19**

## Scope (Approved)

- full desktop shell redesign to dark ink sidebar
- dashboard, tasks, companies, company detail, opportunities redesign to match `docs/ui-mockup.html`
- interactions, contacts, reports, admin pages styling alignment
- login page visual redesign
- no backend or API changes

## Non-Scope (Hard Guardrails)

- no server action behavior changes
- no Prisma query/data model changes for feature behavior
- no routing/auth/middleware/i18n config changes
- no role gate relocation (`canEditRecords`, `canManageAdminLists` stay in place)
- no desktop-mobile behavior swap; mobile bottom nav remains

## CTO Notes

- source package incomplete: no dedicated sprint-14 review doc and no pre-existing sprint-14 todo doc were found
- source of truth used: `sprints/sprint_14/SPRINT_14_UI_REDESIGN.md` + `ARCHITECTURE.md` + `PRD.md` + `DECISIONS.md`
- implementation handoff lives in [[sprints/sprint_14/todo/sprint_14_todo|Sprint 14 Todo]]

## Done When

- all screens in sprint scope visually match approved mockup at route level
- typecheck, lint, tests, and build pass
- RTL/Hebrew and mobile behavior remain correct
- role-based action visibility unchanged

## Related

- [[sprints/sprint_14/SPRINT_14_UI_REDESIGN|Sprint 14 UI Redesign Spec]]
- [[sprints/sprint_14/todo/sprint_14_todo|Sprint 14 Todo]]
- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[DECISIONS|Decisions]]
