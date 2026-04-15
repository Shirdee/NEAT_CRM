---
tags:
  - crm
  - sprint
  - sprint-11
  - todo
  - dev
aliases:
  - Sprint 11 Todo
  - CRM Sprint 11 Todo
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 11 Todo

Parent: [[sprints/sprint_11/sprint_11_index|Sprint 11 Index]]

> All tasks are DEV-executable. Each task lists exact files, exact patterns to change, and acceptance criteria. A Codex agent can execute any task independently without reading other tasks first, as long as the WS-A font task runs before QA.

---

## Task Date Tracking

- added: `2026-04-15`
- started: `2026-04-15` (pre-implemented in Sprint 10 WS7)
- completed: `2026-04-15`
- closed: `2026-04-15`

---

## Workstream A — Font Loading

### DEV-1101 — Load Manrope + Inter via next/font

**Priority:** P0 — blocker. All typography is incorrect until this is done.

**Problem:**
`crm/app/src/app/layout.tsx` has no font loading. Tailwind references `Manrope` and `Inter` by name in `tailwind.config.ts` but these are never loaded. On systems without those fonts installed, the app renders in fallback fonts.

**Current state of `src/app/layout.tsx`:**
```typescript
import type {Metadata, Viewport} from "next";
import "./globals.css";

export default function RootLayout({children}: ...) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

**Current state of `crm/app/tailwind.config.ts` fontFamily:**
```typescript
fontFamily: {
  sans: ["Inter", "\"Segoe UI\"", "Arial", "sans-serif"],
  display: ["Manrope", "\"Segoe UI\"", "sans-serif"]
}
```

**What to change:**

**File 1: `crm/app/src/app/layout.tsx`**

Add `next/font/google` imports for Manrope and Inter. Apply both font CSS variables to the `<html>` element's `className`.

```typescript
import type {Metadata, Viewport} from "next";
import {Inter, Manrope} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CRM Foundation",
  description: "Sprint 1 application shell for the bilingual CRM foundation."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

**File 2: `crm/app/tailwind.config.ts`**

Change fontFamily to reference CSS variables instead of raw font names:

```typescript
fontFamily: {
  sans: ["var(--font-inter)", "\"Segoe UI\"", "Arial", "sans-serif"],
  display: ["var(--font-manrope)", "\"Segoe UI\"", "sans-serif"]
}
```

**File 3: `crm/app/src/app/globals.css`**

Update the body font-family declaration to use the CSS variable:

Change:
```css
body {
  ...
  font-family: Inter, "Segoe UI", Arial, sans-serif;
```
To:
```css
body {
  ...
  font-family: var(--font-inter), "Segoe UI", Arial, sans-serif;
```

**Acceptance criteria:**
- `npm run build` passes
- `npm run typecheck` passes
- In the browser, headings (e.g., dashboard title, page h2) render in Manrope
- Body text (labels, list items, form inputs) renders in Inter
- No console errors about fonts

---

## Workstream B — Slate Token Elimination

### DEV-1102 — Shell components slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/components/shell/app-shell.tsx`
- `crm/app/src/components/shell/bottom-nav.tsx`
- `crm/app/src/components/shell/nav-item-link.tsx`
- `crm/app/src/components/shell/quick-log-button.tsx`

**Changes per file:**

**`app-shell.tsx`:**
- Line 38: `text-slate-900` → remove (body already sets `color: rgb(var(--color-ink))`)
  - Full class: `"relative grid h-[100dvh] min-h-[100dvh] w-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-sand text-slate-900 overscroll-none"`
  - Change to: `"relative grid h-[100dvh] min-h-[100dvh] w-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-sand overscroll-none"`
- Line 144 (sidebar eyebrow): `text-slate-400` → `text-ink/40`

**`bottom-nav.tsx`:**
- Inactive nav item text: `text-slate-400 hover:text-slate-600` → `text-ink/40 hover:text-ink/60`
- Inactive nav item label: `text-slate-400` → `text-ink/40`

**`nav-item-link.tsx`:** (read file first — apply same slate→ink/N pattern)

