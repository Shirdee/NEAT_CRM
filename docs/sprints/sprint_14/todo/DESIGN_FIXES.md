# Design Audit — neat-crm.vercel.app
*Audited from live HTML + compiled CSS. Fixes for Codex.*

---

## Priority 1 — Accessibility / Correctness (must fix)

---

### FIX-01 · Viewport blocks user zoom

**File:** `src/app/layout.tsx` or `src/app/[locale]/layout.tsx`

**Current:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"/>
```
`user-scalable=no` + `maximum-scale=1` is a WCAG 2.1 SC 1.4.4 violation. Prevents text zoom on iOS Safari.

**Fix:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
```
Remove `maximum-scale=1` and `user-scalable=no`. Keep `viewport-fit=cover` for safe area support.

---

### FIX-02 · Login inputs — CSS specificity conflict

**File:** `src/app/[locale]/(public)/login/page.tsx`

**Problem:** The form wrapper div uses `[&_input]:rounded-[12px] [&_input]:border-0 [&_input]:bg-mist [&_input]:py-3 [&_input]:focus:ring-2 [&_input]:focus:ring-teal/35` etc., while the actual `<input>` elements carry their own conflicting classes `rounded-[22px] border border-mist bg-white/80 focus:border-teal focus:bg-white`. This creates unpredictable styling depending on CSS source order.

The `[&_label]:` and `[&_button]:` variants have the same problem.

**Fix:** Delete the entire `[&_form]:... [&_label]:... [&_input]:... [&_button]:...` className string from the wrapper div. Apply styles directly to each element:

```tsx
// Each <label>:
<label className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">

// Each <input>:
<input className="w-full rounded-[12px] bg-mist px-4 py-3 text-[14px] text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/30 border-0" />

// Submit <button>:
<button className="mt-3 w-full rounded-full bg-coral py-3.5 text-[15px] font-semibold text-white transition hover:bg-coral/90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed">
```

---

### FIX-03 · Login inputs use informal label text

**File:** `src/app/[locale]/(public)/login/page.tsx`  
**File:** `src/messages/en.json`, `src/messages/he.json`

**Current:** Labels say `"User"` and `"Pass"` — unprofessional and unclear.

**Fix:**
- Label `for="identifier"` → `{t("Login.identifier")}` → `"Email address"` (en), `"כתובת מייל"` (he)
- Label `for="password"` → `{t("Login.password")}` → `"Password"` (en), `"סיסמה"` (he)
- Input `placeholder="User"` → `{t("Login.identifierPlaceholder")}` → `"you@company.com"` (en)
- Input `placeholder="Pass"` → `{t("Login.passwordPlaceholder")}` → `"••••••••"` (en)
- Button `"Enter CRM"` → `{t("Login.submit")}` → `"Sign in →"` (en), `"כניסה ←"` (he)

---

### FIX-04 · Focus rings — `outline-none ring-0` without replacement

**Files:** All form inputs across the app.

**Problem:** Many inputs use `outline-none ring-0` which removes ALL focus indicators. The `ring-0` neutralizes both the default browser ring AND Tailwind's ring. There's no visible focus ring unless `focus:ring-2` is also present. Verify every interactive element.

**Fix:** Audit every `<input>`, `<select>`, `<button>`, `<a>` that has `outline-none`:
- If `focus:ring-2` also present → OK.
- If `focus:ring-2` absent → add `focus:ring-2 focus:ring-teal/30`.
- `ring-0` should be removed entirely — it serves no purpose if `outline-none` is already there and `focus:ring-2` is the intended focus style.

---

## Priority 2 — Visual / Design System

---

### FIX-05 · Login aside — tagline duplicated

**File:** `src/app/[locale]/(public)/login/page.tsx`

**Problem:** The aside (left dark panel) shows "Stay close to the next conversation..." TWICE:
1. In the logo row's `<p>` element (right next to the logo icon)
2. As the main `<h1>` headline

**Fix:** Remove the duplicate from the logo row. Keep only the h1 version. Replace the logo row `<p>` with just the app name:

