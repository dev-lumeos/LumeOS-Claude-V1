# P1-005 Local Nutrition Preferences + Human Layer Curation Foundation

Status: `LOCAL_ONLY_APPLIED`

## Scope

This slice creates the local Nutrition Preferences schema foundation and a
read-only preference catalog/API/preview. It does not persist real user
preferences, enable Smart Search filtering, build diary logging, create
MealItems, or write DEV/LIVE.

## Screenshot Requirements Coverage

| Requirement | Coverage |
|---|---|
| Diet type | Catalogued: 8 options |
| Allergies / intolerances | Catalogued as hard constraints: 20 options |
| General exclusions | Catalogued: 8 presets |
| Likes/dislikes on foods/categories/tags | Catalogued as 18 groups and 230 items; item-level food mapping remains curation-gated |
| Preferred cuisines | Catalogued: 27 options |
| Meal structure | Catalogued: meals/day 2-6 and snacks/day 0-3 |
| Cooking level | Catalogued: beginner/intermediate/advanced |
| Prep time | Catalogued: 15/20/30/45/60 minutes |
| Meal prep | Added local schema field `meal_prep_ok` |
| Budget | Catalogued and schema-backed: low/medium/high/no_limit |
| Planner notes | Added local schema field `planner_notes` |
| Preference strength/conflicts | Patched into local boundary: hard_exclude/strong_avoid/soft_dislike/neutral/like/boost |
| Smart Search implication | Documented only; application deferred until deterministic mappings are ready |

## Spec Gap Patch

The current specs cover the core tables, API, components, and Smart Search
scoring. The old platform screenshots make these fields more explicit and are
captured by `docs/project/p1-005/P1-005-preferences-spec-gap-patch.md`:

- general exclusion presets
- exact cuisine code list
- meal/snack counts
- `meal_prep_ok`
- `planner_notes`
- preference strength model
- mapping from UI catalog items to food/category/tag/cuisine/exclusion targets

## Local DB Foundation

Applied local-only SQL:

- `docs/project/p1-005/P1-005-local-preferences-foundation.sql`

Created/extended local tables:

- `nutrition.food_preferences`
- `nutrition.food_preference_items`

No rows are inserted for real users in this slice.

## Catalog Summary

| Catalog area | Count |
|---|---:|
| Diet types | 8 |
| Allergies / intolerances | 20 |
| General exclusions | 8 |
| Cuisines | 27 |
| Preference groups | 18 |
| Preference items | 230 |

## Mapped vs Unresolved

Mapped general exclusions:

- `no_offal` -> category: `innereien`
- `no_processed_meat` -> category: `wurstwaren-aufschnitt`
- `no_shellfish` -> category: `schalentiere`
- `no_pork` -> category: `schweinefleisch`
- `no_red_meat` -> category: `rindfleisch`, `schweinefleisch`, `lamm-schaf`, `wild`
- `no_dairy` -> category: `milch-kaese`

Unresolved general exclusions:

- `no_raw_fish`: Requires preparation/raw-state metadata that is not deterministic in the local BLS slice.
- `no_gluten`: Requires allergen_gluten or ingredient-level tags; current local V1 visible tags are not sufficient for hard exclusion.

Food preference item rows from the old UI are kept as a curation catalog. They
are not forced to BLS `food_id` values because exact deterministic matches are
not guaranteed. Group-level deterministic category mappings are recorded where
safe; item-level mappings require a future curated/admin workflow.

## Smart Search Boundary

- hard exclusions remove foods only after deterministic category/tag/food
  mappings exist
- allergies and general exclusions are hard constraints
- likes boost ranking
- dislikes lower ranking unless configured as hard exclusions
- priority is food > category > tag
- cuisines remain catalog values until curated/source-backed cuisine mappings
  exist

## Validation

Run:

```powershell
cmd.exe /c "docker cp docs\project\p1-005\P1-005-local-preferences-foundation-validation.sql supabase_db_LumeOS-Claude-V1:/tmp/P1-005-local-preferences-foundation-validation.sql && docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -At -f /tmp/P1-005-local-preferences-foundation-validation.sql"
```
