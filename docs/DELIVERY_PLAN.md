---
tags:
  - crm
  - planning
  - sprint-plan
  - delivery
aliases:
  - CRM Delivery Plan
---

# CRM Delivery Plan

## Status

Planning-only document for founder approval.
No implementation work should start until this plan is approved.

## PM Summary

The MVP should be delivered in focused slices that protect the highest-risk parts first:

1. stack, auth, schema, and admin foundations
2. workbook audit and import pipeline
3. core operational CRM modules
4. dashboard, reporting, and deployment hardening

## CTO Summary

The technical risk is not the CRUD screens.
The highest risks are:

- workbook inconsistency
- bilingual structured data normalization
- mobile interaction logging UX
- getting permissions right without overbuilding

The plan below addresses those first while keeping deployment continuously testable on Vercel.

## Free-Tier Adjustment

The plan remains workable, but one recommendation changes:

- use Vercel Hobby as the hosting target
- avoid magic-link auth by default
- avoid adding queues, blob storage, background workers, or paid analytics in MVP
- keep supporting infrastructure to one free PostgreSQL provider

## Approval Checkpoints Before Sprint 1

- approve MVP scope
- approve stack recommendation
- approve auth method
- provide workbook access
- confirm dashboard metric definitions
- confirm import cleanup tolerance

## Sprint Plan

### Sprint 1: Foundation And Technical Baseline

#### Objective

Establish the secure app shell, core schema, permissions framework, bilingual foundation, and deployment pipeline.

#### Scope

- initialize Next.js app structure
- set up Vercel project and environment strategy
- configure PostgreSQL and Prisma
- implement credentials-based auth skeleton and role enforcement
- set up bilingual infrastructure
- create app shell and navigation
- create admin list framework
- confirm all infrastructure choices remain within free tiers

#### Backlog Items

Product:

- finalize exact MVP entity scope
- finalize auth choice
- finalize default list categories and labels

Technical:

- create database schema for users, lookups, companies, contacts, interactions, tasks, opportunities, import batches, and issues
- create role guards for admin, editor, viewer
- create base layout, locale switcher, and mobile action shell
- create initial CRUD scaffolds for admin lists
- connect GitHub to Vercel preview and production
- choose and configure one free PostgreSQL provider

Testing:

- auth access tests
- role access tests
- schema migration smoke test
- responsive shell check on iPhone viewport

#### Definition Of Done

- authenticated app shell works
- roles are enforced in core routes
- schema migrations run cleanly
- Vercel preview deployment is live
- admin lists can be managed by admin users

#### Dependencies

- founder approval of stack and auth method
- database provider credentials
- Vercel project access
- confirmation that we are staying on the Hobby plan and not using paid add-ons

#### QA Checks

- unauthenticated users cannot access protected routes
- viewer cannot mutate records
- locale switching works without layout breakage
- mobile shell is usable on iPhone width
- auth flow works without requiring a paid email service

#### Deployment Output

- first preview environment
- non-production environment configured

#### Approval Gate

- founder approves foundation before workbook import work begins

### Sprint 2: Workbook Audit And Import Pipeline

#### Objective

Convert workbook structure into a reliable import specification and working admin import flow.

#### Scope

- workbook profiling
- sheet and column mapping
- staging import design
- validation and normalization rules
- duplicate detection rules
- import review UI for admins

#### Backlog Items

Product:

- decide workbook conflict rules
- approve normalization mappings for structured values
- approve duplicate merge rules

Technical:

- implement batch upload and staging tables
- implement parsers for workbook sheets
- implement validation summary and issue tracking
- implement normalization to lookup values
- implement commit flow from staging to production tables
- define local-script fallback if hosted import exceeds Hobby limits
- design the hosted import path around browser parsing and chunked staging requests

Testing:

- sample workbook import run
- duplicate detection checks
- invalid data review checks
- rollback or retry test on failed batch

#### Definition Of Done

- workbook can be profiled and imported into staging
- import issues are visible to admin
- approved rows can be committed into production tables
- import summary reports created, updated, skipped, and flagged counts

#### Dependencies

- workbook file access
- founder sign-off on cleanup rules
- workbook size must be reasonable for hosted import or approved for local fallback

#### QA Checks

- orphan references are flagged
- duplicates are surfaced
- invalid dates and lookup values are handled predictably
- imported raw text is preserved
- hosted import path stays within free-tier execution limits, or documented fallback is used
- hosted import path does not depend on a single large workbook upload to Vercel

#### Deployment Output

- preview environment with admin import flow
- staging import test data

#### Approval Gate

- founder approves import accuracy before end-user CRM rollout

