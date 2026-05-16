# LumeOS Governance Frontdoor

DRAFT / FRONTDOOR AREA.

This directory is an intake and review workspace for governed project ideas. It is not SSOT, not executable, and not queue-released.

## Purpose

The Frontdoor organizes draft inputs before they can become governed specs or workorders.

Target flow:

Brainstorm -> Summary -> Product Intent -> Spec Candidate -> Workorder Drafts -> Drift Check -> Approval -> Queue Contract Preview

Queue release and execution remain disabled unless a future governed phase explicitly enables them.

## Current SSOT

Current project truth remains in:

- docs/project/CURRENT_GOVERNANCE_HANDOVER.md
- docs/project/OPEN_TODOS.md
- docs/project/GOVERNANCE_TODO_REGISTER.json

Frontdoor drafts may reference those files, but do not replace them.

## Folder Structure

- inbox/ - draft incoming notes waiting for routing
- raw-notes/ - draft raw notes
- summaries/ - draft summaries
- product-intents/ - draft product intents
- spec-candidates/ - draft spec candidates
- workorder-drafts/ - draft workorder text, not active workorders
- approvals/ - approval previews, not real queue approvals
- decisions/ - draft decisions, not binding until promoted and approved
- review-packets/ - review packet previews
- topics/ - topic-local draft work areas

## Initial Topics

- `nutrition`
- `governance-core-extraction`
- `frontdoor`
- `runtime`
- `project-onboarding`
- `structure-cleanup`

## Rules

- All artifacts here are draft-only until promoted.
- Promotion requires source-chain check, drift check, documentation_impact, and approval.
- No artifact here is executable.
- No artifact here may be released directly to system/approval/queue.json.
- No worker dispatch, model runtime call, DB command, DEV/LIVE action, or generated evidence write is authorized by this layout.
- OpenClaw and Telegram are future draft-intake channels only; they are not direct queue or execution channels.

## Status

INITIALIZED_EMPTY.
## Legacy Source Area

Path: docs/project/frontdoor/legacy/

The legacy source area is a broad untrusted source dump and research area. OpenClaw may later research it, search it, summarize it, and deconstruct it.

Legacy is not SSOT, not current product truth, not executable, and not queue-released. Legacy material requires analysis, source refs, drift check, documentation_impact, and approval before reuse.

## Topic Structure

Path: docs/project/frontdoor/topics/

Current working areas are grouped by product, platform, data, business, ops, and governance.

Topics are not raw legacy dumps. Topic outputs require drift check, documentation_impact, and approval before promotion.
