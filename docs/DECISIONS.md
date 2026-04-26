---
tags:
  - crm
  - decisions
  - planning
aliases:
  - CRM Decisions
created: 2026-04-16
updated: 2026-04-26
---

# CRM Decisions

## Source Context

- parent project hub: [[CRM Home]]
- project context: [[CRM Context]]

## Status

Final decisions only. Proposed and pending-approval items were removed.

## Final Decisions

### D-001: Build The Product As A Next.js App On Vercel

- status: final
- owner: CTO
- reason: fastest path to secure internal web delivery with preview deployments on free-tier infrastructure

### D-002: Use PostgreSQL + Prisma As The Main Data Source

- status: final
- owner: CTO
- reason: CRM workflows require relational integrity, filtering, and migration-backed schema control

### D-003: Legacy Credentials Auth Was The MVP Starting Point

- status: superseded by D-014
- owner: CTO
- reason: credentials flow shipped the early MVP, then Clerk replaced it as the identity layer in Sprint 16

### D-004: Keep Microsoft OAuth As A Deferred Extension

- status: final
- owner: CTO
- reason: defer SSO expansion until credentials flow and user management are stable

### D-005: Keep App-Level RBAC Without Record Ownership In MVP

- status: final
- owner: PM and CTO
- reason: `admin`/`editor`/`viewer` gates cover current operating needs without ownership complexity

### D-006: Keep Interactions And Follow-Ups As Separate Lifecycle Objects

- status: final
- owner: PM and CTO
- reason: historical logging and next-action management are distinct workflows and close states

### D-007: Preserve Raw Import Text While Normalizing Structured Values

- status: final
- owner: CTO
- reason: workbook-origin data must remain auditable while normalized fields stay queryable

### D-008: Use Soft Archive With Cascade Rules

- status: final
- owner: CTO
- reason: archive behavior must keep history intact and remove archived entities from active operations
- note: company archive cascade includes linked opportunities (Sprint 15 QA recheck pass)

### D-009: Keep MVP Infrastructure Free-Tier Friendly

- status: final
- owner: PM and CTO
- reason: no paid infra dependency is required for the delivered baseline

### D-010: Keep Integration Scope Minimal And Provider-Agnostic

- status: final
- owner: CTO
- reason: no provider sync/automation lane is opened without explicit post-baseline approval

### D-011: Standardize UI On Ink & Quartz + Focused Clarity

- status: final
- owner: CTO
- reason: route-level visual consistency and maintainable UI tokens are required for ongoing product work

### D-012: Keep Table-First Productivity UX

- status: final
- owner: PM and CTO
- reason: daily use prioritizes dense lists, quick actions, and stable search/filter persistence over decorative layout patterns

### D-013: If Clerk Is Approved, Use It As Identity Replacement, Not Parallel Optional Login

- status: final
- owner: CTO
- reason: live CRM already has working custom auth and RBAC, so a dual-auth steady state would add drift, unclear account ownership, and avoidable cutover risk

### D-014: Use Clerk As The Implemented Auth Platform

- status: final
- owner: CTO
- reason: Sprint 16 implemented Clerk as session identity while CRM database keeps roles, language preference, active state, and audit ownership

## Related

- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[CLERK_DEPLOYMENT_PLAN|Clerk Deployment Plan]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ROADMAP|Roadmap]]
- [[CODEX|Project Context]]
