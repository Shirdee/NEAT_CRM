---
tags:
  - crm
  - sprint
  - sprint-08
  - dev
  - handoff
  - subagents
aliases:
  - Sprint 08 DEV Subagents
  - CRM Sprint 08 DEV Subagents
created: 2026-04-14
updated: 2026-04-14
---

Source: [[sprints/sprint_08/todo/sprint_08_todo|Sprint 08 Todo]]

# Sprint 08 DEV Subagents

## Purpose

Launch-ready DEV briefs for every Sprint 8 task with explicit model choice, dependency order, and guardrails.

## Launch Rules

- Sprint 7 QA closeout and PM closure remain the execution gate for Sprint 8 feature work
- subagents may inspect files and prepare patches now, but should not merge Sprint 8 feature work before the gate clears
- keep one task owner per ticket to avoid overlap
- if a task changes a shared contract, downstream tickets must re-read the merged source before coding

## Model Routing

- use `gpt-5.4` with `medium` reasoning for shared contracts, public-ingress risk, commit-safety, and final hardening
- use `gpt-5.4` with `low` reasoning for routine implementation that spans multiple modules
- keep escalation explicit if failing checks or ambiguous boundaries force a stronger pass

## Execution Order

1. `DEV-801`
2. `DEV-802` and `DEV-803` after `DEV-801`
3. `DEV-804` after `DEV-802` and `DEV-803`
4. `DEV-805` after `DEV-804`
5. `DEV-806` after `DEV-801` through `DEV-805`

## Subagent Briefs

### DEV-801

- model: `gpt-5.4`
- reasoning: `medium`
- why: shared staged-intake contract, repository boundary, and non-destructive coexistence are irreversible enough to justify the stronger pass
- depends on: Sprint 7 closeout; founder decisions may remain partial, but no hidden assumptions on source metadata or review-state shape
- first files: `crm/app/src/lib/import/types.ts`, `crm/app/src/lib/import/repository.ts`, `crm/app/src/lib/import/workbook.ts`, related import tests
- deliverable: one typed staged-intake contract and repository write path that both structured re-import and website intake can consume without clearing prior staged history
- guardrails: no direct production writes; no UI work; no queue, cron, or paid-service additions; document any blocker if the current single-batch behavior cannot be made non-destructive safely
- launch prompt:

```text
Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-801 only. Ownership: define the shared staged-intake contract and repository path for controlled inbound lead ingestion, likely in crm/app/src/lib/import/** plus focused tests. Context: Sprint 8 execution is gated on Sprint 7 QA closeout and PM closure. You may prepare and implement the contract path only if you can keep it staged-only, non-destructive, and compatible with current import review behavior; otherwise stop at the safe boundary and report the blocker clearly. Deliverables: typed intake contract, source metadata shape, review-state compatibility, repository path that does not clear prior staged history, focused tests where practical, and concise outcome plus changed files.
```

### DEV-802

- model: `gpt-5.4`
- reasoning: `low`
- why: this is routine implementation after `DEV-801`, but it still crosses validation, batch creation, and admin import staging behavior
- depends on: merged `DEV-801`
- first files: `crm/app/src/lib/import/workbook.ts`, `crm/app/src/app/api/imports/batches/route.ts`, `crm/app/src/app/api/imports/batches/[batchId]/stage/route.ts`, import tests
- deliverable: structured CSV or Excel re-import routed through the shared intake path with explicit file-shape validation and safe partial-row handling
- guardrails: reuse the existing admin review workflow; no new review model; no website endpoint work in this ticket
- launch prompt:

```text
Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-802 only. Ownership: extend structured CSV or Excel re-import through the shared staged-intake contract defined in DEV-801, likely under crm/app/src/lib/import/** and crm/app/src/app/api/imports/** plus focused tests. Read the merged DEV-801 contract before coding. Deliverables: approved file-shape validation, staging-path reuse, safe partial invalid-row handling, duplicate and review-state compatibility, and concise outcome plus changed files. Guardrails: do not add website intake behavior, do not invent a separate review workflow, and do not bypass staged review.
```

### DEV-803

- model: `gpt-5.4`
- reasoning: `medium`
- why: public or semi-public ingress, validation, and abuse-conscious handling are the highest-risk app-facing slice in Sprint 8
- depends on: merged `DEV-801`; founder field allowlist should be honored strictly
- first files: likely `crm/app/src/app/api/**`, shared intake validation helpers, intake repository tests
- deliverable: narrow website lead intake endpoint that validates an allowlisted payload, tags source metadata, and writes staged-only records for admin review
- guardrails: no admin review UI edits; no direct production writes; no unsupported anti-abuse vendor additions; stop if the current stack cannot provide a safe minimal public-ingress path
- launch prompt:

