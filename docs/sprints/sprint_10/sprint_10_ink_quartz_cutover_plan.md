---
tags:
  - crm
  - sprint
  - sprint-10
  - cto
  - stitch
  - design-system
  - deployment
aliases:
  - Sprint 10 Ink Quartz Cutover Plan
  - CRM Ink Quartz Plan
created: 2026-04-15
updated: 2026-04-15
---

# Sprint 10 Ink & Quartz Cutover Plan — CTO

Parent: [[sprints/sprint_10/sprint_10_index|Sprint 10 Index]]

## Decision

- Re-baseline Sprint 10 UI on Stitch design system: `Ink & Quartz`.
- hard rule: no gradients in app UI.
- keep Stitch parity on desktop + mobile references.

## Stitch Source Of Truth

- project: `CRM UI Kit`
- project id: `14527789615512412022`
- project resource: `projects/14527789615512412022`
- design system asset: `assets/63dd5a314cc14087bbcc06d53b92d5f8`
- design system display name: `Ink & Quartz`
- fetched: `2026-04-15`

## Ink & Quartz Token Contract (from Stitch)

- typography:
  - display/headline: `Manrope`
  - body/label: `Inter`
- roundness: `ROUND_FOUR`
- spacing scale: `1`
- key colors:
  - `ink`: `#10243F`
  - `sand` (`surface`): `#FEF9F0`
  - `surface_container_low`: `#F8F3EA`
  - `surface_container`: `#F2EDE4`
  - `surface_container_lowest`: `#FFFFFF`
  - `coral` (`overridePrimaryColor`): `#DD6B4D`
  - `deep teal` (`overrideSecondaryColor`): `#0F766E`
  - `mint` (`secondary_container`): `#99EFE5`
  - `outline_variant`: `#C4C6CE`

## No-Gradient Enforcement

- banned in all route/page/component classes and global CSS:
  - `linear-gradient(...)`
  - `radial-gradient(...)`
  - Tailwind `bg-gradient-*`
- replacement approach:
  - tonal layering with `sand`/`mist`/`white`
  - structural emphasis with spacing + containment
  - no decorative color bands

## Screen Coverage (Stitch References)

- Login: `a9599bed012a41738d15cf7a69a452bf`
- Dashboard desktop/mobile: `98aa3867e39f49a380a52230098e1055`, `711095a05a8140b591a5eecda6138a7e`
- Companies list/detail + mobile detail: `c238ca4bb1f14d44bc3027f7c2f6eb2f`, `fc377b2c7cf54f7b8c6ee331860a7f18`, `4e4bfe4f06e345b09dbb5e4e0338e81b`
- Tasks desktop/mobile: `4fdfd7c58a644eba995e6f7f18b46f4a`, `fca0068a26b8422bb181361121bb9947`
- Interaction create mobile: `55bf286e7a22435eac0c8e37278d7618`, `e9347defa45d4c459cb768f0aeb1aa5a`
- New record desktop/mobile: `cb6f1e608ea44ead895643cee06a71b8`, `8e8f20aa224344af8ff44fc24c27c030`

## Reference Gallery

