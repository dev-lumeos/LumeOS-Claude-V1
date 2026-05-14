# P1-005 Local Food Taxonomy / Human Layer Foundation

Status: `LOCAL_ONLY_APPLIED`

This report records the local-only Food Taxonomy / Human Layer foundation built
on top of the already populated BLS-backed local food tables.

## Source References

- `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_07_API.md`

## Boundary

This was a local-only schema/data/UI foundation slice. It did not run DEV/LIVE,
Supabase Cloud, production DB, BLS import expansion, seed/import changes beyond
the local Human Layer foundation, RDA changes, diary logging, MealItem creation,
production routing, or MiniMax routing.

## Schema Changes Applied Locally

Applied file:

- `docs/project/p1-005/P1-005-local-food-human-layer.sql`

Created local-only tables if missing:

- `nutrition.food_categories`
- `nutrition.tag_definitions`
- `nutrition.food_tags`
- `nutrition.food_aliases`

Added local-only Human Layer columns if missing:

- `nutrition.foods.category_id`
- `nutrition.foods.name_display_en`
- `nutrition.foods.name_display_th`
- `nutrition.foods.processing_level`
- `nutrition.foods.is_prepared_dish`

Existing columns preserved:

- `nutrition.foods.name_display`
- `nutrition.foods.sort_weight`

## Category Tree Foundation

Category extraction was deterministic from the Category Tree section of
`SPEC_05_FOOD_TAXONOMY.md`.

Applied scope:

- Level 1 categories: 13
- Level 2 categories: 75
- Total categories: 88
- Level 3/4 categories: deferred

Level 3/4 was deferred because the current safe parser extracts explicit
Markdown headings only. Bullet-level subtrees can be added in a follow-up
candidate once a deterministic bullet hierarchy extractor is reviewed.

## Food Category Mapping

Mapping basis:

- BLS code prefix rules from `SPEC_08_IMPORT_PIPELINE.md`
- deterministic L1/L2 category slugs extracted from `SPEC_05_FOOD_TAXONOMY.md`
- exact source-backed name checks only where the spec gives deterministic
  examples, such as cheese/yogurt and pasta variants

No AI category guessing, fuzzy guessing, or invented mappings were used.

Local validation:

- Foods total: 7140
- Foods categorized: 4388
- Foods unassigned: 2752

Unassigned foods remain intentionally unassigned until a deterministic mapping
rule exists.

## V1 Tag Foundation

Inserted all 16 V1 visible tag definitions from `SPEC_04_FEATURES.md` /
`SPEC_05_FOOD_TAXONOMY.md`.

Auto-assigned only deterministic macro-derived tags:

- `high_protein`: `PROT625 >= 20`
- `low_carb`: `CHO <= 10`
- `low_fat`: `FAT <= 3`
- `high_fiber`: `FIBT >= 6`

Local validation:

- `tag_definitions`: 16
- `food_tags`: 9265

Deferred tags:

- `vegan`
- `vegetarian`
- `gluten_free`
- `lactose_free`
- `nut_free`
- `halal`
- `kosher`
- `spicy`
- `thai_food`
- `mediterranean`
- `processed_food`
- `ultra_processed`

Reason: those require ingredient tags, processing-level curation, manual admin
annotation, cuisine annotation, or explicit source-backed rules not present in
this local slice. They were inserted as definitions only where required by V1.

## Source-Backed Aliases / Display Strategy

`food_aliases` was populated only with source-backed forms:

- exact BLS German source label
- exact source English label when available
- deterministic normalized German source-label variant, including umlaut and
  punctuation/case normalization

Local validation:

- `food_aliases`: 21420

No invented synonyms, marketing names, human-friendly rewrites, categories, food
values, or nutrient values were added.

`name_display` remains provisional/source-backed. It is populated from the
existing BLS German source label only when empty and must not be presented as
final curated human-facing product copy.

## Search Enhancement

`/nutrition` and `/api/nutrition/foods` now use the local Human Layer when
available:

- source-backed alias search
- category filter chips from `food_categories`
- V1 tag filter chips where `food_tags` exists
- selected-food detail still resolves nutrients through `nutrient_defs`
- source-label warning remains visible

Everything remains read-only.

## Local DB Validation

Validation command:

```powershell
cmd.exe /c "docker cp docs\project\p1-005\P1-005-local-food-human-layer-validation.sql supabase_db_LumeOS-Claude-V1:/tmp/P1-005-local-food-human-layer-validation.sql && docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -At -f /tmp/P1-005-local-food-human-layer-validation.sql"
```

Observed result:

```text
food_aliases_total|21420
food_categories_level_1|13
food_categories_level_2|75
food_categories_total|88
food_nutrients_total|698092
food_tags_total|9265
foods_categorized|4388
foods_total|7140
foods_uncategorized|2752
missing_nutrient_fk|0
orphan_category_parents|0
orphan_food_nutrients|0
tag_definitions_total|16
utf8_suspect_foods|0
```

## Remaining Gaps

- Level 3/4 category extraction from bullet subtrees.
- Deterministic mapping rules for the 2752 currently unassigned foods.
- Ingredient/allergen tags needed before deriving vegan, vegetarian,
  gluten-free, lactose-free, and nut-free.
- Manual/admin annotation pathway for halal, kosher, spicy, Thai food, and
  Mediterranean tags.
- Human-friendly curated display names and aliases remain future work.
