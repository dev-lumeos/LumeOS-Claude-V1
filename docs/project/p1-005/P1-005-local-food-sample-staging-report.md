# P1-005 Local Food Sample Staging Report

Status: LOCAL_ONLY_REVIEWED_STAGING_CANDIDATE

## Purpose

Create a small source-backed local Nutrition food sample so the next local step
can build real Food Search without inventing food values or running a broad BLS
import.

## Source-backed deterministic sample

- Source workbook: `docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx`
- Sheet: `BLS_4_0_Daten_2025_DE`
- Nutrient code allowlist: `docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md`
- Selection rule: first 10 rows with non-empty BLS code and German food name
- Expected food rows: 10
- Expected food_nutrients rows: 927
- Distinct nutrient codes inserted: 104
- Skipped missing/trace marker values: 153
- Unsupported nutrient headers skipped: 0

## Food rows

| bls_code | name_de | name_en | source row |
|---|---|---|---:|
| C131000 | Hafer ganzes Korn, roh | Oat whole grain, raw | 2 |
| C133000 | Hafer Flocken | Oat flakes | 3 |
| C141000 | Gerste ganzes Korn, roh | Barley whole grain, raw | 4 |
| C243000 | Gerste Mehl | Barley flour | 5 |
| C341000 | Mais roh | Maize raw | 6 |
| C443000 | Mais Mehl | Maize flour | 7 |
| C352000 | Reis poliert, roh | White rice raw | 8 |
| C359000 | Reis parboiled, poliert, roh | Rice parboiled, raw | 9 |
| E401000 | Teigwaren eifrei, roh | Pasta egg-free, raw | 10 |
| E510000 | Vollkornteigwaren eifrei, roh | Wholemeal pasta egg-free, raw | 11 |

## Boundaries

- Local Supabase/Test DB only.
- No DEV/LIVE action.
- No Supabase Cloud command.
- No raw BLS commit.
- No broad/full BLS import.
- No invented food values.
- No RDA value changes.

## Validation queries

```sql
select count(*) from nutrition.foods;
select count(*) from nutrition.food_nutrients;
select count(*)
from nutrition.food_nutrients fn
left join nutrition.nutrient_defs nd on nd.code = fn.nutrient_code
where nd.code is null;
```
