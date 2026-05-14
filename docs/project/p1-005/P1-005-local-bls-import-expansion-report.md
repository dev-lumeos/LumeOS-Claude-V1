# P1-005 Local BLS Import Expansion Report

Status: LOCAL_ONLY_IMPORT_EXPANSION_CANDIDATE

## Purpose

Expand the local Nutrition food foundation with deterministic source-backed BLS
foods and nutrient values so the next local product step can build real Food
Search.

## Source

- Source workbook: `C:/Users/User/AppData/Local/Temp/tmpzjx31r93/sample.xlsx`
- Sheet: `BLS_4_0_Daten_2025_DE`
- Nutrient code allowlist: `C:/Users/User/AppData/Local/Temp/tmpzjx31r93/nutrient-defs.md`
- Extraction scope: `subset`
- Food rows extracted: 2
- Food nutrient rows extracted: 3
- Supported nutrient definitions: 2
- Distinct nutrient codes used: 2
- Missing/trace/non-numeric nutrient cells skipped: 1
- Unsupported nutrient header mappings: 1
- Unsupported examples: UNKNOWN

## Local artifacts

The UTF-8 CSV files are generated under `C:/Users/User/AppData/Local/Temp/tmpzjx31r93/out` and are
local runtime artifacts, not committed BLS data:

- `foods.csv`
- `food_nutrients.csv`
- `apply-local.sql`

## Sample foods

| bls_code | name_de | name_en |
|---|---|---|
| C100000 | Äpfel roh | Apple raw |
| C200000 | Öl süß | Sweet oil |

## Boundaries

- Local Supabase/Test DB only.
- No DEV/LIVE action.
- No Supabase Cloud command.
- No source workbook commit.
- No unsupported food values.
- No unsupported nutrient values.
- No RDA value changes.
- No schema change.

## Validation queries

```sql
select count(*) from nutrition.foods;
select count(*) from nutrition.food_nutrients;
select count(*)
from nutrition.food_nutrients fn
left join nutrition.nutrient_defs nd on nd.code = fn.nutrient_code
where nd.code is null;
select count(*)
from nutrition.food_nutrients fn
left join nutrition.foods foods on foods.id = fn.food_id
where foods.id is null;
```
