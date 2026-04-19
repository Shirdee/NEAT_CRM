# Sprint 14 — UI Redesign: "Focused Clarity"

## Goal
Replace current layout (dark rounded desktop header + white glass sidebar) with a full-height dark ink sidebar design. Redesign dashboard, tasks, companies, company detail, and opportunities screens to match the mockup at `crm/docs/ui-mockup.html`. No backend changes. No API changes. Pure UI/component work.

Reference mockup: open `crm/docs/ui-mockup.html` in a browser to see every target state.

---

## Constraints

- Do not change any server actions, data-fetching functions, or Prisma queries.
- Do not change routing, auth, middleware, or i18n config.
- All Tailwind classes must use the existing design token names: `ink`, `teal`, `mint`, `coral`, `amber`, `lime`, `sand`, `mist`, `white`.
- Keep full RTL / Hebrew support. The `dir` attribute and `next-intl` usage must remain intact.
- Keep `canEditRecords()` and `canManageAdminLists()` gates exactly where they are — just restyle the elements they wrap.
- All interactive elements must stay accessible (keyboard nav, focus-visible rings).
- Mobile bottom nav stays. Only desktop layout changes.

---

## Task List

### T1 — Tailwind config: add missing shadow and color utilities

**File:** `tailwind.config.ts`

Add to `theme.extend.boxShadow`:
```ts
card: "0 2px 12px rgba(16, 36, 63, 0.07)",
hover: "0 6px 24px rgba(16, 36, 63, 0.11)",
modal: "0 16px 48px rgba(16, 36, 63, 0.16)",
```

Keep existing `soft` and `panel` shadows (used elsewhere — don't delete).

Add to `theme.extend.colors`:
```ts
// amber already exists but add explicit dark variant for text use
"amber-text": "rgb(var(--color-amber-text) / <alpha-value>)",
```

**File:** `src/app/globals.css`

Add inside `:root`:
```css
--color-amber-text: 180 110 20;   /* darker amber for readable text on light bg */
```

Also add these utility keyframes (used by future sheet animations, already partially present):
```css
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

### T2 — StatusChip: add `lime` tone, fix `amber` tone

**File:** `src/components/ui/status-chip.tsx`

Current `toneClasses`:
```ts
default: "bg-sand text-ink",
teal: "bg-mint/90 text-teal",
coral: "bg-coral/12 text-coral",
amber: "bg-mist text-ink",           // ← fix: too low contrast
ink: "bg-ink text-white"
```

Replace with:
```ts
const toneClasses = {
  default: "bg-sand text-ink/70",
  teal:    "bg-teal/10 text-teal",
  coral:   "bg-coral/10 text-coral",
  amber:   "bg-amber/15 text-amber-text",   // uses new amber-text token
  lime:    "bg-lime/15 text-lime/80",       // new tone
  ink:     "bg-ink text-white",
} as const;
```

Update the `tone` prop type to include `"lime"`:
```ts
tone?: "default" | "teal" | "coral" | "amber" | "lime" | "ink";
```

**Audit:** Search all usages of `<StatusChip tone="amber">` and verify they still look correct after the color change.

---

### T3 — SurfaceCard: update radius and shadow

**File:** `src/components/ui/surface-card.tsx`

Change:
- `rounded-[28px]` → `rounded-[20px]`
- `shadow-[0_12px_40px_rgba(58,48,45,0.08)]` → `shadow-card` (the new Tailwind token from T1)
- `bg-white/95` → `bg-white`

Result:
```tsx
export function SurfaceCard({children, className}: SurfaceCardProps) {
  const hasCustomBg = className?.split(/\s+/).some((c) => /^bg-/.test(c));
  return (
    <section
      className={clsx(
        "min-w-0 w-full rounded-[20px] p-5 shadow-card sm:p-6",
        !hasCustomBg && "bg-white",
        className
      )}
    >
      {children}
    </section>
  );
}
```

---

### T4 — New component: MetricCard

**File:** `src/components/ui/metric-card.tsx` *(new file)*

```tsx
import clsx from "clsx";

type MetricCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "coral" | "amber" | "teal" | "lime";
};

const valueTone = {
  coral: "text-coral",
  amber: "text-amber-text",
  teal:  "text-teal",
  lime:  "text-lime/80",
} as const;

export function MetricCard({label, value, sub, tone = "teal"}: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[20px] bg-white p-5 shadow-card transition-shadow hover:shadow-hover">
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
        {label}
      </p>
      <p className={clsx("font-display text-4xl font-extrabold leading-none", valueTone[tone])}>
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-xs text-ink/40">{sub}</p>
      ) : null}
    </div>
  );
}
```

---

### T5 — New component: ActivityFeed

**File:** `src/components/ui/activity-feed.tsx` *(new file)*

```tsx
import clsx from "clsx";

export type ActivityItem = {
  id: string;
  type: "interaction" | "task_done" | "task_overdue" | "created" | "stage_change";
  text: string;       // already-translated description string
  time: string;       // formatted relative time string
};

type ActivityFeedProps = {
  items: ActivityItem[];
  dateGroups?: { label: string; itemIds: string[] }[];
};

