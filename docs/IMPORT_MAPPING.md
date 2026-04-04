---
tags:
  - crm
  - import
  - migration
  - planning
aliases:
  - CRM Import Mapping
---

# CRM Import Mapping And Cleanup Plan

## Status

Workbook file is not currently present in the workspace as of 2026-03-31.
This document defines the import approach, target mappings, and the workbook audit needed before implementation starts.
The import plan is intentionally designed to avoid paid worker or storage infrastructure.

## Import Principles

- workbook is the initial data source, not the long-term logic layer
- preserve original text values where imported
- normalize structured values into lookup tables
- never use email as a primary key
- use deterministic import review steps before committing production data

## Planned Import Stages

1. Workbook profiling
2. Sheet inventory and field mapping
3. Staging import
4. validation and duplicate detection
5. normalization and lookup resolution
6. manual review of flagged issues
7. final commit into production tables

## Free-Tier Import Strategy

- first choice: admin opens the workbook import screen, the browser parses the workbook, and the app sends staged records in chunks
- no separate queue, blob storage, or paid ETL tool in MVP
- raw workbook upload to a single Vercel Function should not be assumed because of Hobby request size limits
- if the workbook is too large or slow for a hosted import on Vercel Hobby, use a one-time local import script run by an admin against the same database
- import logic should be shared between hosted and local execution paths so we do not maintain two mapping systems

## Expected Workbook Domains

- companies
- contacts
- outreach or interactions
- next actions or tasks
- opportunities if present
- lookup or validation lists if present

## Provisional Field Mapping

### Company-like Columns

Potential workbook columns map to:

- company name -> `companies.company_name`
- website -> `companies.website`
- source -> lookup `lead_source`
- company type -> lookup `company_type`
- stage -> lookup `company_stage`
- segment -> lookup `segment`
- notes -> `companies.notes`
- last interaction -> derived or staging-only source field

### Contact-like Columns

- first name -> `contacts.first_name`
- last name -> `contacts.last_name`
- full name -> `contacts.full_name`
- role or title -> `contacts.role_title`
- company reference -> `contacts.company_id` through lookup or matching rule
- notes -> `contacts.notes`
- email columns -> `contact_emails`
- phone columns -> `contact_phones`

### Interaction-like Columns

- interaction date -> `interactions.interaction_date`
- interaction type -> lookup `interaction_type`
- subject -> `interactions.subject`
- summary or note -> `interactions.summary`
- outcome or status -> lookup `interaction_outcome_status`
- company reference -> `interactions.company_id`
- contact reference -> `interactions.contact_id`
- creator if present -> `interactions.created_by`

### Task-like Columns

- due date -> `tasks.due_date`
- task type -> lookup `task_type`
- priority -> lookup `task_priority`
- status -> lookup `task_status`
- notes -> `tasks.notes`
- related company or contact -> foreign keys
- related interaction -> `tasks.related_interaction_id` if resolvable

### Opportunity-like Columns

- company reference -> `opportunities.company_id`
- contact reference -> `opportunities.contact_id`
- opportunity name -> `opportunities.opportunity_name`
- stage -> lookup `opportunity_stage`
- type -> lookup `opportunity_type`
- estimated value -> `opportunities.estimated_value`
- status -> lookup `opportunity_status`
- close date -> `opportunities.target_close_date`
- notes -> `opportunities.notes`

## Cleanup Rules To Implement

### Structured Value Normalization

- trim whitespace
- normalize capitalization where safe
- keep original imported value for traceability
- map known synonyms to approved lookup values
- flag unknown values for review

### Duplicate Detection

Companies:

- normalized company name
- website domain

Contacts:

- normalized full name plus company
- email match
- phone match

Interactions:

- same date plus type plus company or contact plus similar subject

Tasks:

- same due date plus company or contact plus similar note

### Invalid Data Handling

- empty required business fields get flagged
- invalid dates move to review queue
- orphaned references get flagged
- multi-company contact conflicts require manual resolution

## Workbook Audit Checklist

- identify every sheet name
- identify header row per sheet
- identify formula columns
- identify lookup columns with inconsistent values
- identify rows that combine multiple entities
- identify rows with multiple emails or phones in one cell
- identify missing stable references between sheets
- identify Hebrew and English mixed content patterns

## Approval Needed Before Final Import Build

- exact workbook-to-entity mapping
- duplicate merge rules
- auto-normalization rules allowed without manual review
- overwrite versus append behavior on re-import

## Related

- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[DECISIONS|Decisions]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[PERMISSIONS|Permissions]]