```tsx
<aside ...>
  <div className="space-y-10">
    {/* Logo row — app name only, no tagline */}
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal font-display text-[18px] font-extrabold text-white">
        C
      </div>
      <span className="font-display text-[17px] font-bold text-white">{t("title")}</span>
    </div>
    {/* Headline — tagline here only */}
    <div className="space-y-4">
      <h1 className="max-w-[18ch] font-display text-4xl font-semibold tracking-tight">
        {t("Login.headline")}
      </h1>
      ...
    </div>
  </div>
  ...
</aside>
```

---

### FIX-06 · Login aside — feature cards have borders

**File:** `src/app/[locale]/(public)/login/page.tsx`

**Current:** Feature cards: `rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur`

**Problem:** Borders violate the no-border rule from the design system. `bg-white/6` is a non-standard 6% opacity value.

**Fix:**
```tsx
<div className="rounded-[16px] bg-white/10 p-4">
```
Remove `border border-white/10 backdrop-blur`. Use `bg-white/10` (rounded up from 6% to 10%).

---

### FIX-07 · Non-design-system colors in use

**Search:** `grep -r "emerald\|rose-5\|rose-7\|rose-8\|rose-1" src/`

**Problem:** Tailwind's built-in `emerald` and `rose` color palette appears in the compiled CSS — meaning somewhere in the source, components use `bg-emerald-100`, `text-emerald-700`, `bg-rose-50`, `text-rose-700` etc. These are not part of the design system.

**Fix:** Replace all occurrences with design token equivalents:

| Current class | Replace with |
|---|---|
| `bg-emerald-100` | `bg-mint/20` or `bg-teal/10` |
| `bg-emerald-50` / `bg-emerald-50/60` | `bg-teal/8` |
| `text-emerald-700` | `text-teal` |
| `text-emerald-800` | `text-teal` |
| `border-emerald-200` | remove or `border-teal/20` |
| `bg-rose-50` / `bg-rose-50/70` | `bg-coral/8` |
| `bg-rose-700` | `bg-coral` |
| `text-rose-700` | `text-coral` |
| `text-rose-800` | `text-coral` |
| `border-rose-100` / `border-rose-200` | remove |

Find the source files using emerald/rose and fix one by one.

---

### FIX-08 · `text-white/72` non-standard opacity

**File:** `src/app/[locale]/(public)/login/page.tsx`

**Current:** `text-white/72` (72% opacity — not a standard Tailwind step).

**Fix:** Change to `text-white/70`.

---

### FIX-09 · Avatar initials — all teal, visually indistinguishable

**Files:** Any component rendering avatar initials (company rows, contact rows, interaction rows).

**Problem:** All avatar circles use the same `bg-teal/12 text-teal` (or similar fixed teal). When multiple companies appear in a list, all initials look identical in color.

**Fix:** Add a deterministic color picker based on name hash:

```ts
// src/lib/ui/avatar-color.ts
const AVATAR_TONES = [
  { bg: "bg-teal/12",  text: "text-teal" },
  { bg: "bg-coral/10", text: "text-coral" },
  { bg: "bg-amber/15", text: "text-amber-text" },
  { bg: "bg-lime/15",  text: "text-lime/80" },
  { bg: "bg-ink/8",    text: "text-ink/50" },
] as const;

export function avatarTone(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_TONES.length;
  return AVATAR_TONES[idx];
}
```

Apply in `AvatarInitial` component (T7 from Sprint 8 plan):
```tsx
const { bg, text } = avatarTone(name);
<div className={clsx("...", bg, text)}>{initials}</div>
```

---

### FIX-10 · Border-radius inconsistency — too many values in use

**Problem:** The compiled CSS has classes for every radius from `rounded-[10px]` to `rounded-[32px]`. This indicates many components using ad-hoc radius values.

**Standard to enforce:**
| Element type | Radius |
|---|---|
| Page cards / section cards | `rounded-[20px]` |
| Filter bars / info cells | `rounded-[12px]` |
| Inputs / selects | `rounded-[12px]` |
| Chips / status pills | `rounded-full` |
| Buttons | `rounded-full` |
| Kanban cards | `rounded-[14px]` |
| Bottom sheet | `rounded-t-[24px]` |
| Avatar circles | `rounded-full` |
| Nav items (sidebar) | `rounded-lg` (8px) |