![Dashboard Desktop](https://lh3.googleusercontent.com/aida/ADBb0uhrUHB3PT_ZnOAdPgZ6ykEx39iy-wej-A59EZZKHP6aQYeIf09-vJMi3cZ_QX6tzmUTi92PveItGOVGWkR7B91v_xXpgne8BZBr1KA39NSTvlA542VFWHiKWgZw_TqdZ26EXzy1M8lBcDYXLzx_Lu3YH1UIqO0l0aoz-1g2gX2LmLPU4qkSEW3eCO5Wt8-LREMOPWN5GqR47Hkzy_Kxin_JrwYIyVrXJ71YwwZFeSsSZmlDNaDSlk9cNvQ)

![Companies Desktop](https://lh3.googleusercontent.com/aida/ADBb0ujoWjgGx1p6lCX18TiqumwcW7MWo0ZT6HZaEk9WUGFsKSTlzaBtNq0m6tIGdcTP8BlvY0H8DCyOdCm4aCy9n3SJg4eqa1RQ2B0pJYdpzAj3ap5dKrQlCFpcoltpGp8EKgUBnm5vM_87Jerg_tRQNMZPohi6x4ak-FtAutLuYghSu3puJrLocSdb9mFZzrJ3fZ_kBi1FTfYne2hEUK3jfnjKHo7KES4Vg364pegLCvAamiEishUTfDZHbJQ)

![Tasks Desktop](https://lh3.googleusercontent.com/aida/ADBb0uhWeJvNYVwrUkrpzVnZvBRu9Iqsk4BGlszQIKe12T8xJnVVJIvtNYNeyXZ9U6CiZE-47_aNxrSphzBEfKd_PW9EQoWO1mf3oLMzQG8LmTkLSDCQc1KX3HWiCuhEQHh2MZcz8RZsLoUR2x5NK_r1tJEnU3XTCQAda4Sak4em3IDNwvOsB2XqcFuNz67NoeeO8m6PFhq6NkUXI5RziacxOTqm5t9kaBon_39bKmKMZBmykqentJ250oo7AIpx)

![Mobile Dashboard](https://lh3.googleusercontent.com/aida/ADBb0uhxutTvYZYhQva5bFt_auL17HMhG0tDt3ZTiRER12KsbUFKSRHhsUBE65wNkSX3zQtC_BbxP4Z1vTJlJK-insQTKa6bY7h4qSR6Ld7Pl9eQFxdHb5_K08vwf29XbdZtcbJecqfoVBO_qIs4ZJu3E90PhhWZSVauByo-p-b42V-aTcyGYVATjbIPC5F2-MprY3NhOXfU8a5Zk5L8NKv5Ic5JHD1MDzPipktgOBSaUweHMCwHy-CDrKzsmZ2E)

![Mobile Tasks](https://lh3.googleusercontent.com/aida/ADBb0ujtEyiX4EDHveQywzFPJlPj-247xqrv_cxlSlmFOWN_pk7q-x4R33iIOytivLdM3L6yrixqOrNUPcpqMyqDdn-qIeMcERBAK4Hb2MvYtL0p0D__RQgqxOmQWT14cHV84zkXBST3e94oXy_daTmKDMQolotk7Spr8UG6B4qfjmAxmhvYp0-grHk5xpnY__VjVxioIjY1FIX0QoP81cWNIUJrF2D1xBo0r_R8iHeN4A7TfaazEjr0X-8dcNCe)

![Mobile Interaction](https://lh3.googleusercontent.com/aida/ADBb0ujfU6YcE5ZGOT6Mdl78TdfhlyHPZaDO6aoCGmajqr-0Vir6GaCx7wZsJA8JRXzgq-tKDUq1EyHoTHnW2EGYn_sXQzGk3LidGgDKhKfxUDyKh5ib-XxNrkgWiUPWitT21FxuyKrm4e3vQsUVF6-LKf_fYaWlI1MY84JaXTXGw3fNgY4zDGjtJoScfKKt-nfefpvEXQD07ep7M4ZdJ-aoqZTPZkAw0WfrDqYPWPEN2rel3S6ztJh3cFgafIsg)

## Current Execution Status (Codebase)

- gradient usage in `crm/app/src`: removed.
- token alignment started in app theme:
  - ink/coral/sand/mint mapping updated.
  - typography switched to Inter + Manrope.
- contrast-preserving solid backgrounds applied to key dark surfaces (login/shell/dashboard hero).

## DEV Handoff — Detailed Task Packs

### WS7-DS: Design System Hard Alignment

- `DEV-7001` Token parity pass:
  - align CSS variables in `globals.css` to Ink & Quartz token intent.
  - remove any stale palette aliases that conflict with Stitch.
- `DEV-7002` Typography parity:
  - ensure all high-level titles use display family and dense data uses body family.
  - verify no legacy font stack leaks in route-level classes.
- `DEV-7003` Surface hierarchy parity:
  - replace remaining neutral `slate-*` UI backgrounds where they conflict with sand/mist/white containment strategy.

### WS7-UI: Route Parity Completion

- `DEV-7101` login parity (desktop/mobile)
- `DEV-7102` dashboard parity (desktop/mobile)
- `DEV-7103` companies + company detail parity
- `DEV-7104` tasks + interactions list parity
- `DEV-7105` create/edit shell parity across `companies|contacts|tasks|interactions|opportunities`

Each task must output:
- changed files list
- before/after screenshot set
- explicit intentional deviations list

### WS7-QA: Visual + Functional Gate

- `DEV-7201` visual regression sweep (desktop/mobile)
- `DEV-7202` RTL sweep for all touched routes
- `DEV-7203` perf sanity check (mobile first paint not worse than pre-cutover)
- `DEV-7204` test/lint/build gate

Required checks:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- targeted Vitest suites for touched behavior

## Deployment Plan

1. Branch + freeze:
- create cutover branch from latest main.
- freeze unrelated UI work during WS7 merge window.

2. Implement + verify:
- complete `DEV-700x` then `DEV-710x` then `DEV-720x`.
- require QA evidence attachment before merge approval.

3. Staging deploy:
- deploy preview and execute mobile/desktop/RTL smoke checklist.
- signoff owners: CTO + QA + PM.

4. Production deploy:
- merge once all P0 parity items are closed.
- deploy with post-deploy monitoring window.

5. Post-deploy checkpoint:
- verify auth/login/dashboard/list/create critical paths.
- collect UI drift items into Sprint 11 only (no hotfix unless blocker).

## Risks

- Stitch `apply_design_system` MCP call returned `invalid argument` during this pass; code was aligned directly to fetched token definitions.
- broad no-gradient replacement can expose contrast issues on dark sections; enforced manual sweep needed.
- remaining `slate-*` utility usage may visually drift from strict Ink & Quartz until WS7-DS closes.

## Related

- [[sprints/sprint_10/sprint_10_stitch_route_plan|Sprint 10 Stitch Route Plan]]
- [[sprints/sprint_10/todo/sprint_10_todo|Sprint 10 Todo]]
- [[sprints/sprint_10/sprint_10_index|Sprint 10 Index]]
