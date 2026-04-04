---
tags:
  - crm
  - roadmap
  - planning
aliases:
  - CRM Roadmap
---

# CRM Roadmap

## Roadmap Principle

This roadmap is intentionally gradual.
The product should begin as a lean internal CRM with the fewest possible moving parts, then grow sprint by sprint only after each layer is stable and useful.

## Guiding Rules

- start with the smallest useful CRM for booking meetings
- keep the initial stack simple and free-tier friendly
- avoid adding supporting services until product usage clearly justifies them
- expand from operations, to reporting, to integrations, then to automation
- keep the roadmap aligned with [[docs/DELIVERY_PLAN|Delivery Plan]]

## MVP Sprint Roadmap

### Sprint 1: Foundation And Technical Baseline

#### Purpose

Create the secure and bilingual foundation for the CRM while keeping the stack simple and free-tier compatible.

#### Core Features

- app shell and navigation
- credentials-based login
- admin, editor, and viewer roles
- bilingual infrastructure
- admin list framework
- Vercel and database setup

#### Supporting Services

- Vercel Hobby
- one free PostgreSQL provider
- no additional supporting services by default

#### Why This Sprint Comes First

Every later sprint depends on auth, permissions, schema, deployment, and localization being in place.

### Sprint 2: Workbook Audit And Import Pipeline

#### Purpose

Move the spreadsheet source into a controlled import workflow without adding queues, blob storage, or paid ETL infrastructure.

#### Core Features

- workbook profiling
- field mapping
- staging import model
- validation and normalization rules
- duplicate detection flow
- admin import review screen
- hosted chunked import path
- local import fallback if needed

#### Supporting Services

- no new services planned

#### Why This Sprint Comes Second

The imported data quality affects every downstream CRM screen, filter, dashboard, and report.

### Sprint 3: Companies, Contacts, And Search

#### Purpose

Make the CRM usable for managing the core lead database day to day.

#### Core Features

- companies table and detail
- contacts table and detail
- create and edit flows
- multiple emails and phone numbers
- global search
- core filters
- mobile-friendly record views

#### Supporting Services

- no new services planned

#### Why This Sprint Comes Third

The team needs the master lead database working before the daily activity workflow can become effective.

### Sprint 4: Interactions And Follow-Ups

#### Purpose

Make the CRM operational for the daily sales workflow that drives meetings booked.

#### Core Features

- interactions table
- interaction detail and history
- mobile quick-add interaction flow
- follow-up tasks table
- overdue and upcoming task views
- create follow-up from interaction
- inactivity tracking

#### Supporting Services

- no new services planned

#### Why This Sprint Comes Fourth

Once the lead data is clean and usable, the team can layer in the activity and follow-up engine that creates business value.

### Sprint 5: Opportunities, Dashboard, Reports, And Launch Readiness

#### Purpose

Complete the MVP business layer and prepare the app for internal rollout.

#### Core Features

- opportunities module
- dashboard widgets
- leads by source reporting
- meetings by period
- conversion views where approved
- permissions hardening
- performance tuning
- launch and release checklist

#### Supporting Services

- no new services planned unless production launch proves one is necessary

#### Why This Sprint Comes Fifth

Reporting and launch hardening are most valuable after the operational workflows already exist.

## Post-MVP Sprint Candidates

These are future sprint candidates, not committed scope.

### Sprint Candidate A: Workflow Optimization

#### Feature Candidates

- saved filters and saved views
- better dashboard presets
- better mobile quick-entry flows
- batch editing for structured values
- improved deduplication and cleanup tools
- richer reporting and team activity summaries
- lightweight notifications if they can be added without service sprawl

#### Supporting Services

- still prefer no new services

### Sprint Candidate B: Controlled Integrations

#### Feature Candidates

- Gmail or Outlook sync
- calendar sync
- website form ingestion
- structured CSV or Excel re-import tools

#### Supporting Services

- add external services gradually and one at a time
- each integration must justify itself with clear operational value

### Sprint Candidate C: Automation And Expansion

#### Feature Candidates

- reminders and notifications
- automation triggers
- assignment and ownership model
- more advanced funnel analytics
- kanban or calendar views if real usage proves they help

#### Supporting Services

- only add new services if there is a concrete repeated workflow they solve

## Service Expansion Policy

Before adding any new supporting service, answer all of these:

1. Does it solve a real repeated problem in the live CRM workflow?
2. Can we do it without leaving the free tier?
3. Can the same value be achieved with the existing stack more simply?
4. Does it reduce manual work enough to justify more complexity?

If the answer is not clearly yes, defer the service.

## Next Planned Service Candidates

These are candidates only, not commitments:

- email service only if magic links or notifications become truly necessary
- calendar provider integration only if meeting workflow benefits are proven
- sync or automation services only after the data model and usage patterns stabilize

## Related

- [[docs/PRD|PRD]]
- [[docs/DELIVERY_PLAN|Delivery Plan]]
- [[docs/DECISIONS|Decisions]]
- [[docs/SCREENS_AND_FLOWS|Screens And Flows]]
- [[docs/ARCHITECTURE|Architecture]]
