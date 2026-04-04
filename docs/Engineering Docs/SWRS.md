---
tags:
  - crm
  - engineering
  - requirements
  - swrs
aliases:
  - CRM SWRS
  - Software Requirements Sheet
---

# CRM Software Requirements Sheet

## Purpose

This SWRS defines the engineering requirements baseline for the CRM MVP.
Each requirement below is intended to be:

- answered in the SW Detailed Design document
- verified in the ATP

## Scope

This sheet consolidates the current source requirements from [[PRD|PRD]], [[ARCHITECTURE|Architecture]], [[DATA_MODEL|Data Model]], [[PERMISSIONS|Permissions]], [[SCREENS_AND_FLOWS|Screens And Flows]], and [[DELIVERY_PLAN|Delivery Plan]].

## Traceability Rules

- requirement IDs use the form `SWR-XXX`
- SW Detailed Design should reference each applicable `SWR-XXX`
- ATP should include at least one verification step for each applicable `SWR-XXX`
- open product approvals remain requirements with TBD design and ATP handling until approved

## Requirements

| ID | Requirement | SW Detailed Design Response | ATP Verification Intent |
| --- | --- | --- | --- |
| SWR-001 | The system shall provide an internal bilingual CRM web application for sales lead management and meeting-booking workflows. | Define overall system scope and module decomposition. | Verify supported end-to-end CRM user workflows match MVP scope. |
| SWR-002 | The system shall support desktop and iPhone use with mobile-friendly behavior for daily operational workflows. | Define responsive layout rules, mobile breakpoints, and action patterns. | Verify key screens and quick actions at desktop and iPhone viewports. |
| SWR-003 | The system shall be deployable on Vercel Hobby with an otherwise free supporting stack. | Define deployment architecture, hosting assumptions, and service boundaries. | Verify deployed environment, stack components, and absence of unsupported paid dependencies. |
| SWR-004 | The system shall use Next.js App Router with TypeScript as the application shell. | Define app structure, routing, and server/client responsibilities. | Verify application boots, routes correctly, and matches intended runtime architecture. |
| SWR-005 | The system shall use PostgreSQL as the relational system of record. | Define schema ownership, relational boundaries, and persistence strategy. | Verify schema deployment and relational persistence behavior. |
| SWR-006 | The system shall use Prisma-managed schema and migrations for database evolution. | Define migration workflow and schema management rules. | Verify migrations run cleanly in the target environments. |
| SWR-007 | The system shall require authentication for all application routes except login and explicitly public access points. | Define route protection and session enforcement behavior. | Verify unauthenticated access is blocked on protected routes. |
| SWR-008 | The system shall implement role-based access control with `admin`, `editor`, and `viewer` roles. | Define role model, authorization gates, and permission checks. | Verify allowed and denied actions per role. |
| SWR-009 | The system shall enforce authorization on the server side for all business mutations and protected reads. | Define server-side authorization architecture for actions and routes. | Verify client-side bypass attempts do not grant unauthorized access. |
| SWR-010 | The system shall support credentials-based login as the MVP default authentication method. | Define login flow, credential handling, and user lifecycle assumptions. | Verify login, logout, invalid credential handling, and session continuity. |
| SWR-011 | The system shall support Hebrew and English UI localization. | Define translation sources, locale routing, and language switching. | Verify both locales render and switch correctly. |
| SWR-012 | The system shall support right-to-left layout behavior when Hebrew is active. | Define RTL layout rules and component-level direction handling. | Verify Hebrew locale screens render correctly in RTL. |
| SWR-013 | The system shall support mixed Hebrew and English data entry and preserve original imported text as entered. | Define encoding, field handling, and raw-text preservation rules. | Verify mixed-language data entry and import preservation behavior. |
| SWR-014 | The system shall store localized structured lookup values with bilingual labels. | Define lookup list schema and localization rules for structured values. | Verify bilingual lookup rendering and admin list behavior. |
| SWR-015 | The system shall provide CRUD support for companies. | Define company data model, routes, forms, and mutation rules. | Verify company create, read, update, and list behaviors. |
| SWR-016 | The system shall allow companies to exist without linked contacts. | Define relationship constraints and nullable linkage handling. | Verify standalone company records are valid and usable. |
| SWR-017 | The system shall provide CRUD support for contacts. | Define contact data model, routes, forms, and mutation rules. | Verify contact create, read, update, and list behaviors. |
| SWR-018 | The system shall allow contacts to exist without linked companies. | Define nullable company linkage behavior for contacts. | Verify standalone contact records are valid and usable. |
| SWR-019 | A contact shall belong to at most one company. | Define relational constraint and update behavior for contact-company linkage. | Verify the system prevents multi-company assignment for one contact. |
| SWR-020 | The system shall support multiple emails per contact. | Define child-entity model and UI behavior for contact emails. | Verify add, edit, display, and primary email behavior. |
| SWR-021 | The system shall support multiple phone numbers per contact. | Define child-entity model and UI behavior for contact phones. | Verify add, edit, display, and primary phone behavior. |
| SWR-022 | The system shall provide interaction logging with quick-add flows on mobile and desktop. | Define interaction creation UX, forms, and save path. | Verify interaction quick-add behavior on desktop and mobile. |
| SWR-023 | Each interaction shall support optional linkage to a company and/or contact, with at least one linked business entity unless an approved exception is defined. | Define interaction relationship validation and exception handling. | Verify valid and invalid interaction-linkage cases. |
| SWR-024 | The system shall provide chronological activity history for interactions. | Define ordering rules and timeline presentation behavior. | Verify chronological interaction display on relevant detail views. |
| SWR-025 | The system shall support interaction filtering by type, date, company, contact, status, and creator where relevant. | Define filter model, query behavior, and supported filter combinations. | Verify interaction filter results and persistence behavior. |
| SWR-026 | The system shall provide follow-up task management with create, update, complete, overdue, and upcoming views. | Define task lifecycle, task fields, and list/view logic. | Verify task creation, updates, completion, overdue, and upcoming behavior. |
| SWR-027 | The system shall allow follow-up tasks to be created either directly or from an interaction. | Define task creation entry points and relationship behavior. | Verify both task creation paths function correctly. |
| SWR-028 | The system shall provide opportunity tracking with stage and status management and optional contact linkage. | Define opportunity model, lifecycle, and UI behavior. | Verify opportunity creation, stage/status changes, and contact linkage behavior. |
| SWR-029 | Opportunities shall require a linked company. | Define non-null company relationship for opportunities. | Verify opportunities cannot be saved without a company. |
| SWR-030 | The system shall provide admin-managed lookup lists editable without code changes. | Define list category/value management and admin workflows. | Verify admins can manage lookup values and non-admins cannot. |
| SWR-031 | Lookup values should be soft-deactivated rather than hard-deleted where feasible. | Define active/inactive state behavior and downstream usage rules. | Verify deactivated values are preserved and handled safely. |
| SWR-032 | The system shall provide global search across company name, contact name, email, phone, website, notes, and opportunity name. | Define search scope, query strategy, and indexing assumptions. | Verify search returns correct results across all required fields. |
| SWR-033 | The system shall support filtering by source, stage, interaction type, date range, task status, task priority, company, contact, and language where relevant. | Define filter coverage per module and query semantics. | Verify required filters operate correctly on applicable screens. |
| SWR-034 | The system shall provide dashboard and reporting views including total leads, leads by source, meetings by period, recent interactions, overdue follow-ups, upcoming follow-ups, inactive leads or companies, and opportunity summary. | Define dashboard calculations, data sources, and aggregation rules. | Verify dashboard metrics and summaries against fixture or seeded data. |
| SWR-035 | The system should provide conversion views where feasible within MVP limits. | Define any included conversion metrics and explicitly document exclusions. | Verify approved conversion views if implemented. |
| SWR-036 | The system shall preserve imported workbook relationships across imported rows. | Define import keying, staging relationships, and commit logic. | Verify imported entities remain linked correctly after commit. |
| SWR-037 | The system shall replace spreadsheet formulas with relational logic and computed system behavior. | Define formula replacement strategy and computed-field ownership. | Verify imported results depend on system logic, not workbook formulas. |
| SWR-038 | The system shall detect duplicate candidates, missing keys, invalid structured values, and other validation issues during import. | Define validation rules, issue classification, and detection flow. | Verify representative invalid and duplicate cases are surfaced. |
| SWR-039 | The system shall provide an admin review flow for import issues before production commit. | Define staging, review, approval, and commit sequence. | Verify admins can review and approve import cleanup outcomes. |
| SWR-040 | The hosted import path shall avoid dependence on a single large workbook upload to one Vercel function. | Define browser-side parsing, chunking, and server staging behavior. | Verify hosted import uses chunked or equivalent free-tier-safe flow. |
| SWR-041 | The system shall support a documented local admin-run import fallback if hosted import exceeds Vercel Hobby practical limits. | Define fallback trigger conditions and local import process. | Verify fallback procedure exists and can complete a representative import. |
| SWR-042 | The system shall maintain audit fields including timestamps and user references where defined for major tables. | Define audit-field population rules and ownership. | Verify audit fields populate correctly on create and update actions. |
| SWR-043 | The system shall use internal UUIDs for primary keys and shall not use email as a primary key. | Define identifier strategy across entities and interfaces. | Verify schema and repository behavior follow UUID-based identity. |
| SWR-044 | The system shall prioritize database-backed search and indexed relational queries before introducing external search infrastructure. | Define search implementation limits and optimization strategy. | Verify required search performance is achievable with database-backed queries in MVP scope. |
| SWR-045 | The system shall avoid background job, queue, blob storage, heavy analytics, and other non-essential infrastructure in MVP unless later approved. | Define infrastructure exclusions and non-goals. | Verify final MVP architecture stays within approved service boundaries. |
| SWR-046 | The system shall provide preview deployments for pull requests and production deployment from `main`. | Define deployment pipeline, branch flow, and environment separation. | Verify preview and production deployment behavior. |
| SWR-047 | The system shall maintain separate development and production databases. | Define environment isolation and secret management. | Verify environment separation and database targeting. |
| SWR-048 | The system shall keep UI flows simple, table-first, and operationally lightweight rather than adding non-essential CRM complexity. | Define UX constraints and explicit exclusions in detailed design. | Verify implemented flows remain within approved MVP scope. |
| SWR-049 | The system shall provide dense desktop tables that collapse into card or stacked-row patterns on smaller screens without unnecessary horizontal scrolling. | Define responsive list behavior for major tables. | Verify table responsiveness on mobile-sized viewports. |
| SWR-050 | The system shall provide large tap targets, sticky primary actions, and mobile-friendly quick actions where relevant. | Define mobile interaction design rules for core workflows. | Verify touch usability and sticky actions on mobile. |
| SWR-051 | Viewer users shall have read-only access with no create, edit, delete, import, or settings actions. | Define viewer restrictions across modules and UI affordances. | Verify viewer cannot mutate records or access admin actions. |
| SWR-052 | Editor users shall have CRUD access to CRM records but no user, role, admin-list, or import-administration privileges. | Define editor permissions and denied administrative capabilities. | Verify editor allowed and denied actions match the permission model. |
| SWR-053 | Admin users shall have full CRUD access plus user, role, admin-list, and import-administration capabilities. | Define admin-only functions and protected surfaces. | Verify admin-only capabilities are accessible only to admins. |
| SWR-054 | The system shall leave unresolved approval items explicit, including viewer note visibility, dashboard formula definitions, cleanup rules, and any auth-method changes. | Define configurable or deferred decisions and their impact points. | Verify unresolved items are called out, gated, or documented rather than silently assumed. |

## Open Items Requiring Approval

- confirm whether viewer users can read all notes and summaries or a limited subset
- confirm final dashboard default periods and conversion formulas
- confirm acceptable cleanup rules for inconsistent workbook values
- confirm whether credentials login remains the final MVP auth method

## Related

- [[Engineering Docs/README|Engineering Docs]]
- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[PERMISSIONS|Permissions]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
- [[DELIVERY_PLAN|Delivery Plan]]