const iconConfig: Record<ActivityItem["type"], { bg: string; symbol: string }> = {
  interaction:   { bg: "bg-teal/10 text-teal",   symbol: "✎" },
  task_done:     { bg: "bg-lime/15 text-lime/80", symbol: "✓" },
  task_overdue:  { bg: "bg-coral/10 text-coral",  symbol: "!" },
  created:       { bg: "bg-ink/6 text-ink/50",    symbol: "+" },
  stage_change:  { bg: "bg-amber/15 text-amber-text", symbol: "→" },
};

export function ActivityFeed({items, dateGroups}: ActivityFeedProps) {
  if (!dateGroups) {
    return (
      <div className="flex flex-col gap-0 px-5 pb-4">
        {items.map((item) => <ActivityRow key={item.id} item={item} />)}
      </div>
    );
  }
  return (
    <div className="px-5 pb-4">
      {dateGroups.map((group) => (
        <div key={group.label}>
          <p className="pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/30">
            {group.label}
          </p>
          {group.itemIds.map((id) => {
            const item = items.find((i) => i.id === id);
            return item ? <ActivityRow key={id} item={item} /> : null;
          })}
        </div>
      ))}
    </div>
  );
}

function ActivityRow({item}: {item: ActivityItem}) {
  const {bg, symbol} = iconConfig[item.type];
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div className={clsx("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", bg)}>
        {symbol}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] leading-snug text-ink/80">{item.text}</p>
        <p className="mt-0.5 text-[11px] text-ink/30">{item.time}</p>
      </div>
    </div>
  );
}
```

---

### T6 — AppShell: full sidebar redesign

**File:** `src/components/shell/app-shell.tsx`

This is the largest change. Replace the entire layout.

**New layout structure:**
- Outermost: `flex h-[100dvh] w-full overflow-hidden` (flex row, not grid)
- Left: `<Sidebar>` — 240px dark ink column (desktop only, `hidden lg:flex`)
- Right: `<main>` — `flex-1 overflow-y-auto bg-sand`
- Mobile: keep existing mobile header + bottom nav

**New sidebar markup** (server component, rendered as `<aside>`):

```tsx
<aside className="hidden w-[240px] shrink-0 flex-col bg-ink lg:flex">
  {/* Logo */}
  <div className="flex items-center gap-2.5 px-5 py-[22px]">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal font-display text-sm font-extrabold text-white">
      C
    </div>
    <span className="font-display text-[15px] font-bold text-white">
      {t("title")}
    </span>
  </div>

  {/* Core nav */}
  <nav className="flex-1 space-y-0.5 px-3">
    {coreNavItems.map((item) => (
      <SidebarNavItem key={item.href} href={item.href} label={item.label} locale={locale} icon={item.icon} />
    ))}

    {/* Admin section — only when canManageAdminLists */}
    {canManageAdminLists(session.role) && (
      <>
        <p className="px-2 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">
          {t("nav.admin")}
        </p>
        {adminNavItems.map((item) => (
          <SidebarNavItem key={item.href} href={item.href} label={item.label} locale={locale} icon={item.icon} />
        ))}
      </>
    )}
  </nav>

  {/* User footer */}
  <div className="border-t border-white/7 p-3">
    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-white/5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 font-display text-[13px] font-bold text-teal">
        {session.fullName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-white/90">{session.fullName}</p>
        <p className="text-[11px] text-white/35">{t(`roles.${session.role}`)}</p>
      </div>
      <form action="/api/logout" method="post">
        <button
          className="rounded p-1 text-white/30 transition hover:text-white/70"
          type="submit"
          aria-label={t("signOut")}
        >
          {/* Logout icon SVG — right-arrow-from-bracket */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 8H2M13 4l-3 4 3 4"/>
            <path d="M7 2H3a1 1 0 00-1 1v10a1 1 0 001 1h4"/>
          </svg>
        </button>
      </form>
    </div>
  </div>
</aside>
```

**Nav items with icons** — define icon map inline in app-shell.tsx or in a separate `nav-icons.tsx`:

| Route | Icon (SVG, 16×16, stroke 1.8) |
|---|---|
| `/dashboard` | 4-square grid |
| `/companies` | building/office |
| `/contacts` | two-people |
| `/interactions` | chat-lines |
| `/tasks` | sliders/checklist |
| `/opportunities` | home/deal |
| `/reports` | line-chart |
| `/search` | magnifier |
| `/admin/users` | person-cog |
| `/admin/lists` | list-bullet |
| `/admin/imports` | arrow-up-tray |
| `/admin/batch` | pencil-square |
| `/admin/duplicates` | document-duplicate |

**SidebarNavItem** — new client component `src/components/shell/sidebar-nav-item.tsx`:

```tsx
"use client";

import clsx from "clsx";
import {Link, usePathname} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";

type Props = {
  href: string;
  label: string;
  locale: AppLocale;
  icon: React.ReactNode;
};

export function SidebarNavItem({href, label, locale, icon}: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      locale={locale}
      className={clsx(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13.5px] font-medium transition-colors",
        active
          ? "bg-teal/18 text-white [&_svg]:text-teal"
          : "text-white/55 hover:bg-white/6 hover:text-white/85"
      )}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
```

**Main content area** (replaces the grid + aside + main):

```tsx
<div className="flex h-[100dvh] w-full overflow-hidden">
  {/* Sidebar — desktop only */}
  <aside ...> {/* as above */} </aside>

  {/* Scrollable content */}
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    {/* Mobile header — unchanged from current */}
    <header className="pt-safe lg:hidden">...</header>

    {/* Page content */}
    <main className="flex-1 overflow-y-auto overscroll-y-contain bg-sand">
      {children}
    </main>
  </div>
</div>

{/* Mobile bottom nav — unchanged */}
<BottomNav locale={locale} />
```

**Remove entirely:**
- The `<div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-ink" />` background overlay
- The full desktop `<header>` block (rounded dark card with search + quick actions)
- The `<aside>` with `rounded-[30px] border border-white/70 bg-white/70` glass sidebar
- The `max-w-7xl` wrapper grid
- The `<div className="space-y-6 pb-6">` wrapper — pages now control their own padding

**Keep:**
- QuickLogButton imports (move quick-add buttons into each page's header or a floating FAB — see T10)
- LocaleSwitcher — move into sidebar footer, next to logout button
- Mobile header — keep as-is

**Page padding convention** (new, since the max-w wrapper is gone):
- All pages now use `px-8 py-7` (desktop), `px-4 py-5` (mobile via responsive prefix)
- Each page component must add its own padding — no global padding wrapper

---

### T7 — NavItemLink: replace with SidebarNavItem

**File:** `src/components/shell/nav-item-link.tsx`

This component is replaced by `SidebarNavItem` (T6). Keep the file but mark as deprecated with a comment. Do not delete until all usages are confirmed removed.

**Search for all imports:** `grep -r "NavItemLink" src/` — should only appear in `app-shell.tsx`. Once T6 is done, the old import can be removed.

---

### T8 — Dashboard: full page redesign

**File:** `src/app/[locale]/(protected)/dashboard/page.tsx`

**Target layout** (server component):

```
<div class="flex flex-col gap-6 px-8 py-7">
  [GreetingRow]       ← greeting + period selector + quick action buttons
  [MetricsGrid]       ← 4 MetricCards in a responsive grid
  <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
    <div class="flex flex-col gap-5">
      [OverdueTasks]  ← SurfaceCard with task rows
      [RecentInteractions] ← SurfaceCard with interaction rows
    </div>
    [ActivityPanel]   ← SurfaceCard with ActivityFeed
  </div>
</div>
```

**GreetingRow** (inline in page, not a separate component):
```tsx
<div className="flex flex-wrap items-start justify-between gap-4">
  <div>
    <h1 className="font-display text-[26px] font-extrabold text-ink">
      {t("greeting", {name: session.fullName.split(" ")[0]})}
    </h1>
    <p className="mt-0.5 text-[13px] text-ink/50">{t("greetingSub")}</p>
  </div>
  <div className="flex items-center gap-3">
    <PeriodToggle />                          {/* client component, see below */}
    {canEditRecords(session.role) && (
      <>
        <QuickLogButton href={...} label={t("quickLog")} sheetLabel={t("quickLog")} />
        <QuickLogButton href={...} label={t("quickTask")} sheetLabel={t("quickTask")} />
      </>
    )}
  </div>
</div>
```

**PeriodToggle** — new small client component `src/components/dashboard/period-toggle.tsx`:
- Renders 3 pill buttons: 7d / 30d / 90d
- On change, calls `router.push` with `?period=30` query param (the page already reads `searchParams.period`)
- Active: `bg-teal text-white rounded-full`, inactive: `bg-mist text-ink/50 rounded-full`
- Height 32px total

**MetricsGrid:**
```tsx
<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
  <MetricCard label={t("metrics.overdue")}  value={snapshot.overdueTasks}     tone="coral" sub={t("metrics.overdueUp", {n: 2})} />
  <MetricCard label={t("metrics.dueToday")} value={snapshot.dueTodayTasks}    tone="amber" sub={t("metrics.highPriority", {n: 3})} />
  <MetricCard label={t("metrics.meetings")} value={snapshot.meetingsInPeriod} tone="teal"  sub={t("metrics.vsPrior", {n: 4})} />
  <MetricCard label={t("metrics.openDeals")}value={snapshot.openOpportunities}tone="lime"  sub={formatMoney(snapshot.openDealValue)} />
</div>
```

Note: `getDashboardSnapshot()` already returns `overdueTasks`, `dueTodayTasks`, `meetingsInPeriod`, `openOpportunities`. Add `openDealValue: number` to that function's return type and query if missing. If the field doesn't exist, show only the count for now.

**OverdueTasks section:**
```tsx
<SurfaceCard>
  <div className="flex items-center justify-between px-1 pb-3">
    <div className="flex items-center gap-2">
      <h2 className="font-display text-[14px] font-bold text-ink">{t("sections.overdue")}</h2>
      <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[11px] font-semibold text-coral">
        {snapshot.overdueTasks}
      </span>
    </div>
    <Link href={`/${locale}/tasks`} className="text-[12px] font-medium text-teal hover:underline">
      {t("viewAll")} →
    </Link>
  </div>
  {overdueTasks.map((task) => (
    <TaskRow key={task.id} task={task} locale={locale} />   {/* see TaskRow spec below */}
  ))}
</SurfaceCard>
```

**TaskRow** (inline in dashboard, not shared yet):
- `flex items-center gap-3 py-2.5 rounded-lg cursor-pointer hover:bg-sand transition-colors`
- Checkbox circle: `h-[18px] w-[18px] rounded-full border-2 border-ink/20 shrink-0`
- Task text: `flex-1 text-[13.5px] font-medium text-ink truncate`
- Company link: `text-[12px] text-teal font-medium`
- Date pill: `shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold` + color by urgency

Date pill urgency logic:
```ts
const isOverdue = task.dueDate && new Date(task.dueDate) < now;
const isToday   = task.dueDate && isSameDay(new Date(task.dueDate), now);
// overdue → bg-coral/10 text-coral
// today   → bg-amber/15 text-amber-text
// future  → bg-ink/6 text-ink/50
```

**RecentInteractions section:**
```tsx
<SurfaceCard>
  <div className="flex items-center justify-between px-1 pb-3">
    <h2 className="font-display text-[14px] font-bold text-ink">{t("sections.recent")}</h2>
    <Link href={`/${locale}/interactions`} className="text-[12px] text-teal hover:underline">{t("viewAll")} →</Link>
  </div>
  {recentInteractions.map((interaction) => (
    <InteractionRow key={interaction.id} interaction={interaction} locale={locale} />
  ))}
</SurfaceCard>
```

**InteractionRow** (inline in dashboard):
- `flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-sand transition-colors`
- Avatar circle: first 2 letters of contact name, `h-7 w-7 rounded-full bg-teal/15 text-teal font-display text-[11px] font-bold`
- Contact name: `text-[13px] font-semibold text-ink`
- Company: `text-[12px] text-ink/50`
- Type chip: `<StatusChip tone="teal">Meeting</StatusChip>` etc.
- Time: `text-[11px] text-ink/30 ml-auto shrink-0`

**Activity Panel (right column):**
```tsx
<SurfaceCard className="xl:sticky xl:top-7">
  <div className="flex items-center justify-between px-1 pb-2">
    <h2 className="font-display text-[14px] font-bold text-ink">{t("sections.activity")}</h2>
  </div>
  <ActivityFeed items={activityItems} dateGroups={dateGroups} />
</SurfaceCard>
```

Activity items for dashboard: use last 10 entries from a new function `getRecentActivity(userId)` that queries interactions, tasks, and opportunities ordered by `updatedAt desc`. Build `ActivityItem` objects from each record type.

Add `src/lib/data/activity.ts` with:
```ts
export async function getRecentActivity(limit = 10): Promise<ActivityItem[]>
```
Query interactions (type=interaction), completed tasks (type=task_done), overdue tasks (type=task_overdue), newly created companies/opportunities (type=created). Return sorted array.

**i18n keys to add** in `en.json` and `he.json` under `"Dashboard"`:
```json
"greeting": "Good morning, {name} ✦",
"greetingSub": "Here's what needs your attention today",
"metrics": {
  "overdue": "Overdue Tasks",
  "dueToday": "Due Today",
  "meetings": "Meetings · {period}",
  "openDeals": "Open Deals",
  "overdueUp": "↑ {n} since yesterday",
  "highPriority": "{n} high priority",
  "vsPrior": "↑ {n} vs prior period"
},
"sections": {
  "overdue": "Overdue",
  "recent": "Recent Interactions",
  "activity": "Activity Feed"
}
```

---

### T9 — Companies list: table styling + filter card

**File:** `src/app/[locale]/(protected)/companies/page.tsx`

**Page structure** (keep all existing data fetching, only change JSX):

```
<div class="flex flex-col gap-5 px-8 py-7">
  [PageHeader]    ← title + count badge + New Company button
  [FilterCard]    ← white card with search + dropdowns + saved views
  [DataTable]     ← borderless table
</div>
```

**PageHeader:**
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
    <span className="rounded-full bg-mist px-3 py-0.5 text-[13px] font-medium text-ink/50">
      {totalCount}
    </span>
  </div>
  <div className="flex items-center gap-2">
    {canEditRecords(session.role) && (
      <Link
        href={`/${locale}/companies/new`}
        className="rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
      >
        + {t("createCompany")}
      </Link>
    )}
  </div>
</div>
```

**FilterCard:**
```tsx
<div className="flex flex-wrap items-center gap-3 rounded-[20px] bg-white p-4 shadow-card">
  {/* Search */}
  <div className="relative min-w-[200px] flex-1">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/30" />
    <input
      name="q"
      defaultValue={searchParams.q}
      placeholder={t("searchPlaceholder")}
      className="w-full rounded-[12px] bg-mist py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/30"
    />
  </div>
  {/* Source select */}
  <select name="source" defaultValue={searchParams.source} className="rounded-[12px] bg-mist px-4 py-2.5 text-[13px] text-ink/70 focus:outline-none focus:ring-2 focus:ring-teal/30">
    <option value="">{t("filters.allSources")}</option>
    {sourceOptions.map(...)}
  </select>
  {/* Stage select */}
  <select name="stage" ...>...</select>
  {/* Saved views bar */}
  <SavedViewBar views={savedViews} activeView={searchParams.view} locale={locale} />
</div>
```

**DataTable** — replace current table markup:

Table wrapper: `rounded-[20px] bg-white shadow-card overflow-hidden`

Table header row: `bg-mist` (not a border — just tonal bg)
```tsx
<thead>
  <tr className="bg-mist">
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
      {t("columns.company")}
    </th>
    {/* repeat for other columns */}
  </tr>
</thead>
```

Table body rows — **remove all `border-b` classes**. Use subtle inner shadow instead:
```tsx
<tr className="group cursor-pointer transition-colors hover:bg-sand [&:not(:last-child)]:shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]">
```

Company cell (first column):
```tsx
<td className="px-4 py-0 h-[52px]">
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/12 font-display text-[13px] font-bold text-teal">
      {company.name[0].toUpperCase()}
    </div>
    <span className="text-[13.5px] font-semibold text-ink">{company.name}</span>
  </div>
</td>
```

"Last Activity" cell: if within last 3 days → `text-teal font-medium`, otherwise `text-ink/50`.

Footer row: `<tr><td colSpan={6} className="px-4 py-3 text-center text-[13px] font-medium text-teal cursor-pointer hover:bg-sand">Show all {totalCount} →</td></tr>`

---

### T10 — Quick-add buttons: move to per-page placement

The desktop header's quick-add buttons are removed in T6. Replace with:

**Option A (preferred):** Add quick-add buttons to each relevant page header (interactions, tasks, opportunities) using the existing `QuickLogButton` component. These are already on mobile sheets — just add them to desktop page headers.

**Option B (fallback):** Add a floating action button (FAB) on mobile:
```tsx
// In interactions/page.tsx, tasks/page.tsx, opportunities/page.tsx
{canEditRecords(session.role) && (
  <QuickLogButton
    href={`/${locale}/interactions/new?compact=1`}
    label="+ Log Interaction"
    sheetLabel="Log Interaction"
    className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white"
  />
)}
```

---

### T11 — Company detail: 2-column layout with activity panel

**File:** `src/app/[locale]/(protected)/companies/[companyId]/page.tsx`

**New layout:**
```
<div class="grid grid-cols-1 gap-5 px-8 py-7 xl:grid-cols-[1fr_340px]">
  <div class="flex flex-col gap-4">  {/* left column */}
    [HeroCard]
    [TabsSection]
  </div>
  <div>  {/* right column */}
    [ActivityPanel]
  </div>
</div>
```

**Breadcrumb** (above grid):
```tsx
<div className="px-8 pt-5 pb-0 text-[12px] text-ink/40">
  <Link href={`/${locale}/companies`} className="text-teal">{t("companies")}</Link>
  {" / "}
  {company.name}
</div>
```

**HeroCard** (SurfaceCard):
```tsx
<SurfaceCard>
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="font-display text-[26px] font-extrabold text-ink">{company.name}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {stageValue && <StatusChip tone={stageToTone(stageValue)}>{stageLabelLocale}</StatusChip>}
        {sourceValue && <StatusChip tone="default">{sourceLabelLocale}</StatusChip>}
        {isStale && <StatusChip tone="amber">{t("stale", {days: staleDays})}</StatusChip>}
      </div>
    </div>
    {canEditRecords(session.role) && (
      <div className="flex items-center gap-2">
        <QuickLogButton href={...} label={t("logInteraction")} ... />
        <QuickLogButton href={...} label={t("addTask")} ... />
        <Link href={editHref} className="rounded-full border border-ink/20 px-4 py-2 text-[13px] font-medium text-ink hover:bg-ink/5">
          {t("edit")}
        </Link>
      </div>
    )}
  </div>

  {/* Notes */}
  {company.notes && (
    <p className="mt-4 text-[13.5px] leading-relaxed text-ink/60">{company.notes}</p>
  )}

  {/* Info grid */}
  <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
    <InfoCell label={t("fields.website")} value={...} tone="teal" />
    <InfoCell label={t("fields.stage")}   value={stageLabelLocale} />
    <InfoCell label={t("fields.source")}  value={sourceLabelLocale} />
    <InfoCell label={t("fields.lastActivity")} value={formattedLastActivity} tone={isStale ? "amber" : "default"} />
  </div>
</SurfaceCard>
```

**InfoCell** — new small inline component or add to `src/components/ui/info-cell.tsx`:
```tsx
type InfoCellProps = { label: string; value: string | null; tone?: "teal" | "amber" | "default" };
export function InfoCell({label, value, tone = "default"}: InfoCellProps) {
  const valueColor = tone === "teal" ? "text-teal" : tone === "amber" ? "text-amber-text" : "text-ink/80";
  return (
    <div className="rounded-[12px] bg-mist px-4 py-3.5">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/40">{label}</p>
      <p className={clsx("text-[13.5px] font-medium", valueColor)}>{value ?? "—"}</p>
    </div>
  );
}
```

**TabsSection** — keep existing tabs (Contacts, Interactions, Tasks, Opportunities).

Style the tab bar:
```tsx
<div className="flex border-b-2 border-ink/6 bg-white rounded-t-[20px] px-1">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      className={clsx(
        "-mb-0.5 px-5 py-3 text-[13px] font-medium transition-colors border-b-2",
        activeTab === tab.key
          ? "border-teal text-teal font-semibold"
          : "border-transparent text-ink/50 hover:text-ink"
      )}
    >
      {tab.label}
      {tab.count > 0 && (
        <span className={clsx(
          "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
          activeTab === tab.key ? "bg-teal/12 text-teal" : "bg-ink/6 text-ink/40"
        )}>
          {tab.count}
        </span>
      )}
    </button>
  ))}