**Search:** `grep -r "rounded-\[" src/components src/app` and fix any value not in this table.

Allowed non-standard: `rounded-[24px]` for the login form card only. `rounded-[32px]` for the old header — will be removed by Sprint 8 T6.

---

### FIX-11 · Letter-spacing — excessive variety

**Problem:** CSS shows 10+ distinct `tracking-[...]` values including 0.06em, 0.07em, 0.08em, 0.14em, 0.16em, 0.18em, 0.20em, 0.24em, 0.26em, 0.32em, 0.35em.

**Standard to enforce:**
| Use case | Class |
|---|---|
| Section eyebrows / admin labels | `tracking-[0.07em]` |
| StatusChip labels | `tracking-[0.06em]` |
| Bottom nav labels | `tracking-wide` (`0.025em`) |
| Headings | `tracking-tight` |

Any value above `0.08em` on body text is too wide. Search and fix: `grep -r "tracking-\[0\." src/` and remove outliers.

---

### FIX-12 · Sheet animation duration too long

**File:** Any component using `animate-[sheet-up_280ms...]`

**Current:** `sheet-up 280ms cubic-bezier(0.32, 0.72, 0, 1)`

**Fix:** Change to `220ms`:
```tsx
className="animate-[sheet-up_220ms_cubic-bezier(0.32,0.72,0,1)_both]"
```

Also update in `globals.css` if the keyframe duration is hardcoded there.

---

## Priority 3 — Performance

---

### FIX-13 · CSS bundle size — arbitrary shadow values bloat CSS

**Problem:** Instead of using design token shadow classes, many components use inline arbitrary shadows:
- `shadow-[0_12px_40px_rgba(58,48,45,0.08)]`
- `shadow-[0_12px_32px_rgba(58,48,45,0.06)]`
- `shadow-[0_10px_30px_rgba(16,36,63,0.06)]`
- `shadow-[0_12px_32px_rgba(16,36,63,0.18)]`
- `shadow-[0_8px_24px_rgba(58,48,45,0.04)]`
- `shadow-[0_8px_24px_rgba(58,48,45,0.05)]`
- `shadow-[0_4px_14px_rgba(16,36,63,0.08)]`
- `shadow-[0_4px_14px_rgba(16,36,63,0.22)]`
- `shadow-[0_4px_14px_rgba(221,107,77,0.26)]`
- `shadow-[0_4px_14px_rgba(15,118,110,0.18)]`

Each generates a unique CSS rule. These 10+ shadows alone add ~2KB to the CSS.

**Fix:** Map to existing tokens or add new ones:

```ts
// tailwind.config.ts — extend boxShadow:
"xs":     "0 2px 8px rgba(16, 36, 63, 0.06)",    // subtle, inside cards
"card":   "0 2px 12px rgba(16, 36, 63, 0.07)",   // already exists
"hover":  "0 6px 24px rgba(16, 36, 63, 0.11)",   // already exists
"coral":  "0 4px 14px rgba(221, 107, 77, 0.26)", // coral button shadow
"teal":   "0 4px 14px rgba(15, 118, 110, 0.18)", // teal button shadow
```

Then search and replace all arbitrary shadow values with token names.

---

### FIX-14 · QuickLogButton client components at shell level

**File:** `src/components/shell/app-shell.tsx`

**Problem:** The desktop header imports and renders `<QuickLogButton>` (a client component) three times at the shell level. This means React hydrates these client components on every page load, even pages where quick-add is irrelevant.

**Fix (Sprint 8 T6):** Remove `QuickLogButton` from the shell entirely. Move quick-add buttons to the specific pages where they're relevant (interactions/new, tasks/new, opportunities/new). The shell should only contain server-rendered navigation. This reduces client JS shipped with every page.

---

### FIX-15 · Font preload — missing Hebrew subset

**File:** `src/app/layout.tsx`

**Problem:** The `<head>` preloads only 3 woff2 files (Latin subsets of Inter and Manrope). The Hebrew character subset (`unicode-range: u+05d0-u+05f4`) is not preloaded, causing a flash of unstyled text (FOUT) when the Hebrew locale is active.

