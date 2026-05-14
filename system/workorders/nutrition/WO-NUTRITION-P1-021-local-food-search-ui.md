# WO-NUTRITION-P1-021 - Local Food Search UI

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only BLS-backed food search
**Source:** completed local BLS import expansion plus local food foundation
**Execution authority:** scoped product-gate exception for one exact local-only UI/API batch only
**Scope boundary:** read-only local Food Search and Food Detail slice

```yaml
workorder_id: "WO-nutrition-021"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Revert the local-only UI/API files and report doc. No DB rollback is required because this workorder is read-only."

task: |
  Build the first local read-only Food Search UI/API against the populated local
  BLS-backed food tables.

  Required behavior:
  - Add /nutrition as a local read-only Food Search page.
  - Add /api/nutrition/foods as a local read-only API route if useful.
  - Search nutrition.foods by available source-label fields.
  - Normalize German umlauts for practical matching: ae/oe/ue/ss variants.
  - Show matching food rows and clean no-match empty state.
  - Select/open one food and show detail.
  - Show source code/source identifier when available.
  - Show source-backed BLS label clearly.
  - Do not claim BLS labels are final human-friendly product copy.
  - Show that human-friendly names, aliases, categories, and search normalization are future work.
  - Show linked nutrient values from nutrition.food_nutrients.
  - Resolve nutrient code, DE name, EN name, and unit through nutrition.nutrient_defs.
  - Prioritize common nutrients where present: energy, protein, fat, carbohydrates, fiber, sugar, sodium.
  - Keep all behavior read-only.

  Do not run DB writes, migrations, Supabase commands, seed/import changes, RDA
  value changes, BLS import expansion, source-unbacked display names,
  source-unbacked aliases, unsupported nutrient values, DEV/LIVE actions,
  Supabase Cloud commands, production routing, MiniMax routing, service
  restarts, manual runtime_state edits, or manual queue edits.

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
    - "docs/project/p1-005/P1-005-local-bls-import-expansion-report.md"
    - "docs/project/p1-005/P1-005-local-food-search-slice.md"
  raw_sources: []
  raw_sources_allowed: false
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
    - "docs/project/p1-005/P1-005-local-food-search-slice.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "apps/web/src/lib/nutrition/food-search.ts"
  - "apps/web/src/lib/nutrition/__tests__/food-search.test.ts"
  - "apps/web/src/app/api/nutrition/foods/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-food-search-slice.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "apps/web/src/lib/nutrition/food-search.ts"
  - "apps/web/src/lib/nutrition/__tests__/food-search.test.ts"
  - "apps/web/src/app/api/nutrition/foods/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-food-search-slice.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "apps/web/src/lib/nutrition/food-search.ts"
  - "apps/web/src/lib/nutrition/__tests__/food-search.test.ts"
  - "apps/web/src/app/api/nutrition/foods/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-food-search-slice.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/project/p1-005/P1-005-local-bls-import-expansion-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The /nutrition page displays a read-only local Food Search UI."
  - "The /api/nutrition/foods route returns local read-only food search and food detail data."
  - "Search is case-insensitive and handles practical German umlaut variants."
  - "No-match search shows a clean empty state."
  - "Selected food detail shows source code, source label, and linked nutrients."
  - "Nutrients are resolved through nutrition.nutrient_defs with code, DE name, EN name, unit, and value."
  - "The UI clearly treats BLS labels as source-backed technical labels, not final user-facing copy."
  - "No source-unbacked aliases, display names, categories, or nutrient values are introduced."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."
  - "All expected output files listed in this workorder exist and are complete."

negative_constraints:
  - "No DB write."
  - "No migration."
  - "No Supabase command."
  - "No seed/import change."
  - "No RDA value change."
  - "No BLS import expansion."
  - "No source-unbacked display names."
  - "No source-unbacked aliases."
  - "No unsupported nutrient values."
  - "No DEV/LIVE action."
  - "No Supabase Cloud action."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual runtime_state edit."
  - "No manual queue edit."

required_skills:
  - "nutrition-specialist"
  - "frontend-specialist"
  - "supabase-specialist"
  - "test-driven-development"
  - "lint-and-validate"
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