</div>
```

Tab content: `bg-white rounded-b-[20px] shadow-card`

**Contacts tab content** — contact rows:
```tsx
<div className="divide-y-0 px-5 py-2">
  {contacts.map((contact) => (
    <div key={contact.id} className="flex items-center gap-3 py-2.5 rounded-lg cursor-pointer hover:bg-sand transition-colors">
      <AvatarInitial name={contact.fullName} />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-ink">{contact.fullName}</p>
        <p className="text-[12px] text-ink/50">{contact.roleTitle}</p>
        <p className="text-[12px] text-teal">{contact.primaryEmail}</p>
      </div>
      {contact.isPrimary && <StatusChip tone="teal">{t("primary")}</StatusChip>}
    </div>
  ))}
</div>
```

**AvatarInitial** — new component `src/components/ui/avatar-initial.tsx`:
```tsx
type Props = { name: string; size?: "sm" | "md" | "lg" };
const sizes = { sm: "h-7 w-7 text-[11px]", md: "h-8 w-8 text-[13px]", lg: "h-10 w-10 text-[15px]" };
export function AvatarInitial({name, size = "md"}: Props) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={clsx("shrink-0 rounded-full bg-teal/15 font-display font-bold text-teal flex items-center justify-center", sizes[size])}>
      {initials}
    </div>
  );
}
```

**ActivityPanel** (right column, uses `getRecentActivity` from T8):
```tsx
<SurfaceCard>
  <div className="flex items-center justify-between px-1 pb-2">
    <h2 className="font-display text-[14px] font-bold text-ink">{t("activity")}</h2>
    {canEditRecords(session.role) && (
      <button className="text-[12px] text-teal hover:underline">+ Note</button>
    )}
  </div>
  <ActivityFeed items={activityItems} dateGroups={dateGroups} />
