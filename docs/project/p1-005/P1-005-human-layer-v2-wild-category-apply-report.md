# P1-005 Human Layer V2 Wild Category Apply Report

Status: applied locally
Date: 2026-05-15
Scope: local-only deterministic category mapping

## Rule

Apply exactly one deterministic rule:

`nutrition.foods.bls_code LIKE 'V2%'` and `category_id IS NULL` -> `nutrition.food_categories.slug = 'wild'`

No other category rule was applied.

## SPEC_05 Evidence

`docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md` contains:

- Section `#### Wild`
- Examples: Hirsch & Reh, Wildschwein, Wildgeflügel, Sonstiges Wild
- Mapping table row: `game_meat | Wild | V2xxxx (Hirsch, Wildschwein, Reh)`

This makes `V2xxxx -> Wild/game meat` deterministic at the parent category level.
The apply intentionally targets the level-2 `wild` category, not deeper
child categories such as Hirsch/Reh or Wildschwein, because the current rule is
prefix-level only.

## Local Category Target

| Field | Value |
|---|---|
| id | `86faea12-9082-456b-9528-34359ad065ba` |
| slug | `wild` |
| name_de | `Wild` |
| level | `2` |
| parent slug | `fleisch-gefluegel` |
| parent path | `FLEISCH & GEFLÜGEL > Wild` |

## Before Apply

| Metric | Count |
|---|---:|
| Foods | 7140 |
| Categorized foods | 4854 |
| Unassigned foods | 2286 |
| Unassigned `V2%` foods | 49 |

Example unassigned `V2%` foods before apply:

- `V212100` - Hirsch Fleisch, roh
- `V212132` - Hirsch Fleisch, gekocht
- `V212142` - Hirsch Fleisch, geschmort ohne Fett
- `V212162` - Hirsch Fleisch, gebraten ohne Fett (Ofen)
- `V212182` - Hirsch Fleisch, gebraten ohne Fett (Pfanne)
- `V217100` - Hirsch Rücken, roh
- `V221100` - Reh Fleisch, roh
- `V251100` - Wildschwein Fleisch, roh

## Apply Result

Applied SQL: `docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply.sql`

Affected rows: `49`

The update only touched rows where:

- `category_id IS NULL`
- `bls_code LIKE 'V2%'`

Already categorized foods were not touched.

## After Apply

| Metric | Count |
|---|---:|
| Foods | 7140 |
| Categorized foods | 4903 |
| Unassigned foods | 2237 |
| `V2%` foods assigned to `wild` | 49 |
| Unassigned `V2%` foods | 0 |
| Food nutrients | 698092 |
| Missing nutrient FK targets | 0 |
| Orphan food nutrients | 0 |
| Orphan category parents | 0 |
| UTF-8 suspect food labels | 0 |

Example rows after apply:

- `V212100` - Hirsch Fleisch, roh -> `wild` / Wild
- `V212132` - Hirsch Fleisch, gekocht -> `wild` / Wild
- `V212142` - Hirsch Fleisch, geschmort ohne Fett -> `wild` / Wild
- `V212162` - Hirsch Fleisch, gebraten ohne Fett (Ofen) -> `wild` / Wild
- `V217100` - Hirsch Rücken, roh -> `wild` / Wild
- `V251100` - Wildschwein Fleisch, roh -> `wild` / Wild

## Boundaries

No alias changes, display-name changes, tag changes, food value changes, nutrient
value changes, RDA changes, diary flow, MealItem creation, remote database
action, or production routing change occurred.

## Remaining Category Coverage Gaps

2237 foods remain unassigned. Most unresolved rows remain prepared-dish `X`/`Y`
prefixes. They require subcategory-specific deterministic rules before any
future apply batch.
