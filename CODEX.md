# CRM Project Context

## Identity

- project name: CRM
- purpose: build a customer relationship management product based on the founder brief
- status: initialized scaffold, awaiting full requirements

## Working Assumptions

- this repository is the dedicated CRM workspace
- scope, stack, and delivery priorities are not finalized yet
- docs should be updated as the source of truth once requirements are provided

## Skill Routing

- keep project role skills in `.codex/skills/`
- support explicit skill calls with `$pm`, `$cto`, `$dev`, and `$qa`
- prefer PM for sequencing, CTO for architecture, DEV for implementation, and QA for verification

## Commands

- pending: define setup, run, test, lint, and deploy commands after stack selection

## Definition Of Done

- requirements are captured in docs
- implementation matches approved scope
- verification is completed before handoff

## Prompt Examples

- `$pm turn the CRM brief into milestone docs and sprint 1`
- `$cto propose the CRM architecture and call out risks`
- `$dev implement the approved CRM task and add tests`
- `$qa verify the delivered CRM slice and list regressions`
