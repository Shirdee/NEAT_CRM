---
tags:
  - crm
  - sprint
  - sprint-02
  - todo
  - dev-handoff
aliases:
  - Sprint 02 Todo
  - CRM Sprint 02 Todo
---

# Sprint 02 Todo

## Status

Reviewed by PM and CTO.
This doc is the approved Sprint 2 handoff to DEV.
Updated on 2026-04-04 after QA and CTO review to reflect final implementation status and closeout approval.

## Sprint Goal

Build the workbook audit and import pipeline so admin users can stage, review, validate, and commit workbook-derived CRM data through a controlled flow.
Review alone is not enough: admins must be able to resolve flagged rows before final commit.

## Documentation Gate

- Sprint 2 index exists before implementation
- Sprint 2 review exists before implementation
- this Sprint 2 todo exists before implementation
- DEV should treat these docs as the current source of truth during execution

## DEV Task List

### DEV-201: Create Shared Import Foundation

- objective: create the shared Sprint 2 import module under `crm/app/src/lib`
- scope: import types, profiling contracts, normalization helpers, issue codes, duplicate helpers, batch summary helpers
- must include: one shared logic path for hosted and local fallback execution
- done when: shared import code can profile, validate, and prepare staged data without depending on page components

### DEV-202: Extend Persistence For Import Staging

- objective: persist staged import rows, issues, and summaries
- scope: Prisma schema updates if needed, repository APIs, fallback-store support
- must include: import batch lifecycle, staged row storage, issue persistence, review reads, and commit operations
- retention rule: keep only the current import batch in product behavior and do not preserve import history as an ongoing user-facing feature
- done when: batch data survives page reloads and can be reviewed before commit

### DEV-203: Implement Workbook Profiling

- objective: inventory workbook structure before allowing commit
- scope: sheet inventory, header capture, row counts, mixed-language detection, multi-value cell detection, mapping warnings
- must include: stored batch summary and visible review data
- done when: an admin can inspect a truthful pre-commit workbook profile from staged data

### DEV-204: Build Hosted Chunked Import Path

- objective: support browser parsing and server-side chunk staging
- scope: admin import entrypoint, client-side workbook parsing, chunk submission, batch creation, retry-safe chunk handling
- must include: no assumption of one large workbook upload to a single Vercel request, plus actionable error feedback when batch creation or staging fails
- done when: an admin can upload a workbook-like file and stage it in chunks for review

### DEV-205: Implement Validation And Duplicate Detection

- objective: surface cleanup issues before commit
- scope: normalization rules, lookup matching, invalid-data checks, orphan detection, duplicate candidate detection
- must include: raw imported text preservation, predictable issue codes, support for rows that depend on new companies introduced elsewhere in the same batch, founder-approved contact minimum requirements, and ignored row-number workbook columns
- done when: admins can review flagged rows and duplicate candidates before commit

### DEV-206: Build Admin Review And Commit Flow

- objective: provide an admin-only review screen and final commit path
- scope: batch summary, issue list, duplicate list, counts, commit action
- must include: created, updated, skipped, and flagged counts plus approval gating before commit
- done when: approved rows commit into production tables through the shared import pipeline

### DEV-206A: Add Manual Issue Resolution For Staged Rows

- objective: make import warnings and errors actionable inside the admin flow
- scope: row-level staged data edit form, lookup override controls, status refresh, validation rerun after save
- must include: editing only against staged import data, not direct writes into production tables
- done when: an admin can open a flagged row, change staged field values or mapping choices, save, and see updated validation results

### DEV-206B: Add Resolution-State UX Before Commit

- objective: prevent admins from getting stuck between warning visibility and final commit
- scope: row detail view, issue-to-field context, unsaved-changes protection, explicit ready-for-commit state after successful revalidation
- must include: clear separation between unresolved rows and rows that are ready
- done when: admins can tell which rows still need action and which rows are safe to commit

### DEV-206C: Add Manual Row Decision Controls

- objective: give admins explicit control over whether each staged row should proceed
- scope: mark-ready, skip-row, return-to-review state, operator-visible row decision state
- must include: decisions stored on staged records and enforced by commit logic
- done when: an admin can intentionally move rows between unresolved, ready, and skipped states without editing production data

### DEV-206D: Add Manual Mapping And Linking Controls

- objective: let admins resolve ambiguous imports without editing raw text blindly
- scope: entity-type override, lookup override, link-to-existing record selection, clear-link action
- must include: controls for duplicate candidates and ambiguous normalized values
- done when: an admin can pick the intended mapping outcome directly in the review flow

Status note:

- entity-type override is implemented
- attach-to-existing selection is implemented
- lookup override for flagged structured values is implemented

### DEV-206E: Add Manual Duplicate Resolution Controls

- objective: turn duplicate warnings into explicit operator decisions
- scope: keep-as-new, attach-to-existing, skip-duplicate-with-reason
- must include: staged-only decision storage and revalidation after decision changes
- done when: duplicate candidate rows can be resolved without hidden assumptions

### DEV-207: Add Local Fallback Path