</SurfaceCard>
```

---

### T12 — Tasks list: grouped card layout

**File:** `src/app/[locale]/(protected)/tasks/page.tsx`  
**File:** `src/components/tasks/task-list-client.tsx` (or wherever the grouping logic lives)

**New page structure:**
```
<div class="flex flex-col gap-5 px-8 py-7 max-w-[860px]">
  [PageHeader]
  [FilterCard]
  [TaskGroups]
</div>
```

**TaskGroups** — replace the existing grouped rendering with this pattern:

Each group:
```tsx
<div className="flex flex-col gap-1.5">
  {/* Group header */}
  <div className="flex items-center gap-2 py-1.5">
    <h2 className={clsx("font-display text-[13px] font-bold", groupTitleColor[group.key])}>
      {group.label}
    </h2>
    <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-semibold", groupBadgeStyle[group.key])}>
      {group.tasks.length}
    </span>
  </div>

  {/* Task cards — one card per task, not a table */}
  {group.tasks.map((task) => (
    <TaskCard key={task.id} task={task} locale={locale} />
  ))}
</div>
```

Group key → style mapping:
```ts
const groupTitleColor = {
  overdue:  "text-ink",
  today:    "text-ink",
  upcoming: "text-ink",
  done:     "text-ink/30",
};
const groupBadgeStyle = {
  overdue:  "bg-coral/10 text-coral",
  today:    "bg-amber/15 text-amber-text",
  upcoming: "bg-ink/6 text-ink/50",
  done:     "bg-lime/15 text-lime/80",
};
```

**TaskCard** — new component `src/components/tasks/task-card.tsx`:
```tsx
type TaskCardProps = { task: TaskWithRelations; locale: AppLocale };

