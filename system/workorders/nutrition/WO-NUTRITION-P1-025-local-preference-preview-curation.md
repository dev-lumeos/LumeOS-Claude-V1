# WO-NUTRITION-P1-025 - Local Preference Preview And Curation

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only preference-aware search preview and curation dashboard
**Source:** Current Nutrition specs, P1-005 Human Layer outputs, and Preferences foundation outputs
**Execution authority:** scoped product-gate exception for one exact local-only batch only
**Scope boundary:** local-only read-only API/UI/helper/report/docs changes

```yaml
workorder_id: "WO-nutrition-025"
agent_id: "docs-agent"
codex_worker: false
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Code/docs-only rollback by reverting this workorder outputs. No DB rollback is required because this slice performs no DB writes."

task: |
  Build a local-only read-only preference-aware Food Search preview and a
  read-only Human Layer curation dashboard.

  Required behavior:
  - Validate the already-created local preference preview and curation outputs.
  - Verify the existing local Food Search and Preferences foundation baseline.
  - Add a local-only preference preview API that transparently applies only
    deterministic category/tag preference effects.
  - Apply hard exclusions only where the existing Preferences catalog has
    deterministic Human Layer category mappings.
  - Keep no_raw_fish and no_gluten unresolved unless deterministic metadata
    exists.
  - Add a read-only curation dashboard/API that exposes unassigned foods,
    category coverage, source-backed alias state, V1 tag coverage, and
    unresolved preference mapping gaps.
  - Keep /nutrition source-label honest and add visible access to the preview
    and curation surfaces.
  - Do not enable persisted user preferences, production Smart Search, diary
    logging, MealItem creation, source-unbacked labels, DEV/LIVE, Supabase
    Cloud, production DB, raw BLS commit, RDA changes, production routing,
    MiniMax routing, service restart, manual runtime_state edit, or manual
    queue edit.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  patches:
    - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  reviews:
    - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
    - "docs/project/p1-005/P1-005-local-food-search-slice.md"
    - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
    - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  sql_sources: []
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
    - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "apps/web/src/lib/nutrition/preference-search-preview.ts"
  - "apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts"
  - "apps/web/src/app/api/nutrition/foods/smart-preview/route.ts"
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/api/nutrition/curation/route.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-validation.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "apps/web/src/lib/nutrition/preference-search-preview.ts"
  - "apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts"
  - "apps/web/src/app/api/nutrition/foods/smart-preview/route.ts"
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/api/nutrition/curation/route.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-validation.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "apps/web/src/lib/nutrition/preference-search-preview.ts"
  - "apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts"
  - "apps/web/src/app/api/nutrition/foods/smart-preview/route.ts"
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/api/nutrition/curation/route.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  - "docs/project/p1-005/P1-005-local-preference-preview-curation-validation.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "All expected output files exist and are complete."
  - "No DB schema or data changes are made by this slice."
  - "GET /api/nutrition/foods/smart-preview returns local-only preference preview metadata."
  - "Hard exclusions are applied only for deterministic category-mapped presets."
  - "no_raw_fish and no_gluten remain unresolved and visible."
  - "Category/tag likes and dislikes are transparent ranking adjustments, not product-default Smart Search."
  - "GET /api/nutrition/curation returns read-only Human Layer curation status."
  - "/nutrition/curation exposes unassigned foods, category coverage, V1 tag coverage, and unresolved preference mapping gaps."
  - "/nutrition still loads and remains read-only."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."
  - "Validation report records the local API/page probes and confirms read-only behavior."

negative_constraints:
  - "No DEV/LIVE action."
  - "No Supabase Cloud action."
  - "No production DB action."
  - "No DB schema change."
  - "No DB data write."
  - "No raw BLS commit."
  - "No source-unbacked food values."
  - "No source-unbacked nutrient values."
  - "No source-unbacked aliases or display names."
  - "No RDA changes."
  - "No diary write flow."
  - "No MealItem creation."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual runtime_state edit."
  - "No manual queue edit."

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\preference-search-preview.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\curation.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\preferences-catalog.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-PREFERENCE-PREVIEW-CURATION.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-PREFERENCE-PREVIEW-CURATION.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-LOCAL-PREFERENCE-PREVIEW-CURATION.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```
