---
tags:
  - crm
  - sprint
  - sprint-13
  - todo
  - pm
aliases:
  - Sprint 13 Todo
  - CRM Sprint 13 Todo
created: 2026-04-16
updated: 2026-04-16
---

# Sprint 13 Todo

Parent: [[sprints/sprint_13/sprint_13_index|Sprint 13 Index]]

## Task Date Tracking

- added: `2026-04-16`

## Execution List

- `DEV-1301` Login cleanup: remove debug/demo defaults and use username-or-email.
- `DEV-1302` Admin creds: set `ShirAdmin` / `shir1994` in seed paths + deployment note.
- `DEV-1303` Admin users: create user + role + locale + activate/deactivate in `/admin/users`.
- `CTO-1301` Microsoft auth boundary: keep as next-step decision, not current switch.
- `QA-1301` Gate: run `npx vitest run src/lib/data/repository.test.ts src/lib/auth/session.test.ts` and `npm run typecheck`.

## Acceptance

- no login debug/demo hints
- requested admin creds work
- admin user management is available in app
- verification commands are green
