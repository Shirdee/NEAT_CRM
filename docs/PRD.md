---
tags:
  - crm
  - planning
  - product
  - prd
aliases:
  - CRM PRD
---

# CRM PRD

## Status

Planning draft prepared for approval on 2026-03-31.
Execution must not begin until the founder approves the plan.

## Product Summary

Build an internal bilingual CRM web app for sales lead management.
The app is optimized for helping the team book meetings, manage follow-ups, and maintain a usable history of company and contact activity.

The experience should feel simple, fast, and operationally lightweight for internal users, while still being deployed as a proper secure web app on Vercel.

## Primary Objective

- primary business goal: help the team book more meetings
- primary success metric: meetings booked

## Primary Users

- founder
- internal team members

## MVP Principles

- table-first views before advanced visualizations
- mobile-friendly daily use on desktop and iPhone
- bilingual UI in Hebrew and English
- preserve original imported workbook text
- optimize for fast logging and follow-up execution
- avoid non-essential CRM complexity in MVP
- fit within a free deployment setup, with Vercel Hobby as the primary hosting target
- security should be high and not "hackable" in the limits of free deployment and encryption
- minimize extra services and avoid paid dependencies in MVP

## In Scope For MVP

### Core Modules

1. Companies
2. Contacts
3. Interactions
4. Follow-up tasks
5. Opportunities
6. Admin-managed lookup lists
7. Dashboard and reporting
8. Basic login and role-based permissions
9. Excel workbook import and cleanup workflow

### Core Views

- login
- dashboard
- companies table
- company detail
- contacts table
- contact detail
- interactions table
- interaction quick add
- follow-ups table
- opportunities table
- admin lists
- user and role management
- import review screen

### Required Search

Global search must support:

- company name
- contact name
- email
- phone
- website
- notes
- opportunity name

### Required Filters

- source
- stage
- interaction type
- date range
- task status
- task priority
- company
- contact
- language where relevant

## Out Of Scope For MVP

- customer success workflows
- account management workflows
- record ownership rules
- recurring tasks
- kanban board
- calendar-first planning
- email sending from inside the CRM
- file attachments
- external Gmail or Outlook sync
- calendar sync
- website form ingestion
- automation builder
- CSV or Excel self-serve re-import UI beyond the initial admin import workflow

## Functional Requirements

### Companies

- create and edit company records
- support standalone companies without contacts
- support bilingual free text and structured values
- searchable and filterable list view
- show related contacts, interactions, tasks, and opportunities

### Contacts

- create and edit contact records
- support standalone contacts without companies
- one contact belongs to at most one company
- support multiple emails
- support multiple phone numbers
- show related interactions, tasks, and opportunities

### Interactions

- quick add on mobile and desktop
- link to company and or contact
- chronological activity history
- filter by type, date, company, contact, status, creator
- allow outcome and summary text

### Follow-Ups

- create from scratch or from an interaction
- due date, priority, status, and note fields
- overdue and upcoming views
- mobile-first quick action flow

### Opportunities

- separate from company master data
- stage and status tracking
- support optional contact linkage
- simple commercial tracking for pilots and deals

### Admin Lists

- editable structured values without code changes
- bilingual labels for lookup values
- soft-deactivate values instead of hard delete where possible

### Dashboard And Reporting

- total leads
- leads by source
- meetings by period
- recent interactions
- overdue follow-ups
- upcoming follow-ups
- inactive leads or companies
- opportunity summary
- conversion views where feasible in MVP

## Mobile UX Requirements

- fast initial load
- large tap targets
- sticky primary actions
- quick-add interaction and task actions
- no unnecessary horizontal scrolling
- detail screens must remain usable on iPhone
- dense tables should collapse into card or stacked-row patterns on mobile
- app-like web UI

## Language Requirements

- Hebrew and English UI
- mixed Hebrew and English data entry
- structured values must support localization
- imported original text must be preserved
- UI should support right-to-left layout when Hebrew is active

## Import Requirements

- import companies, contacts, interaction history, next actions, and lookup lists where relevant
- preserve relationships across imported rows
- replace spreadsheet formulas with relational logic and computed values
- detect duplicates, missing keys, and invalid structured values
- support cleanup rules for inconsistent lookup values

Note:
Exact workbook sheet and column mapping is pending workbook access. The plan below includes a discovery and profiling phase before final import implementation is approved.

## Permission Model Summary

- `admin`: full access, import, list management, user and role management
- `editor`: create and edit CRM records, no system administration
- `viewer`: read-only access to CRM records and dashboard

## Success Criteria For MVP

- internal users can log in and use the app on desktop and iPhone
- companies, contacts, interactions, tasks, and opportunities are operational
- workbook data is imported with reviewed cleanup rules
- dashboard supports daily action management and reporting on meetings booked
- permissions enforce admin, editor, and viewer behavior
- app is deployed to Vercel Hobby with a fully free supporting stack

## Approval Questions

- confirm whether login should be email and password in MVP, or whether a free magic-link email setup is still acceptable
- confirm whether viewer users should see all notes or a limited read-only subset
- confirm acceptable cleanup rules for inconsistent workbook values
- confirm exact dashboard default periods and conversion formulas

## Related

- [[README|Project Home]]
- [[CODEX|Project Context]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[IMPORT_MAPPING|Import Mapping]]
- [[PERMISSIONS|Permissions]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ROADMAP|Roadmap]]
