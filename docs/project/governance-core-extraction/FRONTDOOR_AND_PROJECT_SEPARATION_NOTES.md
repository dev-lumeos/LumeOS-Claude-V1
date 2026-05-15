# Frontdoor And Project Separation Notes

Status: planning only.

The Governance Frontdoor is a future subsystem. The repo split should make it
project-aware from the beginning.

## Frontdoor Flow

Target flow:

```text
Brainstorm
-> Summary
-> Product Intent
-> Spec
-> Workorder Drafts
-> Drift Checker
-> Approval
-> Queue
```

No frontdoor path should release work directly to the active queue without
deterministic checks and human approval.

## Governance-Core Responsibilities

AI-Governance-Core should contain reusable frontdoor mechanics:

- intake schemas
- summary templates
- product intent templates
- spec candidate templates
- workorder draft templates
- drift checker engine
- approval handoff
- project/topic routing logic
- validation rules
- queue release guards

Core should not contain project-specific brainstorm content as source truth.

## Project Repo Responsibilities

Each project repo owns:

- raw brainstorm notes
- summaries
- product intents
- spec candidates
- accepted specs
- workorder drafts
- project/topic notes
- project/topic TODOs
- approval evidence
- final queued workorders

For LumeOS, future frontdoor outputs should live in a project-local area such as:

```text
docs/project/frontdoor/
  inbox/
  summaries/
  product-intents/
  spec-candidates/
  workorder-drafts/
  approvals/
  topics/
```

Exact LumeOS path is UNKLAR and should be decided before implementation.
Verification command before choosing a path:

```powershell
rg "frontdoor|product intent|workorder draft|brainstorm" docs system
```

## Project Routing

Frontdoor input must declare or resolve:

- project id
- topic id
- source channel
- author/requester
- date/time
- intended artifact type
- required approval gate

If the project cannot be resolved deterministically, the frontdoor must stop and
ask for explicit routing. It must not guess a project.

## Topic Routing

Each project should support topic-level organization:

```text
docs/project/topics/<topic-id>/
  index.md
  notes/
  todos.md
  summaries/
  specs/
  workorders/
```

This structure should be created in the project repo, not in core.

## OpenClaw And Telegram

OpenClaw/Telegram inputs should be treated as draft intake only.

Allowed:

- capture raw notes
- create summaries
- propose product intent
- propose spec candidates
- propose workorder drafts

Forbidden:

- direct queue release
- direct DB/product/runtime action
- bypassing source-chain checks
- bypassing human approval
- bypassing documentation-impact checks

## Deterministic Drift Checker

Before approval, the frontdoor drift checker must compare draft artifacts
against:

- current project specs
- current project TODOs
- current handover
- product gates
- forbidden paths/actions
- source-chain requirements
- already queued/completed workorders

If drift is found, the draft is blocked or marked for human review.

## Human Approval Before Queue Release

Queue release requires:

- approved product intent or spec
- source-chain pass
- drift checker pass or explicit accepted exception
- workorder schema pass
- documentation-impact declaration
- project profile pass
- forbidden-action scan pass
- human approval token where required

## What Lives In Core

Core templates:

- brainstorm capture template
- summary template
- product intent template
- spec candidate template
- workorder draft template
- drift checker rules
- approval handoff template

Core code:

- frontdoor parser/normalizer
- project router
- topic router
- drift checker
- approval gate connector
- workorder draft generator

## What Lives In Project Repos

Project artifacts:

- raw input notes
- accepted summaries
- product intents
- specs
- workorder drafts
- approvals
- topic indexes
- project TODO updates
- final queued workorders

## Stop Conditions

Stop if:

- project route is ambiguous
- topic route is ambiguous
- source chain is missing
- frontdoor output conflicts with current specs
- generated workorder lacks documentation impact
- approval is missing
- queue release would write to runtime state directly
- generated work would violate project forbidden actions

