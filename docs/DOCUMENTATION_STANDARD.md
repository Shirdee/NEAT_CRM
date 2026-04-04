---
tags:
  - crm
  - docs
  - standards
  - obsidian
aliases:
  - CRM Documentation Standard
---

# CRM Documentation Standard

## Purpose

Keep all CRM documentation connected, traceable, and understandable inside Obsidian.

Every project-owned Markdown note should make it easy to answer:

- what is this note for
- how does it relate to other notes
- what decision, requirement, or implementation context does it come from
- what downstream work depends on it

## Required Structure For New Docs

Every new project-owned Markdown file created by any agent should include:

- YAML frontmatter with useful `tags`
- an `aliases` section when a short or human-friendly title helps
- at least one Obsidian wiki link to the note's parent or source context
- a `## Related` section with links to upstream and downstream notes where relevant

## Required Linking Behavior

When writing or updating a doc:

1. Link back to the source context.
2. Link sideways to related decisions, architecture, data model, sprint, or UI notes.
3. Link forward to execution, QA, or rollout notes when they exist.

Examples:

- a sprint task note should link to [[DELIVERY_PLAN|Delivery Plan]], [[ARCHITECTURE|Architecture]], and the relevant sprint review
- a product note should link to [[PRD|PRD]], [[DECISIONS|Decisions]], and [[ROADMAP|Roadmap]]
- an implementation handoff should link to the source sprint note, architecture note, and verification note

## Path Convention

Use `docs/` as the Obsidian vault root for wiki links, for example:

- `[[PRD|PRD]]`
- `[[ARCHITECTURE|Architecture]]`
- `[[CODEX|Project Context]]`
- `[[frontend/AGENTS|Frontend Agents]]`

Do not rely on ambiguous bare links when a stable path is clearer.
Do not prefix wiki links with `docs/` because `docs` is the vault root.

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

## Related

- [[README|Project Home]]
- [[CODEX|Project Context]]
- [[AGENTS|Project Agents]]
- [[DELIVERY_PLAN|Delivery Plan]]
