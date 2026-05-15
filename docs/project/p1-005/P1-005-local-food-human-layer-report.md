# P1-005 Local Food Taxonomy / Human Layer Foundation

Status: `LOCAL_ONLY_APPLIED`

This report records the local-only Food Taxonomy / Human Layer foundation built
on top of the already populated BLS-backed local food tables.

## Source References

- `docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md`
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

Update 2026-05-15: the same local-only boundary was hardened toward
spec-compliant Food Search. This update added deterministic L3/L4 category
seeds where the spec provided nested bullet hierarchy, improved deterministic
category assignment coverage, refreshed local `sort_weight`, added pagination
and sort handling, and added a read-only category tree endpoint.

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
- Level 3 categories: 385
- Level 4 categories: 45
- Total categories: 518

L3/L4 extraction is deterministic only where the spec has nested bullet
structure under the Category Tree section. The extractor does not create
categories outside the spec text.

## Food Category Mapping

Mapping basis:

- BLS code prefix rules from `SPEC_08_IMPORT_PIPELINE.md`
- deterministic L1/L2 category slugs extracted from `SPEC_05_FOOD_TAXONOMY.md`
- exact source-backed name checks only where the spec gives deterministic
  examples, such as cheese/yogurt and pasta variants

No AI category guessing, fuzzy guessing, or invented mappings were used.

Local validation:

- Foods total: 7140
- Foods categorized before this hardening: 4388
- Foods categorized after this hardening: 4854
- Foods unassigned after this hardening: 2286

Unassigned foods remain intentionally unassigned until a deterministic mapping
rule exists.

Additional deterministic assignment added:

- `D%` BLS code prefix -> `Backwaren & Gebäck (Snack-Kategorie)`
- selected `V4%` poultry labels -> `Hähnchen`, `Hähnchenbrust & Filet`, or
  `Pute/Truthahn` subtrees where the source label contains the explicit spec
  terms
- selected `U0/U1/U2` beef labels -> beef mince or steak/braten subtrees where
  source label terms match the spec examples

Still deferred:

- `X` and `Y` prepared-dish/zubereitung mappings, because broad prefix
  assignment would be less precise than the spec requires
- any cuisine/religious/allergen/ingredient category inference without an
  explicit source-backed rule

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

Curated names and aliases require a separate governed admin/manual curation
workflow. Current `food_aliases` rows are source-backed exact or normalized
source labels only.

## Search Enhancement

`/nutrition` and `/api/nutrition/foods` now use the local Human Layer when
available:

- source-backed alias search
- category filter chips from `food_categories`
- V1 tag filter chips where `food_tags` exists
- pagination through `limit`/`offset`
- sort modes: `relevance`, `protein_desc`, `kcal_asc`, `name_asc`
- category subtree filtering
- `GET /api/nutrition/foods/categories` category tree endpoint
- selected-food detail still resolves nutrients through `nutrient_defs`
- source-label warning remains visible

Everything remains read-only.

Ranking strategy:

- `relevance` uses deterministic normalized text match contribution and
  `sort_weight`.
- `sort_weight` is refreshed locally from SPEC_08 base prefix rules, known
  core-fitness-food bonuses, protein/lean-protein bonuses, and documented
  processing penalties.
- No AI ranking or external data is used.

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
food_categories_level_3|385
food_categories_level_4|45
food_categories_total|518
food_nutrients_total|698092
food_tags_total|9265
foods_categorized|4854
foods_total|7140
foods_uncategorized|2286
missing_nutrient_fk|0
orphan_category_parents|0
orphan_food_nutrients|0
sort_weight_missing|0
sort_weight_populated|7140
tag_definitions_total|16
utf8_suspect_foods|0
```

## Remaining Gaps

- Deterministic mapping rules for the 2286 currently unassigned foods.
- Ingredient/allergen tags needed before deriving vegan, vegetarian,
  gluten-free, lactose-free, and nut-free.
- Manual/admin annotation pathway for halal, kosher, spicy, Thai food, and
  Mediterranean tags.
- Human-friendly curated display names and aliases remain future work.
- No diary logging or MealItem creation has been added.
