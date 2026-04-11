---
tags:
  - crm
  - architecture
  - planning
  - cto
aliases:
  - CRM Architecture
updated: 2026-04-11
---

# CRM Architecture

## Source Context

- parent project hub: [[CRM Home]]
- project context: [[CRM Context]]

## Status

PM and CTO recommendation prepared for approval on 2026-03-31.
This is the proposed implementation direction for the MVP.

## PM And CTO Recommendation

### Recommended Stack

- frontend and backend shell: Next.js App Router with TypeScript
- deployment: Vercel Hobby
- database: PostgreSQL on a free-tier provider
- ORM and migrations: Prisma
- auth: Auth.js with credentials-based login and app-level roles
- validation: Zod
- forms: React Hook Form
- UI foundation: Tailwind CSS with accessible reusable UI primitives
- data tables: TanStack Table
- i18n: `next-intl`

### Why This Stack

- Next.js App Router supports a full-stack web app with server-side data access and good Vercel support.
- Vercel Hobby provides a free deployment path with previews, HTTPS, and enough function capacity for a small internal MVP.
- PostgreSQL is a strong fit for relational CRM data, imports, filtering, and reporting.
- Prisma gives typed schema management and migrations for a business-data-heavy app.
- TanStack Table is a strong fit for the table-first CRM requirement.
- `next-intl` fits the bilingual Hebrew and English requirement and works with App Router.
- Auth.js keeps auth inside the app and avoids paying for a separate auth SaaS in MVP.

### Important Tradeoff

The free-tier constraint changes the auth recommendation:

- recommended default: email and password with admin-created users
- not recommended as default: magic link, because it usually adds an email delivery service even if the app itself stays free

If the business still wants magic links in MVP, we should treat that as an explicit service decision rather than the default path.

## Free-Tier Compatibility

### Current Verdict

The plan is still viable on a free stack, with one adjustment:

- keep Vercel on the Hobby plan
- use a free PostgreSQL provider as the single supporting infrastructure service
- avoid paid queues, storage products, analytics, and email infrastructure in MVP
- prefer credentials auth over magic-link auth

### Vercel Hobby Constraints That Affect The Plan

- Hobby is free and includes preview deployments and base function usage.
- Current documented Node.js function limits are up to 300 seconds and 2 GB memory on Hobby.
- Current documented Vercel Function request and response body size limit is 4.5 MB.
- Hobby accounts also have deployment and bandwidth limits, so the app should stay operationally light.

### Design Implications

- no background job system in MVP
- no Blob or file-storage dependency unless later proven necessary
- no image-heavy UI dependency
- import flow should be admin-only and avoid assuming raw workbook upload to a single function
- if the workbook is too large for a single hosted import flow, the fallback should be a one-time local import script run by an admin rather than adding paid infrastructure

## System Overview

```text
Users
  -> Next.js web app on Vercel
    -> authenticated routes
    -> server actions and route handlers
    -> Prisma data layer
      -> PostgreSQL

Admin import flow
  -> upload workbook or structured extract
  -> staging tables
  -> validation and normalization
  -> review and conflict report
  -> commit into production tables
```

## Architecture Principles

- server-side data access for sensitive operations
- relational source of truth, not workbook formulas
- app-level RBAC enforced on server paths
- table-first responsive UI
- database-backed record pickers should use live search rather than long static dropdowns
- preserve imported raw text while normalizing structured values
- minimize irreversible decisions until workbook profiling is complete
- stay within free-tier operational limits
- use the fewest possible external services

## Proposed Domain Boundaries

### App Shell

- auth, routing, locale handling, top navigation, mobile quick actions

### CRM Core

- companies
- contacts
- interactions
- tasks
- opportunities

### Administration

- lookup list management
- user roles
- import batches and cleanup review

### Reporting

- dashboard aggregates
- saved summary queries for core reports

## Data Model Summary

Canonical entities:

