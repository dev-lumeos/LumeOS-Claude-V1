-- P1-005 Local Nutrition Preferences + Human Layer Curation Foundation
-- LOCAL ONLY. Do not apply to DEV/LIVE.
-- Source refs:
-- - docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_07_API.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md
-- Boundary: preferences schema foundation only. No user preference writes, diary logging, MealItem creation, or Smart Search application.

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.food_preferences (
  user_id UUID PRIMARY KEY,
  diet_type TEXT DEFAULT 'omnivore'
    CHECK (diet_type IN ('omnivore','pescatarian','vegetarian','vegan','keto','paleo','mediterranean','custom')),
  allergies TEXT[] DEFAULT '{}',
  intolerances TEXT[] DEFAULT '{}',
  general_exclusions TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  meals_per_day INTEGER DEFAULT 3 CHECK (meals_per_day IN (2,3,4,5,6)),
  snacks_per_day INTEGER DEFAULT 1 CHECK (snacks_per_day IN (0,1,2,3)),
  cooking_skill TEXT DEFAULT 'intermediate'
    CHECK (cooking_skill IN ('beginner','intermediate','advanced')),
  prep_time_max_min INTEGER DEFAULT 30 CHECK (prep_time_max_min IN (15,20,30,45,60)),
  budget_level TEXT DEFAULT 'medium'
    CHECK (budget_level IN ('low','medium','high','no_limit')),
  meal_prep_ok BOOLEAN DEFAULT false,
  planner_notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nutrition.food_preferences
  ADD COLUMN IF NOT EXISTS general_exclusions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meals_per_day INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS snacks_per_day INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS meal_prep_ok BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS planner_notes TEXT DEFAULT '';

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'nutrition'
      AND tablename = 'food_preferences'
      AND policyname = 'food_prefs_owner'
  ) THEN
    CREATE POLICY food_prefs_owner ON nutrition.food_preferences
      USING (auth.uid()::text = user_id::text);
  END IF;
END
$policy$;

CREATE TABLE IF NOT EXISTS nutrition.food_preference_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preference TEXT NOT NULL CHECK (preference IN ('liked','disliked','hard_exclude')),
  strength TEXT NOT NULL DEFAULT 'neutral'
    CHECK (strength IN ('hard_exclude','strong_avoid','soft_dislike','neutral','like','boost')),
  target_type TEXT NOT NULL CHECK (target_type IN ('food','category','tag','cuisine','exclusion_preset','catalog_item')),
  food_id UUID REFERENCES nutrition.foods(id),
  category_id UUID REFERENCES nutrition.food_categories(id),
  tag_code TEXT REFERENCES nutrition.tag_definitions(code),
  cuisine_code TEXT,
  exclusion_preset_code TEXT,
  catalog_item_code TEXT,
  source TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT food_preference_items_exactly_one_target CHECK (
    (food_id IS NOT NULL)::int +
    (category_id IS NOT NULL)::int +
    (tag_code IS NOT NULL)::int +
    (NULLIF(cuisine_code, '') IS NOT NULL)::int +
    (NULLIF(exclusion_preset_code, '') IS NOT NULL)::int +
    (NULLIF(catalog_item_code, '') IS NOT NULL)::int = 1
  )
);

ALTER TABLE nutrition.food_preference_items
  ADD COLUMN IF NOT EXISTS strength TEXT NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS cuisine_code TEXT,
  ADD COLUMN IF NOT EXISTS exclusion_preset_code TEXT,
  ADD COLUMN IF NOT EXISTS catalog_item_code TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_food_pref_items_user ON nutrition.food_preference_items(user_id);
CREATE INDEX IF NOT EXISTS idx_food_pref_items_category ON nutrition.food_preference_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_pref_items_tag ON nutrition.food_preference_items(tag_code);

-- Duplikatschutz (C-02, ergänzt 2026-08-04): genau EINE Zeile je Nutzerin
-- und Food. `preference` gehört bewusst NICHT in den Schlüssel — Favorit und
-- Ausschluss sind keine getrennten Zeilen, Umstufung ist ein UPDATE derselben
-- Zeile; zwei Zeilen je Food wären ein widersprüchlicher Zustand.
-- Partiell auf food_id IS NOT NULL: Zeilen anderer target_types (category,
-- tag, cuisine, exclusion_preset, catalog_item) sind nicht betroffen —
-- analoge Uniques dafür folgen mit deren Schreibpfaden.
-- Schliesst die Select-vor-Insert-Race im Anwendungscode (23505 -> 409).
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_pref_items_user_food
  ON nutrition.food_preference_items(user_id, food_id)
  WHERE food_id IS NOT NULL;

ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'nutrition'
      AND tablename = 'food_preference_items'
      AND policyname = 'food_pref_items_owner'
  ) THEN
    CREATE POLICY food_pref_items_owner ON nutrition.food_preference_items
      USING (auth.uid()::text = user_id::text);
  END IF;
END
$policy$;

COMMIT;
