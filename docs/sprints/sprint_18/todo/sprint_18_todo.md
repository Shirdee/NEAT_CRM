---
tags:
  - crm
  - sprint
  - sprint-18
  - todo
  - cto-handoff
aliases:
  - Sprint 18 Todo
  - CRM Sprint 18 Todo
created: 2026-04-26
updated: 2026-04-26
---

# Sprint 18 Todo — CTO Handoff To DEV

Parent: [[sprints/sprint_18/sprint_18_index|Sprint 18 Index]]

## Status

DEV implementation completed on 2026-04-26. QA closeout is partial until authenticated Clerk role/export smoke is run.

## Scope Slice

- close Clerk and export QA carryover
- improve interaction entry speed
- improve dashboard-to-worklist navigation
- improve follow-up close/log flow
- remove duplicate contact edit action

## Technical Guardrails

- keep Clerk as identity source and CRM database as role/audit source
- keep current `admin`, `editor`, `viewer` permissions
- preserve server-side auth checks for exports and mutations
- no new external services
- keep EN/HE translations complete
- touched mobile and RTL layouts must be checked
- use existing form/action/data patterns before adding abstractions

## Execution Order

1. [~] `QA-1801` Run Clerk closeout sweep
2. [~] `QA-1802` Run export closeout sweep
3. [x] `DEV-1801` Interaction form auto-fills company from contact
4. [x] `DEV-1802` Interaction form can create one-week follow-up inline
5. [x] `DEV-1803` Dashboard KPI boxes link to filtered lists
6. [x] `DEV-1804` Follow-up supports another-email context
7. [x] `DEV-1805` Close follow-up as meeting and create/log future meeting interaction
8. [x] `DEV-1806` Remove duplicate contact edit button
9. [x] `QA-1803` Final regression gate

## DEV Task Detail

### QA-1801 — Clerk Closeout

Check:

- EN and HE login routes
- sign-in and sign-out
- `admin`, `editor`, `viewer`
- protected route redirects
- mobile width and RTL layout
- local/preview/prod env wiring if available

Record pass/fail in this sprint doc.

Result:

- EN/HE login routes and signed-out protected redirects passed in earlier Sprint 18 closeout work.
- Full role sweep still needs live authenticated Clerk sessions for `admin`, `editor`, and `viewer`.

### QA-1802 — Export Closeout

Check CSV and XLSX for:

- companies
- contacts
- interactions
- tasks
- opportunities

Also check filters, selected rows where supported, Hebrew headers/text, and signed-out denial.

Result:

- Signed-out export denial passed in earlier Sprint 18 closeout work.
- Full authenticated CSV/XLSX smoke still needs a live authenticated session.

### DEV-1801 — Contact Select Updates Company

Likely surfaces:

- interaction new/edit form
- contact picker component
- interaction server action validation

Behavior:

- when a contact with a company is selected, fill the company field
- user can still override or clear company where current model allows
- no stale company remains after changing contact

### DEV-1802 — Auto Follow-Up Checkbox

Behavior:

- add checkbox in interaction form
- default creates follow-up due seven local days after interaction date or now
- do not open the follow-up form
- created task links back to interaction/contact/company
- validation and errors stay in the interaction submit flow

### DEV-1803 — Dashboard KPI Click-Through

Behavior:

- overdue/today/upcoming KPI cards link to matching task lists
- meeting/lead KPI cards link to matching list/report where available
- preserve existing dashboard visual layout
- links must work in EN/HE

### DEV-1804 — Another Email Context

Behavior:

- follow-up can store/select another email context when it is not the primary contact email
- show this context in list/detail where helpful
- do not add email sending

### DEV-1805 — Close Follow-Up As Meeting

Behavior:

- close action can mark reason as meeting
- user provides future meeting time
- system creates or logs a meeting interaction linked to the same company/contact
- original follow-up closes with clear audit trail

### DEV-1806 — Contact Edit Cleanup

Behavior:

- remove duplicate edit contact button from contact detail
- keep the top primary edit action
- no layout shift on mobile/RTL

## Verification Expectations

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test -- --run`
- [x] `npm run build`
- [~] manual EN/HE smoke for touched flows
- [~] mobile width smoke for touched flows
- [~] signed-out access check for protected/export flows

## Risks / Blockers

- Clerk role sweep needs usable test accounts
- export QA needs authenticated Clerk session and sample data
- database migration adds optional `Task.followUpEmail` and close reason `meeting`
- close-as-meeting uses local meeting time from the close form
