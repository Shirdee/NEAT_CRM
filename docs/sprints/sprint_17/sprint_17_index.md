---
tags:
  - crm
  - sprint
  - sprint-17
  - export
  - cto
aliases:
  - Sprint 17 Index
  - CRM Sprint 17 Index
created: 2026-04-26
updated: 2026-04-26
---

# Sprint 17 Index — Universal List Export

Parent: [[sprints/README|CRM Sprints]]

## Status

**DEV IMPLEMENTATION COMPLETE / QA READY — 2026-04-26**

## Objective

Add export to CSV and Excel from every core CRM list, starting from the user's request:

- contacts
- companies
- interactions

Sprint scope generalizes this to all core list modules so export behavior is consistent.

## Scope

- add reusable export backend for CSV and Excel
- support export from core list pages:
  - companies
  - contacts
  - interactions
  - tasks
  - opportunities
- export the current filtered list, not hidden/unrelated records
- support selected rows where selection exists; otherwise export the filtered result set
- preserve localized labels and dates for EN/HE
- enforce current CRM auth and role rules server-side

## Non-Scope

- no scheduled exports
- no emailed exports
- no external provider sync
- no BI/reporting warehouse
- no export from admin-only configuration lists unless separately approved
- no import redesign

## CTO Decisions

- use server-generated downloads, not client-only table scraping
- create one shared export module with per-list column definitions
- CSV and Excel must share the same row mapping contract
- keep filters as source of truth; export route/action must re-run list queries server-side
- include UTF-8 BOM for CSV so Hebrew opens correctly in Excel
- use `.xlsx` for Excel output
- use one authenticated `/api/exports` GET endpoint for downloads
- reuse existing `xlsx` dependency already present in the app

## Done When

- each core list exposes export controls for CSV and Excel
- exported files match visible filters and selected rows where supported
- Hebrew text opens correctly in CSV and Excel
- unauthorized users cannot export data outside normal read access
- quality gates pass: typecheck, lint, tests, build

## Implementation Handoff

DEV handoff lives in [[sprints/sprint_17/todo/sprint_17_todo|Sprint 17 Todo]].

## DEV Delivery Update (2026-04-26)

- universal `/api/exports` route delivered
- shared export module delivered for:
  - companies
  - contacts
  - interactions
  - tasks
  - opportunities
- CSV export includes UTF-8 BOM
- Excel export uses real `.xlsx`
- list pages now expose CSV and Excel export controls
- existing companies client-only CSV export moved to server export path
- spreadsheet formula hardening added for exported user text

## Verification Evidence (DEV / CTO, 2026-04-26)

- `npm run typecheck` pass
- `npm run lint` pass
- `npm run test` pass (`48/48`)
- `npm run build` pass

Pending QA:

- manual CSV/XLSX download check on EN/HE routes
- manual filtered export check
- manual Hebrew file open check in spreadsheet app

## PM Smoke Update (2026-04-26)

- unauthenticated `/api/exports` request returns `403`
- full CSV/XLSX download QA still needs an authenticated Clerk user session

## Related

- [[sprints/sprint_17/todo/sprint_17_todo|Sprint 17 Todo]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[PERMISSIONS|Permissions]]
- [[sprints/sprint_15/sprint_15_index|Sprint 15 Index]]
