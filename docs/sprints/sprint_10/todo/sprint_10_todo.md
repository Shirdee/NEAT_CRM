---
tags:
  - crm
  - sprint-10
  - todo
  - pm
aliases:
  - Sprint 10 Todo
  - CRM Sprint 10 Todo
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 10 Todo — UX Completion And Runtime Pass

Parent: [[sprints/sprint_10/sprint_10_index|Sprint 10 Index]]

---

## Workstream 1 — Record Deletion

- [ ] Define deletion matrix by entity and role (admin/editor/viewer).
- [ ] Add delete action UI with explicit confirmation flow.
- [ ] Add server-side permission + safety guards.
- [ ] Add tests for allowed, denied, and constrained deletes.

Done when:
- Delete works only for allowed roles.
- Unsafe deletes are blocked with clear user feedback.

---

## Workstream 2 — Stitch Review And UI Plan (Pre-Implementation Gate)

- [ ] Review all relevant CRM screens through Stitch MCP.
- [ ] Produce detailed implementation plan file with route-by-route changes.
- [ ] PM approval checkpoint recorded before DEV starts UI implementation.

Done when:
- No UI implementation starts before plan approval.
- Plan covers all reviewed screens and notes intentional deviations.

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
