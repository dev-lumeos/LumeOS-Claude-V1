# P1-005 Local Food Foundation Validation

Status: `LOCAL_APPLY_VALIDATED`

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

Local apply completed successfully on 2026-05-14 against the local
Supabase/Test DB container only.

Exact local command used:

```powershell
docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/20260514_001_nutrition_food_foundation_slice.sql
```

The SQL file was copied into the local DB container before execution:

```powershell
docker cp supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql supabase_db_LumeOS-Claude-V1:/tmp/20260514_001_nutrition_food_foundation_slice.sql
```

Validation query result:

```text
foods_exists|food_nutrients_exists|foods_rows|food_nutrients_rows|nutrient_fk_exists
t|t|0|0|t
```

Local debug helper result:

```json
{"foods_table_exists":true,"food_nutrients_table_exists":true,"foods_row_count":0,"food_nutrients_row_count":0,"food_nutrients_nutrient_fk_exists":true}
```

## Expected Post-Apply Result

| Check | Expected |
|---|---|
| `nutrition.foods` exists | yes, validated |
| `nutrition.food_nutrients` exists | yes, validated |
| `nutrition.foods` row count | `0`, validated |
| `nutrition.food_nutrients` row count | `0`, validated |
| `food_nutrients.nutrient_code -> nutrient_defs(code)` FK exists | yes, validated |

## Stop Conditions

Stop without applying if:

- static migration guard fails
- any governance high/critical finding appears
- local Supabase/Test DB container is unavailable
- `nutrition.nutrient_defs` is missing
- existing `nutrition.foods` or `nutrition.food_nutrients` drift is incompatible
- validation would require inserting food rows or running BLS import
