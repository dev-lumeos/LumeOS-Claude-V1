# Nutrition Module — Database Schema

## Schema & Übersicht

Alle Nutrition-Tabellen leben im `nutrition` Schema (seit Migration `071_nutrition_schema_split.sql`).
Backward-Compatibility Views in `public.*` zeigen auf `nutrition.*`.
API `search_path` ist auf `nutrition,public` gesetzt (`src/api/nutrition/db.ts`).

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `nutrition.foods` | BLS 4.0 Food-Datenbank (7.140+ Einträge, 46+ Nährstoff-Spalten + JSONB) |
| `nutrition.foods_portions` | Portionsgrößen pro Food |
| `nutrition.foods_custom` | User-erstellte Lebensmittel |
| `nutrition.meals` | Mahlzeiten-Container (user_id + date + meal_type) |
| `nutrition.meal_items` | Items in Mahlzeiten (berechnete Nährstoffe) |
| `nutrition.water_logs` | Tägliche Wasseraufnahme |
| `nutrition.weight_logs` | Gewichtsverlauf |
| `nutrition.nutrition_targets` | User-spezifische Makroziele |
| `nutrition.nutrition_micro_flags` | Mikronährstoff-Warnungen pro Tag |
| `nutrition.user_nutrition_goals` | TDEE-basierte Ernährungsziele |
| `nutrition.macro_cycling_configs` | Training- vs. Rest-Day-Makros |
| `nutrition.refeed_schedules` | Refeed-Planung |
| `nutrition.auto_adjust_rules` | Automatische Zielanpassungen |
| `nutrition.tdee_history` | TDEE-Verlauf mit Confidence |
| `nutrition.user_food_preferences` | Diät, Allergien, Likes/Dislikes |
| `nutrition.user_settings` | Key-Value JSONB für Einstellungen |
| `nutrition.tag_definitions` | Semantic Tag Vokabular |
| `nutrition.food_tags` | Food-Tag-Zuordnungen |
| `recipes` | Rezepte (user-owned) |
| `recipe_items` | Zutaten pro Rezept |
| `meal_plans` | Mahlzeitenpläne |
| `meal_plan_days` | Tage innerhalb eines Plans |
| `meal_plan_items` | Items pro Planday |
| `food_favorites` | Favoriten (user_id, food_id) |

**View:** `daily_nutrition_summary` — meals ⋉ meal_items + water_logs

---

## Tabellen-Details

### `nutrition.foods`

BLS 4.0 Lebensmittel-Datenbank.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `bls_code` | TEXT UNIQUE | z.B. "F100100" |
| `name_de` | TEXT NOT NULL | Deutscher Name |
| `name_en` | TEXT | Englischer Name |
| `category` | TEXT NOT NULL | z.B. "Gemüse" |
| `category_code` | TEXT NOT NULL | BLS-Kategorie-Code |
| `source` | TEXT DEFAULT 'bls_4.0' | bls_4.0 / usda / off / user |
| `confidence` | NUMERIC(3,2) | 1.0 = Lab, 0.7 = berechnet, 0.5 = User |
| `kcal` | NUMERIC(8,2) | Kalorien pro 100g |
| `kj` | NUMERIC(8,2) | Kilojoule pro 100g |
| `protein_g` | NUMERIC(8,3) | |
| `fat_g` | NUMERIC(8,3) | |
| `carbs_g` | NUMERIC(8,3) | |
| `sugar_g` | NUMERIC(8,3) | |
| `fiber_g` | NUMERIC(8,3) | |
| `salt_g` | NUMERIC(8,3) | |
| `water_g` | NUMERIC(8,3) | |
| `alcohol_g` | NUMERIC(8,3) | |
| `fat_sat_g` | NUMERIC(8,3) | Gesättigte Fettsäuren |
| `fat_mono_g` | NUMERIC(8,3) | Einfach ungesättigt |
| `fat_poly_g` | NUMERIC(8,3) | Mehrfach ungesättigt |
| `cholesterol_mg` | NUMERIC(8,3) | |
| `calcium_mg` | NUMERIC(8,3) | |
| `iron_mg` | NUMERIC(8,3) | |
| `magnesium_mg` | NUMERIC(8,3) | |
| `phosphorus_mg` | NUMERIC(8,3) | |
| `potassium_mg` | NUMERIC(8,3) | |
| `sodium_mg` | NUMERIC(8,3) | |
| `zinc_mg` | NUMERIC(8,3) | |
| `copper_mg` | NUMERIC(8,3) | |
| `manganese_mg` | NUMERIC(8,3) | |
| `selenium_ug` | NUMERIC(8,3) | |
| `iodine_ug` | NUMERIC(8,3) | |
| `vitamin_a_ug` | NUMERIC(8,3) | |
| `vitamin_d_ug` | NUMERIC(8,3) | |
| `vitamin_e_mg` | NUMERIC(8,3) | |
| `vitamin_k_ug` | NUMERIC(8,3) | |
| `vitamin_c_mg` | NUMERIC(8,3) | |
| `thiamin_mg` | NUMERIC(8,3) | B1 |
| `riboflavin_mg` | NUMERIC(8,3) | B2 |
| `niacin_mg` | NUMERIC(8,3) | B3 |
| `vitamin_b6_mg` | NUMERIC(8,3) | |
| `folate_ug` | NUMERIC(8,3) | B9 |
| `vitamin_b12_ug` | NUMERIC(8,3) | |
| `pantothenic_acid_mg` | NUMERIC(8,3) | B5 |
| `biotin_ug` | NUMERIC(8,3) | B7 |
| `nutrients_full` | JSONB DEFAULT '{}' | Alle 98+ BLS-Nährstoffe |
| `allergens` | TEXT[] DEFAULT '{}' | Allergen-Flags |
| `is_verified` | BOOLEAN DEFAULT true | |