**Fix:** Add preload hints for Hebrew woff2 files. Check `/_next/static/media/` for which file handles Hebrew range (the Cyrillic/Extended subsets `u+0301,u+0400-045f` file is wrong — find the Hebrew one):

In `layout.tsx`:
```tsx
// Add after existing font preloads:
<link
  rel="preload"
  as="font"
  href="/_next/static/media/[hebrew-inter-subset].woff2"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

Check the actual font files via `ls crm/app/.next/static/media/` and identify the Hebrew-range file by inspecting the `unicode-range` in the compiled CSS.

---

### FIX-16 · `LocaleSwitcher` causes layout shift

**File:** `src/components/i18n/locale-switcher.tsx`

**Problem:** If the locale switcher is a client component that renders differently on hydration (e.g., reads `window.location`), it causes a layout shift (CLS). Verify it has a stable initial render.

**Fix:** Ensure `LocaleSwitcher` uses `usePathname()` from `@/i18n/navigation` (which is stable on server and client) and NOT `window.location`. If it shows a loading state initially, replace with a `<Suspense>` boundary or static server render.

---

### FIX-17 · `overscroll-none` on root prevents pull-to-refresh on iOS

**File:** `src/components/shell/app-shell.tsx`

**Current:** Root div has `overscroll-none` (`overscroll-behavior: none`).

**Problem:** This disables pull-to-refresh on mobile Safari. For a CRM where data needs to be fresh, this is a UX regression.

**Fix:** Change to `overscroll-y-contain` on the SCROLLABLE inner div, not the root. Keep root without overscroll class:

```tsx
// Root div: no overscroll class
<div className="relative h-[100dvh] w-full overflow-hidden">
  // Inner scrollable div:
  <div className="min-h-0 overflow-y-auto overscroll-y-contain">
```

---

### FIX-18 · No `loading="lazy"` on below-fold images

**Files:** Any `<img>` or `<Image>` that renders below the fold (company logos, avatar images if any).

**Fix:** Add `loading="lazy"` to all images not in the initial viewport. For Next.js `<Image>`:
```tsx
<Image ... loading="lazy" />  // or simply omit priority prop (lazy is default)
```
Do NOT add `priority` to images below fold.

---

## Priority 4 — Responsiveness

---

### FIX-19 · Tables on medium screens (768px–1023px) overflow horizontally

**Problem:** The table layouts use `lg:` breakpoint for the grid columns, meaning on tablet (768px–1023px) the table collapses to mobile card view. But the card view may still have horizontal overflow if flex-wrap isn't applied.

**Files:** Companies list, Interactions list, Contacts list table rows.

**Fix:** Check each table row's mobile card layout:
- Ensure the mobile card `<div>` uses `flex-wrap` or `grid-cols-1`
- Add `min-w-0` to text cells to prevent overflow
- Test at 768px viewport width (Chrome DevTools)

---

### FIX-20 · Mobile header has no search access

**File:** `src/components/shell/app-shell.tsx`

**Problem:** The mobile header (shown below `lg:`) has locale switcher and sign out, but no way to trigger search. Users must navigate to `/search` manually. This hurts daily usability for quick lookups.

**Fix:** Add a search icon link in the mobile header:
```tsx
<Link
  href={`/${locale}/search`}
  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
  aria-label={t("search")}
>
  <SearchIcon className="h-4 w-4" />
</Link>
```
Place between locale switcher and sign out button.

---

### FIX-21 · Bottom nav active indicator too subtle on Android Chrome

**File:** `src/components/shell/bottom-nav.tsx`

**Current:** Active state uses `bg-teal` as a `0.5px` top bar (`h-0.5 inset-x-3`). On non-retina Android screens this renders as 1px and can be barely visible.

**Fix:** Increase to `h-[3px]` and make `inset-x-4` (slightly shorter, more tab-like):
```tsx
{active && (
  <span className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-teal" />
)}
```

---

### FIX-22 · Quick-add sheets not dismissable with outside tap on some Android browsers

**File:** Any component using `<dialog>` or custom bottom sheet.

**Problem:** If the bottom sheet uses a `<dialog>` element with `::backdrop`, backdrop clicks may not propagate correctly on Android Chrome. If it uses a custom div backdrop, ensure the click handler is on the backdrop div.

**Fix:** If using `<dialog>`:
```tsx
<dialog
  onMouseDown={(e) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  }}
  ...
