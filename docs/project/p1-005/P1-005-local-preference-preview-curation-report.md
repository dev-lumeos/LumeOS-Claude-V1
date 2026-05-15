# P1-005 Local Preference Preview And Curation Report

Status: local-only governed implementation report.

## Scope

This slice adds a read-only local preference-aware search preview and a read-only Human Layer curation dashboard. It does not persist user preferences, enable production Smart Search, write diary data, create MealItems, change RDA values, or create source-unbacked food labels.

## Specs Used

- `docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_07_API.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md`
- `docs/project/p1-005/P1-005-preferences-spec-gap-patch.md`

## Baseline

Expected local baseline before this slice:

| Item | Count |
|---|---:|
| `nutrition.foods` | 7140 |
| `nutrition.food_nutrients` | 698092 |
| `nutrition.food_categories` | 518 |
| categorized foods | 4854 |
| unassigned foods | 2286 |
| `nutrition.tag_definitions` | 16 |
| `nutrition.food_tags` | 9265 |
| `nutrition.food_aliases` | 21420 |
| `nutrition.food_preferences` | 0 |
| `nutrition.food_preference_items` | 0 |

No DB schema or data changes are required by this slice.

## Preference-Aware Search Preview

New local-only API:

```text
GET /api/nutrition/foods/smart-preview
```

Supported query parameters:

- `q`
- `exclusions`
- `liked_categories`
- `disliked_categories`
- `liked_tags`
- `disliked_tags`
- `limit`
- `offset`
- `sort`

The response includes:

- `applied_preferences`
- `excluded_count`
- `boosted_count`
- `suppressed_count`
- `unresolved_preferences`
- preview result foods with preference notes

This endpoint is explicitly a preview. It is not production Smart Search and does not write user preference state.

## Supported Hard Exclusions

The following old-platform general exclusions are applied only through deterministic Human Layer category mappings:

- `no_offal` -> `innereien`
- `no_processed_meat` -> `wurstwaren-aufschnitt`
- `no_shellfish` -> `schalentiere`
- `no_pork` -> `schweinefleisch`
- `no_red_meat` -> `rindfleisch`, `schweinefleisch`, `lamm-schaf`, `wild`
- `no_dairy` -> `milch-kaese`

## Unresolved Exclusions

The following exclusions are intentionally not applied:

- `no_raw_fish`: requires preparation/raw-state metadata.
- `no_gluten`: requires ingredient or allergen metadata beyond current V1 tags.

These are returned in `unresolved_preferences`.

## Likes And Dislikes

This preview accepts category and tag likes/dislikes only when the caller provides explicit category/tag codes. It does not map individual old-platform food preference items to `food_id` unless a future deterministic curation workflow creates that mapping.

Ranking remains:

```text
normalized text match + sort_weight + transparent preference score adjustment
```

## Curation Dashboard

New visible local page:

```text
http://127.0.0.1:5001/nutrition/curation
```

New local-only API:

```text
GET /api/nutrition/curation
```

The dashboard exposes:

- category counts by level
- assigned and unassigned food counts
- first unassigned food examples
- alias count per shown food
- V1 tag coverage
- unresolved general exclusions
- unresolved preference-group and item mapping counts

The curation page is read-only. It has no save buttons and performs no DB writes.

## Mapping Improvements

No DB mapping changes were made. This slice exposes the current deterministic state and gaps:

- unassigned foods remain `2286`
- unresolved hard exclusions remain `no_raw_fish` and `no_gluten`
- individual old-platform food preference items remain unresolved until a deterministic curated mapping exists

## Validation Plan

- Helper tests for preference preview SQL and curation SQL.
- Food search regression tests.
- Preferences catalog tests.
- API probes:
  - `/api/nutrition/foods`
  - `/api/nutrition/foods/smart-preview`
  - `/api/nutrition/curation`
  - `/api/nutrition/preferences/catalog`
- Page probes:
  - `/nutrition`
  - `/nutrition/curation`
- Governance checks:
  - TypeScript
  - governance invariant check
  - agent contract check
  - governance learning check
  - SSOT sync check
  - spec source-chain check
  - governed operator dry-run, doctor, continue, status

## Remaining Gaps

- No persisted preference state or auth-backed user preference write path.
- No production Smart Search.
- No exact item-to-food mappings for old-platform preference items unless deterministic curation creates them later.
- No ingredient/allergen metadata for hard gluten exclusion.
- No preparation/raw-state metadata for raw fish exclusion.
- No human-friendly display names or curated aliases.