**Indexes:** btree auf `bls_code`, `category`, `category_code`; GIN auf `name_de` (pg_trgm), `nutrients_full`, `allergens`
**RLS:** SELECT für authenticated Users

---

### `nutrition.foods_portions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `food_id` | UUID FK → foods | |
| `name_de` | TEXT NOT NULL | z.B. "1 Scheibe" |
| `name_en` / `name_th` | TEXT | |
| `amount_g` | NUMERIC(8,2) | Gramm pro Portion |
| `is_default` | BOOLEAN | |
| `sort_order` | INTEGER | |

---

### `nutrition.foods_custom`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `name_de` | TEXT NOT NULL | |
| `brand` | TEXT | |
| `barcode` | TEXT | EAN/UPC |
| `kcal` … `zinc_mg` | NUMERIC | Nährstoff-Subset |
| `serving_size_g` | NUMERIC DEFAULT 100 | |
| `serving_name` | TEXT | |
| `source` | TEXT DEFAULT 'user' | user / mealcam / openfoodfacts |
| `confidence` | NUMERIC(3,2) DEFAULT 0.5 | |
| `allergens` | TEXT[] | |
| `is_verified` | BOOLEAN DEFAULT false | |

**RLS:** Users sehen eigene Custom Foods

---

### `nutrition.meals`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `date` | DATE NOT NULL | |
| `meal_type` | TEXT CHECK | breakfast/lunch/dinner/snack/pre_workout/post_workout/other |
| `notes` | TEXT | |

**Index:** `idx_meals_user_date` (user_id, date)

---

### `nutrition.meal_items`

Einzelne Food-Einträge pro Mahlzeit mit berechneten Nährstoffen.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `meal_id` | UUID FK → meals CASCADE DELETE | |
| `food_id` | UUID | Referenz auf foods / foods_custom |
| `food_source` | TEXT CHECK | bls / custom / openfoodfacts / mealcam |
| `food_name` | TEXT NOT NULL | Denormalized |
| `amount_g` | NUMERIC(8,2) | |
| `kcal` | NUMERIC(8,2) | food.kcal × amount/100 |
| `protein_g` … `fat_poly_g` | NUMERIC(8,3) | Alle 34 berechneten Nährstoffe |

**27 Nährstoff-Spalten:** kcal, protein_g, fat_g, carbs_g, sugar_g, fiber_g, salt_g, vitamin_a/d/e/k/c_ug/mg, B-Vitamine, calcium/iron/magnesium/phosphorus/potassium/sodium/zinc/copper/manganese_mg, selenium/iodine_ug, cholesterol_mg, fat_sat/mono/poly_g

---

### `nutrition.nutrition_targets`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID UNIQUE | Ein aktives Target pro User |
| `user_level` | TEXT CHECK | beginner/intermediate/advanced/elite |
| `kcal_target` | NUMERIC(8,2) | |
| `protein_g_target` … `water_ml_target` | NUMERIC | Makro-Ziele |
| `vitamin_a_ug_target` … `zinc_mg_target` | NUMERIC | Mikro-Ziele mit RDA-Defaults |