/>
```
If using a custom backdrop div:
```tsx
<div
  className="fixed inset-0 bg-ink/40"
  onClick={onClose}
  aria-hidden="true"
/>
```

---

### FIX-23 · Min touch target size not met on nav items

**File:** `src/components/shell/bottom-nav.tsx`, sidebar nav items.

**WCAG 2.5.8 (AA):** Touch targets must be at least 24×24px. WCAG 2.5.5 (AAA): 44×44px recommended.

**Current bottom nav items:** `flex-col items-center px-1 pb-1 pt-2` — the tap area may be less than 44px wide on a 5-tab 390px screen (390/5 = 78px wide, OK). Vertical: `pt-2 + icon-22px + gap-0.5 + label-10px + pb-1` ≈ 40px. Slightly under.

**Fix:** Change `pb-1 pt-2` to `pb-1.5 pt-2.5` to reach 44px vertical tap target.

---

### FIX-24 · Task and company detail pages lack `max-w` constraint on very wide screens

**Problem:** On 1920px+ screens, content stretches to full width with no max-width. Text lines become extremely long (bad readability).

**Fix:** Add `max-w-[1400px] mx-auto` to the page content wrapper in the new shell (when Sprint 8 T6 is implemented). For now, each page should add `lg:max-w-[1200px]` to its content root div.

---

## Summary Table

| # | Area | Severity | File(s) | Fix type |
|---|---|---|---|---|
| FIX-01 | Viewport zoom blocked | **Accessibility** | layout.tsx | 1-line fix |
| FIX-02 | Input CSS conflict | **Visual** | login/page.tsx | Refactor |
| FIX-03 | Informal label text | **UX** | login/page.tsx + i18n | Copy |
| FIX-04 | Missing focus rings | **Accessibility** | All forms | Audit |
| FIX-05 | Tagline duplicated | **Visual** | login/page.tsx | Delete duplicate |
| FIX-06 | Feature cards have borders | **Design** | login/page.tsx | Remove border |
| FIX-07 | Wrong color palette | **Design** | Multiple | Find+replace |
| FIX-08 | Non-standard opacity | **CSS hygiene** | login/page.tsx | 1-char fix |
| FIX-09 | Avatar colors identical | **Visual** | AvatarInitial | New util |
| FIX-10 | Radius inconsistency | **Design** | Multiple | Audit+fix |
| FIX-11 | Tracking inconsistency | **Design** | Multiple | Audit+fix |
| FIX-12 | Sheet animation slow | **UX** | Sheet components | Duration |
| FIX-13 | Arbitrary shadow bloat | **Performance** | Multiple | Tokenize |
| FIX-14 | Client JS at shell level | **Performance** | app-shell.tsx | Move to pages |
| FIX-15 | Hebrew font not preloaded | **Performance** | layout.tsx | Preload |
| FIX-16 | LocaleSwitcher CLS | **Performance** | locale-switcher.tsx | Verify |
| FIX-17 | Pull-to-refresh disabled | **Mobile UX** | app-shell.tsx | Overscroll |
| FIX-18 | Images not lazy loaded | **Performance** | Image components | Add lazy |
| FIX-19 | Table overflow on tablet | **Responsive** | Table rows | min-w-0 |
| FIX-20 | No mobile search access | **Mobile UX** | app-shell.tsx | Add icon |
| FIX-21 | Nav indicator too thin | **Mobile visual** | bottom-nav.tsx | h-[3px] |
| FIX-22 | Sheet not dismissable | **Mobile UX** | Sheet components | Click handler |
| FIX-23 | Touch targets too small | **Accessibility** | bottom-nav.tsx | Padding |
| FIX-24 | No max-w on wide screens | **Responsive** | Page wrappers | max-w |

**Implement order:** FIX-01 → FIX-03 → FIX-02 → FIX-04 (accessibility first), then FIX-05–FIX-12 (visual), then FIX-13–FIX-18 (performance), then FIX-19–FIX-24 (responsive).
