---
tags:
  - crm
  - sprint
  - sprint-18
  - ux
  - qa
aliases:
  - Sprint 18 Index
  - CRM Sprint 18 Index
created: 2026-04-26
updated: 2026-04-26
---

# Sprint 18 Index — Closeout QA And Daily UX

Parent: [[sprints/README|CRM Sprints]]

## Status

**DEV COMPLETE / QA PARTIAL — 2026-04-26**

## Objective

Close the remaining Clerk/export QA gates and ship small daily-use improvements from Notes.

## Carryover

- `QA-1601` Clerk manual closeout from Sprint 16
- `QA-1701` export manual closeout from Sprint 17

## Scope

- verify Clerk login, logout, roles, mobile, RTL, and env wiring
- verify CSV/XLSX exports for all core modules
- interaction form: auto-fill company from selected contact
- interaction form: optional auto-follow-up one week out
- dashboard KPI boxes click through to matching lists
- follow-ups: support another-email context
- follow-ups: close as meeting and create/log future meeting interaction
- contact view: remove duplicate edit contact button

## Shipped

- Clerk login crash fix and signed-out export denial check
- contact-to-company autofill, including locked-contact interaction entry
- optional interaction auto-follow-up due one week later
- clickable dashboard KPI cards
- follow-up email context field and task export column
- close follow-up as meeting with linked meeting interaction
- duplicate lower contact edit action removed

## Non-Scope

- no provider sync
- no email/calendar integration
- no automation builder
- no new analytics redesign
- no admin-list export

## Done When

- Clerk and export QA are recorded as pass or explicit blocker
- Notes-derived UX items are shipped
- EN/HE and mobile checks pass for touched flows
- quality gates passed: typecheck, lint, tests, build

## CTO Handoff

DEV handoff lives in [[sprints/sprint_18/todo/sprint_18_todo|Sprint 18 Todo]].

## Source Inputs

- [[sprints/open_tasks|Open Tasks]]
- [[Notes|Notes]]
- [[sprints/sprint_16/sprint_16_index|Sprint 16 Index]]
- [[sprints/sprint_17/sprint_17_index|Sprint 17 Index]]
