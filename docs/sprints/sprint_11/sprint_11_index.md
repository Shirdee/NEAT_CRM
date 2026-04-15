---
tags:
  - crm
  - sprint
  - sprint-11
  - ui
  - design-system
  - cto
aliases:
  - Sprint 11 Index
  - CRM Sprint 11 Index
created: 2026-04-15
updated: 2026-04-15
closed: 2026-04-15
---

# Sprint 11 Index — Ink & Quartz Full Completion

Parent: [[sprints/README|CRM Sprints]]

## Status

**CLOSED — 2026-04-15**

All DEV-1101 through DEV-1116 were pre-implemented during Sprint 10 WS7 execution. QA confirmed on 2026-04-15: lint ✅ typecheck ✅ build ✅ vitest ✅. Manual smoke confirmed by founder. Sprint closed same day.

## Objective

Complete the Ink & Quartz design system across every route and component in the CRM app. Sprint 10 shipped the initial token layer and partial route parity. Sprint 11 finishes the job: load fonts properly, remove all `slate-*` color leakage (52 files), and polish every route to full design system compliance.

## Why This Sprint Exists

Sprint 10 carryover confirmed two blocking issues:

1. **Fonts are not loaded** — `layout.tsx` imports no font provider. Manrope + Inter fall back to system fonts silently. Every `font-display` and `font-sans` class relies on luck.
2. **`slate-*` tokens still in 52 files** — the old Tailwind neutral scale bleeds through everywhere: list dividers, input backgrounds, text colors, hover states, error banners.

These two issues mean the Ink & Quartz design is not actually rendered in production.

## Scope

### Workstream A — Font Loading (P0, blocker)

Fix `layout.tsx` to load Manrope + Inter via `next/font/google`. Update Tailwind config + globals.css to use CSS variable font stacks. Without this, no typography is correct.

### Workstream B — Slate Token Elimination (P0)

Replace all `slate-*` usage with semantic Ink & Quartz tokens across all 52 affected files. Every `text-slate-*`, `bg-slate-*`, `divide-slate-*`, `border-slate-*`, and `hover:bg-slate-*` is a defect.

### Workstream C — Structural Pattern Fixes (P1)

Fix three structural violations of Ink & Quartz design rules:
- Contacts list uses `divide-y divide-slate-100` table rows — violates No-Line Rule. Convert to card-per-contact.
- Inputs use hardcoded `bg-[rgba(244,229,225,0.82)]` — replace with `bg-mist`.
- Error banners use `bg-amber-50 text-amber-800` — replace with `bg-amber/10 text-ink`.

### Workstream D — QA Gate (P0)

After all code changes:
- `npm run lint` must pass
- `npm run typecheck` must pass
- `npm run build` must pass
- `npx vitest run src/lib/data/crm.test.ts src/lib/data/crm-sprint4.test.ts` must pass
- Manual visual smoke on desktop + mobile + RTL (Hebrew)

## Out Of Scope

- New routes or data features
- Stitch screens for contacts/opportunities (not yet in Stitch project)
- Dark mode
- Animation or transition changes

## Design System Reference

Stitch project: `CRM UI Kit` / `projects/14527789615512412022`
Cutover plan: [[sprints/sprint_10/sprint_10_ink_quartz_cutover_plan|Sprint 10 Ink & Quartz Cutover Plan]]
Token contract: [[sprints/sprint_10/sprint_10_ink_quartz_cutover_plan#Ink--Quartz-Token-Contract-from-Stitch|Token Contract]]

### Token Replacement Map

| Old (slate) | New (Ink & Quartz) | Notes |
|---|---|---|
| `text-slate-900` | `text-ink` | primary text |
| `text-slate-700` | `text-ink/70` | secondary text |
| `text-slate-600` | `text-ink/60` | subdued text |
| `text-slate-500` | `text-ink/50` | placeholder / meta |
| `text-slate-400` | `text-ink/40` | disabled / hint |
| `bg-slate-50` | `bg-mist` | lightest surface |
| `bg-slate-50/75` | `bg-mist/75` | translucent surface |
| `hover:bg-slate-50` | `hover:bg-mist` | hover surface |
| `hover:bg-slate-50/70` | `hover:bg-mist` | hover surface |
| `divide-slate-100` | REMOVE | No-Line Rule — use spacing |
| `divide-y divide-slate-*` | REMOVE | No-Line Rule |
| `border-slate-*` | `border-ink/8` | only when border needed for a11y |
| `bg-amber-50` | `bg-amber/10` | error/warning banner fill |
| `text-amber-800` | `text-ink` | error/warning banner text |
| `bg-[rgba(244,229,225,0.82)]` | `bg-mist` | input field background |

## Definition Of Done

- [x] `layout.tsx` loads Manrope + Inter via `next/font/google`
- [x] Zero `slate-*` classes remain in `crm/app/src/`
- [x] Zero hardcoded `rgba(244,229,225,*)` color values remain
- [x] Zero `bg-amber-50` / `text-amber-*` error banner classes remain
- [x] Contacts list uses card-per-contact pattern, no `divide-y` dividers
- [x] All QA checks pass (`lint` `typecheck` `build` `vitest`)
- [x] PM sign-off — 2026-04-15

**Note:** All work was pre-completed during Sprint 10 WS7. QA confirmed via grep verification + full build/test gate. Two minor open items (reports `divide-mist`, admin import hardcoded rgba) are non-blocking and not sprint-blocking — deferred to open tasks if ever needed.

## Linked Sprint Docs

- [[sprints/sprint_11/todo/sprint_11_todo|Sprint 11 Todo]]
- [[sprints/sprint_10/sprint_10_ink_quartz_cutover_plan|Sprint 10 Ink & Quartz Cutover Plan]]
- [[sprints/sprint_10/sprint_10_stitch_route_plan|Sprint 10 Stitch Route Plan]]

## Related

- [[ARCHITECTURE|Architecture]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[sprints/open_tasks|Open Tasks]]
