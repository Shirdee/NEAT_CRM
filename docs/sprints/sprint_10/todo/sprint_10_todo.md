---
tags:
  - crm
  - sprint
  - sprint-10
  - todo
  - dev-handoff
aliases:
  - Sprint 10 Todo
  - CRM Sprint 10 Todo
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 10 Todo — UX Completion And Runtime Pass

Parent: [[sprints/sprint_10/sprint_10_index|Sprint 10 Index]]

---

## Status

Planned by PM on 2026-04-15.
CTO technical handoff completed for Workstream 1 and Workstream 2 on 2026-04-15.
Execution is opened for DEV on Workstream 1 and Workstream 2 only.
Workstreams 3 to 6 remain planned and not opened in this handoff.

## Scope Slice In This Handoff

- included: Workstream 1 (Record Deletion), Workstream 2 (Stitch Review And UI Plan)
- excluded in this handoff: Workstreams 3 to 6

## CTO Technical Decisions (2026-04-15)

- record deletion must use soft-delete semantics first for CRM business entities unless a hard-delete path is explicitly required and approved
- lookup values keep current PRD direction: soft-deactivate over hard delete
- all delete permissions remain enforced server-side under existing admin/editor/viewer RBAC
- deletion UX must use explicit confirmation with human-readable impact text; no silent one-click destructive path
- Stitch review is a planning gate, not implementation: DEV produces route-level plan doc first, PM approves, only then UI code work may start
- Stitch review should use current Sprint 9 Stitch reference baseline where available and document every intentional deviation

## CTO Execution Handoff

- handoff owner: CTO
- handoff target: DEV
- sprint: Sprint 10
- build scope now: Workstream 1 and Workstream 2 only
- first concrete implementation action: start `DEV-1001` by defining deletion policy matrix and target entity list, then open policy decisions in sprint doc before coding mutations
- immediate sequencing after first action: complete `DEV-1001`, then `DEV-1002`, then `DEV-1003`, then execute `DEV-1004` as planning gate
- hard technical guardrails: keep RBAC server-side, preserve auditability, avoid irreversible destructive behavior by default, no schema redesign beyond required deletion flags/fields, no new services, no queue/cron/automation
- unresolved blockers: final list of entities allowed for hard delete, retention window policy if any, final Stitch project ID confirmation for all screens in scope
- PM routing note: PM should record explicit approval checkpoint after `DEV-1004` before any UI rebuild implementation starts

## DEV Task List (Workstream 1+2)

### DEV-1001: Define Deletion Policy Matrix

- objective: produce one explicit deletion policy for each relevant entity and role
- scope: `companies`, `contacts`, `interactions`, `tasks`, `opportunities`, and linked relation constraints
- must include: role behavior (`admin`, `editor`, `viewer`), allowed operations (soft delete, restore, hard delete if approved), and dependency constraints
- done when: sprint docs contain approved policy table and unresolved exceptions list

Policy matrix (implemented for this slice):

| Entity | Admin | Editor | Viewer | Rule |
|---|---|---|---|---|
| Company | delete allowed | denied | denied | blocked when linked contacts/interactions/tasks/opportunities exist |
| Contact | delete allowed | denied | denied | blocked when linked interactions/tasks/opportunities exist |
| Interaction | delete allowed | delete allowed | denied | blocked when linked tasks exist |
| Task | delete allowed | delete allowed | denied | allowed directly |
| Opportunity | delete allowed | delete allowed | denied | allowed directly |

Unresolved exception:
- soft-delete-first policy is not fully implemented because business entities do not yet have `deleted_at` (or equivalent) schema fields; current implementation is guarded hard-delete with explicit confirmation and dependency blocks.

### DEV-1002: Implement Safe Deletion Backend Path

- objective: implement mutation layer for approved deletion paths with guardrails
- scope: server actions and data layer updates with permission checks, relation safety checks, and audit field handling
- must include: explicit error states for denied or blocked deletions and deterministic behavior in both Prisma and fallback modes
- done when: unauthorized or unsafe delete attempts are blocked server-side, approved paths succeed predictably

### DEV-1003: Implement Deletion UX And Tests

- objective: expose deletion actions in UI with clear confirmation and recovery messaging
- scope: list/detail surfaces for entities approved in `DEV-1001`, locale strings, and test coverage
- must include: confirmation UX, destructive intent text, permission-aware visibility, and regression checks for non-delete flows
- done when: UI behavior matches policy matrix and tests cover allow/deny/block outcomes

### DEV-1004: Complete Stitch Screen Review And Route-Level Plan

