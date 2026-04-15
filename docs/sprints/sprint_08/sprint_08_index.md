---
tags:
  - crm
  - sprint
  - sprint-08
  - planning
  - pm
  - cto
aliases:
  - Sprint 08 Index
  - CRM Sprint 08 Index
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 08 Index

## Status

**CLOSED (DEFERRED) — 2026-04-15**

Sprint 8 is closed as deferred (not approved for implementation in this cycle).
Deferred approval items were moved to [[sprints/open_tasks|Open Tasks]].

## Objective

Prepare the CRM for controlled integrations by building a narrow, auditable integration boundary first, then only add one provider path if the founder approves the value.

## PM Summary

- keep Sprint 8 small and utility-first
- avoid automation, queues, and broad sync scope
- prefer one repeated workflow pain point over multiple integrations at once

## CTO Summary

- build on the current Next.js, Prisma, RBAC, and server-action patterns
- use a provider-agnostic boundary before any live sync work
- keep config, permissions, and audit behavior explicit
- do not add paid infrastructure unless a blocker proves it necessary

## Sprint 8 Deliverables

- integration inventory and priority order
- provider boundary/types for future email or calendar work
- storage and permission shape for integration config
- minimal admin-facing integration entrypoint or stub surface
- tests for the boundary layer and enable/disable behavior

## Main Carry-Ins

- Sprint 7 saved views, cleanup, and mobile polish
- Sprint 6 business-layer and reporting baseline
- Sprint 5 UI baseline and shell patterns

## Dependencies

- founder approval on the first integration target
- confirmation that the first slice stays provider-boundary only
- agreement on whether email or calendar comes first

## Definition Of Done

- the integration boundary exists and is tested
- the first provider choice is documented or approved
- no sync logic leaks into the app before the boundary is stable
- repo gates pass, or any blocker is recorded clearly

## Linked Sprint Docs

- [[sprints/sprint_08/todo/sprint_08_todo|Sprint 08 Todo]]
- [[sprints/sprint_08/sprint_08_resume|Sprint 08 Resume]]
- [[sprints/sprint_07/sprint_07_index|Sprint 07 Index]]
- [[sprints/sprint_07/sprint_07_close_plan|Sprint 07 Close Plan]]

## Related

- [[ROADMAP|Roadmap]]
- [[DELIVERY_PLAN|Delivery Plan]]
- [[ARCHITECTURE|Architecture]]
- [[PRD|PRD]]
- [[PERMISSIONS|Permissions]]
