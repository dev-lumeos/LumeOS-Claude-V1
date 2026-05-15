# WO-NUTRITION-P1-028 - Human Layer V2 Wild Apply

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only Human Layer category apply
**Source:** SPEC_05 Food Taxonomy and local P1-005 Human Layer gap analysis
**Execution authority:** scoped product-gate exception for one exact local-only batch only
**Scope boundary:** local-only deterministic category update for currently unassigned `V2%` foods

```yaml
workorder_id: "WO-nutrition-028"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Local-only rollback: set category_id back to NULL only for rows changed by this V2 Wild apply if Tom explicitly requests local rollback. No DEV/LIVE rollback is applicable."
required_skills: []
optional_skills: []

task: |
  Verify and apply exactly one deterministic Human Layer category mapping:
  currently unassigned local foods with BLS code prefix V2xxxx map to the
  SPEC_05 Wild/game meat category.

  Required behavior:
  - Verify SPEC_05 evidence for game_meat / Wild / V2xxxx.
  - Verify local target category row `nutrition.food_categories.slug = 'wild'`.
  - Apply only to local `nutrition.foods` rows where `category_id IS NULL` and
    `bls_code LIKE 'V2%'`.
  - Do not touch already categorized foods.
  - Do not apply any other category rule.
  - Do not change aliases, display names, tags, food values, nutrient values, or RDA values.
  - Produce apply SQL, validation SQL, and a factual apply report.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  patches: []
  sql_sources:
    - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply.sql"
    - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-validation.sql"
  reviews:
    - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
    - "docs/project/p1-005/P1-005-human-layer-alias-coverage-analysis.md"
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
    - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-report.md"
    - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply.sql"
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-validation.sql"
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-report.md"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply.sql"
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-validation.sql"
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-report.md"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply.sql"
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-validation.sql"
  - "docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-report.md"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "All expected output files exist and are complete."
  - "SPEC_05 target evidence is recorded."
  - "Local target category slug/id/level/parent path is recorded."
  - "Exactly 49 currently unassigned V2% foods are assigned to category slug wild."
  - "Categorized foods increase from 4854 to 4903."
  - "Unassigned foods decrease from 2286 to 2237."
  - "Foods remain 7140 and food_nutrients remain 698092."
  - "No missing nutrient FK targets, orphan food_nutrients, orphan category parents, or UTF-8 suspect labels remain."
  - "No other category rules, aliases, display names, tags, food values, nutrient values, or RDA values change."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No remote environment action."
  - "No remote cloud action."
  - "No production data-store action."
  - "No raw BLS commit."
  - "No source-unbacked food values."
  - "No source-unbacked nutrient values."
  - "No source-unbacked aliases, display names, categories, or tags."
  - "No RDA changes."
  - "No diary write flow."
  - "No MealItem creation."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual governed-runtime state edit."
  - "No manual governed queue edit."

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\curation.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-V2-WILD-APPLY.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-V2-WILD-APPLY.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-V2-WILD-APPLY.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```