---

### `nutrition.nutrition_micro_flags`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `date` | DATE NOT NULL | |
| `nutrient` | TEXT NOT NULL | z.B. 'vitamin_d_ug' |
| `flag_type` | TEXT CHECK | deficit / surplus / optimal |
| `actual_value` | NUMERIC(8,3) | |
| `target_value` | NUMERIC(8,3) | |
| `percentage` | NUMERIC(5,2) | actual/target × 100 |
| `severity` | TEXT CHECK | info / warn / block |

---

### `nutrition.water_logs`

| Spalte | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `date` | DATE NOT NULL | |
| `amount_ml` | NUMERIC(8,2) NOT NULL | |
| `source` | TEXT DEFAULT 'manual' | manual / quick_add / auto |

---

### `nutrition.weight_logs`

| Spalte | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `date` | DATE NOT NULL | |
| `weight_kg` | NUMERIC(6,2) NOT NULL | |
| `body_fat_pct` | NUMERIC(5,2) | Optional |
| `notes` | TEXT | |

---

### `recipes` + `recipe_items`

| recipes | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `name` | TEXT NOT NULL | |
| `description` | TEXT | |
| `servings` | NUMERIC(6,2) NOT NULL DEFAULT 1 | |
| `total_weight_g` | NUMERIC(10,2) | Pre-computed |
| `total_energy_kcal` | NUMERIC(10,2) | Pre-computed |
| `total_protein_g` … `total_sugar_g` | NUMERIC | Pre-computed |
| `serving_weight_g` | GENERATED | total / servings |
| `serving_energy_kcal` | GENERATED | total / servings |
| `serving_protein_g` … `serving_carbs_g` | GENERATED | |
| `is_active` | BOOLEAN DEFAULT true | |
| `is_public` | BOOLEAN DEFAULT false | Zukünftig: Sharing |
| `prep_time_min` / `cook_time_min` | INTEGER | |
| `instructions` | TEXT | |
| `tags` | TEXT[] | |
| `is_favorite` | BOOLEAN | |

| recipe_items | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `recipe_id` | UUID FK → recipes CASCADE | |
| `food_id` | UUID FK → foods RESTRICT | |
| `amount_grams` | NUMERIC(10,2) NOT NULL | |
| `energy_kcal` … `sugar_g` | NUMERIC | Pre-computed (food × amount/100) |
| `sort_order` | INTEGER | |

**Trigger:** `trg_recipe_items_recalculate` → aktualisiert `recipes.total_*` bei Item-Änderungen

---

### `food_favorites`

| Spalte | Typ | |
|---|---|---|
| `user_id` | UUID (PK part) | |
| `food_id` | UUID FK → foods (PK part) | |

---

### `meal_plans` + `meal_plan_days` + `meal_plan_items`

| meal_plans | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `name` | TEXT NOT NULL | |
| `target_calories` … `target_fat_g` | NUMERIC | |
| `days_count` | INTEGER DEFAULT 7 | |
| `is_active` | BOOLEAN DEFAULT false | |

| meal_plan_days | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `plan_id` | UUID FK → meal_plans CASCADE | |
| `day_number` | INTEGER NOT NULL | 1–N |
| `name` | TEXT | "Montag" / "Training Day" |
| UNIQUE | (plan_id, day_number) | |

| meal_plan_items | Typ | |
|---|---|---|
| `id` | UUID PK | |
| `day_id` | UUID FK → meal_plan_days CASCADE | |
| `meal_type` | TEXT CHECK | breakfast/lunch/dinner/snack |
| `food_id` | UUID FK → foods | |
| `custom_food_id` | UUID FK → foods_custom | |
| `recipe_id` | UUID FK → recipes | |
| `name` | TEXT NOT NULL | |
| `amount_g` | NUMERIC DEFAULT 100 | |
| `calories_kcal` … `fat_g` | NUMERIC | |
| `sort_order` | INTEGER | |

---

### `user_settings`

Key-Value Store für Settings (JSONB).

| Spalte | Typ | |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `setting_key` | TEXT NOT NULL | |
| `setting_value` | JSONB NOT NULL | |
| UNIQUE | (user_id, setting_key) | |

---

