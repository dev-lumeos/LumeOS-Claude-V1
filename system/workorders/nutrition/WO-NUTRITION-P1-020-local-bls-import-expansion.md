# WO-NUTRITION-P1-020 - Local BLS Import Expansion

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only BLS-backed food data
**Source:** approved local BLS 4.0 workbook plus completed local food foundation
**Execution authority:** scoped product-gate exception for one exact local-only BLS import expansion batch only
**Scope boundary:** deterministic full local BLS extraction and local Supabase/Test DB upsert after gates pass

```yaml
workorder_id: "WO-nutrition-020"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Local-only rollback, if separately approved, would remove food_nutrients with data_source='bls_4_0_local_import' and then reconcile nutrition.foods to the previous 10-row sample boundary."

task: |
  Expand the local Nutrition food foundation with deterministic source-backed
  BLS food rows and nutrient values so the next local step can build real Food
  Search.

  Required behavior:
  - Use only docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx.
  - Use sheet BLS_4_0_Daten_2025_DE.
  - Prefer the full local BLS import when deterministic mapping is complete.
  - Generate UTF-8 local CSV artifacts under tmp/nutrition/p1-005-bls-local-import.
  - Do not commit generated bulk CSV data.
  - Insert/update nutrition.foods idempotently by bls_code.
  - Insert/update nutrition.food_nutrients idempotently by food_id/nutrient_code.
  - Validate that all food_nutrients.nutrient_code values have nutrition.nutrient_defs(code) targets.
  - Validate that no orphan food_nutrients.food_id rows exist.
  - Preserve German UTF-8 food names.
  - Report inserted/updated/skipped counts and missing mapping counts.
  - Update active handover with the local-only result.

  Do not run DEV/LIVE commands, Supabase Cloud commands, production DB work,
  source workbook commits, unsupported food values, unsupported nutrient values,
  RDA value changes, schema changes unless separately reported, production
  routing, MiniMax routing, manual runtime_state edit, or manual queue edit.

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
    - "docs/project/p1-005/P1-005-local-food-sample-staging-report.md"
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
    - "docs/project/p1-005/P1-005-local-bls-import-expansion-report.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "system/workorders/cli/nutrition_food_bls_import_expand.py"
  - "system/workorders/cli/__tests__/test_nutrition_food_bls_import_expand.py"
  - "docs/project/p1-005/P1-005-local-bls-import-expansion-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "system/workorders/cli/nutrition_food_bls_import_expand.py"
  - "system/workorders/cli/__tests__/test_nutrition_food_bls_import_expand.py"
  - "docs/project/p1-005/P1-005-local-bls-import-expansion-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "system/workorders/cli/nutrition_food_bls_import_expand.py"
  - "system/workorders/cli/__tests__/test_nutrition_food_bls_import_expand.py"
  - "docs/project/p1-005/P1-005-local-bls-import-expansion-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx"
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
  - "docs/project/p1-005/P1-005-local-food-sample-staging-report.md"
  - "supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The importer deterministically extracts from the approved local BLS workbook and does not invent food or nutrient values."
  - "The import scope is full if all nutrient mappings resolve; otherwise the largest safe deterministic subset and blockers are reported."
  - "Generated bulk CSV artifacts remain local runtime artifacts and are not committed."
  - "Local DB validation confirms nutrition.foods row count after import."
  - "Local DB validation confirms nutrition.food_nutrients row count after import."
  - "Local DB validation confirms zero food_nutrients nutrient_code values are missing from nutrition.nutrient_defs."
  - "Local DB validation confirms zero orphan food_nutrients food_id values."
  - "UTF-8 sample food names render correctly."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."
  - "All expected output files listed in this workorder exist and are complete."
  - "No DEV/LIVE action, Supabase Cloud command, production DB work, source workbook commit, unsupported values, RDA update, schema change, production routing change, or MiniMax routing change is introduced."

negative_constraints:
  - "No DEV/LIVE action."
  - "No Supabase Cloud command."
  - "No production DB work."
  - "No source workbook commit."
  - "No unsupported food values."
  - "No unsupported nutrient values."
  - "No RDA value changes."
  - "No schema change unless separately reported before execution."
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
  - "python -m unittest system.workorders.cli.__tests__.test_nutrition_food_bls_import_expand"
  - "python -m unittest system.workorders.cli.__tests__.test_nutrition_food_sample_extract"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\local-schema-debug.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
