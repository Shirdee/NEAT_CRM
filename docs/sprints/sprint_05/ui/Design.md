---
tags:
  - crm
  - ui
  - design-system
  - sprint-05
aliases:
  - CRM Design MD
created: 2026-04-09
updated: 2026-04-09
---

# CRM Design MD

## Overview

Design an internal bilingual CRM for sales lead management.
The product should feel fast, young, warm, and operational.
It should help users move leads forward quickly, log interactions with low friction, and manage follow-up work without heavy enterprise complexity.

Creative direction:

- focused sales cockpit
- premium but not formal
- lightweight, not corporate
- action-oriented, not decorative
- implementation-friendly and table-first

## Brand And Mood

- young startup energy
- clear and optimistic
- calm, warm work surfaces
- sharp data presentation
- obvious next actions

The interface should feel like a modern operating console for sales work:
warm shell surfaces, crisp cards, strong status signals, and clear action hierarchy.

## Colors

Use these colors as the base system:

- `Ink`: `#10243F` for primary text, navigation, structure, and table headers
- `Deep Teal`: `#0F766E` for active states, selected filters, and secondary emphasis
- `Mint`: `#DFF7F1` for soft highlights and calm state backgrounds
- `Coral`: `#DD6B4D` for primary CTA and urgent actions
- `Amber`: `#F4B740` for warnings and overdue states
- `Lime`: `#8BCF5B` for success and completed states
- `Sand`: `#F5F0E7` for shell background
- `White`: `#FFFFFF` for cards and primary work surfaces

Rules:

- use warm sand and mist surfaces instead of cold gray admin backgrounds
- keep contrast strong on data-heavy screens
- use coral sparingly for the main action and urgency moments
- use teal for active filters and navigation states
- use amber and lime only as clear semantic signals

## Typography

- headings: `Space Grotesk` or `Manrope`
- body: `IBM Plex Sans` or `Assistant`
- numbers and dense table values should feel tabular and precise

Rules:

- headings should feel modern and crisp
- body text should stay neutral and operational
- KPI numbers should have strong hierarchy
- avoid decorative typography treatments

## Shape And Spacing

- 8px base rhythm
- 24px desktop card padding
- 16px mobile card and form padding
- 20px to 28px rounded corners for cards, drawers, and large controls

Rules:

- surfaces should feel soft but intentional
- avoid sharp corners
- avoid cramped multi-panel layouts

## Layout System

### Desktop

- left navigation rail
- top header with global search and fast actions
- one dominant goal per screen
- side rail only when it adds clear action value

### Mobile

- no horizontal scrolling
- thumb-friendly primary actions
- tables collapse into stacked entity cards
- quick-add uses bottom sheet or full-screen modal

## Surface Rules

- use one subtle atmospheric gradient in shell areas
- use white or mist cards for work surfaces
- avoid heavy borders
- separate sections mostly by spacing, tonal shifts, and layering

## Component Direction

- navigation rail with clear active state
- header with search and quick action button
- KPI cards with strong number hierarchy
- sticky filter bar on list screens
- compact but friendly table rows
- bold readable status chips
- summary card at top of detail screens
- activity timeline near the top of detail pages
- quick-add drawer or bottom sheet
- utilitarian admin review rows for import flows

## Interaction Style

- short labels
- obvious primary actions
- minimal helper text
- empty states should suggest the next action
- subtle motion only: hover lift, panel slide, staggered card reveal

## Product Patterns

### Dashboard

Purpose: show what needs action today.

Must feel:

- action-first
- operational
- easy to scan

Include:

- headline focused on today
- KPI row
- dominant overdue and upcoming follow-up area
- recent activity timeline
- small insights rail

### Table Screens

Used for companies, contacts, tasks, interactions, and opportunities.

Rules:

- search first
- filters second
- strong first column with title and subtext
- sticky filter bar
- visible top-right primary action
- mobile collapse into stacked cards

### Detail Screens

Rules:

- top summary card with core identity and status
- timeline or latest activity high on the page
- related entities grouped simply
- compact desktop side rail for quick facts and actions

### Quick Add

Rules:

- desktop drawer
- mobile bottom sheet or full-screen modal
- essential fields first
- optional details hidden behind progressive reveal

### Admin Screens

Rules:

- cleaner and more utilitarian than sales-facing screens
- issue counts and confidence markers should be obvious
- raw and normalized values should be easy to compare
- destructive actions should be rare and visually distinct

## Bilingual And RTL

- layouts must mirror cleanly in Hebrew
- avoid directional iconography that breaks in RTL
- chips, tabs, badges, and filters must remain readable in both languages
- mixed Hebrew and English data must not break rows, forms, or cards

## Screen Priorities

Design these first:

1. Login
2. Dashboard
3. Companies table
4. Company detail
5. Contacts table
6. Tasks view
7. Quick-add interaction
8. Import review

## Screen Notes

### Login

- split-screen or centered card
- short message about staying on top of leads
- email and password form
- premium but not formal

### Dashboard

- headline: today’s focus
- KPI row
- overdue and upcoming follow-ups as the dominant block
- recent activity timeline
- small insights rail

### Companies Table

- company, stage, source, last touch, next task, contact count
- clickable rows with subtle hover life

### Company Detail

- company identity, stage, source, owner
- quick actions: log interaction, add follow-up, edit
- latest activity high on page

### Tasks View

- overdue, today, upcoming, done
- priority stronger than metadata
- fast status change

### Import Review

- confidence banner
- grouped issues by severity
- raw value beside cleaned value
- approve and fix actions should be immediate

## Implementation Notes

When using this document during implementation:

- keep the target screen type explicit
- specify desktop or mobile behavior when layout differs
- describe the main modules and action hierarchy directly
- preserve bilingual and RTL-safe behavior on every screen
- implement one screen at a time when validating parity

## Related

- [[sprints/sprint_05/sprint_05_index|Sprint 05 Index]]
- [[sprints/sprint_05/ui/UI_KIT|UI Kit]]
- [[sprints/sprint_05/ui/FRONTEND_IMPLEMENTATION_TASKS|Frontend Implementation Tasks]]
