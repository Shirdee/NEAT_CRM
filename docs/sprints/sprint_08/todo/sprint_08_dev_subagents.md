---
tags:
  - crm
  - sprint
  - sprint-08
  - todo
  - cto
  - dev-handoff
aliases:
  - Sprint 08 DEV Subagents
  - CRM Sprint 08 DEV Subagents
created: 2026-04-14
updated: 2026-04-14
---

# Sprint 08 DEV Subagents

## Status

Prepared by CTO on 2026-04-14.
Use these packets to open one DEV thread per Sprint 8 task.
No Sprint 8 feature thread should start implementation until Sprint 7 QA closeout and PM closure are complete.

## Model Policy

- default Sprint 8 implementation model: `gpt-5.3-codex` with `medium` reasoning
- escalate to `gpt-5.4` with `medium` reasoning for contract, public-ingress, duplicate-policy, or regression-risk work
- do not downgrade below `gpt-5.4-mini` unless the task becomes trivially narrow
- keep one model per task thread unless a concrete blocker forces escalation

## Shared Guardrails

- do not revert unrelated work
- do not widen Sprint 8 into mailbox, calendar, notification, queue, cron, or automation scope
- keep all sensitive writes server-side
- do not allow public intake to write directly into production CRM entities
- preserve explicit review, duplicate handling, and auditability
- report meaningful outcomes back to PM for sprint tracking

## Subagent Packets

### DEV-801

- model: `gpt-5.4` with `medium` reasoning
- ownership: shared staged-intake contract only
- why this model: contract shape and non-destructive repository changes are the highest-risk Sprint 8 boundary
- start condition: Sprint 7 closed; founder approvals for field allowlist and source labels frozen enough to encode
- first action: define typed staged-intake envelope, payload allowlist, and review-state contract in the import layer
- hard boundaries: no website endpoint, no admin review UI, no product workflow expansion
- done target: one reusable repository path for staged inbound records that does not clear prior batch history

Prompt:

`Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-801 only. Ownership: define the shared staged-intake contract and repository path used by structured re-import and website intake. Keep scope to typed contract shape, source metadata, review-state compatibility, and removal or replacement of destructive staged-batch coexistence behavior. Do not build website submission endpoints or admin review UI in this task. Use model gpt-5.4 with medium reasoning. Deliverables: implemented code, focused tests, concise summary, risks, and files changed.`

### DEV-802

- model: `gpt-5.3-codex` with `medium` reasoning
- ownership: structured re-import reuse only
- why this model: medium-risk extension work on a known import path
- start condition: DEV-801 merged or available in branch context
- first action: route structured CSV or Excel re-import through the shared staged-intake contract
- hard boundaries: no public endpoint, no new review UX beyond what reuse requires
- done target: structured re-import reaches staged review through the shared path with accepted file-shape validation and safe partial-failure behavior

Prompt:

`Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-802 only. Ownership: extend structured re-import to use the shared staged-intake contract. Keep scope to file-shape validation, batch creation updates, staging behavior, duplicate surfacing, and reuse of the existing admin review path. Do not implement website intake or new admin workflow surfaces unless required for minimal reuse wiring. Use model gpt-5.3-codex with medium reasoning. Deliverables: implemented code, focused tests, concise summary, risks, and files changed.`

### DEV-803

- model: `gpt-5.4` with `medium` reasoning
- ownership: website lead intake staging endpoint only
- why this model: unauthenticated or semi-public ingress is a security-sensitive boundary
- start condition: DEV-801 merged or available; field allowlist and source attribution approved
- first action: add narrow validated website intake entrypoint that stages records without production writes
- hard boundaries: no auto-commit, no rich anti-abuse platform additions, no workflow automation
- done target: website-origin submissions create staged inbound records with explicit source metadata, validation, and basic abuse controls

Prompt:

`Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-803 only. Ownership: add the website lead intake staging endpoint. Keep scope to endpoint or server-action design, payload validation, source tagging, basic abuse controls that fit the current stack, and staged record creation through the shared intake contract. Do not write directly into production CRM entities and do not build admin review UI here. Use model gpt-5.4 with medium reasoning. Deliverables: implemented code, focused tests, concise summary, risks, and files changed.`

### DEV-804

- model: `gpt-5.4` with `low` reasoning
- ownership: admin inbound review and commit UX only
- why this model: UI plus commit-safety logic spans multiple surfaces but should follow defined contracts
- start condition: DEV-801 through DEV-803 available in branch context
- first action: expose staged inbound queue, source labels, review states, and explicit commit actions for admins
- hard boundaries: no hidden auto-commit logic, no ownership model expansion, no unrelated CRM UI redesign
- done target: admins can triage, attach, create, and commit staged inbound records with visible source and duplicate context

Prompt:

`Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-804 only. Ownership: ship the admin inbound review and commit UX. Keep scope to staged inbound list or queue updates, duplicate-candidate review, attach-versus-create decisions, source labels, review states, and explicit confirmation before commit. Do not add unrelated product features or redesign unaffected CRM surfaces. Use model gpt-5.4 with low reasoning. Deliverables: implemented code, focused tests, concise summary, risks, and files changed.`

### DEV-805

- model: `gpt-5.3-codex` with `medium` reasoning
- ownership: committed inbound outcomes into core CRM workflows only
- why this model: integration work is routine once commit decisions and contracts exist
- start condition: DEV-804 available in branch context
- first action: wire approved staged inbound records into company, contact, and minimal follow-up continuation paths
- hard boundaries: no unsupported downstream automation, no new external integrations
- done target: approved inbound records land in expected CRM entities and remain traceable to their inbound source

Prompt:

`Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-805 only. Ownership: connect approved inbound outcomes to core CRM workflows. Keep scope to commit mapping, related-record linking, and minimal post-commit affordances needed for existing company, contact, and follow-up workflows. Preserve source auditability and do not add automation or external sync. Use model gpt-5.3-codex with medium reasoning. Deliverables: implemented code, focused tests, concise summary, risks, and files changed.`

### DEV-806

- model: `gpt-5.4` with `medium` reasoning
- ownership: verification and regression only
- why this model: repo-wide confidence and regression triage need stronger review judgment
- start condition: enough Sprint 8 code exists to verify meaningfully; otherwise prepare checklist only
- first action: assess whether feature work is present, then run the highest-signal checks that are meaningful
- hard boundaries: do not implement product features while verifying
- done target: concise verification status, failures if any, residual risks, and commands run for Sprint 8 confidence

Prompt:

`Operate as [DEV]. You are not alone in the codebase. Do not revert others' work. You own Sprint 8 task DEV-806 only. Ownership: verification and regression only. Do not implement product features. Once enough Sprint 8 code exists, run focused verification and then the repo checks needed for Sprint 8 confidence: lint, typecheck, tests, build, plus targeted review of intake/review/permissions regression risk. Context: Sprint 8 execution is gated on Sprint 7 QA closeout and PM closure, so if feature work is not yet integrated, prepare the verification checklist and run only what is meaningful. Deliverables: concise verification status, failures if any, residual risks, and commands run.`

## Recommended Launch Order

1. open DEV-801 on `gpt-5.4`
2. open DEV-802 after DEV-801 contract shape stabilizes
3. open DEV-803 after field allowlist and source labels are frozen
4. open DEV-804 after ingest sources exist in staging
5. open DEV-805 after review and commit UX lands
6. open DEV-806 last, or earlier only for checklist prep

## Related

- [[sprints/sprint_08/todo/sprint_08_todo|Sprint 08 Todo]]
- [[sprints/sprint_08/sprint_08_index|Sprint 08 Index]]
