# P1-005 Preferences + Human Layer Curation Spec Patch

Status: `LOCAL_ONLY_SPEC_PATCH`

## Purpose

This patch records old-platform Preference screen requirements that are already
partly covered by the current Nutrition specs but need explicit local execution
rules before Preferences and Smart Search can become product behavior.

## Source Inputs

- `docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_07_API.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md`
- Old-platform Preference screen text provided by Tom in this task.

## Patch Decisions

### Preference Strength Model

Preferences must distinguish:

- `hard_exclude`: hard constraint; removes matched foods once deterministic mapping exists
- `strong_avoid`: strong negative signal; not a hard exclusion
- `soft_dislike`: ranking penalty
- `neutral`: no ranking effect
- `like`: ranking boost
- `boost`: stronger positive boost for future planner/search contexts

Allergies and general exclusions are hard constraints. Likes are boosts.
Dislikes are soft unless the user or preset explicitly marks them as hard.

### General Exclusion Presets

The local foundation recognizes these old-platform presets:

- `no_offal`
- `no_processed_meat`
- `no_raw_fish`
- `no_shellfish`
- `no_pork`
- `no_red_meat`
- `no_dairy`
- `no_gluten`

Only deterministic category/tag mappings may be activated. Presets without a
deterministic Human Layer mapping remain unresolved and must not affect Smart
Search yet.

### Cuisine Code List

The local foundation recognizes the screenshot cuisine list as catalog values:

`german`, `swiss`, `italian`, `french`, `spanish`, `greek`, `turkish`,
`scandinavian`, `british`, `thai`, `japanese`, `korean`, `chinese`,
`vietnamese`, `indian`, `indonesian`, `mexican`, `american`, `brazilian`,
`peruvian`, `mediterranean`, `middle_eastern`, `lebanese`, `moroccan`,
`caribbean`, `african`, `fusion`.

Cuisine preferences are not mapped to foods until curated/source-backed cuisine
rules exist.

### Meal Routine Fields

The local Preferences schema may include:

- `meals_per_day`: `2 | 3 | 4 | 5 | 6`
- `snacks_per_day`: `0 | 1 | 2 | 3`
- `meal_prep_ok`: boolean
- `planner_notes`: free-text notes for future planner context

These fields do not create diary entries or meal items.

### Target Types

The preference item target types are:

- `food`
- `category`
- `tag`
- `cuisine`
- `exclusion_preset`
- `catalog_item`

Old-platform food preference items should initially be treated as catalog
items. They must not be forced to BLS `food_id` targets unless an exact,
deterministic mapping exists.

## Smart Search Boundary

Smart Search can use this foundation only after a later governed step decides
which mapped preferences are safe to apply. Until then:

- no product-default preference filtering is enabled
- no preference write flow is enabled
- no diary logging or MealItem creation is enabled
- no AI-generated preference mappings are allowed