### Sprint 3: Companies, Contacts, And Search

#### Objective

Deliver the foundational CRM records and usable table-first workflows.

#### Scope

- companies table and detail
- contacts table and detail
- create and edit flows
- multiple emails and phones
- global search foundation
- filters for company and contact workflows

#### Backlog Items

Product:

- finalize list columns and default filters
- finalize detail page information hierarchy

Technical:

- CRUD for companies and contacts
- relational linking between company and contact
- global search across core fields
- mobile-friendly list and detail views

Testing:

- CRUD coverage for company and contact flows
- search behavior checks
- bilingual rendering checks
- mobile layout checks

#### Definition Of Done

- users can create, edit, filter, and search companies and contacts
- company can exist without contact
- contact can exist without company
- multiple contact emails and phones work

#### Dependencies

- Sprint 1 foundation
- Sprint 2 import outputs for real data testing

#### QA Checks

- search returns correct companies, contacts, emails, and phones
- list filters behave consistently
- mobile detail screens remain readable without horizontal scroll

#### Deployment Output

- preview deployment with real core-data screens

#### Approval Gate

- founder approves daily data-management usability before interaction workflow build

### Sprint 4: Interactions And Follow-Ups

#### Objective

Deliver the daily action engine of the CRM.

#### Scope

- interactions table and detail
- quick-add interaction flow
- follow-up task flow
- overdue and upcoming task views
- create task from interaction

#### Backlog Items

Product:

- finalize default interaction statuses and task priorities
- approve quick-entry field minimums

Technical:

- CRUD for interactions and tasks
- chronological history on company and contact detail
- quick-add mobile entry flows
- derived last interaction and inactivity calculations

Testing:

- interaction logging from mobile and desktop
- task creation from interaction
- overdue and upcoming filter tests
- history ordering tests

#### Definition Of Done

- users can log interactions quickly
- users can create follow-ups from interactions or from scratch
- history is chronological and filterable
- overdue and upcoming tasks are reliable

#### Dependencies

- approved list values
- core company and contact records

#### QA Checks

- one-tap or low-friction quick-add flow on iPhone
- chronological order is correct
- related company and contact links render correctly

#### Deployment Output

- preview deployment with operational activity workflows

#### Approval Gate

- founder approves that the app now supports the daily meetings-booking workflow

### Sprint 5: Opportunities, Dashboard, Reports, And Production Readiness

#### Objective

Complete the MVP business layer and prepare for production launch.

#### Scope

- opportunities module
- dashboard metrics
- reports
- permissions hardening
- production deployment checklist
- UAT and launch prep

#### Backlog Items

Product:

- finalize opportunity stages and status definitions
- finalize dashboard periods, inactive threshold, and conversion formulas
- run UAT with internal team

Technical:

- CRUD for opportunities
- dashboard queries and reporting views
- performance tuning and indexes
- audit and error handling polish
- production environment hardening on Vercel

Testing:

- regression suite across all modules
- role access verification
- dashboard metric validation against source data
- smoke test production deployment

#### Definition Of Done

- opportunities are operational
- dashboard shows approved KPI views
- reports support the MVP business questions
- production deployment is ready
- UAT feedback is resolved or triaged

#### Dependencies

- prior sprints complete
- confirmed KPI definitions

#### QA Checks

- dashboard numbers reconcile with database queries
- admin, editor, and viewer permissions behave correctly
- production build and migration flow succeed

#### Deployment Output

- production-ready Vercel release candidate
- launch checklist and rollback plan

#### Approval Gate

- founder approves MVP launch

## Cross-Sprint QA Strategy

- route and permission smoke tests every sprint
- critical CRUD happy-path tests for each module
- mobile viewport verification every sprint
- import regression tests after schema changes
- pre-release UAT before production launch

## Cross-Sprint Deployment Strategy

- GitHub branch workflow with preview deployments
- merge to `main` only after sprint QA sign-off
- run migrations in controlled sequence
- keep production deploys reversible where possible
- keep the architecture deployable on Vercel Hobby without paid platform features

## Decisions Requiring Role Approval

### Founder

- auth method
- metric definitions
- import cleanup tolerance
- workbook conflict policy
- final sprint approval gates

### PM

- MVP scope control
- sprint sequencing
- acceptance criteria

### CTO

- final technical stack
- schema boundaries
- import implementation detail
- deployment hardening approach

## Related

- [[CODEX|Project Context]]
- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[IMPORT_MAPPING|Import Mapping]]
- [[PERMISSIONS|Permissions]]
- [[SCREENS_AND_FLOWS|Screens And Flows]]
- [[ROADMAP|Roadmap]]
- [[sprints/README|Sprints]]
