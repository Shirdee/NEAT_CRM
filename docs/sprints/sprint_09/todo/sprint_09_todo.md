---
tags:
  - crm
  - sprint-09
  - todo
  - ui
aliases:
  - Sprint 09 Todo
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 09 Todo — Dense UI Refresh

Parent: [[sprints/sprint_09/sprint_09_index|Sprint 09 Index]]

---

## Phase 1 — Mobile

- [x] **task-list-client.tsx** — flat rows
  - `rounded-[28px]` → `rounded-none`
  - `pl-4 pr-4 pt-4 pb-4 sm:pl-5 sm:pr-5 sm:pt-5 sm:pb-5` → `py-2.5 px-3`
  - remove `shadow-[0_12px_32px_...]` and `hover:-translate-y-0.5 hover:shadow-[...]`
  - wrap list in `<div className="divide-y divide-slate-100 rounded overflow-hidden bg-white">` (no `space-y-3`)
  - retain `border-l-4` accent
  - `mb-2` priority row → `mb-1`
  - `mt-1.5` company row → `mt-0.5`
  - `mt-3 hidden gap-2 sm:flex` chip row → `mt-1.5 hidden gap-1.5 sm:flex`

- [x] **companies/page.tsx** — flat rows
  - `rounded-[28px]` → `rounded-none`
  - `p-4 sm:p-5` → `py-2.5 px-3`
  - remove card shadow + hover lift
  - list wrapper: `space-y-4` → `divide-y divide-slate-100 rounded overflow-hidden bg-white`
  - filter inputs: `rounded-[22px]` → `rounded`
  - table header: `rounded-[24px] py-4 px-5` → `rounded py-2 px-3`
  - empty state card padding: `p-8` → `p-5`

- [x] **contacts/page.tsx** — same flat-row treatment

- [x] **interactions/page.tsx** — same flat-row treatment

- [x] **app-shell.tsx** mobile header
  - `px-4 py-3` → `px-3 py-2`
  - logo icon `h-8 w-8 rounded-xl` → `h-7 w-7 rounded`
  - title font-size `text-base` → `text-sm`

- [x] **bottom-nav.tsx**
  - link: `pb-2 pt-3` → `pb-1 pt-2`
  - icon size: keep `h-[22px] w-[22px]`
  - label: `text-[10px]` → keep (already tiny)

- [x] **dashboard/page.tsx** mobile
  - outer `space-y-6` → `space-y-4`
  - KPI `grid-cols-2 gap-3 sm:gap-4` → `gap-2`
  - metric card inner padding: check MetricCard component
  - recent interactions list: apply flat-row treatment

- [ ] **Smoke test on mobile viewport** (390px)
  - Companies list
  - Tasks list
  - Dashboard
  - Header + bottom nav

- [ ] Commit: `feat(ui): dense mobile list rows — phase 1`

---

## Phase 2 — Desktop

- [ ] **app-shell.tsx** desktop aside
  - `p-3` → `p-2`
  - `space-y-2` nav → `space-y-0.5`

- [ ] **nav-item-link.tsx** — reduce `py-2.5` → `py-1.5`

- [ ] Companies/tasks/contacts desktop table header
  - `py-4 px-5 rounded-[24px]` → `py-2 px-3 rounded`

- [ ] Desktop list cards: `rounded-[28px]` → `rounded` (4px), replace shadow+lift with tonal hover

- [ ] **dashboard/page.tsx** desktop
  - `space-y-6` → `space-y-3` in main sections

- [ ] **Smoke test at 1280px**
  - Dashboard
  - Companies list
  - Tasks list
  - Sidebar nav

- [ ] Commit: `feat(ui): dense desktop list rows — phase 2`

---

## Gate

- `npm run lint` clean - pass (2026-04-15)
- `npm run typecheck` clean - pass (2026-04-15)
- RTL (Hebrew) layout check on mobile

---

## Notes

- Keep all chip/badge `rounded-full` — intentional
- Keep button `rounded-full` — intentional
- Keep modal/sheet radii — intentional
- Task `border-l-4` stays — it's a tonal signal, not decoration
