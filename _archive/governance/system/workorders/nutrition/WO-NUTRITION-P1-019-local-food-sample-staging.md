# WO-NUTRITION-P1-019 - Local Food Sample Staging

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only food foundation data
**Source:** approved local BLS 4.0 workbook plus completed local nutrient_defs foundation
**Execution authority:** scoped product-gate exception for one exact local-only food sample staging batch only
**Scope boundary:** deterministic source extraction, governed review, and local Supabase/Test DB sample insert after gates pass

```yaml
workorder_id: "WO-nutrition-019"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Local-only rollback, if separately approved, would delete food_nutrients for data_source='bls_4_0_local_sample' and then delete foods whose bls_code is listed in the staging report."

task: |
  Populate the local Nutrition food foundation with a small deterministic
  source-backed food sample so the next local step can build real Food Search.

  Required behavior:
  - Inspect only the approved local BLS workbook source.
  - Generate a deterministic local-only staging SQL file and review report.
  - Select at least 10 source-backed foods when safely available.
  - Insert only source-backed food names, stable BLS identifiers, and nutrient
    values that map to existing nutrition.nutrient_defs(code).
  - Do not invent food values or use arbitrary mock data.
  - Apply only to the local Supabase/Test DB after gates pass.
  - Validate foods row count > 0, food_nutrients row count > 0, and no
    food_nutrients.nutrient_code values are missing from nutrition.nutrient_defs.
  - Update the local schema/debug page copy to reflect the local food sample
    status without adding food search or food UI.
  - Update active handover with the local-only staging result.

  Do not run DEV/LIVE commands, Supabase Cloud commands, broad/full BLS import,
  raw BLS commit, invented food values, RDA value changes, production routing,
  MiniMax routing, manual runtime_state edit, or manual queue edit.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  patches: []
  sql_sources:
    - "supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql"
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
    - "docs/project/p1-005/P1-005-local-food-foundation-validation.md"
  raw_sources:
    - "docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx"
  raw_sources_allowed: true
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "sql_sources"
    - "reviews"
    - "patches"
    - "adrs"
    - "raw_sources"

documentation_impact:
  required: true
  domains:
    - "product"
    - "product_gate"
  ssot_files:
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/p1-005/P1-005-local-food-sample-staging-report.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "system/workorders/cli/nutrition_food_sample_extract.py"
  - "system/workorders/cli/__tests__/test_nutrition_food_sample_extract.py"
  - "docs/project/p1-005/P1-005-local-food-sample-staging.sql"
  - "docs/project/p1-005/P1-005-local-food-sample-staging-report.md"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "system/workorders/cli/nutrition_food_sample_extract.py"
  - "system/workorders/cli/__tests__/test_nutrition_food_sample_extract.py"
  - "docs/project/p1-005/P1-005-local-food-sample-staging.sql"
  - "docs/project/p1-005/P1-005-local-food-sample-staging-report.md"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "system/workorders/cli/nutrition_food_sample_extract.py"
  - "system/workorders/cli/__tests__/test_nutrition_food_sample_extract.py"
  - "docs/project/p1-005/P1-005-local-food-sample-staging.sql"
  - "docs/project/p1-005/P1-005-local-food-sample-staging-report.md"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx"
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
  - "docs/project/p1-005/P1-005-local-food-foundation-validation.md"
  - "supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The deterministic helper reads the approved local BLS workbook and does not invent food or nutrient values."
  - "The staging report identifies the local source file, selection rule, expected food count, expected food_nutrients count, and boundaries."
  - "The local-only SQL inserts at least 10 foods and nutrient values linked to existing nutrition.nutrient_defs(code)."
  - "Local DB validation confirms foods row count > 0."
  - "Local DB validation confirms food_nutrients row count > 0."
  - "Local DB validation confirms zero food_nutrients rows have nutrient_code values missing from nutrition.nutrient_defs."
  - "The local schema/debug page remains read-only and reflects that local food sample rows may exist."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."
  - "All expected output files listed in this workorder exist and are complete."
  - "No DEV/LIVE action, Supabase Cloud command, broad/full BLS import, raw BLS commit, invented food values, RDA update, production routing change, or MiniMax routing change is introduced."

negative_constraints:
  - "No DEV/LIVE action."
  - "No Supabase Cloud command."
  - "No production DB work."
  - "No broad/full BLS import."
  - "No raw BLS commit."
  - "No invented food values."
  - "No RDA value changes."
  - "No food search or food search UI."
  - "No production routing change."
  - "No MiniMax production routing change."
  - "No manual runtime_state edit."
  - "No manual queue edit."

required_skills:
  - "nutrition-specialist"
  - "supabase-specialist"
  - "test-driven-development"
  - "lint-and-validate"
optional_skills: []

validation_commands:
  - "python -m unittest system.workorders.cli.__tests__.test_nutrition_food_sample_extract"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
