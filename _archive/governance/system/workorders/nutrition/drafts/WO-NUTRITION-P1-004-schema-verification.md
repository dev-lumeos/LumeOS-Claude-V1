# WO-NUTRITION-P1-004 - Nutrition Local Schema Verification

**Status:** draft
**Phase:** 1 - DB Foundation Verification
**Source:** post Batch 001 verification follow-up

```yaml
workorder_id: "WO-nutrition-004"
agent_id: "test-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "test"

task: |
  Verify the committed Nutrition P1 schema migrations statically before any BLS import work.
  Confirm migration order, extension dependencies, table dependency order, foreign keys,
  RLS enablement, idempotent policy creation, migration guard compatibility, seed counts,
  and absence of Supabase db push/reset commands.
  Produce a verification report. If local Supabase execution is needed, document Tom-only
  instructions instead of running Supabase commands.

scope_files:
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-004-schema-verification.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-004-schema-verification.md"
  - "system/workorders/nutrition/verify-p1-schema-static.ts"
  - "system/workorders/nutrition/__tests__/verify-p1-schema-static.test.ts"
  - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
  - "supabase/migrations/"

context_files:
  - "supabase/migrations/20240522_001_nutrition_schema_foundation.sql"
  - "supabase/migrations/20240522_002_nutrition_food_core_tables.sql"
  - "system/agent-registry/authorize-tool-call.ts"

acceptance_criteria:
  - "Schema foundation migration sorts before food core migration"
  - "Static verifier passes"
  - "nutrient_defs seed count remains 138"
  - "tag_definitions seed count remains 16"
  - "No executable DOWN/rollback blocks"
  - "No Supabase db push/reset commands"
  - "Tom-only local Supabase validation instructions are documented"

negative_constraints:
  - "Do not run Supabase db push"
  - "Do not run Supabase db reset"
  - "Do not execute migrations"
  - "Do not import BLS data"
  - "Do not modify raw BLS files"
  - "Do not manually edit runtime_state.json"

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test system\\workorders\\nutrition\\__tests__\\verify-p1-schema-static.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"

blocked_by: []
```
