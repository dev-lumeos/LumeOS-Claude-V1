# AI-Governance-Core Extraction Phase Plan

Status: planning only.

This phase plan defines how to create `D:\GitHub\AI-Governance-Core` later. It
does not authorize the extraction in the current task.

## Phase 0: Prepare Source Snapshot / No Writes To LumeOS

Goal:

- Establish a source snapshot and exact copy manifest.

Allowed:

- read-only inspection of LumeOS
- `git status`
- `git rev-parse HEAD`
- dependency/import inventory
- create extraction manifest docs

Forbidden:

- moving files
- deleting files
- editing runtime state or queue
- changing product code
- running DB/Supabase actions
- copying files into the new repo

Validation:

- clean or intentionally documented worktree
- source commit recorded
- migration map reviewed
- file-backed default storage policy documented

Exit criteria:

- Tom approves the source snapshot and copy manifest before Phase 1 begins.

Rollback/stop rule:

- Stop if the source repo is dirty with unrelated changes or if reusable/project
  boundaries are unclear.

## Phase 1: Copy Reusable Core Skeleton Into New Repo

Goal:

- Create `D:\GitHub\AI-Governance-Core` and copy only approved reusable files.

Prerequisite:

- Tom has explicitly approved `PHASE_1_COPY_MANIFEST.md`.

Allowed:

- create new repo directory
- initialize package/workspace files
- copy approved reusable source
- copy generic schemas/templates/policies
- create fixture project

Forbidden:

- deleting or moving files from LumeOS
- copying LumeOS product specs or dossiers as core source
- copying runtime state or approval queue as defaults
- changing LumeOS behavior
- requiring Supabase/Postgres for core commands

Validation:

- file manifest matches approved migration map
- no Nutrition specs or BLS files in core
- no LumeOS generated dossiers in core
- initial dependency install succeeds

Exit criteria:

- core repo skeleton exists and contains only approved reusable source/templates.

Rollback/stop rule:

- Delete the new core repo directory if copy manifest is wrong before any cutover
  is attempted. Do not alter LumeOS.

## Phase 2: Install Dependencies And Make Tests Compile

Goal:

- Make AI-Governance-Core compile and run generic tests.

Allowed:

- adjust imports for new repo layout
- configure package names
- create fixture project
- update tests to use fixtures
- add `--project-root` and `--profile` plumbing where needed

Forbidden:

- connecting write-capable runs to LumeOS
- replacing LumeOS embedded governance
- altering LumeOS runtime routing

Validation:

- `pnpm install`
- `tsc --noEmit`
- generic control-plane tests
- generic workorder/operator tests
- fixture project doctor

Exit criteria:

- core tests pass without LumeOS as an implicit cwd.

Rollback/stop rule:

- Stop if tests require LumeOS product files as hidden dependencies.

## Phase 3: Create Fixture Project

Goal:

- Prove Governance-Core works on a synthetic project before touching LumeOS.

Allowed:

- fixture project under `examples/fixtures/minimal-project`
- fixture workorders
- fixture reports
- fixture SSOT docs
- fixture runtime route stubs

Forbidden:

- using real LumeOS Nutrition data as fixture truth
- using live project runtime state

Validation:

- fixture dry-run
- fixture doctor
- fixture documentation-impact pass
- fixture SSOT_SYNC_CHECK pass
- fixture dossier generation

Exit criteria:

- complete harmless fixture governed run.

Rollback/stop rule:

- Stop if project/profile path handling is ambiguous.

## Phase 4: Attach LumeOS As External Project Read-Only

Goal:

- Run read-only doctor/checks against LumeOS from AI-Governance-Core.

Allowed:

- pass `--project-root D:\GitHub\LumeOS-Claude-V1`
- pass explicit LumeOS profile
- run read-only status/doctor/checks
- write no LumeOS files unless explicitly approved

Forbidden:

- `--continue`
- worker dispatch
- review dispatch
- DB/Supabase actions
- runtime state mutation
- approval queue mutation
- report writes unless a read-only report path is explicitly approved

Validation:

- doctor reads LumeOS workorder
- forbidden paths recognized
- SSOT mappings recognized
- no writes occur

Exit criteria:

- first LumeOS read-only doctor command succeeds.

Rollback/stop rule:

- Stop if any path writes to AI-Governance-Core or outside LumeOS unexpectedly.

## Phase 5: Run Doctor/Checks Against LumeOS

Goal:

- Prove external core checks match embedded LumeOS governance behavior.

Allowed:

- status
- doctor
- invariant checks
- agent contract checks
- SSOT_SYNC_CHECK
- source-chain checks

Forbidden:

- work execution
- DB/Supabase actions
- runtime state/queue manual edits
- DEV/LIVE

Validation:

- outputs match or explain differences from embedded operator
- no unexpected project writes
- no silent fallback from Spark1 mode

Exit criteria:

- external core can evaluate a completed LumeOS batch accurately.

Rollback/stop rule:

- Stop if external and embedded results disagree on final classification without
  an explained version difference.

## Phase 6: Run Harmless Governed Test

Goal:

- Prove end-to-end external governance on a harmless LumeOS docs-only task.

Allowed:

- create a small governed docs-only workorder in LumeOS
- run Spark1 orchestration
- run configured reviewer if required
- run documentation-impact lifecycle
- run SSOT_SYNC_CHECK
- generate dossier in LumeOS report root

Forbidden:

- product code changes
- DB/Supabase actions
- runtime state or queue manual edits
- production routing changes

Validation:

- dry-run
- doctor
- continue
- status
- dossier
- git diff limited to approved docs/report evidence

Exit criteria:

- harmless docs-only batch reaches DONE through AI-Governance-Core.

Rollback/stop rule:

- Revert only the harmless test artifacts if Tom requests; do not alter embedded
  governance.

## Phase 7: Archive/Cleanup LumeOS Embedded Governance Only After Approval

Goal:

- Reduce duplication after external core is proven.

Allowed:

- archive embedded governance files only with Tom approval
- replace embedded commands with thin wrappers if approved
- update docs to point to AI-Governance-Core

Forbidden:

- deleting historical evidence
- removing project workorders/reports
- moving product SSOT into core
- changing project gates without approval

Validation:

- LumeOS can still run governed workflows through core
- project SSOT remains in LumeOS
- old embedded paths are indexed or archived

Exit criteria:

- LumeOS no longer contains duplicated active governance engine code, but keeps
  project truth and evidence.

Rollback/stop rule:

- Stop if any project run needs embedded code not available in core.