**`quick-log-button.tsx`:** (read file first — apply same slate→ink/N pattern)

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/components/shell/` returns no matches

---

### DEV-1103 — UI primitive components slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/components/ui/status-chip.tsx`
- `crm/app/src/components/ui/info-pair.tsx`
- `crm/app/src/components/ui/bottom-sheet.tsx`
- `crm/app/src/components/ui/saved-view-bar.tsx`

**Changes per file:**

**`status-chip.tsx`:**
- `default` tone: `"bg-[rgba(244,229,225,0.82)] text-slate-700"` → `"bg-mist text-ink/70"`

**`info-pair.tsx`:** Read file first. Apply token replacement map from sprint index.

**`bottom-sheet.tsx`:** Read file first. Apply token replacement map.

**`saved-view-bar.tsx`:** Read file first. Apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/components/ui/` returns no matches
- `grep -r "rgba(244" crm/app/src/components/ui/` returns no matches

---

### DEV-1104 — CRM form components slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/components/crm/interaction-form.tsx`
- `crm/app/src/components/crm/opportunity-form.tsx`
- `crm/app/src/components/crm/task-form.tsx`
- `crm/app/src/components/crm/contact-form.tsx`
- `crm/app/src/components/crm/company-form.tsx`
- `crm/app/src/components/crm/searchable-option-field.tsx`
- `crm/app/src/components/crm/interaction-type-field.tsx`

**For each file:** Read it first. Then apply the token replacement map from the sprint index. Pay attention to:
- Input background colors: any `bg-slate-*` or `bg-[rgba(244,229,225,*)]` → `bg-mist`
- Text colors: apply the slate→ink/N map
- Dividers: any `divide-slate-*` → remove entirely, add `gap-*` spacing instead

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/components/crm/` returns no matches
- `grep -r "rgba(244" crm/app/src/components/crm/` returns no matches

---

### DEV-1105 — Task components slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/components/tasks/task-list-client.tsx`
- `crm/app/src/components/tasks/task-filter-tabs.tsx`

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/components/tasks/` returns no matches

---

### DEV-1106 — Auth components slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/components/auth/login-form.tsx`
- `crm/app/src/app/[locale]/(public)/login/page.tsx`
- `crm/app/src/app/[locale]/access-denied/page.tsx`