export function TaskCard({task, locale}: TaskCardProps) {
  const isDone     = task.status === "done";
  const isOverdue  = !isDone && task.dueDate && new Date(task.dueDate) < now;
  const isToday    = !isDone && task.dueDate && isSameDay(task.dueDate, now);

  return (
    <Link
      href={`/${locale}/tasks/${task.id}`}
      className="flex items-center gap-3 rounded-[10px] bg-white px-4 py-2.5 shadow-card transition hover:shadow-hover hover:-translate-y-px"
    >
      {/* Checkbox visual */}
      <div className={clsx(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
        isDone
          ? "border-transparent bg-lime/20 text-lime/80"
          : "border-ink/20"
      )}>
        {isDone && "✓"}
      </div>

      {/* Priority dot */}
      <div className={clsx("h-2 w-2 shrink-0 rounded-full", {
        "bg-coral":   task.priority === "high",
        "bg-amber":   task.priority === "medium",
        "bg-ink/25":  task.priority === "low",
      })} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={clsx("text-[13.5px] font-medium text-ink truncate", isDone && "line-through text-ink/30")}>
          {task.notes}
        </p>
        <p className="text-[12px] text-ink/50">
          {task.company && <span className="text-teal font-medium">{task.company.name}</span>}
          {task.contact && task.company && " · "}
          {task.contact && task.contact.fullName}
        </p>
      </div>

      {/* Right: priority chip + date pill */}
      <div className="flex shrink-0 items-center gap-2">
        <StatusChip tone={task.priority === "high" ? "coral" : task.priority === "medium" ? "amber" : "default"}>
          {t(`priority.${task.priority}`)}
        </StatusChip>
        <span className={clsx("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", {
          "bg-coral/10 text-coral":       isOverdue,
          "bg-amber/15 text-amber-text":  isToday,
          "bg-ink/6 text-ink/50":         !isOverdue && !isToday,
          "bg-ink/4 text-ink/25":         isDone,
        })}>
          {formatTaskDate(task.dueDate, isDone)}
        </span>
      </div>
    </Link>
  );
}
```

**Group ordering** (keep existing logic, just rename keys if needed):
1. `overdue` — dueDate < today, not done
2. `today` — dueDate === today, not done
3. `upcoming` / `this_week` — dueDate > today, not done
4. `done` — status === "done"

---

### T13 — Opportunities: add Kanban pipeline view

**File:** `src/app/[locale]/(protected)/opportunities/page.tsx`

**View toggle** — add `?view=pipeline` query param support. Default: `table`.

```tsx
const viewMode = searchParams.view === "pipeline" ? "pipeline" : "table";
```

**Page header** additions:
```tsx
<div className="flex items-center gap-2">
  <ViewToggle current={viewMode} locale={locale} />   {/* client component */}
  {canEditRecords(...) && <Link href=".../new" className="rounded-full bg-coral px-5 py-2.5 ...">+ New Deal</Link>}
