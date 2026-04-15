---
tags:
  - crm
  - sprint
  - sprint-10
  - dev-handoff
  - cto
aliases:
  - Sprint 10 DEV Execution Packet
  - CRM Sprint 10 DEV Packet
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 10 DEV Execution Packet

Parent: [[sprints/sprint_10/sprint_10_index|Sprint 10 Index]]

## Scope

- active in this packet: Workstream 1 closeout + Workstream 2 approval-ready prep
- out of scope: Workstreams 3, 4, 5, 6

## Current State

1. Workstream 1 implementation landed in code:
- guarded delete actions for company/contact/interaction/task/opportunity
- role enforcement + explicit confirmation + blocked dependency handling
- locale strings updated in EN/HE
- baseline tests + lint/typecheck pass

2. Workstream 2 planning artifact landed:
- full Stitch route plan doc exists and includes screen registry and route mapping
- PM approval gate still open before broad UI rebuild starts

## DEV Sub-Streams (parallel-safe)

### DEV-S1: Deletion Hardening

- files:
  - `crm/app/src/lib/data/crm.ts`
  - `crm/app/src/lib/data/fallback-store.ts`
  - delete actions and detail pages under `crm/app/src/app/[locale]/(protected)/...`
- objective:
  - verify edge cases and improve blocked dependency messages
  - add tests for deny/confirm/block/success per entity path
- done when:
  - delete behavior is deterministic and fully covered for current policy matrix

### DEV-S2: Stitch P0 Prep (No Broad Rebuild Yet)

- files:
  - `crm/docs/sprints/sprint_10/sprint_10_stitch_route_plan.md`
  - shared token/primitive touchpoints only if needed for preflight
- objective:
  - convert plan into implementation checklist per route with acceptance points
  - do not start visual rebuild until PM approval note is recorded
- done when:
  - PM can approve with no ambiguity on sequence and acceptance

### DEV-S3: PM Gate Support

- files:
  - sprint docs only (`crm/docs/sprints/sprint_10/*`)
- objective:
  - keep sprint status truthful as DEV-S1/S2 complete
- done when:
  - sprint docs state exactly what is ready and what remains blocked by approval

## Hard Guardrails

1. no Workstream 3/4/5/6 implementation.
2. no infra additions, queue, cron, automation, or paid service.
3. no silent destructive path; delete actions must require explicit user confirmation.
4. if soft-delete schema is introduced later, treat as separate approved slice.

## Execution Order

1. DEV-S1 complete + green checks
2. DEV-S2 finalize approval-ready checklist
3. PM approval gate recorded
4. only then open broad Stitch rebuild implementation

## Related

- [[sprints/sprint_10/todo/sprint_10_todo|Sprint 10 Todo]]
- [[sprints/sprint_10/sprint_10_stitch_route_plan|Sprint 10 Stitch Route Plan]]