**Important for login:** The login page uses the Stitch reference screen `a9599bed012a41738d15cf7a69a452bf` (High-Tech CRM Login). Keep the ink-dark hero background. Only fix slate token leakage.

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(public\)/` returns no matches
- `grep -r "slate-" crm/app/src/components/auth/` returns no matches

---

### DEV-1107 — Dashboard page slate cleanup

**Priority:** P0

**File:** `crm/app/src/app/[locale]/(protected)/dashboard/page.tsx`

**Specific changes:**

1. Task list cards — line ~136:
   - `bg-slate-50/75` → `bg-white/80`
   - `text-slate-600` → `text-ink/60`
   - `hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]` — keep (this is fine)

2. Interaction list items — line ~184:
   - `text-slate-600` → `text-ink/60`

3. Insights section — line ~198:
   - `text-slate-400` eyebrow → `text-ink/40`
   - `bg-slate-50/75` company items → `bg-white/80`
   - `text-slate-600` secondary text → `text-ink/60`

**Acceptance criteria:**
- `grep "slate-" crm/app/src/app/\[locale\]/\(protected\)/dashboard/page.tsx` returns no matches

---

### DEV-1108 — Companies pages slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/app/[locale]/(protected)/companies/page.tsx`
- `crm/app/src/app/[locale]/(protected)/companies/[companyId]/page.tsx`
- `crm/app/src/app/[locale]/(protected)/companies/[companyId]/edit/page.tsx`
- `crm/app/src/app/[locale]/(protected)/companies/new/page.tsx`

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/companies/` returns no matches

---

### DEV-1109 — Contacts pages slate cleanup + card pattern

**Priority:** P0

**Files:**
- `crm/app/src/app/[locale]/(protected)/contacts/page.tsx`
- `crm/app/src/app/[locale]/(protected)/contacts/[contactId]/page.tsx`
- `crm/app/src/app/[locale]/(protected)/contacts/[contactId]/edit/page.tsx`
- `crm/app/src/app/[locale]/(protected)/contacts/new/page.tsx`

**Specific structural fix in `contacts/page.tsx`:**

**Current pattern** (uses `divide-y` dividers — violates No-Line Rule):
```tsx
<div className="divide-y divide-slate-100 overflow-hidden rounded bg-white">
  {contacts.map((contact) => (
    <Link
      className="block rounded-none bg-white/95 px-3 py-2.5 transition hover:bg-slate-50/70 lg:rounded lg:hover:bg-sand/60"
      ...
    >
```

**Replace with card-per-contact pattern** (matches companies directory Stitch screen `c238ca4bb1f14d44bc3027f7c2f6eb2f`):
```tsx
<div className="space-y-2">
  {contacts.map((contact) => (
    <Link
      className="block rounded-[18px] bg-white px-4 py-3.5 shadow-[0_1px_0_rgba(16,36,63,0.04)] transition hover:bg-mist hover:shadow-soft"
      ...
    >
```

Also fix the column header row:
- `text-slate-500` → `text-ink/50`
- `bg-mist` header background — keep (already correct)

Also fix input backgrounds in the filter form:
- `bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700` → `bg-mist px-4 py-3 text-ink/70`

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/contacts/` returns no matches
- `grep -r "rgba(244" crm/app/src/app/\[locale\]/\(protected\)/contacts/` returns no matches
- Contacts list shows cards with spacing between them, no horizontal divider lines

---

### DEV-1110 — Tasks pages slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/app/[locale]/(protected)/tasks/page.tsx`
- `crm/app/src/app/[locale]/(protected)/tasks/[taskId]/page.tsx`
- `crm/app/src/app/[locale]/(protected)/tasks/[taskId]/edit/page.tsx`
- `crm/app/src/app/[locale]/(protected)/tasks/new/page.tsx`

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/tasks/` returns no matches

---

### DEV-1111 — Interactions pages slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/app/[locale]/(protected)/interactions/page.tsx`
- `crm/app/src/app/[locale]/(protected)/interactions/[interactionId]/page.tsx`
- `crm/app/src/app/[locale]/(protected)/interactions/[interactionId]/edit/page.tsx`
- `crm/app/src/app/[locale]/(protected)/interactions/new/page.tsx`

Read each file first, then apply token replacement map.

**Stitch reference for `interactions/new`:** Use mobile screens `55bf286e7a22435eac0c8e37278d7618` and `e9347defa45d4c459cb768f0aeb1aa5a` from Sprint 10 Stitch plan for visual reference.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/interactions/` returns no matches

---

### DEV-1112 — Opportunities pages slate cleanup

**Priority:** P0

**Files:**
- `crm/app/src/app/[locale]/(protected)/opportunities/page.tsx`
- `crm/app/src/app/[locale]/(protected)/opportunities/[opportunityId]/page.tsx`
- `crm/app/src/app/[locale]/(protected)/opportunities/[opportunityId]/edit/page.tsx`
- `crm/app/src/app/[locale]/(protected)/opportunities/new/page.tsx`

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/opportunities/` returns no matches

---

### DEV-1113 — Admin pages slate cleanup

**Priority:** P1 (admin-only UI, lower user impact)

**Files:**
- `crm/app/src/app/[locale]/(protected)/admin/lists/page.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/imports/page.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/imports/upload-panel.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/imports/row-review-form.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/batch/page.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/duplicates/page.tsx`
- `crm/app/src/app/[locale]/(protected)/admin/integrations/page.tsx`

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/admin/` returns no matches

---

### DEV-1114 — Reports and search pages slate cleanup

**Priority:** P1

**Files:**
- `crm/app/src/app/[locale]/(protected)/reports/page.tsx`
- `crm/app/src/app/[locale]/(protected)/reports/leads-by-source/page.tsx`
- `crm/app/src/app/[locale]/(protected)/reports/meetings/page.tsx`
- `crm/app/src/app/[locale]/(protected)/search/page.tsx`

Read each file first, then apply token replacement map.

**Acceptance criteria:**
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/reports/` returns no matches
- `grep -r "slate-" crm/app/src/app/\[locale\]/\(protected\)/search/` returns no matches

---

## Workstream C — Structural Pattern Fixes

### DEV-1115 — Error banner token standardization

**Priority:** P1

**Problem:** Error and warning banners throughout the app use raw Tailwind amber scale (`bg-amber-50 text-amber-800`) which is outside the Ink & Quartz token set.

**Search command to find all occurrences:**
```bash
cd crm/app && grep -r "amber-50\|amber-100\|amber-800\|amber-700\|amber-900" src/ --include="*.tsx"
```

**Replacement pattern:**
- `bg-amber-50` → `bg-amber/10`
- `text-amber-800` → `text-ink`
- `text-amber-900` → `text-ink`

Do the same for any `bg-amber-100`, `text-amber-700`, etc.

**Note:** `bg-amber` (the design system amber token) and `text-amber-800` (raw Tailwind) are different. `bg-amber/10` uses the Ink & Quartz amber CSS variable with 10% opacity. `text-amber-800` does not.

**Acceptance criteria:**
- `grep -r "amber-[0-9]" crm/app/src/` returns no matches
- Error banners still visually distinct from normal content

---

### DEV-1116 — Hardcoded input background removal

**Priority:** P1

**Problem:** Several files use `bg-[rgba(244,229,225,0.82)]` as input background. This is a hardcoded value that should use the `bg-mist` token.

**Search command:**
```bash
cd crm/app && grep -r "rgba(244" src/ --include="*.tsx"
```

**Replacement:** `bg-[rgba(244,229,225,0.82)]` → `bg-mist`

This applies to:
- `crm/app/src/app/[locale]/(protected)/contacts/page.tsx` (already covered in DEV-1109)
- Any other files the grep finds

**Acceptance criteria:**
- `grep -r "rgba(244" crm/app/src/` returns no matches

---

## Workstream D — QA Gate

### DEV-1117 — Final verification gate

**Priority:** P0 — must run after DEV-1101 through DEV-1116 are complete.

**Run all checks from `crm/app/` directory:**

```bash
cd crm/app

# 1. Lint
npm run lint
# Expected: no errors

# 2. Type check
npm run typecheck
# Expected: no errors

# 3. Build
npm run build
# Expected: build succeeds, no type or module errors

# 4. Tests
npx vitest run src/lib/data/crm.test.ts src/lib/data/crm-sprint4.test.ts
# Expected: all tests pass

# 5. Verify zero slate leakage
grep -r "slate-" src/ --include="*.tsx" --include="*.ts" --include="*.css"
# Expected: no output (zero matches)

# 6. Verify zero hardcoded input colors
grep -r "rgba(244" src/ --include="*.tsx"
# Expected: no output

# 7. Verify zero raw amber scale
grep -r "amber-[0-9]" src/ --include="*.tsx"
# Expected: no output
```

**Manual smoke checklist (desktop Chrome):**
- [ ] Login page: renders correctly, form works
- [ ] Dashboard: Manrope headline renders, metric cards visible, task + interaction lists show
- [ ] Companies list: cards visible with spacing, no divider lines
- [ ] Company detail: sections use tonal layering, no hard borders
- [ ] Contacts list: card-per-contact layout, no divider lines
- [ ] Tasks list: renders correctly
- [ ] Interactions/new: form renders correctly

**Manual smoke checklist (mobile — 390px viewport):**
- [ ] Bottom nav visible, icons and labels render in Inter
- [ ] Dashboard scrolls correctly
- [ ] Companies list readable
- [ ] Contacts list card layout works at mobile width

**Manual RTL smoke (switch locale to Hebrew):**
- [ ] Dashboard: right-aligned text, correct layout flip
- [ ] Companies list: RTL renders without broken layout
- [ ] Contacts list: RTL renders without broken layout
- [ ] Bottom nav: icons and labels render correctly RTL

**Acceptance criteria:**
- All 7 shell commands above return expected results
- All manual smoke items checked
- PM adds sign-off note to Sprint 11 Index after DEV reports completion

---

## Task Completion Order

Execute in this order to avoid build failures:

1. `DEV-1101` — fonts (must be first; affects all subsequent visual checks)
2. `DEV-1102` through `DEV-1116` — can run in any order or parallel
3. `DEV-1117` — must be last

---

## Related

- [[sprints/sprint_11/sprint_11_index|Sprint 11 Index]]
- [[sprints/sprint_10/sprint_10_ink_quartz_cutover_plan|Sprint 10 Ink & Quartz Cutover Plan]]
- [[sprints/sprint_10/sprint_10_stitch_route_plan|Sprint 10 Stitch Route Plan]]
