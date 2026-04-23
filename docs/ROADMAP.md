---
tags:
  - crm
  - roadmap
  - planning
aliases:
  - CRM Roadmap
created: 2026-04-15
updated: 2026-04-23
---

# CRM Roadmap

## Source Context

- parent project hub: [[CRM Home]]
- project context: [[CRM Context]]

## Roadmap Status

Execution is past early-MVP planning. The product baseline is already delivered through lifecycle hardening (Sprint 15), and roadmap focus is now closeout + controlled expansion.

## Delivered Baseline (Implemented)

- foundation, auth, RBAC, i18n, core schema, and deployment flow (Sprints 1-10 closed in sprint index history)
- full Ink & Quartz UI system completion and route-level parity (Sprint 11)
- focused-clarity UI redesign across major routes (Sprint 14)
- lifecycle and productivity hardening:
  - close-reason flows
  - soft archive cascades
  - list productivity and context actions
  - search/filter persistence fixes
  - contrast/spacing polish (Sprint 15, QA pass after recheck)

## Active Roadmap Lanes

### Lane 1: Closeout And QA Completion

- close remaining manual QA/smoke and documentation carryover from [[sprints/open_tasks|Open Tasks]]
- remove stale sprint-era planning drift from top-level docs

### Lane 2: Import Production Readiness

- complete final real-workbook validation pass before production import use
- record import readiness outcome and operational runbook notes

### Lane 3: Integration Boundary Decision

- decide first provider lane (`email` or `calendar`) before implementation
- keep integration implementation blocked until boundary approval

### Lane 4: Auth Platform Delivery

- Clerk cutover is now implemented in repo as the resolved auth direction
- remaining closeout work is QA/manual env verification and deployment wiring confirmation
- see [[CLERK_DEPLOYMENT_PLAN|Clerk Deployment Plan]]

## Expansion Rules

- keep PRD MVP scope and current delivered behavior as baseline truth
- do not open provider sync/automation work without explicit approval
- keep free-tier compatibility unless the founder approves an infra change

## Related

- [[DELIVERY_PLAN|Delivery Plan]]
- [[DECISIONS|Decisions]]
- [[CLERK_DEPLOYMENT_PLAN|Clerk Deployment Plan]]
- [[PRD|PRD]]
- [[sprints/README|CRM Sprints]]
- [[sprints/open_tasks|Open Tasks]]
