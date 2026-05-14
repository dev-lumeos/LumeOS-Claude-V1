# P1-005 Local Food Foundation Validation

Status: `PRE_APPLY_VALIDATION_READY`

## Scope

This report covers the local-only Nutrition food foundation schema slice:

- Migration candidate: `supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql`
- Target environment: local Supabase/Test DB only
- Target tables:
  - `nutrition.foods`
  - `nutrition.food_nutrients`
- Required FK:
  - `nutrition.food_nutrients.nutrient_code` references `nutrition.nutrient_defs(code)`

## Explicit Exclusions

- No food search.
- No food UI.
- No BLS import execution.
- No raw BLS commit.
- No invented food values.
- No seed/import rows.
- No DEV/LIVE action.
- No Supabase Cloud command.
- No production routing change.
- No MiniMax routing change.

## Static Validation

The slice is expected to pass:

- migration guard for `db-migration-agent`
- local food foundation static test
- local schema debug parser test
- TypeScript typecheck
- governance invariant check
- agent contract check
- governance learning check
- `SSOT_SYNC_CHECK`

## Local Apply Status

Local apply has not been recorded in this report yet.

After gates pass, apply only this exact SQL file to the local Supabase/Test DB
container and update this section with:

- exact command used
- table existence result
- row-count validation result
- FK validation result

## Expected Post-Apply Result

| Check | Expected |
|---|---|
| `nutrition.foods` exists | yes |
| `nutrition.food_nutrients` exists | yes |
| `nutrition.foods` row count | `0` |
| `nutrition.food_nutrients` row count | `0` |
| `food_nutrients.nutrient_code -> nutrient_defs(code)` FK exists | yes |

## Stop Conditions

Stop without applying if:

- static migration guard fails
- any governance high/critical finding appears
- local Supabase/Test DB container is unavailable
- `nutrition.nutrient_defs` is missing
- existing `nutrition.foods` or `nutrition.food_nutrients` drift is incompatible
- validation would require inserting food rows or running BLS import
