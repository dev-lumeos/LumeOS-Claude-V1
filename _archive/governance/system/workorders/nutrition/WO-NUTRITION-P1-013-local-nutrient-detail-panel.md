# WO-NUTRITION-P1-013 - Local Nutrient Detail Panel

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only UI visibility
**Source:** local `nutrition.nutrient_defs` debug snapshot and current Nutrition schema source
**Execution authority:** scoped product-gate exception for one exact local-only UI batch only
**Scope boundary:** read-only local debug UI/API code only

```yaml
workorder_id: "WO-nutrition-013"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"

task: |
  Add a read-only local nutrient detail panel or route to the existing
  nutrition.nutrient_defs local schema debug page.

  Required behavior:
  - Keep the page local-only and read-only.
  - Reuse the existing local debug data path under apps/web/src/lib/nutrition/local-schema-debug.ts.
  - Let the user select or inspect one nutrient_defs row from the local preview.
  - Display these fields for the selected row:
    code, name_de, name_en, name_th, unit, group_de, group_en, group_th,
    sort_index, display_tier, is_always_computed, is_partly_computed,
    formula, rda_male, rda_female, rda_unit.
  - Preserve the RDA partial-by-design note.
  - Add focused tests for any pure helper logic.

  Do not add write paths, DB apply, migration, Supabase command, seed changes,
  RDA updates, BLS import, DEV/LIVE action, production routing, or MiniMax routing.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  patches: []
  sql_sources: []
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
    - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "patches"
    - "sql_sources"
    - "adrs"
    - "reviews"
    - "raw_sources"

expected_outputs:
  - "apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx"
  - "apps/web/src/lib/nutrition/nutrient-detail-selection.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-detail-selection.test.ts"

scope_files:
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/nutrient-detail-selection.ts"
  - "apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-detail-selection.test.ts"

files_allowed:
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/nutrient-detail-selection.ts"
  - "apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-detail-selection.test.ts"

context_files:
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/nutrient-preview-filter.ts"
  - "apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-preview-filter.test.ts"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
  - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - "supabase/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The local schema page shows a selected nutrient detail panel or equivalent local-only detail route."
  - "The detail display includes all requested nutrient_defs fields."
  - "The detail display handles empty Thai fields and NULL/empty formula or RDA fields clearly."
  - "The RDA partial-by-design boundary remains visible."
  - "No DB write, schema change, seed change, RDA update, BLS import, DEV/LIVE action, production routing change, or MiniMax routing change is introduced."
  - "Expected output files exist and tests/typecheck pass."

negative_constraints:
  - "No DB apply."
  - "No migration."
  - "No Supabase command."
  - "No seed changes."
  - "No RDA updates."
  - "No BLS import."
  - "No DEV/LIVE action."
  - "No production routing change."
  - "No MiniMax production routing change."
  - "No manual runtime_state edit."
  - "No manual queue edit."

required_skills:
  - "frontend-specialist"
  - "lint-and-validate"
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\local-schema-debug.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-preview-filter.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-detail-selection.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"

blocked_by: []
```