</div>
```

**ViewToggle** — new client component `src/components/opportunities/view-toggle.tsx`:
```tsx
"use client";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
// Renders two buttons: Table and Pipeline
// On click, updates ?view= query param
```

**Kanban board** (rendered when `viewMode === "pipeline"`):

```tsx
// src/components/opportunities/kanban-board.tsx (new, client component)
"use client";

type KanbanBoardProps = {
  opportunities: OpportunityWithRelations[];
  stages: ListValue[];    // all stage list values, ordered
  locale: AppLocale;
};

export function KanbanBoard({opportunities, stages, locale}: KanbanBoardProps) {
  return (
    <div className="flex gap-3.5 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const cards = opportunities.filter((o) => o.stageId === stage.id);
        return (
          <KanbanColumn key={stage.id} stage={stage} cards={cards} locale={locale} />
        );
      })}
    </div>
  );
}

function KanbanColumn({stage, cards, locale}) {
  return (
    <div className="w-[240px] shrink-0 flex flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink/50">
          {stage.labelEn /* or labelHe based on locale */}
        </h3>
        <span className="rounded-full bg-ink/6 px-2 py-0.5 text-[11px] font-semibold text-ink/50">
          {cards.length}
        </span>
      </div>
      {/* Cards */}
      {cards.map((opp) => <KanbanCard key={opp.id} opp={opp} locale={locale} />)}
      {/* Add link */}
      <Link
        href={`/${locale}/opportunities/new?stageId=${stage.id}`}
        className="flex items-center gap-1.5 rounded-lg px-1 py-2 text-[12px] font-medium text-ink/30 hover:text-teal"
      >
        + Add deal
      </Link>
    </div>
  );
}

