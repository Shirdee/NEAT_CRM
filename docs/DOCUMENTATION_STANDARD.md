---
tags:
  - crm
  - docs
  - standards
  - obsidian
aliases:
  - CRM Documentation Standard
updated: 2026-04-11
---

# CRM Documentation Standard

## Purpose

Keep all CRM documentation connected, traceable, and understandable inside Obsidian.

Every project-owned Markdown note should make it easy to answer:

- what is this note for
- how does it relate to other notes
- what decision, requirement, or implementation context does it come from
- what downstream work depends on it

## Root Model

- the repo root is the master navigation layer
- `crm/` is a project root
- inside this project, `docs/` is the CRM wiki root for project-owned notes
- project docs should optimize for fast entry from [CRM Home](README.md) to [CRM Context](CODEX.md) to the active area hub and then the active leaf
- cross-project navigation should move through project homes, not leaf-to-leaf links

## Required Structure For New Docs

Every new project-owned Markdown file created by any agent should include:

- YAML frontmatter with useful `tags`
- an `aliases` section when a short or human-friendly title helps
- an `updated` property in frontmatter for active docs, using ISO date format
- one parent or source-context wiki link near the top of the note when the note is a leaf
- a `## Related` section with links to upstream and downstream notes where relevant
- frontmatter dates instead of body text when the note is operational, planning, sprint, or handoff documentation

## Canonical Note Roles

Use one of these roles when shaping a doc:

- `Project Home`
- `Project Context`
- `Area Home`
- `Sprint Home`
- `Leaf Note`

Hub notes should stay compact and predictable:

- one-sentence purpose
- current focus or status
- a short `Start Here` section
- 4 to 8 canonical outbound links only

Leaf notes should:

- link to one parent or source note near the top
- avoid listing the full sibling graph when a hub already exists
- keep `## Related` to essential upstream and downstream links only

## Date Standard

Use explicit dates in ISO format such as `2026-04-07`.

When writing or updating PM-owned planning or tracking docs:

- include a frontmatter `created` date when the note is first added, when creation tracking matters
- include a frontmatter `updated` date when the note changes materially
- include dated status updates when tasks are added, started, completed, or closed
- prefer a small number of meaningful dated entries over noisy change logs

Default rule:

- use `updated: YYYY-MM-DD` in YAML frontmatter as the default revision marker
- do not add standalone body lines such as `Updated on YYYY-MM-DD.` unless a note has a special reason to show date history inside the content

## Required Linking Behavior

When writing or updating a doc:

1. Link back to the source context.
2. Link sideways to related decisions, architecture, data model, sprint, or UI notes.
3. Link forward to execution, QA, or rollout notes when they exist.

Examples:

- a sprint task note should link to [Delivery Plan](DELIVERY_PLAN.md), [Architecture](ARCHITECTURE.md), and the relevant sprint review
- a product note should link to [PRD](PRD.md), [Decisions](DECISIONS.md), and [Roadmap](ROADMAP.md)
- an implementation handoff should link to the source sprint note, architecture note, and verification note

## Alias Rule

Prefer stable, human-readable aliases for homes and repeated note families.

Canonical patterns for this project:

- project hubs: `CRM Home`, `CRM Context`, `CRM Sprints`, `CRM UI`
- sprint families: `CRM Sprint 01 Index`, `CRM Sprint 01 Todo`, `CRM Sprint 01 Review`, `CRM Sprint 01 Report`, and the same pattern for later sprints
- keep aliases stable even when headings or surrounding prose evolve

## Path Convention

Use `docs/` as the Obsidian vault root for wiki links, for example:

- `[PRD](PRD.md)`
- `[Architecture](ARCHITECTURE.md)`
- `[CRM Context](CODEX.md)`
- `[Screens And Flows](SCREENS_AND_FLOWS.md)`

Use the shortest stable link that remains unambiguous:

- inside CRM docs, prefer canonical aliases for homes and repeated sprint notes
- use explicit path links only when a canonical alias does not exist yet
- do not prefix wiki links with `docs/` because `docs` is the vault root

## Reasoning Standard

Docs should not only state decisions.
They should also preserve the reason for those decisions.

When useful, explicitly capture:

- the business reason
- the technical reason
- the dependency or blocker
- the approval or owner

## Scope Rule

This standard applies to project-owned docs in the CRM workspace.
It does not apply to third-party Markdown inside `app/node_modules`.

## Validation Rule

Before closing documentation work:

- confirm the wiki links point to real project docs
- confirm moved files have updated links
- confirm the note is connected to the relevant context and reasoning
- confirm important doc revisions and task state changes are dated

## Structure Rule

- Do not create a dedicated folder for a single note unless it clearly improves navigation, follows an existing pattern, or is expected to grow soon.
- Prefer flatter structures when the extra folder adds ceremony but no clarity.

## Current Focus Rule

Project and area hubs should include a short `Current Focus` section that answers:

- what is active now
- which hub owns that work
- which leaf note is the current handoff target

## Link Budget Rule

- hub notes: 4 to 8 canonical outbound wiki links
- leaf notes: prefer 3 to 6 links in `## Related`
- if a note needs more links, add or improve the hub note instead of expanding the leaf

## Related

- [CRM Home](README.md)
- [CRM Context](CODEX.md)
- [CRM Sprints](sprints/README.md)
- [CRM UI](ui/README.md)
- [Delivery Plan](DELIVERY_PLAN.md)