### `nutrition.user_nutrition_goals`

TDEE-basierte Ernährungsziele.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `goal_type` | VARCHAR(20) | lose / maintain / gain |
| `goal_type_new` | VARCHAR(40) | aggressive_cut / moderate_cut / mini_cut / lean_bulk / clean_bulk |
| `tdee_calculated` | INTEGER | |
| `tdee_manual_override` | INTEGER | |
| `tdee_modifier` | DECIMAL(4,2) | z.B. -0.20 = 20% Deficit |
| `calorie_target` | INTEGER | |
| `protein_target` … `fiber_target` | INTEGER | In Gramm |
| `protein_per_kg` | DECIMAL(3,1) DEFAULT 2.0 | |
| `macro_preset` | VARCHAR(20) | balanced / low_carb / keto / high_protein / custom |
| `weekly_rate` | DECIMAL(3,2) DEFAULT 0.5 | kg/Woche |
| `current_weight_kg` / `height_cm` / `age` / `gender` | Mixed | User-Profil Snapshot |
| `activity_level` | VARCHAR(25) | sedentary bis very_active |
| `training_days_per_week` | INTEGER DEFAULT 4 | |
| `training_type` | VARCHAR(10) | strength / endurance / both / none |
| `is_active` | BOOLEAN DEFAULT true | |
| `onboarding_completed` | BOOLEAN DEFAULT false | |

---

### `nutrition.macro_cycling_configs`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `goal_id` | UUID FK → user_nutrition_goals CASCADE | |
| `cycling_type` | VARCHAR(20) | none / training_rest |
| `training_protein` / `training_fat` | DECIMAL(3,1) | g/kg Bodyweight |
| `training_days` | INTEGER[] DEFAULT '{1,2,3,4,5}' | 0=So, 6=Sa |
| `rest_protein` / `rest_fat` / `rest_carbs_fixed` | Mixed | Rest Day Macros |

---

### `nutrition.refeed_schedules`

| Spalte | Typ | |
|---|---|---|
| `goal_id` | UUID FK | |
| `frequency` | VARCHAR(20) DEFAULT 'none' | none / weekly / bi_weekly |
| `refeed_day_of_week` | INTEGER DEFAULT 6 | |
| `refeed_calories` … `refeed_fat` | INTEGER | |

---

### `nutrition.auto_adjust_rules`

| Spalte | Typ | |
|---|---|---|
| `goal_id` | UUID FK | |
| `check_interval_days` | INTEGER DEFAULT 14 | |
| `weight_stall_threshold_kg` | DECIMAL(3,1) DEFAULT 0.2 | |
| `calorie_adjustment_step` | INTEGER DEFAULT 100 | |
| `min_calories` / `max_calories` | INTEGER | 1200 / 5000 |

---

### `nutrition.tdee_history`

| Spalte | Typ | |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `date` | DATE NOT NULL | UNIQUE(user_id, date) |
| `tdee_estimate` | INTEGER | |
| `avg_intake` / `avg_weight_kg` / `weight_change_kg` | Mixed | |
| `confidence` | VARCHAR(10) | low / medium / high |

---

### `nutrition.user_food_preferences`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID UNIQUE | |
| `diet_type` | TEXT CHECK | omnivore/pescatarian/vegetarian/vegan/keto/paleo/mediterranean/carnivore/custom |
| `allergies` | TEXT[] | |
| `intolerances` | TEXT[] | |
| `liked_foods` | JSONB DEFAULT '[]' | [{food_id?, name, category?}] |
| `disliked_foods` | JSONB DEFAULT '[]' | |
| `preferred_cuisines` | TEXT[] | |
| `meals_per_day` | INTEGER DEFAULT 4 | |
| `cooking_skill` | TEXT CHECK | beginner/intermediate/advanced |
| `prep_time_max` | INTEGER DEFAULT 30 | Minuten |
| `budget_level` | TEXT CHECK | low/medium/high/no_limit |
| `high_protein_foods` / `preferred_carb_sources` / `preferred_fat_sources` | TEXT[] | |

---

### `nutrition.tag_definitions`

| Spalte | Typ | |
|---|---|---|
| `code` | TEXT PK | 'pork', 'dairy', 'vegan', etc. |
| `label_de` | TEXT NOT NULL | |
| `label_en` | TEXT NOT NULL | |
| `tag_type` | TEXT NOT NULL | 'ingredient' / 'diet' / 'fitness' |
| `is_exclusion_relevant` | BOOLEAN | Für Diet-Exclusions nutzbar |
| `sort_order` | INTEGER | |

