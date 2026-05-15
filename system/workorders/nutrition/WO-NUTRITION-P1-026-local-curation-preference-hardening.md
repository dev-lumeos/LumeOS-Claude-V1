# WO-NUTRITION-P1-026 - Local Curation Preference Hardening

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only Human Layer curation and preference preview hardening
**Source:** Current Nutrition specs, P1-005 Human Layer outputs, Preferences foundation, and preference preview outputs
**Execution authority:** scoped product-gate exception for one exact local-only batch only
**Scope boundary:** local-only schema, read-only API/UI/helper/report/docs validation

```yaml
workorder_id: "WO-nutrition-026"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Local-only DB rollback: drop nutrition.food_curation_decisions and nutrition.food_curation_candidates if Tom wants to remove the curation foundation. Code/docs rollback by reverting this workorder outputs."
required_skills:
  - "nutrition-specialist"
  - "frontend-specialist"
  - "backend-specialist"
  - "test-specialist"
optional_skills:
  - "doc-specialist"

task: |
  Implement the next local-only Nutrition Human Layer + preference preview
  hardening slice.

  Required behavior:
  - Create local-only curation candidate/decision table foundation.
  - Keep /nutrition/curation read-only, but make it more useful for human
    review with filters, curation table status, alias counts, macro/status
    context, and preference mapping workbench.
  - Harden /api/nutrition/foods/smart-preview and /nutrition with explicit
    applied/unresolved preference metadata and per-result preference reasons.
  - Do not implement user preference persistence, diary logging, MealItem
    creation, DEV/LIVE promotion, Supabase Cloud actions, production DB work,
    or source-unbacked labels/mappings.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_09_SCORING.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  patches:
    - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  reviews:
    - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
    - "docs/project/p1-005/P1-005-local-food-search-slice.md"
    - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
    - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
    - "docs/project/p1-005/P1-005-local-preference-preview-curation-validation.md"
  sql_sources:
    - "docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql"
    - "docs/project/p1-005/P1-005-local-curation-persistence-validation.sql"
  adrs: []
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "patches"
    - "sql_sources"
    - "reviews"
    - "adrs"
    - "raw_sources"

documentation_impact:
  required: true
  domains:
    - "product"
    - "product_gate"
  ssot_files:
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/p1-005/P1-005-local-curation-preference-hardening-report.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/api/nutrition/curation/route.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "apps/web/src/lib/nutrition/preference-search-preview.ts"
  - "apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql"
  - "docs/project/p1-005/P1-005-local-curation-persistence-validation.sql"
  - "docs/project/p1-005/P1-005-local-curation-preference-hardening-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/api/nutrition/curation/route.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "apps/web/src/lib/nutrition/preference-search-preview.ts"
  - "apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql"
  - "docs/project/p1-005/P1-005-local-curation-persistence-validation.sql"
  - "docs/project/p1-005/P1-005-local-curation-preference-hardening-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/api/nutrition/curation/route.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "apps/web/src/lib/nutrition/preference-search-preview.ts"
  - "apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql"
  - "docs/project/p1-005/P1-005-local-curation-persistence-validation.sql"
  - "docs/project/p1-005/P1-005-local-curation-preference-hardening-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_09_SCORING.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Local-only curation candidate and decision tables exist."
  - "No nutrition.foods/category/display-name/alias rows are mutated by this slice."
  - "/nutrition/curation shows curation table status, filters, unassigned examples, and preference mapping workbench."
  - "/api/nutrition/curation remains read-only and supports safe filter parameters."
  - "/api/nutrition/foods/smart-preview returns applied_preferences, unresolved_preferences, counts, preference_score, preference_notes, and preference_reasons."
  - "/nutrition shows applied/unresolved preference metadata and preview result reasons."
  - "no_raw_fish and no_gluten remain unresolved and visible."
  - "No food-id guessing or source-unbacked labels/mappings are introduced."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."
  - "All expected output files exist and contain complete scoped content."

negative_constraints:
  - "No DEV/LIVE."
  - "No Supabase Cloud."
  - "No production DB."
  - "No raw BLS commit."
  - "No food value changes."
  - "No nutrient value changes."
  - "No source-unbacked aliases or display names."
  - "No RDA changes."
  - "No diary write flow."
  - "No MealItem creation."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual governed-runtime state edit."
  - "No manual governed queue edit."

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\preference-search-preview.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\curation.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\preferences-catalog.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-CURATION-PREFERENCE-HARDENING.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-CURATION-PREFERENCE-HARDENING.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-CURATION-PREFERENCE-HARDENING.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```
