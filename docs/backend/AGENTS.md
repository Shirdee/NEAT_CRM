---
tags:
  - crm
  - backend
  - roles
aliases:
  - CRM Backend Agents
---

# CRM Backend Agents

## Purpose

- define how PM, CTO, DEV, and QA work inside the backend surface
- keep service, data, and integration work aligned with the CRM quality bar

## Backend Role Focus

### PM

- shapes backend slices, milestones, and acceptance criteria
- keeps API and service docs aligned with delivered behavior

### CTO

- defines service boundaries, contracts, and data ownership
- reviews reliability, security, and scaling tradeoffs

### DEV

- implements handlers, services, jobs, and tests
- keeps business logic modular and easy to verify

### QA

- verifies API behavior, integration flow, and regression risk
- checks boundary validation, failure modes, and operational confidence

## Backend Rules

- keep handlers thin
- validate inputs at the boundary
- move logic into testable units
- avoid hardcoded secrets
- protect migrations, contracts, and irreversible data changes

## Related

- [[AGENTS|Project Agents]]
- [[CODEX|Project Context]]
- [[ARCHITECTURE|Architecture]]
- [[DATA_MODEL|Data Model]]
- [[IMPORT_MAPPING|Import Mapping]]
- [[frontend/AGENTS|Frontend Agents]]
