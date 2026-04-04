---
tags:
  - crm
  - data-model
  - schema
  - planning
aliases:
  - CRM Data Model
---

# CRM Data Model

## Status

Proposed schema for MVP approval.

## Core Tables

### users

- `id` UUID primary key
- `email` unique
- `full_name`
- `role` enum: `admin`, `editor`, `viewer`
- `language_preference` enum: `he`, `en`
- `is_active`
- `created_at`
- `updated_at`

### companies

- `id`
- `company_name`
- `website`
- `source_value_id`
- `company_type_value_id`
- `stage_value_id`
- `segment_value_id`
- `notes`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Derived in queries or cached columns:

- `last_interaction_date`
- `interactions_count`

### contacts

- `id`
- `first_name`
- `last_name`
- `full_name`
- `role_title`
- `company_id` nullable
- `notes`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Derived in queries or cached columns:

- `last_interaction_date`

### contact_emails

- `id`
- `contact_id`
- `email`
- `label_value_id` nullable
- `is_primary`
- `created_at`

### contact_phones

- `id`
- `contact_id`
- `phone_number`
- `label_value_id` nullable
- `is_primary`
- `created_at`

### interactions

- `id`
- `interaction_date`
- `company_id` nullable
- `contact_id` nullable
- `interaction_type_value_id`
- `subject`
- `summary`
- `outcome_status_value_id` nullable
- `created_by`
- `created_at`
- `updated_at`

### tasks

- `id`
- `company_id` nullable
- `contact_id` nullable
- `related_interaction_id` nullable
- `task_type_value_id`
- `due_date`
- `priority_value_id`
- `status_value_id`
- `notes`
- `created_by`
- `created_at`
- `updated_at`
- `completed_at` nullable

### opportunities

- `id`
- `company_id`
- `contact_id` nullable
- `opportunity_name`
- `opportunity_stage_value_id`
- `opportunity_type_value_id`
- `estimated_value` nullable
- `status_value_id`
- `target_close_date` nullable
- `notes`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

### list_categories

- `id`
- `key`
- `name`
- `created_at`

Examples:

- `lead_source`
- `interaction_type`
- `company_type`
- `company_stage`
- `segment`
- `contact_label`
- `phone_label`
- `task_status`
- `task_priority`
- `task_type`
- `opportunity_stage`
- `opportunity_type`
- `language_preference`

### list_values

- `id`
- `category_id`
- `key`
- `label_en`
- `label_he`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

### import_batches

- `id`
- `uploaded_by`
- `source_filename`
- `status`
- `started_at`
- `completed_at`
- `summary_json`

### import_issues

- `id`
- `batch_id`
- `entity_type`
- `sheet_name`
- `row_number`
- `severity`
- `issue_code`
- `raw_value`
- `message`
- `resolution_status`

## Relationships

- company has many contacts
- company has many interactions
- company has many tasks
- company has many opportunities
- contact has many emails
- contact has many phones
- contact has many interactions
- contact has many tasks
- contact has many opportunities
- interaction optionally links to company and contact
- task optionally links to company, contact, and interaction
- lookup categories have many localized lookup values

## Constraints

- contact may exist without company
- company may exist without contact
- contact can belong to at most one company
- at least one of `company_id` or `contact_id` should exist on interactions and tasks unless an approved exception is defined
- opportunity must belong to a company
- no file attachments in MVP

## Indexing Priorities

- `companies.company_name`
- `companies.website`
- `contacts.full_name`
- `contact_emails.email`
- `contact_phones.phone_number`
- `interactions.interaction_date`
- `tasks.due_date`
- `opportunities.opportunity_name`
- compound indexes for common filters, especially `status`, `type`, and date

## Computed Fields Strategy

- derive counts and last interaction dates from interactions
- use database views or cached query layers for dashboard metrics
- do not trust imported spreadsheet formulas as system-of-record logic

## Related

- [[docs/PRD|PRD]]
- [[docs/ARCHITECTURE|Architecture]]
- [[docs/IMPORT_MAPPING|Import Mapping]]
- [[docs/PERMISSIONS|Permissions]]
- [[docs/SCREENS_AND_FLOWS|Screens And Flows]]
- [[docs/DELIVERY_PLAN|Delivery Plan]]
