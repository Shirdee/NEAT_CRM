---
tags:
  - crm
  - sprint
  - sprint-08
  - planning
  - pm
  - cto
aliases:
  - Sprint 08 Index
  - CRM Sprint 08 Index
created: 2026-04-14
updated: 2026-04-14
---

# Sprint 08 Index

## Status

Sprint 8 planning and CTO technical handoff were opened on 2026-04-14.
Sprint 8 is approved as the next planning slice after Sprint 7 implementation completion.
Sprint 8 implementation is complete in the repository as of 2026-04-14.
Sprint 8 is ready for QA and PM closeout.

## Objective

Extend the CRM into a controlled intake system by adding safe lead ingestion and re-ingestion paths that reuse the existing import, normalization, deduplication, and RBAC foundations without introducing mailbox sync, calendar sync, automation, or paid services.

## PM Summary

- Sprint 8 should open the first controlled integration wave without expanding into full external sync.
- The highest-value next move is reducing manual lead-entry and re-import friction while keeping the current operating model trustworthy.
- The sprint should favor intake channels that fit the existing stack and admin review patterns before any Gmail, Outlook, or calendar coupling is attempted.
- Sprint 8 should stay constrained to controlled ingress, review, and commit workflows rather than becoming a broad integration program.

## CTO Summary

- Sprint 8 should reuse the current Next.js, Prisma, import staging, duplicate review, and RBAC paths instead of creating a separate ingestion subsystem.
- The first integration wave should normalize all inbound records through one typed intake contract so website submissions and structured re-imports do not fork business rules.
- Public or semi-public intake must be rate-limited, validated, and routed into explicit review states before production writes.
- Gmail sync, Outlook sync, calendar sync, and notification automation are deferred because they add external state, auth, and reconciliation risk before the intake contract is stable.

## Sprint 8 Deliverables

- a shared typed intake contract for controlled inbound lead data
- structured CSV or Excel re-ingestion that reuses the import review model
- a website lead-capture ingestion path that stages submissions instead of writing directly into production CRM entities
- admin review tooling that triages inbound staged records, duplicate candidates, and commit outcomes
- post-intake verification and regression coverage across import, duplicate safety, permissions, and bilingual behavior

## Main Carry-Ins

- Sprint 2 provides the workbook staging, normalization, issue tracking, and commit path that Sprint 8 should extend
- Sprint 3 provides company and contact workflows that inbound records must attach to safely
- Sprint 4 provides the workflow baseline for follow-up creation and interaction context after intake
- Sprint 6 provides reporting, dashboard, and launch-readiness baselines that Sprint 8 must not destabilize
- Sprint 7 provides the post-MVP optimization baseline and should close cleanly before Sprint 8 execution starts

## Dependencies

- Sprint 7 QA closeout and PM closure
- founder approval that Sprint 8 stays on controlled ingress and excludes mailbox and calendar sync
- founder approval of initial website lead fields and source attribution rules
- confirmation of the structured re-import file shape allowed in Sprint 8
- explicit agreement that all inbound data uses admin review before production commit

## Definition Of Done

- website and file-based inbound lead records enter the same staged review path
- admin users can review duplicate candidates and commit approved staged records safely
- inbound validation, localization, and duplicate behavior are explicit and testable
- no Sprint 8 surface bypasses server-side RBAC or writes unreviewed records directly into production entities
- repository verification targets pass, or any blocker is documented explicitly

## Linked Sprint Docs

- [[sprints/sprint_08/reviews/sprint_08_review|Sprint 08 Review]]
- [[sprints/sprint_08/todo/sprint_08_todo|Sprint 08 Todo]]
- [[sprints/sprint_08/dev_subagents|Sprint 08 DEV Subagents]]

## Related

- [[ROADMAP|Roadmap]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[DATA_MODEL|Data Model]]
- [[IMPORT_MAPPING|Import Mapping]]
