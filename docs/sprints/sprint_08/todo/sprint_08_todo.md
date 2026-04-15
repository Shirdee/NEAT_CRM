---
tags:
  - crm
  - sprint
  - sprint-08
  - todo
  - dev-handoff
aliases:
  - Sprint 08 Todo
  - CRM Sprint 08 Todo
created: 2026-04-14
updated: 2026-04-14
---

# Sprint 08 Todo

## Status

Planned by PM and opened by CTO on 2026-04-14.
Prepared for DEV execution with explicit technical boundaries.
Implementation is complete in the repository as of 2026-04-14.
Sprint 8 is ready for QA and PM closeout.
Repo state: `DEV-801` through `DEV-806` are implemented in the repository.

## PM Model Strategy (2026-04-14)

- default planning and doc model: `gpt-5.4-mini` with `low` to `medium` reasoning for PM routing, doc cleanup, and task tracking
- default implementation model: `gpt-5.3-codex` with `medium` reasoning for routine DEV tickets
- higher-risk technical model: `gpt-5.4` with `low` to `medium` reasoning for intake contracts, public ingress security, duplicate policy, or commit-safety decisions
- QA verification model: start with `gpt-5.4-mini` for broad regression setup and escalate to `gpt-5.4` when failures require deeper triage
- escalation rule: promote model strength only when blocked by ambiguity, public-ingress risk, or failing verification
- continuity rule: keep one model per task thread unless a concrete blocker justifies a switch

## PM Execution Tracker (2026-04-14)

- DEV-801: implemented
- DEV-802: implemented
- DEV-803: implemented
- DEV-804: implemented
- DEV-805: implemented
- DEV-806: implemented; repo checks green on integrated Sprint 8 state

## Agent Flow

- PM owns scope, sequencing, doc truth, and closeout
- CTO owns technical boundaries where ingress, deduplication, or review safety could create risk
- DEV owns implementation once Sprint 7 closes and ticket scope is approved
- QA owns verification, regression review, and release confidence
- after CTO, DEV, or QA completes meaningful work, the outcome returns to PM for doc and status updates

## CTO Technical Decisions (2026-04-14)

- Sprint 8 should create one shared intake contract for staged inbound lead records rather than source-specific direct-write logic
- website submissions and structured re-imports should both normalize into the same staged review path wherever practical
- new inbound sources should record explicit source metadata and review status before any production commit occurs
- production entity creation remains an admin-reviewed commit step, not an automatic side effect of public ingress
- public intake should stay intentionally narrow in field scope and protected with basic abuse controls that fit the current stack
- Gmail sync, Outlook sync, calendar sync, and notification automation are out of scope for Sprint 8
- new background workers, queues, cron, or paid services are out of scope for Sprint 8

## CTO Execution Handoff

- handoff owner: CTO
- handoff target: DEV
- sprint: Sprint 8
- build scope: shared intake contract, structured re-import, website lead capture staging, admin inbound review, and verification hardening
- execution start condition: Sprint 7 QA closeout and PM closure are complete; until then DEV may prepare file targets and implementation order but should not merge Sprint 8 feature work
- first concrete implementation action: start `DEV-801` by defining the shared staged-intake contract and source metadata path that both structured re-import and website submissions will use
- immediate sequencing after first action: finish `DEV-801`, then move to `DEV-802` for structured re-import reuse of the existing import pipeline before adding the website intake endpoint in `DEV-803`
- hard technical guardrails: keep all sensitive writes server-side, reuse import staging and duplicate review patterns, require admin review before production commit, store source identity explicitly, keep public intake field scope small, keep permissions enforced server-side, do not add integrations, queues, cron, notifications, or paid services
- unresolved blockers to keep explicit during build: final website lead field set, source attribution rules, inbound duplicate attachment policy, commit summary wording for staged review, and replacement of the current single-batch destructive import creation behavior
- PM routing note: once Sprint 7 closes, PM should publish a short status update that Sprint 8 execution has formally opened on `DEV-801`
- PM routing note: after `DEV-801`, PM should confirm whether the website intake first wave includes only lead capture or also immediate follow-up creation in admin review
- subagent routing note: launch-ready DEV briefs and model choices live in [[sprints/sprint_08/dev_subagents|Sprint 08 DEV Subagents]]

## Sprint Goal

Reduce manual lead-ingestion friction by routing controlled inbound data through one safe staged-review model that fits the existing CRM architecture and free-tier deployment constraints.

## Documentation Gate

- Sprint 8 index exists before implementation
- Sprint 8 review exists before implementation
- this Sprint 8 todo exists before implementation
- Sprint 7 review remains the execution gate that must close before Sprint 8 mainline build work starts
- DEV and QA should treat these docs as the Sprint 8 planning source of truth

## Product Approval Dependencies

- confirm the first-wave website lead fields
- confirm source attribution labels for website and re-import channels
- confirm the allowed structured file shape for re-import in Sprint 8
- confirm whether staged inbound records may attach to existing companies and contacts automatically or only by admin decision
- confirm that Sprint 8 excludes mailbox sync, calendar sync, notifications, and automation

## DEV Task List

### DEV-801: Define Shared Staged-Intake Contract

- objective: create one typed inbound contract and storage path for controlled lead ingestion
- scope: source metadata, review status shape, normalization entry points, and typed payload rules shared by structured re-import and website intake
- must include: a single contract that keeps staged inbound data auditable before production commit and fits the current import repository patterns
- must include: a non-destructive path for staged intake coexistence because the current import batch creation flow clears prior batch history
- done when: the app has one shared intake contract and repository path that both Sprint 8 ingress sources can consume safely