function KanbanCard({opp, locale}) {
  return (
    <Link
      href={`/${locale}/opportunities/${opp.id}`}
      className="rounded-[14px] bg-white p-4 shadow-card transition hover:shadow-hover hover:-translate-y-0.5 block"
    >
      <p className="text-[13.5px] font-semibold text-ink">{opp.opportunityName}</p>
      <p className="mt-1 text-[12px] text-teal">{opp.company?.name}</p>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-display text-[14px] font-bold text-coral">
          {opp.estimatedValue ? formatMoney(opp.estimatedValue) : "—"}
        </span>
        <span className="text-[11px] text-ink/40">
          {opp.targetCloseDate ? formatDate(opp.targetCloseDate) : "—"}
        </span>
      </div>
    </Link>
  );
}
```

**Table view** — keep existing table, apply same borderless styling as Companies (T9).

---

### T14 — Interactions list: styling only

**File:** `src/app/[locale]/(protected)/interactions/page.tsx`

Apply same pattern as Companies (T9):
- Page header with title + count + New button
- FilterCard: white rounded card with search + dropdowns
- Table: same borderless styling (no `border-b`, hover bg-sand, tonal header)

No structural changes to data fetching.

---

### T15 — Contacts list: styling only

**File:** `src/app/[locale]/(protected)/contacts/page.tsx`

Same treatment as T14.

---

### T16 — Reports: styling only

**File:** `src/app/[locale]/(protected)/reports/page.tsx`

Apply new page padding and SurfaceCard usage. No structural changes.

---

### T17 — Admin pages: styling only

**Files:** `src/app/[locale]/(protected)/admin/*/page.tsx`

Apply new page padding. No structural changes to admin logic. Keep all functionality.

---

### T18 — Login page: update layout

**File:** `src/app/[locale]/(public)/login/page.tsx`

No sidebar (public route). Update the 2-column layout:
- Left panel: `bg-ink` full height, 420px wide, flex col, justify-between
  - Top: logo + app name
  - Middle: headline + subtitle
  - Bottom: 3 feature cards (secure, bilingual, mobile)
- Right panel: `bg-sand` flex center, contains white form card (24px radius, `shadow-modal`)

Form card fields — keep same inputs, update styling:
```tsx
<input className="w-full rounded-[12px] bg-mist border-none px-4 py-3 text-[14px] text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/35" />
```
Submit button:
```tsx
<button className="mt-2 w-full rounded-full bg-coral py-3.5 text-[15px] font-semibold text-white transition hover:bg-coral/90">
  {t("signIn")} →
</button>
```

---

## Implementation Order

Do these in order — each phase unblocks the next:

**Phase 1 — Foundation** (no visual regressions, additive only):
1. T1 — Tailwind config + CSS tokens
2. T2 — StatusChip lime tone + amber fix
3. T3 — SurfaceCard radius/shadow
4. T4 — MetricCard (new component)
5. T5 — ActivityFeed (new component)
6. T7 — AvatarInitial (new component)

**Phase 2 — Shell** (biggest visual change, affects every page):
6. T6 — AppShell full sidebar redesign
7. T7 — SidebarNavItem component
8. T10 — Move quick-add buttons to page headers

After T6, run the app and verify all pages still load. The main layout changes here. Fix any padding/overflow issues before proceeding.

**Phase 3 — Screens** (can be parallelised by screen):
9.  T8 — Dashboard
10. T9 — Companies list
11. T11 — Company detail
12. T12 — Tasks list
13. T13 — Opportunities + Kanban
14. T14 — Interactions list (quick, styling only)
15. T15 — Contacts list (quick, styling only)
16. T16 — Reports (trivial)
17. T17 — Admin pages (trivial)
18. T18 — Login page

---

## New Files Summary

| File | Purpose |
|---|---|
| `src/components/ui/metric-card.tsx` | MetricCard component |
| `src/components/ui/activity-feed.tsx` | ActivityFeed + ActivityRow |
| `src/components/ui/avatar-initial.tsx` | AvatarInitial circle |
| `src/components/ui/info-cell.tsx` | InfoCell for detail pages |
| `src/components/shell/sidebar-nav-item.tsx` | Dark sidebar nav link |
| `src/components/tasks/task-card.tsx` | Individual task card |
| `src/components/dashboard/period-toggle.tsx` | 7d/30d/90d client toggle |
| `src/components/opportunities/kanban-board.tsx` | Kanban pipeline view |
| `src/components/opportunities/view-toggle.tsx` | Table/Pipeline view toggle |
| `src/lib/data/activity.ts` | getRecentActivity() query |

---

## Modified Files Summary

| File | Change |
|---|---|
| `tailwind.config.ts` | Add shadow-card, shadow-hover, shadow-modal |
| `src/app/globals.css` | Add --color-amber-text token |
| `src/components/ui/status-chip.tsx` | Add lime tone, fix amber |
| `src/components/ui/surface-card.tsx` | radius 28→20, shadow update |
| `src/components/shell/app-shell.tsx` | Full sidebar redesign |
| `src/app/[locale]/(protected)/dashboard/page.tsx` | Full redesign |
| `src/app/[locale]/(protected)/companies/page.tsx` | Filter card + borderless table |
| `src/app/[locale]/(protected)/companies/[companyId]/page.tsx` | 2-col + activity panel |
| `src/app/[locale]/(protected)/tasks/page.tsx` | Grouped card layout |
| `src/app/[locale]/(protected)/opportunities/page.tsx` | + Kanban view |
| `src/app/[locale]/(protected)/interactions/page.tsx` | Styling only |
| `src/app/[locale]/(protected)/contacts/page.tsx` | Styling only |
| `src/app/[locale]/(protected)/reports/page.tsx` | Styling only |
| `src/app/[locale]/(protected)/admin/*/page.tsx` | Padding only |
| `src/app/[locale]/(public)/login/page.tsx` | Layout update |
| `src/messages/en.json` | Add new i18n keys |
| `src/messages/he.json` | Add new i18n keys (Hebrew) |

---

## Verification Checklist

After each phase, run:
```bash
cd crm/app
npm run typecheck    # zero TS errors
npm run lint         # zero lint errors
npm run test         # all tests green
npm run build        # successful build
```

Manual verification per screen:
- [ ] Dashboard loads, 4 metric cards visible, overdue tasks shown, activity feed visible
- [ ] Companies list: no border between rows, hover changes bg, filter card visible
- [ ] Company detail: 2-column on xl viewport, tabs work, activity panel visible
- [ ] Tasks: grouped Overdue/Today/Week/Done, individual cards with priority dots
- [ ] Opportunities: view toggle works, Kanban renders columns
- [ ] Login: 2-col layout desktop, form submits correctly
- [ ] Mobile (390px viewport): sidebar hidden, bottom nav visible, all pages scroll correctly
- [ ] Hebrew locale: RTL layout preserved, bilingual chips correct
- [ ] Admin role: admin nav section visible in sidebar
- [ ] Viewer role: no create/edit buttons rendered
