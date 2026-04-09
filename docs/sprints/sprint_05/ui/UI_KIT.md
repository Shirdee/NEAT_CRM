---
tags:
  - crm
  - ui
  - design
  - planning
  - sprint-05
aliases:
  - CRM UI Kit
created: 2026-04-09
updated: 2026-04-09
---

# CRM UI Kit

## Status

Draft design direction for approval before implementation.

## Design Goal

Create a CRM that feels fast, young, and operational.
The UI should help the team move leads forward with low friction, not feel like heavy enterprise software.

## CTO Fit

- table-first and implementation-friendly
- reusable primitives across dashboard, lists, details, and admin
- mobile-safe on iPhone without needing separate flows
- bilingual and RTL-safe by design
- avoids visual complexity that would slow delivery

## Brand Direction

### Tone

- young startup energy
- clear and optimistic
- lightweight, not corporate
- action-oriented, not decorative

### Design Statement

The product should feel like a focused sales cockpit:
warm base surfaces, sharp data cards, bright action accents, and very obvious next steps.

## Visual System

### Color Direction

- `Ink` for primary text and structural UI
- `Cloud` or `Mist` for calm surfaces
- `Mint/Teal` for active states and positive momentum
- `Coral` for primary CTA and urgency moments
- `Amber` for warnings and overdue tasks
- `Lime` for success chips and completed states

### Suggested Palette

- `Ink`: `#10243F`
- `Deep Teal`: `#0F766E`
- `Mint`: `#DFF7F1`
- `Coral`: `#DD6B4D`
- `Amber`: `#F4B740`
- `Lime`: `#8BCF5B`
- `Sand`: `#F5F0E7`
- `White`: `#FFFFFF`

### Typography

- headings: `Space Grotesk` or `Manrope`
- body: `IBM Plex Sans` or `Assistant`
- numbers and tabular data: mono or tabular numeric styling where possible

Typography should feel modern and crisp, with stronger hierarchy than a typical back-office system.

## Core Layout Rules

### App Shell

- left nav on desktop
- top search and fast actions in the header
- main content area with one clear primary goal per screen
- sticky bottom action bar on mobile for quick add and follow-up actions

### Spacing

- 8px base rhythm
- 24px card padding for desktop
- 16px padding for mobile cards and forms
- rounded corners should feel soft but intentional, around 20px to 28px

### Surfaces

- one atmospheric background gradient in shell areas
- white or mist cards for work surfaces
- avoid adding many competing panels on one screen

## Product Patterns

### Dashboard

Purpose: show what needs action today.

- hero strip with meetings booked trend and current workload
- 4 KPI cards: overdue tasks, upcoming tasks, meetings this period, open opportunities
- priority queue section: "Do now"
- recent interactions feed
- inactive companies block

The dashboard should answer:
"Who do I need to contact next, and what is moving?"

### Table Screens

Used for companies, contacts, tasks, interactions, and opportunities.

- sticky filter bar
- compact but friendly rows
- strong first column with title and subtext
- status chips with bold contrast
- mobile collapse into stacked cards
- top-right primary action button stays visible

### Detail Screens

- top summary card with core identity and status
- timeline/activity module directly below summary
- related entities grouped in simple sections
- side rail on desktop for quick facts and actions
- mobile keeps actions near thumb zone

### Quick Add

- drawer on desktop
- bottom sheet or full-screen modal on mobile
- only essential fields first
- optional details hidden behind progressive reveal

This is especially important for interactions and follow-up tasks.

### Admin Screens

- cleaner, more utilitarian look than the sales-facing screens
- import review uses issue counts, confidence markers, and side-by-side raw vs normalized values
- destructive actions should be visually distinct but rare

## Key Screens To Design First

1. Login
2. Dashboard
3. Companies table
4. Company detail
5. Contacts table
6. Tasks table
7. Quick-add interaction sheet
8. Import review screen

## Screen Blueprints

### Login

- split-screen or centered card
- short message about staying on top of leads
- simple email/password form
- visual tone should feel premium but not formal

### Dashboard

- headline: today’s focus
- KPI row
- overdue and upcoming follow-ups as the dominant block
- recent activity timeline
- small insights rail for source mix and meetings trend

### Companies Table

- search first
- filters second
- rows show company, stage, source, last touch, next task, contact count
- row hover should feel clickable and alive

### Company Detail

- company title, stage, source, owner/status style area
- quick actions: log interaction, add follow-up, edit
- tabs or stacked sections for contacts, tasks, interactions, opportunities
- latest activity should appear high on the page

### Tasks View

- segmented focus: overdue, today, upcoming, done
- easy status change
- priority visible before metadata
- mobile should support one-hand completion

### Import Review

- confidence banner at top
- grouped issues by severity
- raw value beside cleaned value
- approve or fix decisions should be obvious and fast

## Components

- app header
- navigation rail
- KPI card
- data table row
- stacked mobile entity card
- status chip
- filter bar
- quick action button
- activity timeline item
- summary stat strip
- form section card
- import issue row

## Interaction Style

- short labels
- obvious primary actions
- minimal helper text
- empty states should suggest the next action
- motion should be subtle: panel slide, hover lift, staggered card reveal

## RTL And Bilingual Rules

- all layouts must mirror cleanly in Hebrew
- status chips and badges should remain readable in both languages
- avoid icon directions that break in RTL
- mixed-language data should not break rows or forms

## Implementation Guidance For Later

- build from reusable shell, card, table, chip, and drawer primitives
- keep the design system small during MVP
- prioritize dashboard, companies, tasks, and quick-add flows before deeper polish
- preserve this visual direction across admin screens, but reduce decorative treatment there

## Related

- [[PRD|PRD]]
- [[sprints/sprint_05/sprint_05_index|Sprint 05 Index]]
- [[sprints/sprint_05/ui/Design|Design]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
- [[ARCHITECTURE|Architecture]]
