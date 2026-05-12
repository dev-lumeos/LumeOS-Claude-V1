# WO-NUTRITION-P1-005 - Preparation Draft

STATUS: NON_EXECUTABLE_DRAFT

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `NOT_DISPATCHABLE`

Execution authority: none

**Status:** draft
**Phase:** 1 - Nutrition / BLS / P1-005 preparation
**Source:** `docs/project/P1_005_DECOMPOSITION_CANDIDATE.md` (`PLAN-NUTRITION-P1-005-PREPARATION-001`)
**Template:** factory-derived draft from validated decomposition candidate
**Lifecycle:** draft-only artifact; not queue released, not ready, not dispatchable

---

## Out of Scope

- BLS import execution
- raw BLS commit
- Nutrition implementation
- DB work
- Supabase commands
- migration execution
- production DB work
- approval grants
- dispatcher execution
- Codex Worker execution
- product batch execution

---

## Workorder

```yaml
workorder_id: "WO-p1-005-preparation-draft-001"
agent_id: "docs-agent"
phase: 1
priority: "P0"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  <task>
    <analyze>
      Review only the approved P1-005 preparation source set and identify the minimum source-backed planning package.
    </analyze>

    <implement>
      Create a draft-only source-chain readiness report and keep this workorder in non-executable draft form.
      Mark all outputs as NON_EXECUTABLE_DRAFT, NOT_QUEUE_RELEASED, and NOT_DISPATCHABLE.
    </implement>

    <constraints>
      No product execution.
      No BLS import.
      No DB or Supabase commands.
      No migrations.
      No approval grants.
      No dispatcher or Codex Worker execution.
      No raw BLS file writes or commits.
      Only documentation or draft workorder artifacts are allowed.
    </constraints>

    <on_error>
      Stop with FIX_REQUIRED if source-chain evidence is incomplete or if the candidate would require execution-scoped outputs.
    </on_error>
  </task>

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  patches: []
  sql_sources: []
  adrs: []
  reviews:
    - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
    - "docs/project/P1_005_READINESS_CANDIDATE.md"
    - "docs/project/P1_005_DECOMPOSITION_CANDIDATE.md"
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - module_index
    - current_specs
    - reviews

expected_outputs:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md"

scope_files:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md"

files_allowed:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md"

context_files:
  - "docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md"
  - "docs/project/P1_005_READINESS_CANDIDATE.md"
  - "docs/project/P1_005_DECOMPOSITION_CANDIDATE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "This workorder remains marked NON_EXECUTABLE_DRAFT, NOT_QUEUE_RELEASED, and NOT_DISPATCHABLE."
  - "No task content requests import, DB, Supabase, migration, approval, dispatcher, or Codex execution."
  - "Source-chain references stay inside the approved source set."
  - "Only draft documentation or draft workorder artifacts are produced."

negative_constraints:
  - "Do not run BLS import."
  - "Do not run Supabase commands."
  - "Do not execute migrations."
  - "Do not write runtime_state.json or queue.json."
  - "Do not dispatch any workorder."
  - "Do not execute Codex Worker."

blocked_by: []
validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\decomposition-plan-validator.ts --plan docs/project/P1_005_DECOMPOSITION_CANDIDATE.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\wo-factory.ts --from-plan docs/project/P1_005_DECOMPOSITION_CANDIDATE.md --out system/workorders/nutrition --dry-run --json --project lumeos"
```

---

## Notes

- This file is derived from the validated decomposition candidate `PLAN-NUTRITION-P1-005-PREPARATION-001`.
- It is not queue-released and must not be dispatched.
- No draft batch was created in this step because the existing workflow does not require a batch artifact to preserve this workorder as a draft-only, non-executable review object.

---

*Draft generated: 2026-05-12 - from validated P1-005 decomposition candidate, read-only only.*
