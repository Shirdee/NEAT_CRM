---
tags:
  - crm
  - permissions
  - security
  - planning
aliases:
  - CRM Permission Model
updated: 2026-04-11
---

# CRM Permission Model

## Source Context

- parent project hub: [[CRM Home]]
- project context: [[CRM Context]]

## Access Principles

- all users must authenticate
- all authenticated users can access the internal app shell
- authorization is enforced server-side
- no record ownership rules in MVP

## Roles

### admin

- manage users and roles
- manage admin lists
- run imports and approve cleanup
- full CRUD on companies, contacts, interactions, tasks, and opportunities
- view all dashboard and reporting data

### editor

- full CRUD on companies, contacts, interactions, tasks, and opportunities
- read dashboard and reports
- cannot manage users, roles, or admin lists
- cannot run production imports unless founder later expands access

### viewer

- read-only access to companies, contacts, interactions, tasks, opportunities, and dashboard
- no create, edit, delete, import, or settings actions

## Permission Matrix

| Capability | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| Login | Yes | Yes | Yes |
| Read CRM records | Yes | Yes | Yes |
| Create or edit companies | Yes | Yes | No |
| Create or edit contacts | Yes | Yes | No |
| Log interactions | Yes | Yes | No |
| Create or update tasks | Yes | Yes | No |
| Create or update opportunities | Yes | Yes | No |
| Manage lookup lists | Yes | No | No |
| Manage users and roles | Yes | No | No |
| Run import batches | Yes | No | No |
| Approve cleanup issues | Yes | No | No |

## Open Approval Question

- confirm whether viewer users should see all notes and summaries or only sanitized read-only content

## Related

- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[DECISIONS|Decisions]]
- [[DELIVERY_PLAN|Delivery Plan]]