- objective: review all target screens and produce implementation plan before UI rebuild work
- scope: route inventory, screen-by-screen diffs vs Stitch reference, implementation sequence, risk notes, and acceptance checklist
- must include: one plan doc under Sprint 10 docs, explicit out-of-scope list, and per-route change summary
- done when: PM can approve or reject with concrete comments; no UI rebuild implementation starts before approval

## Workstream 1 — Record Deletion

- [x] Define deletion matrix by entity and role (admin/editor/viewer).
- [x] Add delete action UI with explicit confirmation flow.
- [x] Add server-side permission + safety guards.
- [x] Add tests for allowed, denied, and constrained deletes.

Done when:
- Delete works only for allowed roles.
- Unsafe deletes are blocked with clear user feedback.

---

## Workstream 2 — Stitch Review And UI Plan (Pre-Implementation Gate)

- [x] Review all relevant CRM screens through Stitch MCP.
- [x] Produce detailed implementation plan file with route-by-route changes.
- [ ] PM approval checkpoint recorded before DEV starts UI implementation.

Done when:
- No UI implementation starts before plan approval.
- Plan covers all reviewed screens and notes intentional deviations.

## Recommended Execution Order (This Handoff)

1. `DEV-1001` Define Deletion Policy Matrix
2. `DEV-1002` Implement Safe Deletion Backend Path
3. `DEV-1003` Implement Deletion UX And Tests
4. `DEV-1004` Complete Stitch Screen Review And Route-Level Plan

## Non-Scope Guardrails (This Handoff)

- no runtime optimization work from Workstream 3
- no interaction-summary format changes from Workstream 4
- no interaction-view type/link changes from Workstream 5
- no global live-search retrofit from Workstream 6
- no new infrastructure service, queue, cron, automation, or paid add-on
- no broad UI rebuild before `DEV-1004` plan approval

## QA Execution Expectations (For Opened Slice)

- verify role enforcement for every delete endpoint and action path
- verify blocked-delete cases with linked dependent data
- verify confirmation UX in English and Hebrew
- verify fallback-mode behavior parity where applicable
- verify Stitch planning artifact completeness and route coverage
- run `npm run lint`, `npm run typecheck`, and targeted tests for deletion paths

---

## Workstream 3 — Runtime Improvement

- [ ] Capture baseline runtime metrics for key routes.
- [ ] Identify bottlenecks (data fetch, rendering, query patterns).
- [ ] Implement bounded optimizations.
- [ ] Re-measure and document before/after.

Done when:
- Runtime improvement is measurable and documented.
- No functional or permission regressions introduced.

---

## Workstream 4 — Interaction Summary Formatting

- [ ] Update interaction list/summary rendering:
  - line 1 (bold): `First Name + Company`
  - line 2: `Subject + Date`
- [ ] Validate RTL and mobile behavior.

Done when:
- Format is consistent across routes where interaction summaries appear.

---

## Workstream 5 — Interaction Record View Updates

- [ ] Add `phone call` as interaction type in model/form/list filters as needed.
- [ ] Make company and contact references clickable in interaction record view.
- [ ] Add/update tests for new type and links.

Done when:
- New type can be created, viewed, and filtered.
- Links navigate correctly to related records.

---

## Workstream 6 — Live Search Standardization

- [ ] Inventory all search inputs and open-list selectors.
- [ ] Convert non-live controls to live search behavior.
- [ ] Verify debounce/perf behavior on large lists.

Done when:
- All targeted search/open-list controls are live and responsive.

---

## QA Gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] Targeted tests for deletion, interaction updates, and live search
- [ ] Manual smoke on desktop + mobile + RTL

---

## Notes

- Source: `crm/docs/Notes.md` (interpreted as requested `notes.md`).
- Keep sprint scope tight; defer extras to Sprint 11 candidate list.
- CTO handoff in this file opens DEV work for Workstreams 1 and 2 only.
- DEV implementation update 2026-04-15:
  - added guarded delete actions and detail-page confirmation flows for company/contact/interaction/task/opportunity
  - added blocked-delete handling for linked record constraints
  - added locale strings for deletion UX in English and Hebrew
  - created Stitch route plan: [[sprints/sprint_10/sprint_10_stitch_route_plan|Sprint 10 Stitch Route Plan]]
- CTO execution packet for DEV sub-streams: [[sprints/sprint_10/sprint_10_dev_execution_packet|Sprint 10 DEV Execution Packet]]
- PM tracking note: [[sprints/sprint_10/sprint_10_pm_update|Sprint 10 PM Update]]
