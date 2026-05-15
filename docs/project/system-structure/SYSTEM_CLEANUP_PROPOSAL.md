# System Cleanup Proposal

Date: 2026-05-15  
Status: PROPOSAL ONLY / NO CLEANUP PERFORMED

This proposal follows the system tree audit in:

- `docs/project/system-structure/SYSTEM_TREE_AUDIT.md`
- `docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json`

No file move, delete, runtime behavior change, or architecture rewrite is
authorized by this proposal.

## Principles

- Preserve evidence before cleanup.
- Add indexes before moving files.
- Move only after Tom approval.
- Do not edit runtime state, queue, or audit logs manually.
- Keep active code and generated evidence separate.
- Keep current SSOT docs authoritative:
  - `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
  - `docs/project/OPEN_TODOS.md`
  - `docs/project/GOVERNANCE_TODO_REGISTER.json`
  - `docs/project/STACK_REFERENCE.md`
  - `system/model-tiers/model_registry_v2.md`
  - `system/model-tiers/model_tiers_v2.md`

## Phase 1: Add Indexes / READMEs Only

Goal: make the tree understandable without moving anything.

Allowed:

- Add `README.md` / `INDEX.md` files.
- Mark active vs support vs generated vs historical.
- Cross-link to the audit and classification JSON.

Recommended files:

- `system/README.md`
- `system/memory/README.md`
- `system/reports/README.md`
- `system/state/README.md`
- `system/workorders/README.md` update
- `system/workorders/nutrition/README.md` update

Content to include:

- purpose
- active files
- generated files
- forbidden manual edits
- where to look for current truth

Validation:

- `SSOT_SYNC_CHECK`
- `governance-invariant-check`
- `governance-learning-check`
- `git diff --check`

## Phase 2: Mark Archive / Stale / Placeholder

Goal: make historical/stale status explicit without moving files.

Allowed:

- Add status headers to stale or historical docs.
- Add index rows that classify placeholder directories.
- Add TODO register entries if new cleanup work appears.

Candidate markings:

- `system/OPEN_TODOS.md`: stale/superseded by `docs/project/OPEN_TODOS.md`
  and `docs/project/GOVERNANCE_TODO_REGISTER.json`.
- `system/memory/events`, `execution`, `learning`, `promotions`,
  `retrieval`: placeholders.
- `system/graph`: placeholder.
- `system/decomposition/specs` and `validators`: placeholders.
- `system/prompts/gstack` and `review`: placeholders.
- `system/policies/promotion` and `review`: placeholders.
- `system/workorders/nutrition/drafts`: historical drafts.
- Completed `BATCH-GOVERNANCE-P1-*` files under
  `system/workorders/nutrition/batches`: historical completed governance
  batches.

Not allowed:

- Move/delete.
- Rewrite history.
- Change runtime behavior.

## Phase 3: Move Only After Tom Approval

Goal: reduce clutter only after indexes and status labels are reviewed.

Potential moves, not yet authorized:

- Move historical workorder drafts into an archive folder.
- Move completed governance batch evidence into a completed/historical index.
- Move stale root `system/OPEN_TODOS.md` to an archive path, or replace it with
  a short pointer.
- Move tracked generated reports into an indexed historical evidence area.

Required before move:

- Tom approval for exact move list.
- Clean git diff plan.
- SSOT update.
- Search/link update.
- Validation checks.

Forbidden:

- Deleting evidence without a reviewed retention decision.
- Rewriting runtime state or audit logs.
- Moving active code.

## Phase 4: Enforce with SSOT / Documentation Checks

Goal: prevent the tree from drifting back into unclear state.

Possible enforcement:

- Extend `SSOT_SYNC_CHECK` to flag new top-level `system/` directories without
  an index/classification.
- Add a check that generated report outputs under `system/reports` are either
  ignored or explicitly classified as durable evidence.
- Add a check that workorder batches in active folders declare status and
  lifecycle state.
- Add a check that `system/memory` placeholder folders cannot be described as
  active unless code actually reads/writes them.

This phase requires code changes and tests, so it should be a separate governed
workorder.

## Recommended Next Task

Create a governed Phase 1 batch:

`System structure indexes/readmes only`

Scope:

- `system/README.md`
- `system/memory/README.md`
- `system/reports/README.md`
- `system/state/README.md`
- `system/workorders/README.md`

No moves, no deletes, no runtime state changes.
