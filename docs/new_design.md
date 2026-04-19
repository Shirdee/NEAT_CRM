# CRM — New Design Brief
*For Stitch screen generation. Sprint 8+ design direction.*

---

## Design Philosophy: "Focused Clarity"

Inspired by Attio, Linear, and Notion. Data-dense but breathing. Every pixel earns its place.
Three rules:
1. **No borders as dividers** — use background shifts and tonal layering instead
2. **Teal leads, coral acts** — teal (#0F766E) is the brand, coral (#DD6B4D) is the call-to-action
3. **Mobile-first interactions, desktop-first layout** — design both, but mobile dictates the interaction model

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `ink` | `#10243F` | Primary text, nav bg, dark surfaces |
| `teal` | `#0F766E` | Brand, active states, links, badges |
| `mint` | `#99EFE5` | Teal tints, hover states, success bg |
| `coral` | `#DD6B4D` | Primary CTA buttons, alerts, overdue |
| `amber` | `#F4B740` | Warnings, medium priority |
| `lime` | `#8BCF5B` | Success, completed, on-track |
| `sand` | `#F5F0E7` | Page background |
| `mist` | `#F8F3EA` | Card backgrounds, input fields |
| `white` | `#FFFFFF` | Elevated cards, modals |

### Typography
- **Headlines**: Manrope 700–800, -0.02em tracking
- **Body**: Inter 400–500
- **UI labels**: Inter 500, uppercase, 0.06em tracking, 11px
- **Monospace** (dates, IDs): Inter 400

### Spacing & Shape
- Card radius: 20px (cards), 12px (inputs/chips), 9999px (pills/buttons)
- Page padding: 24px mobile, 32px desktop
- Section gap: 24px
- Card padding: 20px

### Elevation
- Page bg: sand `#F5F0E7`
- Section bg: `#F0EBE2` (slightly deeper sand)
- Card bg: white `#FFFFFF`
- Input bg: mist `#F8F3EA`
- Dark surface (nav): ink `#10243F`
- Shadow: `0 2px 12px rgba(16,36,63,0.08)` for cards, `0 8px 32px rgba(16,36,63,0.12)` for modals

---

## Navigation

### Desktop Sidebar (240px)
- Dark ink background (`#10243F`)
- Company logo / app name at top (white text)
- Navigation items: icon + label, 40px height, 8px radius
- Active: teal background tint (`rgba(15,118,110,0.2)`), teal-colored icon + label
- Hover: `rgba(255,255,255,0.06)` bg
- Sections: Core (Dashboard, Companies, Contacts, Interactions, Tasks, Opportunities, Reports) | Admin (collapsed by default, expandable)
- Bottom: user avatar + name + role chip + logout

### Mobile Bottom Navigation (5 tabs)
- White bg, 1px top border in `rgba(16,36,63,0.08)`
- Icons: 24px, labels: 10px Inter
- Active: teal icon + teal label dot indicator above
- Tabs: Home, Companies, Contacts, Tasks, Log (Interactions)

---

## Screen Specifications

### 1. Dashboard
**Layout**: 3-column grid on desktop. Left = 240px nav. Center = main content (flex, max-w 900px). Right = optional activity panel (320px, collapsible).

**Header row**:
- "Good morning, [Name]" in Manrope 28px semibold
- Period selector pills (7d / 30d / 90d), rounded-full, mist bg, active=teal
- Quick-add button group: "+ Interaction", "+ Task", "+ Opportunity" — coral pill buttons

**Metric cards row** (4 cards, equal width):
- Card bg: white, 20px radius, subtle shadow
- Each: label (11px uppercase Inter, ink/50), number (Manrope 32px bold, ink), delta or icon badge bottom-right
- Cards: Overdue Tasks (coral accent), Today's Tasks (amber), Meetings this period (teal), Open Opportunities (lime)

**Priority section** (center):
- Title "Overdue" with count badge (coral pill)
- Task rows: company name (teal link), task notes (ink/70), due date pill (coral bg if overdue, amber if today)
- Compact, no card borders — rows on white bg

**Recent interactions section**:
- 5 most recent, compact row: avatar initial circle + contact name + company + interaction type chip + time ago (ink/40)

**Insights sidebar** (right, collapsible):
- "Active Companies" section — stacked company cards (logo initial, name, last activity)
- Upcoming tasks timeline

---

### 2. Companies List
**Layout**: Sidebar nav + full-width table area

**Page header**:
- "Companies" Manrope 24px bold
- Company count badge (mist pill)
- "+ New Company" button (coral, rounded-full, right side)

**Filter bar** (below header, above table):
- Search input (full-width mist bg, magnifier icon, 12px radius)
- Filter chips row: Source (dropdown), Stage (dropdown), Inactive (toggle)
- Saved Views: horizontal scrollable pill row below filters (teal outline for active view)

**Table** (desktop):
- Header row: `surface-container-low` bg, Inter 11px uppercase labels, ink/40
- No vertical dividers. Row height 52px.
- Columns: Company name (Manrope 500 + favicon initial circle), Website (ink/50), Stage chip, Source chip, Last Activity (relative time), Contacts count badge
- Row hover: white → sand bg transition (no shadow)
- Row click → company detail (no full navigation, slide-in panel on desktop)

**Mobile card list**:
- Company name + stage chip on row 1
- Source + last activity on row 2 (ink/50 small)
- Tap → full detail page

---

### 3. Company Detail
**Layout**: 2-column on desktop (detail left 60%, activity right 40%). Single column on mobile.

**Header card** (full-width, white, 20px radius):
- Row 1: Company name (Manrope 28px bold) + Stage chip + Source chip
- Row 2: Website link (teal) + Last activity date (ink/50)
- Row 3: Action buttons — "Log Interaction" (coral), "Add Task" (ink outline), "Edit" (ghost)
- Empty notes → muted "+ Add notes" prompt

**Info grid** (4 cells, mist bg, 12px radius each):
- Stage, Source, Website, Segment — label above value pattern

**Related sections** (tabs: Contacts | Interactions | Tasks | Opportunities):
- Tab bar: Inter 14px, active = teal underline + teal text
- Each tab shows a compact list of related records (5 max, "View all →" link)
- Contact rows: avatar initial + full name + role title + email (one-liner)
- Interaction rows: date + type chip + subject (one-liner)
- Task rows: due date badge + notes + status chip

**Activity panel** (right, desktop only):
- "Activity" header
- Chronological feed: date group headers (ink/30 small caps) + activity items
- Activity item: icon (type) + description + timestamp
- "Add note" input at bottom (inline, ghost style)

---

### 4. Contacts List
Same pattern as Companies List.
Columns: Name (avatar initial), Company (teal link), Email, Phone, Last Interaction date.

---

### 5. Interactions List
**Filter bar**: Search + Company (live search) + Contact (live search) + Type (dropdown) + Date range

**Table columns**: Contact name + Company | Subject | Type chip | Outcome chip | Date

**Quick-log FAB** (mobile): coral floating button bottom-right "+" → opens bottom sheet

---

### 6. Tasks List
**Grouped layout** (no table — grouped rows):
- Section headers: "Overdue" (coral), "Today" (amber), "This Week" (ink), "Upcoming" (ink/50), "Done" (ink/30 strikethrough style)
- Row: Checkbox circle (tap to complete) | task notes | company + contact links (teal) | due date pill | priority dot (coral/amber/ink)
- Completing a task: smooth cross-out animation + move to Done section

**Filter bar**: Search + Company + Contact + Status + Priority

---

### 7. Opportunities List
**Two view modes** (toggle pills top-right):
- **Table** — Name | Company | Stage chip | Status chip | Value | Close date
- **Pipeline** (Kanban) — Column per stage, card per opportunity (name + company + value + date)

**Kanban card**: white, 12px radius, shadow-sm. Name (Inter 500) + company (teal small) + value (Manrope 600 coral) + close date (small ink/50)

---

### 8. Quick-Add Interaction (Bottom Sheet — Mobile)
Sheet height: ~70vh, swipe-to-dismiss
- Handle bar at top (standard)
- "Log Interaction" title + close X
- Fields stacked: Company (live search), Contact (live search, auto-filtered by company), Type (pills: Meeting / Call / Email / Other), Date (today pre-filled), Subject (text), Outcome (text area)
- "Save" button: full-width coral, 48px height, rounded-full
- Optional: "+ Add follow-up task" toggle at bottom

---

### 9. Login
**Desktop**: 2-col. Left = dark ink panel (brand, tagline, 3 feature cards). Right = white form card (centered).
**Mobile**: Full-screen form over sand bg.

**Form**: Email input + Password input (show/hide toggle) + "Sign in" coral button (full width) + Error message (coral, above form)

**Brand panel** (desktop left):
- Company name / logo
- Tagline
- 3 feature chips: "Mobile-ready", "Bilingual (EN/HE)", "Role-based access"

---

### 10. Admin — Import Batches
**Sidebar**: Import history (list of batches, date + status chip)
**Main**: Upload area (dashed border, drag-drop zone, coral upload button) + Active batch review

**Batch review card**: White, 20px radius. Sheet name + row count + status. Commit/reject buttons (coral/ghost).
**Issues section**: 3-tab (Errors | Warnings | Info) with row-level review.

---

## Component Library

| Component | Specs |
|---|---|
| `StatusChip` | Rounded-full, 11px uppercase Inter. Tones: teal (mint bg), coral (coral/10 bg), amber (amber/15 bg), lime (lime/15 bg), ink (ink/8 bg) |
| `MetricCard` | White, 20px radius, shadow-sm. Label 11px uppercase ink/50. Value Manrope 32px ink. |
| `AvatarInitial` | Circle, 36px. Bg: teal/20 or ink/10. Text: teal or ink, Manrope 600 14px. |
| `PriorityDot` | 8px circle. Coral = high, amber = medium, ink/30 = low. |
| `LiveSearchInput` | Mist bg, 12px radius, magnifier icon left, 44px height. Dropdown: white card, shadow-md, 8px radius. |
| `PillButton` | Rounded-full, 40px height, px-5. Filled coral = primary. Ink outline = secondary. Ghost = tertiary. |
| `SectionHeader` | Manrope 16px 600, ink. Optional count badge (mist pill, Inter 12px 500). Optional action link (teal, right). |
| `EmptyState` | Centered text + icon. Title Manrope 18px. Body Inter 14px ink/50. Optional CTA button below. |
| `BottomSheet` | White, top-radius 24px, handle 32×4px bar (ink/20). Backdrop: ink/40. |
| `InfoPair` | Label: 11px uppercase Inter ink/40. Value: 14px Inter ink/80. Stacked. |
| `ActivityItem` | 36px icon circle (bg varies by type) + description text (Inter 14px ink/70) + time (Inter 12px ink/30). |

---

## Stitch Prompt Templates

### Dashboard
```
A CRM dashboard screen for a B2B sales team. Dark ink (#10243F) left sidebar with white icons and labels, active item highlighted in teal. Main content on warm sand (#F5F0E7) background. Top greeting "Good morning, Shir" in Manrope bold 28px. Row of 4 metric cards (white, 20px radius, soft shadow): Overdue Tasks (coral number), Today's Tasks (amber number), Meetings (teal number), Open Opportunities (lime number). Below: "Overdue" section with task rows (company name + notes + coral date pill). Recent interactions section: compact list with avatar circles, contact name, company, interaction type chip, time ago. Right sidebar panel: "Activity" feed with chronological entries. Clean, startup-feel, no borders, tonal layering for depth.
```

### Companies List
```
CRM companies list page. Dark sidebar nav left. Main area: "Companies" heading Manrope 24px bold + coral "+ New Company" button top right. Filter bar below: mist search input, Source dropdown chip, Stage dropdown chip. Full-width data table: header row in light surface, columns for Company name (with initial circle avatar), Website, Stage (teal chip), Source (ink chip), Last Activity, Contacts count. Rows 52px height, hover shows sand background. No table borders, tonal separation only. Clean startup aesthetic, Inter 14px body text.
```

### Company Detail
```
CRM company detail page. Dark sidebar left. Two-column layout: left 60% = company details, right 40% = activity feed panel. Header card (white, 20px radius): company name Manrope 28px bold, stage and source chips, website link in teal, action buttons row (coral "Log Interaction", ink outline "Add Task", ghost "Edit"). Info grid below: 4 cells with label-value pairs on mist background. Tab bar: Contacts / Interactions / Tasks / Opportunities, active tab teal underline. Contact rows with avatar initials. Right panel: chronological activity feed with type icons, descriptions, timestamps. Warm, professional, startup feel.
```

### Quick-Add Interaction (Mobile)
```
Mobile bottom sheet for logging a CRM interaction. iPhone 390px width. Bottom sheet slides up 70% of screen height, white background, 24px top radius, drag handle bar at top. Sheet title "Log Interaction" in Manrope 600 18px. Form fields stacked: Company (live-search mist input with magnifier), Contact (live-search, auto-filtered), Type (horizontal pill selector: Meeting / Call / Email / Other — teal for selected), Date (pre-filled today), Subject (text input), Outcome (textarea). Full-width coral "Save" button 48px at bottom. Clean, one-thumb usable.
```

### Tasks List
```
CRM tasks list, grouped by urgency. Dark sidebar left. Main: "Tasks" heading + filter bar (search, company, status, priority dropdowns). Grouped sections: "Overdue" header in coral with count badge, task rows below (checkbox circle + task text + company link in teal + coral date pill). "Today" section header in amber. "This Week" in ink. Each row 48px height. No table borders. Compact, scannable, Linear-inspired design. Sand background, white row hover state.
```

### Opportunities Pipeline (Kanban)
```
CRM opportunities pipeline in Kanban view. Dark sidebar left. Toggle pills top-right switching between Table and Pipeline view (Pipeline active, teal filled). Kanban board: horizontal scroll, 5 columns (Prospect / Qualified / Proposal / Negotiation / Closed). Column header: stage name Manrope 600 + count badge. Cards: white, 12px radius, soft shadow, drag handle. Card content: opportunity name Inter 500 14px + company name teal small + value Manrope 600 coral + close date ink/50 small. Sand background between columns. Clean, Trello-like but elevated startup aesthetic.
```
