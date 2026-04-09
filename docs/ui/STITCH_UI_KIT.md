---
tags:
  - crm
  - ui
  - stitch
  - design
aliases:
  - CRM Stitch UI Kit
---

# CRM Stitch UI Kit

## Purpose

This file is the Stitch-first version of the CRM UI direction.
Use it as the source of truth when prompting Stitch to generate or edit screens.

It is optimized for:

- `generate_screen_from_text`
- `edit_screens`
- consistent multi-screen design generation
- desktop and mobile-safe CRM layouts
- bilingual English/Hebrew and RTL-safe UI

## Product Summary

Design an internal CRM web app for sales lead management.
The product should feel fast, young, warm, and operational.
It should help users move leads forward quickly, log interactions fast, and manage follow-up tasks without heavy enterprise complexity.

## Core Product Intent

- primary goal: help the team book more meetings
- primary users: founder and internal team members
- style goal: focused sales cockpit
- UX goal: obvious next action on every screen
- implementation goal: table-first, reusable, and easy to turn into app screens later

## Visual DNA

### Tone

- young startup energy
- clear and optimistic
- lightweight, not corporate
- action-oriented, not decorative

### Look And Feel

- warm shell background with a subtle atmospheric gradient
- white and mist work surfaces
- sharp, crisp cards over soft rounded containers
- bright action accents for buttons, chips, and urgency states
- calm density: information-rich but never noisy

## Design Tokens

### Colors

- `Ink`: `#10243F` for primary text, nav, table headers, structure
- `Deep Teal`: `#0F766E` for active states, selected filters, links, secondary CTAs
- `Mint`: `#DFF7F1` for highlighted surfaces and soft active backgrounds
- `Coral`: `#DD6B4D` for primary CTA and urgent actions
- `Amber`: `#F4B740` for warnings and overdue states
- `Lime`: `#8BCF5B` for success and completed states
- `Sand`: `#F5F0E7` for app background
- `White`: `#FFFFFF` for cards and main work surfaces

### Typography

- headings: `Space Grotesk` or similar geometric modern sans
- body: `IBM Plex Sans` or similar neutral operational sans
- data and numbers: tabular-feeling numeric treatment

Typography should feel more modern and sharp than a normal admin dashboard.

### Shape And Spacing

- 8px base rhythm
- 24px desktop card padding
- 16px mobile card padding
- 20px to 28px border radius on cards, drawers, and large controls
- buttons should feel soft but intentional, never pillowy or toy-like

## Layout System

### Desktop Shell

- left navigation rail
- top header with search, quick actions, and profile area
- main content focuses on one dominant job per screen
- side rails are allowed only when they help action-taking

### Mobile Shell

- no horizontal scrolling
- sticky bottom action zone where useful
- tables collapse into stacked entity cards
- key actions stay near the thumb zone

## Component Rules

- navigation rail with clear active state
- app header with global search and fast action button
- KPI card with strong number hierarchy
- sticky filter bar for list screens
- dense but friendly data rows
- bold readable status chips
- summary card at the top of detail screens
- timeline/activity blocks near the top of details
- drawer or bottom-sheet quick add flows
- utilitarian review rows for import/admin screens

## Interaction Rules

- short labels
- very obvious primary action
- helper text only when needed
- empty states must suggest what to do next
- subtle motion only: hover lift, panel slide, staggered card reveal

## Bilingual And RTL Rules

- every layout must mirror cleanly in Hebrew
- avoid directional UI that breaks in RTL
- mixed Hebrew and English data must not break rows or forms
- chips, tabs, filters, and tables must remain readable in both languages
- icons should be neutral or mirrored safely when direction matters

## Screen Strategy

Generate these screens first in this order:

1. Login
2. Dashboard
3. Companies table
4. Company detail
5. Contacts table
6. Tasks view
7. Quick-add interaction sheet
8. Import review

## Screen Briefs

### Login

- premium but not formal
- either centered card or split-screen
- short message about staying on top of leads
- email and password form
- clear primary CTA
- mobile-safe

### Dashboard

- headline: today’s focus
- strong KPI row
- overdue and upcoming follow-ups as the dominant area
- recent activity timeline
- small insights rail for meetings trend and source mix
- should answer: who needs attention next

### Companies Table

- search first, filters second
- sticky filter bar
- visible primary action in top-right
- columns: company, stage, source, last touch, next task, contact count
- row hover should feel alive and clickable
- mobile becomes stacked cards

### Company Detail

- top summary card with company identity and stage
- quick actions: log interaction, add follow-up, edit
- latest activity appears high on the page
- related contacts, tasks, interactions, opportunities grouped clearly
- desktop can use a compact side rail

### Contacts Table

- same design language as companies
- table-first
- easy scanning of company, role, contact methods, last touch, next task
- strong first column with name and subtext

### Tasks View

- segmented into overdue, today, upcoming, done
- priority visually stronger than metadata
- status change should feel fast
- one-hand mobile completion should feel easy

### Quick-Add Interaction

- desktop drawer, mobile bottom sheet or full-screen modal
- essential fields first
- optional details hidden behind progressive reveal
- designed for fast logging after calls or meetings

### Import Review

- more utilitarian than sales-facing screens
- confidence banner at top
- grouped issues by severity
- raw value beside cleaned value
- approve or fix actions should be fast and obvious

## Stitch Prompting Rules

When using this file with Stitch:

- keep prompts explicit and concrete
- name the screen type directly
- describe hierarchy, key modules, and dominant actions
- include desktop or mobile intent clearly
- remind Stitch that the product is bilingual and RTL-safe
- prefer one screen prompt at a time unless intentionally generating a flow

## Prompt Template

Use this structure when prompting Stitch:

```md
Create a [desktop/mobile] screen for an internal bilingual CRM.

Use this design system:
- fast, young, operational sales cockpit
- warm sand background, white cards, ink structure
- coral primary CTA, teal active states, amber warnings, lime success
- Space Grotesk-style headings, IBM Plex Sans-style body
- soft 24px rounded cards
- table-first layout
- RTL-safe and Hebrew/English friendly

Screen:
[screen name]

Must include:
- [module 1]
- [module 2]
- [module 3]

Behavior:
- [important UX rule]
- [mobile or desktop rule]
- [primary action rule]
```

## Edit Rules For Stitch

Use `edit_screens` for targeted refinements such as:

- add or remove modules
- change hierarchy
- tighten spacing
- improve CTA emphasis
- increase table density
- simplify admin screens
- improve mobile behavior
- strengthen RTL-safe mirroring

Write edit prompts as direct change requests, not full screen rewrites.

## Recommended First Stitch Run

For the first generated screen in a new Stitch project, use the dashboard.
It contains the strongest mix of:

- shell
- KPI cards
- queue blocks
- timeline patterns
- action hierarchy

That gives Stitch the best base design language for later screens.

## Source Notes

This file is adapted from:

- [UI_KIT](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/ui/UI_KIT.md)
- [PRD](/Users/shir/Documents/Claude/Coding/_Codex_tamplate/crm/docs/PRD.md)

## Online Stitch Notes

These points informed this Stitch-specific version:

- Stitch generation is driven mainly by direct natural-language screen prompts.
- The first generated screen in a project effectively establishes the project design system for later consistency.
- `edit_screens` is better for targeted changes; `generate_variants` is better for exploration.
- Matching the correct `deviceType` improves output quality.
- Keeping a reusable design markdown helps produce more consistent follow-up screens.