```text
Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-803 only. Ownership: website lead intake staging endpoint design and implementation, likely under crm/app/src/app/api/** plus any minimal shared validation files you need, but do not edit admin review UI files. Context: Sprint 8 execution is gated on Sprint 7 QA closeout and PM closure. You may implement the endpoint and validation path only if you can keep it strictly staged, allowlist-based, and review-gated; otherwise prepare the patch cleanly and stop at the safe boundary. Deliverables: narrow website intake path with strict validation, source tagging, basic abuse-conscious handling that fits the current stack, staged-only writes, focused tests where practical, and concise outcome plus changed files.
```

### DEV-804

- model: `gpt-5.4`
- reasoning: `medium`
- why: this ticket owns review-state visibility, duplicate decisions, and commit confirmation on admin surfaces
- depends on: merged `DEV-802` and `DEV-803`
- first files: `crm/app/src/app/[locale]/(protected)/admin/imports/**`, shared review-state and commit helpers, related UI tests if present
- deliverable: admin inbound review and commit UX that exposes source labels, review states, duplicate choices, and explicit commit outcomes
- guardrails: preserve current RBAC; do not add automation or silent downstream writes; align with the final merged intake contract instead of redefining it in the UI layer
- launch prompt:

```text
Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-804 only. Ownership: admin inbound review and commit UX for staged inbound records, likely under crm/app/src/app/[locale]/(protected)/admin/imports/** plus any minimal shared review helpers. Read the merged DEV-801, DEV-802, and DEV-803 boundaries before coding. Deliverables: staged inbound queue or list updates, visible source labels, explicit review states, duplicate attach-versus-create decisions, confirmation before commit, concise outcome, and changed files. Guardrails: no direct public-ingress work in this ticket, no automation, and no hidden production writes.
```

### DEV-805

- model: `gpt-5.4`
- reasoning: `low`
- why: this is downstream workflow wiring once commit behavior is settled, but it still touches CRM entities and traceability
- depends on: merged `DEV-804`
- first files: commit mapping and CRM workflow modules touched by import commit outcomes
- deliverable: committed inbound records land in the correct company, contact, and minimal follow-up paths while preserving source traceability
- guardrails: no silent unsupported automation; no ownership-model expansion; preserve auditability from staged source to committed entity
- launch prompt:

```text
Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-805 only. Ownership: connect approved inbound commit outcomes to the existing CRM workflows, likely in commit-mapping and downstream company/contact/follow-up modules, with minimal tests where practical. Read the merged DEV-804 commit behavior first. Deliverables: correct entity linking for approved inbound records, preserved source traceability, minimal downstream affordances needed for existing workflows, concise outcome, and changed files. Guardrails: no new automation engine, no ownership-model expansion, and no hidden side effects beyond the approved commit path.
```

### DEV-806

- model: `gpt-5.4`
- reasoning: `medium`
- why: final hardening crosses regression, public-ingress safety, permissions, and build confidence
- depends on: merged `DEV-801` through `DEV-805`
- first files: changed tests plus any fragile import, review, role, and build surfaces
- deliverable: Sprint 8 verification and hardening pass with repo checks, targeted regression fixes, and explicit remaining risks if any command cannot pass
- guardrails: keep fixes narrow; no opportunistic refactors; if failures reveal architecture drift, stop and escalate instead of patching around it silently
- launch prompt:

```text
Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-806 only. Ownership: verify, harden, and regress Sprint 8 across the changed intake, review, permissions, and workflow surfaces. Read the merged Sprint 8 changes first. Deliverables: focused hardening fixes as needed, execution of npm run lint, npm run typecheck, npm test, and npm run build when possible, concise verification outcome, blockers if any command fails or cannot run, and changed files. Guardrails: keep fixes minimal, do not reopen feature scope, and escalate rather than hiding contract or security issues.
```

## PM Follow-Up

- when a DEV subagent finishes, PM should update Sprint 8 task state in [[sprints/sprint_08/todo/sprint_08_todo|Sprint 08 Todo]]
- if `DEV-801` changes the contract materially, PM should request a short CTO confirmation before `DEV-802` to `DEV-804` continue

## Related

- [[sprints/sprint_08/sprint_08_index|Sprint 08 Index]]
- [[sprints/sprint_08/todo/sprint_08_todo|Sprint 08 Todo]]
- [[sprints/sprint_08/reviews/sprint_08_review|Sprint 08 Review]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
