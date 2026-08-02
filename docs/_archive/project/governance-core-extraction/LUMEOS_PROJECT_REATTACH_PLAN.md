# LumeOS Project Reattach Plan

Status: planning only.

This plan explains how AI-Governance-Core should later run against the LumeOS
repo as an external project. It does not authorize extraction or cutover.

## Reattach Principle

AI-Governance-Core runs the workflow. LumeOS supplies project truth.

LumeOS remains responsible for:

- product code
- project specs
- project docs and SSOT
- project TODOs
- workorders and batches
- dossiers and reports
- runtime evidence
- project-specific forbidden actions and gates

Governance-Core reads those locations through a project profile.

## Storage Adapter Policy

Initial LumeOS attachment must use file-backed storage only:

- `system/state` for runtime/audit/metrics
- `system/approval` for approval state
- `system/reports` for reports and dossiers
- `docs/project` for SSOT docs and TODOs

No AI-Governance-Core command may require Supabase/Postgres during LumeOS
reattach unless the LumeOS project profile explicitly enables a DB-backed
adapter in a later approved phase.

## Project Profile Location

Current embedded profile:

```text
D:\GitHub\LumeOS-Claude-V1\system\project-profiles\profiles\lumeos.json
```

Initial reattach should use the existing profile read-only to avoid changing
LumeOS layout.

Later target profile location, after approval:

```text
D:\GitHub\LumeOS-Claude-V1\.governance\project.profile.json
```

or:

```text
D:\GitHub\LumeOS-Claude-V1\governance\project.profile.json
```

The final location is UNKLAR and should be decided before Phase 4. Verification
step: compare existing path references with:

```powershell
rg "system/project-profiles/profiles/lumeos.json|project.profile" .
```

## Profile Shape

The external project profile should include at least:

```json
{
  "project_id": "lumeos",
  "display_name": "LumeOS",
  "project_root": "D:/GitHub/LumeOS-Claude-V1",
  "workorders_root": "system/workorders",
  "reports_root": "system/reports",
  "memory_root": "system/memory",
  "runtime_state_root": "system/state",
  "approval_root": "system/approval",
  "ssot_files": [
    "docs/project/CURRENT_GOVERNANCE_HANDOVER.md",
    "docs/project/OPEN_TODOS.md",
    "docs/project/GOVERNANCE_TODO_REGISTER.json",
    "docs/project/STACK_REFERENCE.md"
  ],
  "todo_files": [
    "docs/project/OPEN_TODOS.md",
    "docs/project/GOVERNANCE_TODO_REGISTER.json"
  ],
  "forbidden_paths": [
    ".env",
    ".env.*",
    "system/state/runtime_state.json",
    "system/approval/queue.json"
  ],
  "generated_evidence_paths": [
    "system/reports/batches/**",
    "system/reports/dossiers/**",
    "system/reports/runs/**",
    "system/reports/codex-worker/**"
  ],
  "ignored_local_paths": [
    "docs/specs/Nutrition/00_raw/**"
  ],
  "storage": {
    "default_adapter": "file",
    "db_adapters_enabled": false
  }
}
```

The actual profile must be generated from the current LumeOS profile and
validated against the core schema.

## Workorders And Batches

LumeOS workorders should remain in the LumeOS repo.

Current location:

```text
D:\GitHub\LumeOS-Claude-V1\system\workorders\
```

Initial external runs should use this location unchanged.

Later project cleanup may choose a project-local governance folder, but that is
a separate Tom-approved cleanup phase.

## Reports And Dossiers

LumeOS reports and dossiers should remain in:

```text
D:\GitHub\LumeOS-Claude-V1\system\reports\
```

AI-Governance-Core should write reports into the project profile's `reports_root`
when operating on LumeOS. Core should not keep LumeOS dossiers in its own repo.

## Running Checks Against LumeOS

Future core CLI should accept explicit project parameters:

```powershell
pnpm --dir D:\GitHub\AI-Governance-Core run governance:doctor -- `
  --project-root D:\GitHub\LumeOS-Claude-V1 `
  --profile D:\GitHub\LumeOS-Claude-V1\system\project-profiles\profiles\lumeos.json `
  --batch D:\GitHub\LumeOS-Claude-V1\system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-RDA-FILTER.md `
  --orchestration-mode spark1_orchestrated
```

Command name is proposed. Exact CLI name is UNKLAR until the standalone package
entrypoint exists.

## Product Gates And Forbidden Paths

Governance-Core should read product gates and forbidden paths from:

- project profile
- workorder/batch metadata
- project SSOT docs
- project policies

For LumeOS, forbidden actions remain:

- no DEV/LIVE unless explicitly approved
- no Supabase Cloud unless explicitly approved
- no production DB writes
- no raw BLS commit
- no production routing changes
- no MiniMax production routing
- no manual runtime state or queue edits

## SSOT_SYNC_CHECK Against Project Files

`SSOT_SYNC_CHECK` should run in project mode:

- changed project files are detected under `project_root`
- documentation impact is read from workorders
- SSOT mappings come from the project profile
- TODO consistency checks compare project TODO files
- runtime role consistency checks compare project runtime SSOT files

The core repo should not treat its own docs as satisfying LumeOS SSOT.

## Documentation Impact

For LumeOS workorders:

- `documentation_impact` remains mandatory.
- Documentation agent/step writes to LumeOS docs when required.
- Structured N/A reasons are stored in LumeOS workorder/dossier evidence.
- DONE is blocked if project SSOT is required but not updated.

## First Read-Only Doctor Target

Recommended first external read-only command target:

```text
system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-V2-WILD-APPLY.md
```

Reason: this batch is already completed and has recent evidence:

- Spark1 used
- Nemotron review PASS
- documentation impact completed
- SSOT sync passed
- final operator DONE
- doctor CLEAN_READY

If that exact file name differs, verify with:

```powershell
Get-ChildItem system/workorders/nutrition/batches -Filter '*WILD*' | Select-Object -ExpandProperty FullName
```

## First Harmless Test Workorder Target

After read-only doctor succeeds, create a new harmless docs-only fixture
workorder in the LumeOS repo that:

- touches only `docs/project/governance-core-extraction/` or a fixture docs path
- declares `documentation_impact`
- requires no DB, product code, runtime state, or queue writes
- produces a small validation report
- runs with `--orchestration-mode spark1_orchestrated`
- uses `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent` if review is enabled

The test should prove external project path handling before any product or
governance behavior change.

## Reattach Stop Conditions

Stop immediately if:

- core tries to write reports inside AI-Governance-Core for a LumeOS run
- core treats LumeOS SSOT as core SSOT
- LumeOS forbidden paths are missing from the profile
- runtime state or approval queue would be manually edited
- a project path resolves outside the LumeOS repo
- model routing falls back silently when `spark1_orchestrated` is requested
- documentation impact is missing or skipped without structured N/A
