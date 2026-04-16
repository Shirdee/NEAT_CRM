---
tags:
  - crm
  - decisions
  - planning
aliases:
  - CRM Decisions
updated: 2026-04-16
---

# CRM Decisions

## Source Context

- parent project hub: [[CRM Home]]
- project context: [[CRM Context]]

## Status

These are proposed PM and CTO decisions pending founder approval.

## Proposed Decisions

### D-001: Build The MVP As A Next.js Web App On Vercel

- status: proposed
- owner: CTO
- reason: fastest path to a mobile-friendly internal app with secure routes and preview deployments on Vercel Hobby

### D-002: Use PostgreSQL As The Source Of Truth

- status: proposed
- owner: CTO
- reason: CRM data is relational and requires strong filtering, reporting, and import control

### D-003: Keep MVP Scope Focused On Lead Management

- status: proposed
- owner: PM
- reason: the business goal is meetings booked, not full account management

### D-004: Use Table-First UX For MVP

- status: proposed
- owner: PM
- reason: this matches daily operational usage and reduces UI complexity

### D-005: Separate Historical Interactions From Follow-Up Tasks

- status: proposed
- owner: PM and CTO
- reason: activity history and future action management serve different workflows

### D-006: Use App-Level Roles Without Record Ownership In MVP

- status: proposed
- owner: PM and CTO
- reason: internal collaboration is broad and ownership rules are not currently required

### D-007: Preserve Imported Raw Text While Normalizing Structured Values

- status: proposed
- owner: CTO
- reason: imported workbook text must remain trustworthy while structured values become queryable

### D-008: Keep The MVP Compatible With A Fully Free Stack

- status: proposed
- owner: PM and CTO
- reason: the founder explicitly requires Vercel free tier and minimal extra services

### D-009: Prefer Credentials Login Over Magic Links In MVP

- status: proposed
- owner: CTO
- reason: credentials login avoids adding an email delivery service just for authentication

### D-010: Keep Integration Storage Provider-Agnostic And Minimal

- status: proposed
- owner: CTO
- reason: integration config should stay narrow until boundary approval, with no sync, queue, automation, or paid infra assumptions

### D-011: Keep Credentials Auth As Primary, Plan Microsoft OAuth As Optional Extension

- status: proposed
- owner: CTO
- reason: credentials auth unblocks immediate delivery while preserving a clean decision gate for Microsoft SSO migration

## Founder Approval Needed

### A-001: Login Method

- options: email and password, or magic link
- recommendation: email and password for MVP under the free-tier constraint
- approval needed from: founder

### A-002: Viewer Access Scope

- question: should viewers see all notes and interaction summaries, or only limited read-only fields
- approval needed from: founder

### A-003: Import Cleanup Rules

- question: what tolerance is acceptable for automatic normalization versus manual review
- approval needed from: founder with PM recommendation after workbook audit

### A-004: Dashboard Definitions

- question: confirm exact conversion definitions, reporting periods, and inactive lead threshold
- approval needed from: founder

### A-005: Workbook Authority

- question: if workbook content conflicts with the written requirements, which source wins
- recommendation: written requirements define target behavior, workbook defines initial data only
- approval needed from: founder

### A-006: Integration Boundary Scope

- question: confirm whether MVP integration scope is config-only or may include sync-ready fields
- recommendation: config-only until CTO-803 boundary approval
- approval needed from: founder

### A-007: Microsoft Auth Timing

- question: should Microsoft OAuth be enabled now or after Sprint 13 credentials + user-management stabilization
- recommendation: ship Sprint 13 on credentials first, then approve Microsoft OAuth as the next auth iteration
- approval needed from: founder

## Related

- [[PRD|PRD]]
- [[ARCHITECTURE|Architecture]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[IMPORT_MAPPING|Import Mapping]]
- [[PERMISSIONS|Permissions]]
- [[CODEX|Project Context]]