- `users`
- `companies`
- `contacts`
- `contact_emails`
- `contact_phones`
- `interactions`
- `tasks`
- `opportunities`
- `list_categories`
- `list_values`
- `import_batches`
- `import_issues`

Computed or derived behavior:

- `last_interaction_date`
- `interactions_count`
- inactive lead status
- dashboard summary aggregates

The full schema proposal lives in [[DATA_MODEL|Data Model]].

## Key Technical Decisions

### IDs

- use internal UUIDs for all primary keys
- never use email as a primary key

### Relationships

- company is optional on contact
- contact is optional on company
- contact belongs to at most one company
- child tables hold multiple emails and phones

### Localization

- UI strings come from translation files
- admin lists store bilingual labels
- imported raw notes and original values are preserved as entered

### Search

- start with database-backed partial search over core fields
- optimize with indexes first
- defer dedicated search engine unless performance proves it necessary
- whenever a user needs to find an existing company, contact, interaction, or similar CRM record inside a form, the UI should use live search backed by the existing data layer instead of rendering an unbounded static select

### Reporting

- use SQL queries and app-level summaries for MVP
- defer a BI layer or warehouse until real reporting volume requires it

## Security Model

- all app routes require authentication except login
- all business mutations are enforced server-side
- roles: admin, editor, viewer
- no ownership-based filtering in MVP
- audit fields on major tables: `created_at`, `updated_at`, `created_by`, `updated_by` where relevant

## Import Architecture

1. Admin uploads workbook.
2. System stores batch metadata.
3. Sheet-specific parsers map rows into staging records.
4. Validation rules identify missing references, duplicate candidates, invalid lookup values, and empty required fields.
5. Normalization rules convert workbook values into relational entities and lookup IDs.
6. Admin reviews a validation summary.
7. Approved rows are committed into production tables.

Free-tier note:

- the primary import path should avoid sending the entire workbook file to a single Vercel Function
- preferred hosted path: parse workbook client-side, then send normalized data to staging in chunks
- if workbook size or validation complexity still exceeds Hobby limits, the fallback path should be a local admin-run import command against the same database

Detailed mapping and cleanup logic lives in `docs/IMPORT_MAPPING.md`.

## Deployment Architecture

- GitHub repository connected to Vercel
- preview deployment on pull requests
- production deployment from `main`
- environment-specific database and auth secrets in Vercel
- separate development and production databases
- migration execution controlled as part of deployment workflow
- no paid Vercel add-ons assumed in MVP
- no separate email service assumed in MVP

## Risks

- workbook structure may be more inconsistent than the narrative requirements imply
- bilingual imported values may require manual normalization rules
- interaction history may not have stable keys for deduplication
- dashboard conversions may need clarified business definitions
- large workbook imports may exceed the practical comfort zone of a hosted free-tier import flow
- magic-link auth would likely increase service count and complexity

## External References

The recommendation above aligns with current official docs checked on 2026-03-31:

- Next.js App Router and deployment guidance: [nextjs.org](https://nextjs.org/docs/app/getting-started/deploying), [vercel.com](https://vercel.com/docs/frameworks/nextjs)
- Vercel Hobby plan and limits: [vercel.com](https://vercel.com/docs/plans/hobby), [vercel.com](https://vercel.com/docs/functions/limitations)
- Prisma with Next.js and Vercel: [prisma.io](https://www.prisma.io/docs/guides/nextjs)
- TanStack Table for table-heavy UI: [tanstack.com](https://tanstack.com/table/latest/docs/framework/react)
- `next-intl` for App Router i18n: [next-intl.dev](https://next-intl.dev/)
- Auth.js project overview: [authjs.dev](https://authjs.dev/)

## Related

- [[CODEX|Project Context]]
- [[PRD|PRD]]
- [[DATA_MODEL|Data Model]]
- [[IMPORT_MAPPING|Import Mapping]]
- [[PERMISSIONS|Permissions]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[DECISIONS|Decisions]]
