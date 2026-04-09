---
tags:
  - crm
  - ux
  - screens
  - flows
aliases:
  - CRM Screens And Flows
---

# CRM Screens And User Flows

## Screen List

### Authentication

- login
- access denied

### Core App

- dashboard
- global search results
- companies table
- company detail
- create and edit company
- contacts table
- contact detail
- create and edit contact
- interactions table
- quick-add interaction drawer or sheet
- interaction detail and edit
- follow-ups table
- quick-add task drawer or sheet
- task detail and edit
- opportunities table
- opportunity detail and edit

### Administration

- lookup list management
- users and roles
- import batches
- import issue review

## Key User Flows

### Daily Sales Workflow

1. User logs in.
2. Dashboard shows overdue tasks, upcoming tasks, recent interactions, and meetings by period.
3. User searches for company or contact.
4. User logs a new interaction from mobile or desktop.
5. User creates a follow-up task from that interaction if needed.
6. User updates opportunity stage if commercial progress changed.

### Company Management Flow

1. User opens companies table.
2. User filters by source, stage, or inactivity.
3. User creates or edits a company.
4. User reviews related contacts, interactions, tasks, and opportunities on company detail.

### Contact Management Flow

1. User opens contacts table.
2. User creates or edits a contact.
3. User adds multiple emails and phone numbers.
4. User optionally links the contact to a company.

### Follow-Up Execution Flow

1. User opens follow-ups table.
2. User filters overdue or upcoming tasks.
3. User marks a task complete or edits due date and priority.
4. User optionally logs an interaction and creates a new next action.

### Import Admin Flow

1. Admin uploads workbook.
2. System profiles sheets and creates a staging batch.
3. Admin reviews duplicate and invalid data report.
4. Admin approves normalization results.
5. System commits records and returns import summary.

## Mobile UX Notes

- app shell should keep primary actions reachable with one thumb
- detail pages should prioritize summary cards over wide grids
- quick-add forms should open in bottom sheet or full-screen mobile modal
- tables should collapse into stacked patterns on smaller screens

## Related

- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[PERMISSIONS|Permissions]]
- [[sprints/sprint_05/ui/UI_KIT|UI Kit]]
- [[DELIVERY_PLAN|Delivery Plan]]
- tables should collapse columns into stacked labels on small screens
