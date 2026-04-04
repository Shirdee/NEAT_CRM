---
tags:
  - crm
  - sprint
  - sprint-03
  - todo
  - dev-handoff
aliases:
  - Sprint 03 Todo
---

# Sprint 03 Todo

## Status

Reviewed by [[AGENTS|PM]] and [[AGENTS|CTO]].
This doc is the Sprint 3 execution handoff to DEV and QA.
Sprint 3 implementation is now complete in the repository.

## Sprint Goal

Make the CRM usable for core lead management by shipping companies, contacts, and search on top of the completed Sprint 1 and Sprint 2 foundation.

## Documentation Gate

- Sprint 3 index exists before implementation
- Sprint 3 review exists before implementation
- this Sprint 3 todo exists before implementation
- DEV and QA should treat these docs as the current Sprint 3 source of truth

## DEV Task List

### DEV-301: Extend Shared CRM Data Access

- objective: add shared server-side data access for companies, contacts, filters, and search
- scope: Prisma queries, fallback-store support where needed, typed input and output contracts, lookup-value loading for forms
- must include: one consistent access path for list views, detail views, create and edit flows, and search
- done when: pages and actions can consume shared company and contact data services without embedding raw query logic

### DEV-302: Add Companies List Flow

- objective: ship the first companies table screen
- scope: protected route, table-first list UI, default columns, empty state, core filters
- must include: source and stage filters where list data exists, mobile-safe collapse behavior, and viewer-safe read access
- done when: authenticated users can browse and filter companies on desktop and mobile

### DEV-303: Add Company Detail And Form Flow

- objective: support company create, read, and update behavior
- scope: company detail screen, create and edit form, structured-value inputs, notes and website fields
- must include: company can exist without contacts, editor and admin mutation paths, and read-only presentation for viewers
- done when: company records can be created and edited through the app without violating RBAC

### DEV-304: Add Contacts List Flow

- objective: ship the first contacts table screen
- scope: protected route, table-first list UI, default columns, company filter, search entrypoint alignment
- must include: readable mobile fallback and relation display to optional company
- done when: authenticated users can browse and filter contacts cleanly

### DEV-305: Add Contact Detail And Form Flow

- objective: support contact create, read, and update behavior
- scope: contact detail screen, create and edit form, role title, notes, and optional company link
- must include: contact can exist without company, editor and admin mutation paths, and read-only presentation for viewers
- done when: contact records can be created and edited through the app without violating RBAC

### DEV-306: Add Multiple Email And Phone Editing

- objective: support the Sprint 3 contact communication model
- scope: create, edit, reorder-or-primary selection behavior, display blocks on detail screens
- must include: multiple emails, multiple phone numbers, one primary marker for each set, and validation that prevents empty duplicate rows
- done when: users can manage realistic contact communication details from the form layer

### DEV-307: Add Company And Contact Linking Rules

- objective: make cross-record relationships behave predictably
- scope: connect contact to company, display related contacts on company detail, preserve optional relationship behavior
- must include: contact-to-company reassignment support and no forced company creation
- done when: company-contact relationships are visible and editable without breaking optionality rules

### DEV-308: Build Global Search Foundation

- objective: deliver the first searchable CRM entrypoint
- scope: search input integration, results page or results section, ranked grouped results for companies and contacts
- must include: matching on company name, contact name, email, phone, website, and notes, plus safe empty and no-results states
- done when: a user can find companies or contacts from a single search path

### DEV-309: Mobile And Navigation Hardening

- objective: make the new Sprint 3 surfaces practical for daily use
- scope: nav entrypoints, page headings, sticky actions where needed, compact cards or stacked rows on smaller widths
- must include: no unnecessary horizontal scrolling on key list and detail screens
- done when: the new routes feel coherent in the existing shell on desktop and iPhone-width layouts

### DEV-310: Verify And Harden

- objective: complete Sprint 3 with tests and regression checks
- scope: repository tests, route and action coverage where practical, form validation checks, search behavior checks, full repo verification commands
- must include: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
- done when: Sprint 3 behavior is covered and prior sprint behavior still passes

Current verification read:

- passed: `npm test`
- passed: `npm run typecheck`
- passed: `npm run build`
- blocked by tooling: `npm run lint`

## Recommended Execution Order

1. DEV-301 Extend Shared CRM Data Access
2. DEV-302 Add Companies List Flow
3. DEV-303 Add Company Detail And Form Flow
4. DEV-304 Add Contacts List Flow
5. DEV-305 Add Contact Detail And Form Flow
6. DEV-306 Add Multiple Email And Phone Editing
7. DEV-307 Add Company And Contact Linking Rules
8. DEV-308 Build Global Search Foundation
9. DEV-309 Mobile And Navigation Hardening
10. DEV-310 Verify And Harden

## Non-Scope Guardrails

- no interactions UI
- no tasks UI
- no opportunities UI
- no dashboard expansion
- no import-pipeline redesign unless Sprint 3 exposes a real defect
- no external search engine or new paid service

## Definition Of Done

- companies list and detail exist
- contacts list and detail exist
- create and edit flows exist for admin and editor users
- viewer remains read-only
- company-contact relationships work with optional linkage
- multiple emails and phones work
- global search returns correct company and contact matches
- mobile layouts are usable on iPhone width
- tests and repo checks pass

Current status against definition of done:

- satisfied: companies list and detail, contacts list and detail, create and edit flows, viewer read-only behavior in route guards, optional company-contact linkage, multiple emails and phones, global search, mobile-aware route structure, tests, typecheck, and build
- follow-up only: restore lint as a reliable gate in this workspace

## QA Execution Plan

- verify role behavior: admin and editor can mutate, viewer cannot
- verify company create and edit, including standalone company behavior
- verify contact create and edit, including standalone contact behavior
- verify add, edit, and primary-selection behavior for multiple emails and phones
- verify company-contact linking, unlinking, and reassignment
- verify search matches company name, contact name, email, phone, website, and notes
- verify filters behave consistently on list screens
- verify English and Hebrew rendering on the new routes
- verify mobile list and detail usability at iPhone width
- run regression on Sprint 1 auth, locale, and admin-list behavior
- run regression on Sprint 2 imported company and contact visibility, searchability, and edit compatibility

Current QA read:

- approved in code for delivered Sprint 3 scope
- residual risk is tooling, not a proven feature defect

## CTO To DEV Handoff

DEV should treat the following as the approved Sprint 3 build direction:

1. keep data access centralized
- list queries, detail queries, mutations, and search should share server-side data modules

2. treat search as a product foundation, not a final engine
- start simple, database-backed, and index-aware
- optimize query shape before adding any new infrastructure

3. respect optional relationships
- do not force company creation for contacts
- do not force contacts onto companies

4. preserve role boundaries everywhere
- read access for all authenticated users
- mutation paths only for admin and editor

5. optimize for table-first desktop use and readable mobile fallback
- avoid building desktop-only dense layouts that collapse poorly

## PM Closeout Target

If DEV and QA complete the items above without scope drift, Sprint 3 should be ready to close as the roadmap’s core CRM records slice.

Current PM read:

- Sprint 3 implementation matches the intended slice
- the remaining open item is the local lint toolchain, not a roadmap-scope gap

## Blockers And Approval Dependencies

- none for repository implementation
- remaining follow-up: repair the local ESLint dependency issue if full verification green status is required