### DEV-802: Extend Structured Re-Import Through The Shared Intake Path

- objective: let admins re-ingest structured CSV or Excel data without inventing a separate review workflow
- scope: file-shape validation, batch creation updates, staging behavior, duplicate surfacing, and review-state reuse on the admin import surface
- must include: clear limits on accepted file shape and safe handling when rows are partially invalid or stale
- done when: structured re-import uses the shared staged-intake contract and reaches the existing admin review path predictably

### DEV-803: Add Website Lead Intake Staging Endpoint

- objective: accept narrow website lead submissions without writing directly into production CRM tables
- scope: endpoint or action design, payload validation, basic abuse controls, source tagging, and staged record creation
- must include: explicit field allowlist, safe unauthenticated handling if public, and no bypass around review-state creation
- done when: website-origin leads can be captured into staged review with clear source metadata and no direct production writes

### DEV-804: Ship Admin Inbound Review And Commit UX

- objective: let admins inspect, triage, and commit staged inbound records safely
- scope: staged inbound list or queue updates, duplicate candidate review, attach-versus-create decisions, and commit outcome reporting
- must include: visible source labels, clear review states, and explicit confirmation before production commit
- done when: admins can process inbound staged records without hidden write paths or ambiguous duplicate resolution

### DEV-805: Connect Inbound Outcomes To Core CRM Workflows

- objective: make committed inbound records useful inside existing company, contact, and follow-up workflows
- scope: commit mapping, related-record linking, and any minimal post-commit affordances needed to continue CRM work
- must include: preserved auditability of source metadata and no silent creation of unsupported downstream automation
- done when: approved inbound records land in the expected CRM entities and remain traceable to their source

### DEV-806: Verify, Harden, And Regress

- objective: close Sprint 8 with confidence and without destabilizing prior delivery
- scope: repository verification, public-ingress safety checks, duplicate and review correctness, role checks, and regression validation
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 8 behavior is covered and Sprint 2 through Sprint 7 workflows still pass regression checks

## Recommended Execution Order

1. close Sprint 7 through QA and PM approval
2. freeze founder decisions for website fields, source labels, and re-import file shape
3. DEV-801 Define Shared Staged-Intake Contract
4. DEV-802 Extend Structured Re-Import Through The Shared Intake Path
5. DEV-803 Add Website Lead Intake Staging Endpoint
6. DEV-804 Ship Admin Inbound Review And Commit UX
7. DEV-805 Connect Inbound Outcomes To Core CRM Workflows
8. DEV-806 Verify, Harden, And Regress

## Non-Scope Guardrails

- no Gmail sync
- no Outlook sync
- no calendar sync
- no notification engine
- no cron, queue, or automation engine
- no ownership model expansion
- no direct production writes from website intake
- no new paid service unless a concrete blocker forces explicit approval

## Definition Of Done

- structured re-import and website intake share a staged review path
- admins can review duplicate candidates and commit approved inbound records safely
- inbound source metadata remains visible and auditable
- key intake and review surfaces remain bilingual and role-correct
- tests and repo checks pass

## QA Execution Plan

- verify structured re-import accepts only the approved file shape
- verify website intake creates staged records rather than direct production writes
- verify invalid inbound payloads fail safely and visibly
- verify duplicate candidates and attach-versus-create choices are explicit
- verify admin-only review and commit actions enforce role boundaries
- verify committed inbound records link correctly into company and contact workflows
- verify bilingual rendering on changed surfaces
- run regression on Sprint 2 import workflows
- run regression on Sprint 3 company and contact workflows
- run regression on Sprint 4 interactions and follow-ups where inbound records feed later actions
- run regression on Sprint 6 dashboard and report behavior if inbound counts affect summaries
- run full repo verification commands

## CTO To DEV Handoff

DEV should treat the following as the approved Sprint 8 build direction once the Sprint 7 gate clears:

1. centralize inbound rules
- website and file-based intake should share one typed staged contract instead of branching early

2. keep review explicit
- staged records, duplicate states, and commit outcomes should be visible and auditable

3. preserve trust before speed
- no inbound source should bypass admin review or silently create risky production mutations

4. preserve the current platform
- reuse Next.js, Prisma, RBAC, and the import repository rather than introducing services or infrastructure

5. integrate gradually
- controlled ingress is the sprint; mailbox sync, calendar sync, and automation are not

6. design for QA validation
- source labels, review states, duplicate paths, and commit summaries should be easy to verify

## PM Closeout Target

If DEV and QA complete the items above without scope drift, Sprint 8 should leave the CRM able to ingest new leads through controlled staged paths without overcommitting the product to full external sync.

## Blockers And Approval Dependencies

- if founder wants mailbox or calendar sync in Sprint 8, reopen scope and architecture explicitly rather than extending this sprint silently
- if website intake requires richer anti-abuse controls than the current stack can provide for free, pause and escalate before widening exposure
- if auto-commit behavior is requested, add an explicit review of duplicate and trust implications before implementation
- if the import repository cannot stop clearing prior batches without destabilizing Sprint 2 behavior, split that repository hardening into an explicit blocker fix before website intake work continues

## Related

- [[sprints/sprint_08/sprint_08_index|Sprint 08 Index]]
- [[sprints/sprint_08/dev_subagents|Sprint 08 DEV Subagents]]