- objective: provide a local admin-run import path for large workbook cases
- scope: script or command entrypoint that reuses shared import logic
- must include: the same validation and commit behavior as the hosted path
- done when: the repo has a documented fallback execution path for Hobby-limit edge cases

### DEV-209: Add Guided Import Support

- objective: reduce failed test runs and improve import onboarding
- scope: downloadable sample workbook, known-good sheet structure, and matching import-screen affordance
- must include: a sample file that exercises company, contact, interaction, and task sheets
- done when: an admin can download a sample workbook directly from the import screen and use it to test the staged import flow

### DEV-208: Verify And Harden

- objective: finish Sprint 2 with tests and regression checks
- scope: unit tests, repository tests, route protection checks, full repo verification commands
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 2 behavior is covered and the existing shell remains stable

Status note:

- code-level verification is passing
- Sprint 2 implementation closeout is approved
- real-workbook validation remains a production-readiness follow-up
- guided import support and clearer staging errors are implemented

## Recommended Execution Order

1. DEV-201 Create Shared Import Foundation
2. DEV-202 Extend Persistence For Import Staging
3. DEV-203 Implement Workbook Profiling
4. DEV-204 Build Hosted Chunked Import Path
5. DEV-205 Implement Validation And Duplicate Detection
6. DEV-206A Add Manual Issue Resolution For Staged Rows
7. DEV-206B Add Resolution-State UX Before Commit
8. DEV-206C Add Manual Row Decision Controls
9. DEV-206D Add Manual Mapping And Linking Controls
10. DEV-206E Add Manual Duplicate Resolution Controls
11. DEV-206 Build Admin Review And Commit Flow
12. DEV-207 Add Local Fallback Path
13. DEV-209 Add Guided Import Support
14. DEV-208 Verify And Harden

## Non-Scope Guardrails

- no queue system
- no blob storage
- no paid ETL services
- no Sprint 3 record management UI
- no automatic merge or overwrite rules beyond clearly approved safe defaults

## Definition Of Done

- import docs are present and aligned
- admin-only import flow is implemented
- staged rows, issues, and summaries are persisted
- duplicate candidates and validation issues are reviewable
- flagged rows can be edited and revalidated in staging
- row decision state is explicit and enforced
- mapping and duplicate resolution can be done manually in-product
- approved rows commit successfully
- hosted path is chunked and Hobby-safe by design
- fallback local path exists and reuses the same logic
- tests and repo checks pass

Current status against definition of done:

- satisfied: admin-only import flow, staged persistence, reviewable issues, staged editing, row decision state, manual mapping resolution UX, duplicate controls, commit gating, local fallback, sample workbook support, actionable staging errors, new-company creation support, founder-approved contact minimum requirements, ignored row-number columns, current-import-only behavior, tests, repo checks
- follow-up only: final QA validation with the real workbook before production use

## QA Targets For DEV

- docs match implementation
- admin can import; editor and viewer cannot
- admin can download a sample workbook and use it to exercise the import path
- profiling output is truthful
- invalid data is flagged predictably
- duplicate candidates are surfaced correctly
- dependent rows do not fail just because the referenced company is created later in the same batch
- contact rows fail only when the reduced required set is missing: name, company, and email or phone
- row-number workbook columns do not affect staged data or validation outcomes
- only the current import batch is surfaced in product behavior; old import history is not retained for normal use
- admins can edit flagged rows and rerun validation without losing batch state
- unresolved rows stay blocked from commit
- admins can manually link staged rows to existing records where needed
- admins can explicitly skip or approve staged rows
- duplicate resolution choices persist and affect final commit output correctly
- staging failures return usable error text in the UI
- commit counts are accurate
- Sprint 1 auth, admin lists, and locale flows still pass regression

## CTO To DEV Handoff

DEV should treat the following as the approved implementation direction for the remaining Sprint 2 slice:

1. keep all manual review state on staged import records
- no manual review action may mutate production tables before final commit

2. separate staged raw data from operator decisions
- raw field edits, mapping overrides, link decisions, duplicate decisions, and row state should be stored independently so validation can be rerun deterministically

3. revalidation must remain centralized
- every manual change should flow back through the shared import validation pipeline rather than adding page-level exception logic

4. commit must consume reviewed staged state, not re-infer everything from scratch
- rows marked skipped stay out
- rows marked ready are eligible for commit
- unresolved rows keep the batch blocked

5. prefer explicit controls over hidden automation
- if a choice is ambiguous, show it to the admin rather than silently choosing

## PM Closeout Note

Sprint 2 implementation is complete and approved.
PM may mark Sprint 2 closed for engineering scope.
Real-workbook validation should still happen before live production import use.

## Blockers And Approval Dependencies

- real workbook access is still needed for final production-shape validation
- founder approval is still required for any irreversible conflict-resolution policy

## Related

- [[sprints/sprint_02/sprint_02_index|Sprint 02 Index]]
- [[sprints/sprint_02/reviews/sprint_02_review|Sprint 02 Review]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[IMPORT_MAPPING|Import Mapping]]