### `nutrition.food_tags`

| Spalte | Typ | |
|---|---|---|
| `food_id` | UUID FK → nutrition.foods | PK part |
| `tag_code` | TEXT FK → tag_definitions | PK part |
| `confidence` | NUMERIC(3,2) | 1.0 = sicher, 0.7–0.9 = wahrscheinlich |

**Trigger:** `trg_foods_auto_tag` → re-tagged Food bei Änderung von `bls_code`, `macros`, `is_active`, `name_de`

---

## View: `daily_nutrition_summary`

Aggregierter Tagesüberblick: meals ⋉ meal_items + water_logs

**Spalten:** user_id, date, meal_count, total_kcal, total_protein_g, total_fat_g, total_carbs_g, total_sugar_g, total_fiber_g, total_salt_g, alle Mikronährstoffe, total_water_ml

---

## Migrations-Verlauf

| Migration | Inhalt |
|---|---|
| `001_create_foods_table.sql` | Foods (BLS 4.0), pg_trgm, Indexes |
| `002_create_nutrition_tables.sql` | foods_portions, foods_custom, meals, meal_items, targets, micro_flags, water_logs, weight_logs, daily_nutrition_summary View |
| `004_create_recipes_tables.sql` | recipes, recipe_items, food_favorites |
| `005_add_nutrients_full.sql` | nutrients_full JSONB + GIN Index |
| `006_portions_custom_foods_mealplans.sql` | Portions erweitert, Custom Foods, meal_plans Hierarchie |
| `007_user_settings.sql` | user_settings Key-Value |
| `017_nutrition_goals.sql` | user_nutrition_goals, macro_cycling_configs, refeed_schedules, auto_adjust_rules, tdee_history |
| `021_food_preferences.sql` | user_food_preferences |
| `042_fix_numeric_precision.sql` | Numeric Precision Fixes |
| `071_nutrition_schema_split.sql` | Move Tables public → nutrition Schema |
| `072_nutrition_schema_access.sql` | Schema Access Grants |
| `20260319_1530_nutrition_settings_consolidation.sql` | Settings Consolidation |
| `20260320_1600_food_preferences_columns.sql` | Food Preferences Column Updates |
| `20260322_smart_search_indexes.sql` | Smart Search Indexes |
| `20260331000004_food_semantic_tags.sql` | tag_definitions, food_tags, Auto-Tagging Trigger |

---

## RLS-Policies

| Tabelle | Policy |
|---|---|
| `foods` | SELECT für alle authenticated |
| `foods_custom` | ALL für `auth.uid() = user_id` |
| `meals` | ALL für `auth.uid() = user_id` |
| `meal_items` | Via meals (CASCADE) |
| `nutrition_targets` | ALL für Owner |
| `nutrition_micro_flags` | ALL für Owner |
| `water_logs` | ALL für Owner |
| `weight_logs` | ALL für Owner |
| `recipes` + `recipe_items` | ALL für Owner |
| `food_favorites` | ALL für Owner |
| `meal_plans` + children | ALL für Owner (nested via subquery) |
| `user_food_preferences` | Enabled (TODO: restrict) |
| `user_nutrition_goals` + children | Enabled |
| `food_tags` | SELECT für authenticated |
| `user_target_logs` | SELECT + INSERT für authenticated (append-only) |

---

## Schema-Architektur-Entscheidungen

**Warum separates `nutrition` Schema?**
Domain-Isolation, klare Ownership, zukunftssichere Multi-Schema-Architektur, Backward-Compat via Views.

**Warum `nutrients_full` JSONB?**
BLS 4.0 hat 138 Nährstoffe — nicht alle sinnvoll als Spalten. JSONB für flexible Queries + GIN-Index. Direkte Spalten für die 46 wichtigsten Nährstoffe bleiben für schnelle Aggregation.

**Warum Pre-computed Nährstoffe in `meal_items`?**
Snapshot-Prinzip: Nährstoffe werden beim Eintragen berechnet und eingefroren. Spätere Änderungen an der Food-DB verfälschen keine historischen Einträge.

**Warum `user_target_logs` (append-only)?**
"Was waren meine Ziele als ich 5kg verloren habe?" — historische Traceability für Analyse und Coaching.
