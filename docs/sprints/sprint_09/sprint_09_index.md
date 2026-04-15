---
tags:
  - crm
  - sprint
  - sprint-09
  - planning
  - ui
  - cto
aliases:
  - Sprint 09 Index
  - CRM Sprint 09 Index
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 09 Index — Dense UI Refresh

## Status

In progress. Phase 1 and Phase 2 implementation completed on 2026-04-15. Manual smoke pass and commit closeout remain open.

## Objective

Increase information density across all CRM screens by reducing padding, margins, and border-radii on list items. Start with mobile, then apply to desktop. Reference: Stitch "CRM UI Kit" project (ID: 14527789615512412022).

## Design Direction (from Stitch Reference)

The Stitch mobile screens use a flat-row list pattern:
- **List items**: no border-radius (0px), thin `border-b` divider, `py-2.5 px-3` padding
- **Cards** (non-list, standalone): retain small radius (`rounded` = 4px, `rounded-md` = 8px max)
- **Section gaps**: `space-y-4` → `space-y-2` or `space-y-0` with `divide-y`
- **Header**: tighter vertical padding (`py-2` not `py-3`)
- **Bottom nav**: reduce top/bottom pad (`pt-2 pb-1` not `pt-3 pb-2`)

**No-round rule applies to**: company rows, task rows, contact rows, interaction rows.  
**Retain rounding on**: chips/badges (`rounded-full`), buttons, modal dialogs, KPI metric cards.

## Scope

### Phase 1 — Mobile (commit after done)

| File | Change |
|---|---|
| `src/components/tasks/task-list-client.tsx` | `rounded-[28px]` → `rounded-none`, `p-4` → `py-2.5 px-3`, `space-y-3` → `divide-y divide-slate-100 space-y-0`, remove shadow card |
| `src/app/[locale]/(protected)/companies/page.tsx` | Same: `rounded-[28px]` → `rounded-none`, `p-4/p-5` → `py-2.5 px-3`, card shadow → none, `space-y-4` → `divide-y` |
| `src/app/[locale]/(protected)/contacts/page.tsx` | Same list-item treatment |
| `src/app/[locale]/(protected)/interactions/page.tsx` | Same list-item treatment |
| `src/components/shell/app-shell.tsx` (mobile header) | `py-3` → `py-2`, `px-4` → `px-3` |
| `src/components/shell/bottom-nav.tsx` | `pt-3 pb-2` → `pt-2 pb-1`, reduce `gap-1` → `gap-0.5` |
| `src/app/[locale]/(protected)/dashboard/page.tsx` | `space-y-6` → `space-y-4`, KPI card padding `p-5` → `p-3` |

### Phase 2 — Desktop (commit after Phase 1 passes)

| File | Change |
|---|---|
| `src/components/shell/app-shell.tsx` (desktop aside) | `p-3` nav container → `p-2`, `space-y-2` nav items → `space-y-0.5` |
| `src/components/shell/nav-item-link.tsx` | Reduce `px-3 py-2.5` → `px-3 py-1.5` |
| Companies/contacts/tasks desktop table header | `py-4 px-5` → `py-2 px-3`, `rounded-[24px]` → `rounded` |
| Desktop list cards | same flat-row treatment: `rounded-[28px]` → `rounded` (4px), remove `hover:-translate-y-0.5` lift, replace with `hover:bg-sand/60` tonal shift |
| `src/app/[locale]/(protected)/dashboard/page.tsx` desktop section | `space-y-6` → `space-y-3` |

## CTO Notes

- Replace card-shadow pattern on list items with tonal background shift: `bg-white` rows on `bg-sand/30` container → no shadow needed
- Keep `border-l-4` accent stripe on task rows (tonal signal, no radius impact)
- `divide-y divide-slate-100` replaces `space-y-3` between list rows — fewer DOM nodes, cleaner separation
- Buttons and chips retain `rounded-full` — this is intentional per Stitch design; only _list container_ rows go sharp
- Filter inputs: `rounded-[22px]` → `rounded` (4px) on mobile to match list density
- No changes to color tokens, typography, or icon set

## Definition of Done

- All mobile list screens show flat rows with no card radius
- No individual card box-shadow on list items (mobile)
- Header and bottom nav are 8–10px tighter vertically
- Desktop phase: same flat rows, desktop header unchanged (keep current branded look)
- No regressions in RTL (Hebrew) layout
- `npm run lint` and `npm run typecheck` pass
- Committed: Phase 1 mobile commit, Phase 2 desktop commit

## Progress Log

- 2026-04-15: Phase 1 implementation completed in code (tasks list, companies, contacts, interactions, mobile shell header, bottom nav, dashboard density pass, metric card mobile padding).
- 2026-04-15: Validation gate run in `crm/app`: `npm run lint` pass, `npm run typecheck` pass.
- 2026-04-15: Phase 2 implementation completed in code (desktop aside/nav density, desktop row rounding + tonal hover, dashboard desktop spacing trim).
- 2026-04-15: Validation gate re-run in `crm/app`: `npm run lint` pass, `npm run typecheck` pass.
- 2026-04-15: Automated smoke run executed against local server with authenticated session: `/en/dashboard`, `/en/companies`, `/en/tasks` returned 200 for mobile and desktop user-agents; `/he/dashboard` returned 200 with `dir="rtl"`.
- 2026-04-15: UI marker checks passed for mobile header/nav density, desktop aside/nav density, dashboard desktop spacing, and companies tonal hover. Tasks desktop tonal-hover marker could not be asserted from SSR output because default tasks tab rendered without rows in the fetched state.
- Remaining: manual interactive smoke pass (especially tasks tab row rendering at 1280px) and commit closeout.

## Linked Sprint Docs

- [[sprints/sprint_09/todo/sprint_09_todo|Sprint 09 Todo]]
- [[sprints/sprint_08/sprint_08_index|Sprint 08 Index]]

## Related

- [[ROADMAP|Roadmap]]
- [[ARCHITECTURE|Architecture]]
- Stitch reference: CRM UI Kit (project `14527789615512412022`)
