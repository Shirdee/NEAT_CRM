---
tags:
  - crm
  - sprint
  - sprint-13
  - auth
  - cto
aliases:
  - Sprint 13 Index
  - CRM Sprint 13 Index
created: 2026-04-16
updated: 2026-04-16
---

# Sprint 13 Index — Login And User Access

Parent: [[sprints/README|CRM Sprints]]

## Status

**PLANNED — 2026-04-16**

Sprint 13 focuses on login cleanup and admin user access control.
This sprint keeps credentials auth as primary path.

## Objective

Ship production-ready login defaults and an admin-managed user access flow.

## Scope

- remove debug/demo login defaults from UI copy and form behavior
- set seeded admin login to `ShirAdmin` with password `shir1994`
- support login by username or email
- add admin user-management screen to create users and toggle account activation
- document Microsoft auth boundary and keep it as planned follow-up

## Out Of Scope

- replacing credentials auth with OAuth-only login
- automatic Microsoft directory sync or SCIM
- role model changes beyond current `admin`, `editor`, `viewer`

## Definition Of Done

- no debug/demo credentials shown in login UI
- seeded admin credentials match founder request
- admin can add users from app UI and control active/inactive state
- user role and locale assignment is set during user creation
- Microsoft auth next-step is documented with explicit approval gate
- lint, typecheck, and targeted tests pass

## Linked Sprint Docs

- [[sprints/sprint_13/todo/sprint_13_todo|Sprint 13 Todo]]
- [[sprints/open_tasks|Open Tasks]]

## Related

- [[DECISIONS|Decisions]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
- [[CODEX|CRM Context]]
