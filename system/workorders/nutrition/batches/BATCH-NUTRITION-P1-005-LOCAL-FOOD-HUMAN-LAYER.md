# BATCH-NUTRITION-P1-005-LOCAL-FOOD-HUMAN-LAYER

**Status:** EXECUTABLE_SCOPED_BATCH
**Queue:** NOT_QUEUE_RELEASED
**Dispatch:** SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW
**Product gate:** exact per-batch local-only exception required

## Purpose

Build the local-only Food Taxonomy / Human Layer foundation needed for better
Food Search while preserving BLS as the scientific/source layer.

## Scope

- Create/apply local-only Human Layer schema/data foundation.
- Seed deterministic category and V1 tag foundations from current specs.
- Generate source-backed aliases only.
- Enhance read-only local Food Search to use category/tag/alias data if present.
- Update documentation/SSOT.

## Workorders

1. `../WO-NUTRITION-P1-022-local-food-human-layer.md`

## Explicit Non-Goals

- No DEV/LIVE.
- No Supabase Cloud.
- No production DB.
- No raw BLS commit.
- No invented food values.
- No invented nutrient values.
- No invented categories.
- No invented aliases/synonyms.
- No invented display names.
- No RDA changes.
- No Diary write flow.
- No MealItem creation.
- No production routing.
- No MiniMax routing.
- No service restart.
- No manual `runtime_state` edit.
- No manual queue edit.

## Expected Outputs

- `system/workorders/cli/nutrition-human-layer.ts`
- `system/workorders/cli/__tests__/nutrition-human-layer.test.ts`
- `docs/project/p1-005/P1-005-local-food-human-layer.sql`
- `docs/project/p1-005/P1-005-local-food-human-layer-validation.sql`
- `docs/project/p1-005/P1-005-local-food-human-layer-report.md`
- `apps/web/src/lib/nutrition/food-search.ts`
- `apps/web/src/lib/nutrition/__tests__/food-search.test.ts`
- `apps/web/src/app/api/nutrition/foods/route.ts`
- `apps/web/src/app/nutrition/page.tsx`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`

## Documentation Impact

Required. Product and product-gate documentation must record that:

- BLS labels remain source-backed technical labels.
- Human-friendly curated names/aliases remain future work.
- Level 3/4 taxonomy, ingredient/allergen tags, manual/cuisine/religious tags,
  and additional deterministic mapping rules remain future work.
- This boundary is local-only.
