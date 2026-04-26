---
tags:
  - crm
  - sprint
  - sprint-17
  - todo
  - dev-handoff
aliases:
  - Sprint 17 Todo
  - CRM Sprint 17 Todo
created: 2026-04-26
updated: 2026-04-26
---

# Sprint 17 Todo — CTO Handoff To DEV

Parent: [[sprints/sprint_17/sprint_17_index|Sprint 17 Index]]

## Status

Planned and handed off by CTO on 2026-04-26.
Founder approved handoff to DEV with cheap subagents on 2026-04-26.
DEV implementation complete on 2026-04-26.
Sprint ready for QA.

## Scope Slice In This Handoff

- included:
  - shared CSV/XLSX export service
  - export routes/actions for core CRM list modules
  - export controls on list pages
  - filtered-result export
  - selected-row export where list selection exists
  - EN/HE label and date formatting
- excluded:
  - admin configuration list export
  - scheduled or emailed exports
  - provider sync
  - analytics/BI redesign

## Technical Guardrails

- server must re-query data using submitted filters; do not trust client rows
- current session/auth helpers remain permission authority
- export must not bypass `viewer` read-only constraints or expose admin-only data
- CSV must include UTF-8 BOM for Hebrew compatibility
- Excel output must be real `.xlsx`, not renamed CSV
- export columns must be explicit per module
- keep row limits or streaming strategy clear before enabling very large exports
- use `crm/app/src/app/api/exports/route.ts` as the single download endpoint
- use existing `xlsx` dependency; do not add another spreadsheet package unless blocked
- existing companies export is client-side CSV in `crm/app/src/components/ui/company-table.tsx`; replace or route it through the shared server export path

## Execution Order

1. [x] `DEV-1701` Define shared export contract and per-list column maps
2. [x] `DEV-1702` Add CSV and XLSX generation utilities using existing `xlsx`
3. [x] `DEV-1703` Add `/api/exports` server endpoint with auth, filters, selected IDs
4. [x] `DEV-1704` Wire companies export to new shared path and preserve Sprint 15 behavior
5. [x] `DEV-1705` Add contacts export
6. [x] `DEV-1706` Add interactions export
7. [x] `DEV-1707` Add tasks and opportunities export for full core-list coverage
8. [x] `DEV-1708` Add UI controls, loading/error states, and translations
9. [ ] `QA-1701` Run automated and manual export verification gate

## DEV Task Detail

### DEV-1701 — Export contract

**Files likely touched:**

- `crm/app/src/lib/export/*`
- `crm/app/src/lib/data/crm.ts`

**Do:**

- define supported modules: `companies`, `contacts`, `interactions`, `tasks`, `opportunities`
- define column metadata: key, localized header, value formatter
- keep CSV/XLSX rows generated from same normalized records

**Acceptance:**

- adding a module needs column map + query adapter only
- TypeScript prevents unsupported module names

### DEV-1702 — File generation

**Files likely touched:**

- `crm/app/package.json`
- `crm/app/src/lib/export/*`

**Do:**

- use existing `xlsx` dependency
- generate CSV with UTF-8 BOM
- generate `.xlsx` workbook with localized sheet name
- sanitize filename and include module + date

**Acceptance:**

- Hebrew opens correctly in Excel/Sheets
- CSV and XLSX contain same rows/columns

### DEV-1703 — Server endpoint

**Files likely touched:**

- `crm/app/src/app/api/exports/route.ts`
- `crm/app/src/lib/auth/session.ts`

**Do:**

- require authenticated session
- accept module, format, locale, filters, optional selected IDs
- re-run matching list query server-side
- return correct content type and attachment filename

**Acceptance:**

- unauthenticated requests fail or redirect safely
- invalid module/format rejected
- submitted selected IDs cannot export records outside current module/filter contract
- route mirrors existing API auth pattern from `crm/app/src/app/api/imports/batches/route.ts`

### DEV-1704 to DEV-1707 — Module wiring

**Do:**

- companies: migrate existing CSV export to shared implementation
- contacts: include name, company, role, primary email, primary phone, notes-safe fields
- interactions: include date, contact, company, type, outcome, subject, summary
- tasks: include due date, company, contact, type, priority, status, notes
- opportunities: include company, contact, name, stage, type, status, estimated value, target close date

**Acceptance:**

- each list exports current filters
- selected export works where row selection exists
- no module leaks internal IDs unless needed for audit/debug
- current `CompanyTable` client CSV data URL is removed or no longer used as primary export path

### DEV-1708 — UI and translations

**Files likely touched:**

- list page files under `crm/app/src/app/[locale]/(protected)/*/page.tsx`
- `crm/app/src/components/ui/company-table.tsx`
- optional shared export button/menu component under `crm/app/src/components/ui/`
- shared UI component if created
- locale message files

**Do:**

- add compact export menu/control to each list toolbar
- provide CSV and Excel options
- show clear disabled/empty state
- preserve mobile layout and RTL alignment

**Acceptance:**

- export controls are easy to find but do not crowd primary create/filter actions
- EN/HE text fits on mobile

## Verification Expectations

- run: `npm run typecheck`
- run: `npm run lint`
- run: `npm run test`
- run: `npm run build`
- manual export checks:
  - companies CSV/XLSX
  - contacts CSV/XLSX
  - interactions CSV/XLSX
  - tasks CSV/XLSX
  - opportunities CSV/XLSX
- manual filter checks:
  - search filter
  - lookup filters
  - selected rows where available
- manual locale checks:
  - English filenames/headers/dates
  - Hebrew filenames/headers/dates
  - Hebrew CSV opens without mojibake
- role checks:
  - `viewer`: can export readable list data only
  - `editor`: same read export plus existing edit permissions unchanged
  - `admin`: no regression on admin access

## Risks / Blockers

- current companies export may be client-side; migrating it could affect Sprint 15 behavior
- large exports can hit runtime memory/time limits if row count grows
- Hebrew CSV compatibility needs explicit BOM validation
- selected-row behavior is only available on pages with selection UI unless selection is added

## Verification Evidence (DEV / CTO, 2026-04-26)

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test` (`48/48`)
- [x] `npm run build`
- [x] signed-out export request denied with `403`
- [ ] manual export checks on all five modules
- [ ] manual EN/HE spreadsheet open checks

## [DEV] Visible Start

- sprint: Sprint 17
- approved build scope: universal list export to CSV/XLSX
- first implementation action:
  - inspect existing companies export component,
  - then build shared export contract under `crm/app/src/lib/export/`
