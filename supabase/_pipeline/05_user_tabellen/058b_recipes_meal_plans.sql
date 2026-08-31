-- =============================================================
-- 058b -- Rezepte und Wochenplaene (C-150)
-- Datum: 2026-08-20
-- Zweck:
--   * Wiederverwendbare Rezepte mit Zutaten aus nutrition.foods und
--     nutrition.foods_custom.
--   * Wochenplaene als Kalender: Plan -> Woche -> Tag -> Slot/Eintrag.
--   * Copy week als Datenbankfunktion.
--   * Uebernahme eines Plantags ins Tagebuch als normale meals +
--     meal_items mit eingefrorenen Naehrwert-Snapshots.
--
-- Grenze:
--   Kein Generator, keine Planbewertung, keine Oberflaeche.
--   meals und meal_items werden nicht umgebaut.
--
-- Abweichung vom Vorgaengerrepo:
--   Dort speicherten Plan-Items bereits kcal/protein/carbs/fat als
--   Snapshot. Hier bleiben Rezepte/Plan aus Zutaten berechnet; der
--   Snapshot entsteht erst beim Uebernehmen ins Tagebuch, weil erst
--   meal_items die kanonische Historie sind.
-- =============================================================

\set ON_ERROR_STOP on

BEGIN;

-- -------------------------------------------------------------
-- 1. Rezepte
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.recipes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  name_de            TEXT NOT NULL CHECK (length(trim(name_de)) >= 2),
  name_en            TEXT,
  description        TEXT,
  instructions       TEXT,
  cuisine_code       TEXT,
  cooking_skill      TEXT NOT NULL DEFAULT 'intermediate'
    CHECK (cooking_skill IN ('beginner','intermediate','advanced')),
  prep_time_min      INTEGER CHECK (prep_time_min IS NULL OR prep_time_min >= 0),
  cook_time_min      INTEGER CHECK (cook_time_min IS NULL OR cook_time_min >= 0),
  servings           NUMERIC(8,3) NOT NULL DEFAULT 1 CHECK (servings > 0),
  is_favorite        BOOLEAN NOT NULL DEFAULT false,
  tags               TEXT[] NOT NULL DEFAULT '{}'::text[],
  measurement_source TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual','device','import','admin','seed')),
  source_detail      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_user
  ON nutrition.recipes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recipes_filters
  ON nutrition.recipes(user_id, cuisine_code, cooking_skill, prep_time_min);

DROP TRIGGER IF EXISTS recipes_touch_updated_at ON nutrition.recipes;
CREATE TRIGGER recipes_touch_updated_at
  BEFORE UPDATE ON nutrition.recipes
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.recipe_ingredients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id          UUID NOT NULL REFERENCES nutrition.recipes(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  food_source        TEXT NOT NULL CHECK (food_source IN ('bls','custom')),
  food_id            UUID REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  custom_food_id     UUID REFERENCES nutrition.foods_custom(id) ON DELETE RESTRICT,
  food_name_snapshot TEXT,
  amount_g           NUMERIC(10,2) NOT NULL CHECK (amount_g > 0),
  portion_name       TEXT,
  portion_quantity   NUMERIC(10,3),
  portion_amount_g   NUMERIC(10,2),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT recipe_ingredients_source_target_check CHECK (
    (food_source = 'bls'    AND food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (food_source = 'custom' AND food_id IS NULL     AND custom_food_id IS NOT NULL)
  ),
  CONSTRAINT recipe_ingredients_portion_check CHECK (
    (
      portion_name IS NULL
      AND portion_quantity IS NULL
      AND portion_amount_g IS NULL
    )
    OR
    (
      portion_name IS NOT NULL
      AND length(trim(portion_name)) > 0
      AND portion_quantity IS NOT NULL
      AND portion_quantity > 0
      AND portion_amount_g IS NOT NULL
      AND portion_amount_g > 0
      AND abs(amount_g - (portion_quantity * portion_amount_g)) <= 0.01
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
  ON nutrition.recipe_ingredients(recipe_id, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_user
  ON nutrition.recipe_ingredients(user_id);

DROP TRIGGER IF EXISTS recipe_ingredients_touch_updated_at ON nutrition.recipe_ingredients;
CREATE TRIGGER recipe_ingredients_touch_updated_at
  BEFORE UPDATE ON nutrition.recipe_ingredients
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- -------------------------------------------------------------
-- 2. Wochenplaene
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.meal_plans (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  name               TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  description        TEXT,
  target_kcal        NUMERIC(10,2) CHECK (target_kcal IS NULL OR target_kcal >= 0),
  target_protein_g   NUMERIC(10,2) CHECK (target_protein_g IS NULL OR target_protein_g >= 0),
  target_carbs_g     NUMERIC(10,2) CHECK (target_carbs_g IS NULL OR target_carbs_g >= 0),
  target_fat_g       NUMERIC(10,2) CHECK (target_fat_g IS NULL OR target_fat_g >= 0),
  is_active          BOOLEAN NOT NULL DEFAULT false,
  lifecycle_type     TEXT DEFAULT 'once'
    CHECK (lifecycle_type IN ('once','rollover','sequence')),
  start_date         DATE,
  days_count         INTEGER DEFAULT 7 CHECK (days_count > 0),
  next_plan_id       UUID REFERENCES nutrition.meal_plans(id) ON DELETE SET NULL,
  rollover_count     INTEGER DEFAULT 0 CHECK (rollover_count >= 0),
  status             TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned','active','completed','paused','archived')),
  measurement_source TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual','device','import','admin','seed')),
  source_detail      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- C-239: Die bestehenden Wochenplaene haben keinen belegten Start und
-- keine belegte Laufzeit. Die neuen Spalten bleiben dort NULL; nur der
-- bereits vorhandene boolesche Zustand wird verlustfrei nach active/paused
-- ueberfuehrt. Neue Plaene erhalten die Defaults beim Anlegen.
ALTER TABLE nutrition.meal_plans
  ADD COLUMN IF NOT EXISTS lifecycle_type TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS days_count INTEGER,
  ADD COLUMN IF NOT EXISTS next_plan_id UUID REFERENCES nutrition.meal_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rollover_count INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT;

ALTER TABLE nutrition.meal_plans
  ALTER COLUMN lifecycle_type SET DEFAULT 'once',
  ALTER COLUMN days_count SET DEFAULT 7,
  ALTER COLUMN rollover_count SET DEFAULT 0,
  ALTER COLUMN status SET DEFAULT 'assigned',
  ALTER COLUMN is_active SET DEFAULT false;

UPDATE nutrition.meal_plans
SET status = CASE WHEN is_active THEN 'active' ELSE 'paused' END
WHERE status IS NULL;

ALTER TABLE nutrition.meal_plans
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE nutrition.meal_plans
  DROP CONSTRAINT IF EXISTS meal_plans_lifecycle_type_check,
  DROP CONSTRAINT IF EXISTS meal_plans_days_count_check,
  DROP CONSTRAINT IF EXISTS meal_plans_rollover_count_check,
  DROP CONSTRAINT IF EXISTS meal_plans_status_check,
  DROP CONSTRAINT IF EXISTS meal_plans_sequence_target_check,
  DROP CONSTRAINT IF EXISTS meal_plans_sequence_not_self_check;
ALTER TABLE nutrition.meal_plans
  ADD CONSTRAINT meal_plans_lifecycle_type_check
    CHECK (lifecycle_type IS NULL OR lifecycle_type IN ('once','rollover','sequence')),
  ADD CONSTRAINT meal_plans_days_count_check
    CHECK (days_count IS NULL OR days_count > 0),
  ADD CONSTRAINT meal_plans_rollover_count_check
    CHECK (rollover_count IS NULL OR rollover_count >= 0),
  ADD CONSTRAINT meal_plans_status_check
    CHECK (status IN ('assigned','active','completed','paused','archived')),
  ADD CONSTRAINT meal_plans_sequence_target_check
    CHECK (
      lifecycle_type IS NULL
      OR (lifecycle_type = 'sequence' AND next_plan_id IS NOT NULL)
      OR (lifecycle_type <> 'sequence' AND next_plan_id IS NULL)
    ),
  ADD CONSTRAINT meal_plans_sequence_not_self_check
    CHECK (next_plan_id IS NULL OR next_plan_id <> id);

-- is_active ist ein bestehender Lesevertrag. Der neue Status ist die einzige
-- Wahrheit; der Trigger haelt den booleschen Rueckwaertskompatibilitaetswert
-- synchron und uebernimmt noch alte Schreiber, die nur is_active setzen.
CREATE OR REPLACE FUNCTION nutrition.meal_plans_status_compatibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $status_compatibility$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'assigned' AND NEW.is_active THEN
      NEW.status := 'active';
    END IF;
  ELSIF NEW.status IS NOT DISTINCT FROM OLD.status
        AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    NEW.status := CASE WHEN NEW.is_active THEN 'active' ELSE 'paused' END;
  END IF;

  NEW.is_active := (NEW.status = 'active');
  RETURN NEW;
END;
$status_compatibility$;

DROP TRIGGER IF EXISTS meal_plans_status_compatibility_trg ON nutrition.meal_plans;
CREATE TRIGGER meal_plans_status_compatibility_trg
  BEFORE INSERT OR UPDATE ON nutrition.meal_plans
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plans_status_compatibility();

CREATE INDEX IF NOT EXISTS idx_meal_plans_user
  ON nutrition.meal_plans(user_id, is_active DESC, created_at DESC);

DROP TRIGGER IF EXISTS meal_plans_touch_updated_at ON nutrition.meal_plans;
CREATE TRIGGER meal_plans_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_plans
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.meal_plan_weeks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id             UUID NOT NULL REFERENCES nutrition.meal_plans(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  week_start          DATE NOT NULL,
  name                TEXT,
  copied_from_week_id UUID REFERENCES nutrition.meal_plan_weeks(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_meal_plan_weeks_plan_start UNIQUE (plan_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_weeks_user
  ON nutrition.meal_plan_weeks(user_id, week_start DESC);

DROP TRIGGER IF EXISTS meal_plan_weeks_touch_updated_at ON nutrition.meal_plan_weeks;
CREATE TRIGGER meal_plan_weeks_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_plan_weeks
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.meal_plan_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id     UUID NOT NULL REFERENCES nutrition.meal_plan_weeks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  plan_date   DATE NOT NULL,
  day_index   SMALLINT NOT NULL CHECK (day_index BETWEEN 1 AND 7),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_meal_plan_days_week_index UNIQUE (week_id, day_index),
  CONSTRAINT uq_meal_plan_days_week_date UNIQUE (week_id, plan_date)
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_days_user_date
  ON nutrition.meal_plan_days(user_id, plan_date);

DROP TRIGGER IF EXISTS meal_plan_days_touch_updated_at ON nutrition.meal_plan_days;
CREATE TRIGGER meal_plan_days_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_plan_days
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.meal_plan_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id             UUID NOT NULL REFERENCES nutrition.meal_plan_days(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL,
  meal_type          TEXT NOT NULL
    CHECK (meal_type IN ('breakfast','lunch','dinner','snack',
                         'pre_workout','post_workout','other')),
  planned_time       TIME,
  slot_order         INTEGER NOT NULL DEFAULT 0 CHECK (slot_order >= 0),
  entry_type         TEXT NOT NULL CHECK (entry_type IN ('recipe','bls','custom')),
  recipe_id          UUID REFERENCES nutrition.recipes(id) ON DELETE RESTRICT,
  food_id            UUID REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  custom_food_id     UUID REFERENCES nutrition.foods_custom(id) ON DELETE RESTRICT,
  amount_g           NUMERIC(10,2) CHECK (amount_g IS NULL OR amount_g > 0),
  planned_servings   NUMERIC(8,3) CHECK (planned_servings IS NULL OR planned_servings > 0),
  portion_name       TEXT,
  portion_quantity   NUMERIC(10,3),
  portion_amount_g   NUMERIC(10,2),
  note               TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT meal_plan_entries_target_check CHECK (
    (entry_type = 'recipe' AND recipe_id IS NOT NULL AND food_id IS NULL AND custom_food_id IS NULL
      AND planned_servings IS NOT NULL AND amount_g IS NULL) OR
    (entry_type = 'bls' AND recipe_id IS NULL AND food_id IS NOT NULL AND custom_food_id IS NULL
      AND amount_g IS NOT NULL AND planned_servings IS NULL) OR
    (entry_type = 'custom' AND recipe_id IS NULL AND food_id IS NULL AND custom_food_id IS NOT NULL
      AND amount_g IS NOT NULL AND planned_servings IS NULL)
  ),
  CONSTRAINT meal_plan_entries_portion_check CHECK (
    (
      portion_name IS NULL
      AND portion_quantity IS NULL
      AND portion_amount_g IS NULL
    )
    OR
    (
      entry_type IN ('bls','custom')
      AND portion_name IS NOT NULL
      AND length(trim(portion_name)) > 0
      AND portion_quantity IS NOT NULL
      AND portion_quantity > 0
      AND portion_amount_g IS NOT NULL
      AND portion_amount_g > 0
      AND amount_g IS NOT NULL
      AND abs(amount_g - (portion_quantity * portion_amount_g)) <= 0.01
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_day
  ON nutrition.meal_plan_entries(day_id, meal_type, planned_time, slot_order, id);

CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_user
  ON nutrition.meal_plan_entries(user_id);

DROP TRIGGER IF EXISTS meal_plan_entries_touch_updated_at ON nutrition.meal_plan_entries;
CREATE TRIGGER meal_plan_entries_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_plan_entries
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- C-238: Ein Plan-Entry ist die Vorlage. Bei rollover oder einer
-- rueckwirkenden Bestaetigung kann dieselbe Vorlage mehrfach ausgefuehrt
-- werden; der Status gehoert deshalb an die Ausfuehrung, nicht an die
-- Vorlage. Fehlende Zeilen bedeuten nicht "uebersprungen"; pending wird
-- beim Erzeugen der Ghost-Entry-Ausfuehrung geschrieben und hat kein Expiry.
CREATE TABLE IF NOT EXISTS nutrition.meal_plan_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id           UUID NOT NULL REFERENCES nutrition.meal_plans(id) ON DELETE RESTRICT,
  plan_entry_id     UUID NOT NULL REFERENCES nutrition.meal_plan_entries(id) ON DELETE RESTRICT,
  user_id           UUID NOT NULL,
  execution_date    DATE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  actual_meal_id    UUID REFERENCES nutrition.meals(id) ON DELETE RESTRICT,
  confirmation_mode TEXT,
  deviation_kcal    NUMERIC(10,2),
  deviation_pct     NUMERIC(7,2),
  confirmed_at      TIMESTAMPTZ,
  skipped_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_meal_plan_logs_entry_execution UNIQUE (plan_entry_id, execution_date),
  CONSTRAINT meal_plan_logs_status_check
    CHECK (status IN ('pending','confirmed','deviated','skipped')),
  CONSTRAINT meal_plan_logs_confirmation_mode_check
    CHECK (confirmation_mode IS NULL OR confirmation_mode IN ('mealcam','manual')),
  CONSTRAINT meal_plan_logs_resolution_check CHECK (
    (status = 'pending'
      AND actual_meal_id IS NULL AND confirmation_mode IS NULL
      AND confirmed_at IS NULL AND skipped_at IS NULL)
    OR (status = 'confirmed'
      AND actual_meal_id IS NOT NULL AND confirmation_mode IS NOT NULL
      AND confirmed_at IS NOT NULL AND skipped_at IS NULL)
    OR (status = 'deviated'
      AND actual_meal_id IS NOT NULL AND confirmation_mode IS NOT NULL
      AND confirmed_at IS NOT NULL AND skipped_at IS NULL
      AND deviation_kcal IS NOT NULL AND deviation_pct IS NOT NULL)
    OR (status = 'skipped'
      AND actual_meal_id IS NULL AND confirmation_mode IS NULL
      AND confirmed_at IS NULL AND skipped_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_logs_user_execution
  ON nutrition.meal_plan_logs(user_id, execution_date, status);
CREATE INDEX IF NOT EXISTS idx_meal_plan_logs_plan_execution
  ON nutrition.meal_plan_logs(plan_id, execution_date, status);

DROP TRIGGER IF EXISTS meal_plan_logs_touch_updated_at ON nutrition.meal_plan_logs;
CREATE TRIGGER meal_plan_logs_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_plan_logs
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- -------------------------------------------------------------
-- 3. Einkaufslisten
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.shopping_lists (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  name               TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  source_type        TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual','recipe','meal_plan','supplement_reorder')),
  recipe_id          UUID REFERENCES nutrition.recipes(id) ON DELETE SET NULL,
  meal_plan_week_id  UUID REFERENCES nutrition.meal_plan_weeks(id) ON DELETE SET NULL,
  servings           NUMERIC(8,3) NOT NULL DEFAULT 1 CHECK (servings > 0),
  status             TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','completed','archived')),
  measurement_source TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual','device','import','admin','seed')),
  source_detail      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT shopping_lists_source_target_check CHECK (
    (source_type = 'recipe' AND recipe_id IS NOT NULL AND meal_plan_week_id IS NULL) OR
    (source_type = 'meal_plan' AND recipe_id IS NULL AND meal_plan_week_id IS NOT NULL) OR
    (source_type IN ('manual','supplement_reorder') AND recipe_id IS NULL AND meal_plan_week_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user
  ON nutrition.shopping_lists(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_recipe
  ON nutrition.shopping_lists(recipe_id)
  WHERE recipe_id IS NOT NULL;

DROP TRIGGER IF EXISTS shopping_lists_touch_updated_at ON nutrition.shopping_lists;
CREATE TRIGGER shopping_lists_touch_updated_at
  BEFORE UPDATE ON nutrition.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.shopping_list_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id    UUID NOT NULL REFERENCES nutrition.shopping_lists(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  item_source         TEXT NOT NULL DEFAULT 'free_text'
    CHECK (item_source IN ('bls','custom','free_text')),
  food_id             UUID REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  custom_food_id      UUID REFERENCES nutrition.foods_custom(id) ON DELETE RESTRICT,
  food_name           TEXT NOT NULL CHECK (length(trim(food_name)) >= 1),
  amount_g            NUMERIC(10,2) CHECK (amount_g IS NULL OR amount_g > 0),
  quantity            NUMERIC(10,3) CHECK (quantity IS NULL OR quantity > 0),
  unit_display        TEXT NOT NULL DEFAULT 'g',
  is_checked          BOOLEAN NOT NULL DEFAULT false,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT shopping_list_items_source_target_check CHECK (
    (item_source = 'bls' AND food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (item_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL) OR
    (item_source = 'free_text' AND food_id IS NULL AND custom_food_id IS NULL)
  ),
  CONSTRAINT shopping_list_items_amount_or_quantity_check CHECK (
    amount_g IS NOT NULL OR quantity IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list
  ON nutrition.shopping_list_items(shopping_list_id, is_checked, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user
  ON nutrition.shopping_list_items(user_id);

DROP TRIGGER IF EXISTS shopping_list_items_touch_updated_at ON nutrition.shopping_list_items;
CREATE TRIGGER shopping_list_items_touch_updated_at
  BEFORE UPDATE ON nutrition.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- -------------------------------------------------------------
-- 4. Owner-Guards fuer die denormalisierten user_id-Spalten.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.recipe_ingredients_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_owner UUID;
  v_custom_owner UUID;
BEGIN
  SELECT r.user_id INTO v_owner
  FROM nutrition.recipes r
  WHERE r.id = NEW.recipe_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'recipe_ingredients.recipe_id % existiert nicht', NEW.recipe_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_owner THEN
    RAISE EXCEPTION 'recipe_ingredients.user_id (%) weicht von recipes.user_id (%) ab',
      NEW.user_id, v_owner USING ERRCODE = '23514';
  END IF;

  IF NEW.custom_food_id IS NOT NULL THEN
    SELECT fc.user_id INTO v_custom_owner
    FROM nutrition.foods_custom fc
    WHERE fc.id = NEW.custom_food_id;
    IF v_custom_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'recipe_ingredients.custom_food_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS recipe_ingredients_owner_guard_trg ON nutrition.recipe_ingredients;
CREATE TRIGGER recipe_ingredients_owner_guard_trg
  BEFORE INSERT OR UPDATE OF recipe_id, user_id, custom_food_id
  ON nutrition.recipe_ingredients
  FOR EACH ROW EXECUTE FUNCTION nutrition.recipe_ingredients_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.meal_plan_weeks_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_owner UUID;
BEGIN
  SELECT p.user_id INTO v_owner
  FROM nutrition.meal_plans p
  WHERE p.id = NEW.plan_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'meal_plan_weeks.plan_id % existiert nicht', NEW.plan_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_owner THEN
    RAISE EXCEPTION 'meal_plan_weeks.user_id (%) weicht von meal_plans.user_id (%) ab',
      NEW.user_id, v_owner USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS meal_plan_weeks_owner_guard_trg ON nutrition.meal_plan_weeks;
CREATE TRIGGER meal_plan_weeks_owner_guard_trg
  BEFORE INSERT OR UPDATE OF plan_id, user_id
  ON nutrition.meal_plan_weeks
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_weeks_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.meal_plan_days_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_owner UUID;
BEGIN
  SELECT w.user_id INTO v_owner
  FROM nutrition.meal_plan_weeks w
  WHERE w.id = NEW.week_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'meal_plan_days.week_id % existiert nicht', NEW.week_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_owner THEN
    RAISE EXCEPTION 'meal_plan_days.user_id (%) weicht von meal_plan_weeks.user_id (%) ab',
      NEW.user_id, v_owner USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS meal_plan_days_owner_guard_trg ON nutrition.meal_plan_days;
CREATE TRIGGER meal_plan_days_owner_guard_trg
  BEFORE INSERT OR UPDATE OF week_id, user_id
  ON nutrition.meal_plan_days
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_days_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.meal_plan_entries_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_owner UUID;
  v_recipe_owner UUID;
  v_custom_owner UUID;
BEGIN
  SELECT d.user_id INTO v_owner
  FROM nutrition.meal_plan_days d
  WHERE d.id = NEW.day_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'meal_plan_entries.day_id % existiert nicht', NEW.day_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_owner THEN
    RAISE EXCEPTION 'meal_plan_entries.user_id (%) weicht von meal_plan_days.user_id (%) ab',
      NEW.user_id, v_owner USING ERRCODE = '23514';
  END IF;

  IF NEW.recipe_id IS NOT NULL THEN
    SELECT r.user_id INTO v_recipe_owner
    FROM nutrition.recipes r
    WHERE r.id = NEW.recipe_id;
    IF v_recipe_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'meal_plan_entries.recipe_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.custom_food_id IS NOT NULL THEN
    SELECT fc.user_id INTO v_custom_owner
    FROM nutrition.foods_custom fc
    WHERE fc.id = NEW.custom_food_id;
    IF v_custom_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'meal_plan_entries.custom_food_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS meal_plan_entries_owner_guard_trg ON nutrition.meal_plan_entries;
CREATE TRIGGER meal_plan_entries_owner_guard_trg
  BEFORE INSERT OR UPDATE OF day_id, user_id, recipe_id, custom_food_id
  ON nutrition.meal_plan_entries
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_entries_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.meal_plan_logs_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_plan_id UUID;
  v_entry_owner UUID;
  v_meal_owner UUID;
BEGIN
  SELECT w.plan_id, e.user_id
  INTO v_plan_id, v_entry_owner
  FROM nutrition.meal_plan_entries e
  JOIN nutrition.meal_plan_days d ON d.id = e.day_id
  JOIN nutrition.meal_plan_weeks w ON w.id = d.week_id
  WHERE e.id = NEW.plan_entry_id;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'meal_plan_logs.plan_entry_id % existiert nicht', NEW.plan_entry_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.plan_id <> v_plan_id THEN
    RAISE EXCEPTION 'meal_plan_logs.plan_id gehoert nicht zum plan_entry_id'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.user_id <> v_entry_owner THEN
    RAISE EXCEPTION 'meal_plan_logs.user_id gehoert nicht zum plan_entry_id'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.actual_meal_id IS NOT NULL THEN
    SELECT m.user_id INTO v_meal_owner
    FROM nutrition.meals m
    WHERE m.id = NEW.actual_meal_id;
    IF v_meal_owner IS NULL OR v_meal_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'meal_plan_logs.actual_meal_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS meal_plan_logs_owner_guard_trg ON nutrition.meal_plan_logs;
CREATE TRIGGER meal_plan_logs_owner_guard_trg
  BEFORE INSERT OR UPDATE OF plan_id, plan_entry_id, user_id, actual_meal_id
  ON nutrition.meal_plan_logs
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_logs_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.shopping_lists_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_recipe_owner UUID;
  v_week_owner UUID;
BEGIN
  IF NEW.recipe_id IS NOT NULL THEN
    SELECT r.user_id INTO v_recipe_owner
    FROM nutrition.recipes r
    WHERE r.id = NEW.recipe_id;
    IF v_recipe_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'shopping_lists.recipe_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.meal_plan_week_id IS NOT NULL THEN
    SELECT w.user_id INTO v_week_owner
    FROM nutrition.meal_plan_weeks w
    WHERE w.id = NEW.meal_plan_week_id;
    IF v_week_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'shopping_lists.meal_plan_week_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS shopping_lists_owner_guard_trg ON nutrition.shopping_lists;
CREATE TRIGGER shopping_lists_owner_guard_trg
  BEFORE INSERT OR UPDATE OF user_id, recipe_id, meal_plan_week_id
  ON nutrition.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION nutrition.shopping_lists_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.shopping_list_items_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_list_owner UUID;
  v_custom_owner UUID;
BEGIN
  SELECT sl.user_id INTO v_list_owner
  FROM nutrition.shopping_lists sl
  WHERE sl.id = NEW.shopping_list_id;

  IF v_list_owner IS NULL THEN
    RAISE EXCEPTION 'shopping_list_items.shopping_list_id % existiert nicht', NEW.shopping_list_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_list_owner THEN
    RAISE EXCEPTION 'shopping_list_items.user_id (%) weicht von shopping_lists.user_id (%) ab',
      NEW.user_id, v_list_owner USING ERRCODE = '23514';
  END IF;

  IF NEW.custom_food_id IS NOT NULL THEN
    SELECT fc.user_id INTO v_custom_owner
    FROM nutrition.foods_custom fc
    WHERE fc.id = NEW.custom_food_id;
    IF v_custom_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'shopping_list_items.custom_food_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS shopping_list_items_owner_guard_trg ON nutrition.shopping_list_items;
CREATE TRIGGER shopping_list_items_owner_guard_trg
  BEFORE INSERT OR UPDATE OF shopping_list_id, user_id, custom_food_id
  ON nutrition.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.shopping_list_items_owner_guard();

-- -------------------------------------------------------------
-- 5. Nährwert-Helfer: BLS-EAV und Custom-Food-Flachspalten auf eine
--    Snapshot-Form bringen. Werte gelten je p_amount_g.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.food_nutrient_snapshot(
  p_food_source text,
  p_food_id uuid,
  p_custom_food_id uuid,
  p_amount_g numeric
)
RETURNS TABLE (
  food_name text,
  enercc numeric,
  prot625 numeric,
  fat numeric,
  cho numeric,
  fibt numeric,
  sugar numeric,
  fasat numeric,
  nacl numeric,
  water_g numeric,
  nutrients jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF p_amount_g IS NULL OR p_amount_g <= 0 THEN
    RAISE EXCEPTION 'food_nutrient_snapshot: amount_g muss > 0 sein'
      USING ERRCODE = '23514';
  END IF;

  IF p_food_source = 'bls' THEN
    RETURN QUERY
    SELECT
      COALESCE(NULLIF(f.name_display_de, ''), f.name_de) AS food_name,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'ENERCC') AS enercc,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'PROT625') AS prot625,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'FAT') AS fat,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'CHO') AS cho,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'FIBT') AS fibt,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'SUGAR') AS sugar,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'FASAT') AS fasat,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'NACL') AS nacl,
      max(round(fn.value * p_amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'WATER') AS water_g,
      COALESCE(jsonb_object_agg(fn.nutrient_code, round(fn.value * p_amount_g / 100, 5))
        FILTER (WHERE fn.nutrient_code IS NOT NULL AND fn.value IS NOT NULL), '{}'::jsonb) AS nutrients
    FROM nutrition.foods f
    LEFT JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
    WHERE f.id = p_food_id
    GROUP BY f.id, f.name_display_de, f.name_de;

    RETURN;
  END IF;

  IF p_food_source = 'custom' THEN
    RETURN QUERY
    SELECT
      fc.name_de AS food_name,
      round(fc.enercc * p_amount_g / 100, 5) AS enercc,
      round(fc.prot625 * p_amount_g / 100, 5) AS prot625,
      round(fc.fat * p_amount_g / 100, 5) AS fat,
      round(fc.cho * p_amount_g / 100, 5) AS cho,
      round(fc.fibt * p_amount_g / 100, 5) AS fibt,
      round(fc.sugar * p_amount_g / 100, 5) AS sugar,
      round(fc.fasat * p_amount_g / 100, 5) AS fasat,
      round(fc.nacl * p_amount_g / 100, 5) AS nacl,
      round(fc.water_g * p_amount_g / 100, 5) AS water_g,
      jsonb_strip_nulls(jsonb_build_object(
        'ENERCC', round(fc.enercc * p_amount_g / 100, 5),
        'PROT625', round(fc.prot625 * p_amount_g / 100, 5),
        'FAT', round(fc.fat * p_amount_g / 100, 5),
        'CHO', round(fc.cho * p_amount_g / 100, 5),
        'FIBT', round(fc.fibt * p_amount_g / 100, 5),
        'SUGAR', round(fc.sugar * p_amount_g / 100, 5),
        'FASAT', round(fc.fasat * p_amount_g / 100, 5),
        'NACL', round(fc.nacl * p_amount_g / 100, 5),
        'WATER', round(fc.water_g * p_amount_g / 100, 5),
        'ALC', round(fc.alc * p_amount_g / 100, 5),
        'VITA', round(fc.vita_ug * p_amount_g / 100, 5),
        'VITD', round(fc.vitd_ug * p_amount_g / 100, 5),
        'VITE', round(fc.vite_mg * p_amount_g / 100, 5),
        'VITK', round(fc.vitk_ug * p_amount_g / 100, 5),
        'VITC', round(fc.vitc_mg * p_amount_g / 100, 5),
        'THIA', round(fc.thia_mg * p_amount_g / 100, 5),
        'RIBF', round(fc.ribf_mg * p_amount_g / 100, 5),
        'NIA', round(fc.nia_mg * p_amount_g / 100, 5),
        'VITB6', round(fc.vitb6_ug * p_amount_g / 100, 5),
        'FOL', round(fc.fol_ug * p_amount_g / 100, 5),
        'VITB12', round(fc.vitb12_ug * p_amount_g / 100, 5),
        'NA', round(fc.na_mg * p_amount_g / 100, 5),
        'K', round(fc.k_mg * p_amount_g / 100, 5),
        'CA', round(fc.ca_mg * p_amount_g / 100, 5),
        'MG', round(fc.mg_mg * p_amount_g / 100, 5),
        'P', round(fc.p_mg * p_amount_g / 100, 5),
        'FE', round(fc.fe_mg * p_amount_g / 100, 5),
        'ZN', round(fc.zn_mg * p_amount_g / 100, 5),
        'ID', round(fc.id_ug * p_amount_g / 100, 5),
        'CU', round(fc.cu_ug * p_amount_g / 100, 5),
        'MN', round(fc.mn_ug * p_amount_g / 100, 5)
      )) AS nutrients
    FROM nutrition.foods_custom fc
    WHERE fc.id = p_custom_food_id;

    RETURN;
  END IF;

  RAISE EXCEPTION 'food_nutrient_snapshot: unbekannte Quelle %', p_food_source
    USING ERRCODE = '23514';
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.recipe_nutrition(
  p_recipe_id uuid,
  p_servings numeric DEFAULT NULL
)
RETURNS TABLE (
  recipe_id uuid,
  servings_used numeric,
  ingredient_count integer,
  amount_g numeric,
  enercc numeric,
  prot625 numeric,
  fat numeric,
  cho numeric,
  fibt numeric,
  sugar numeric,
  fasat numeric,
  nacl numeric,
  water_g numeric,
  nutrients jsonb
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $function$
WITH recipe AS (
  SELECT r.id, r.servings, COALESCE(p_servings, r.servings) AS servings_used
  FROM nutrition.recipes r
  WHERE r.id = p_recipe_id
),
scaled AS (
  SELECT
    ri.id,
    ri.recipe_id,
    (ri.amount_g * recipe.servings_used / recipe.servings) AS amount_g,
    snap.enercc,
    snap.prot625,
    snap.fat,
    snap.cho,
    snap.fibt,
    snap.sugar,
    snap.fasat,
    snap.nacl,
    snap.water_g,
    snap.nutrients
  FROM recipe
  JOIN nutrition.recipe_ingredients ri ON ri.recipe_id = recipe.id
  CROSS JOIN LATERAL nutrition.food_nutrient_snapshot(
    ri.food_source,
    ri.food_id,
    ri.custom_food_id,
    ri.amount_g * recipe.servings_used / recipe.servings
  ) snap
)
SELECT
  recipe.id AS recipe_id,
  recipe.servings_used,
  count(scaled.id)::integer AS ingredient_count,
  sum(scaled.amount_g) AS amount_g,
  sum(scaled.enercc) AS enercc,
  sum(scaled.prot625) AS prot625,
  sum(scaled.fat) AS fat,
  sum(scaled.cho) AS cho,
  sum(scaled.fibt) AS fibt,
  sum(scaled.sugar) AS sugar,
  sum(scaled.fasat) AS fasat,
  sum(scaled.nacl) AS nacl,
  sum(scaled.water_g) AS water_g,
  COALESCE(
    (
      SELECT jsonb_object_agg(code, round(total, 5))
      FROM (
        SELECT n.key AS code, sum((n.value #>> '{}')::numeric) AS total
        FROM scaled s
        CROSS JOIN LATERAL jsonb_each(s.nutrients) AS n(key, value)
        GROUP BY n.key
      ) totals
    ),
    '{}'::jsonb
  ) AS nutrients
FROM recipe
LEFT JOIN scaled ON scaled.recipe_id = recipe.id
GROUP BY recipe.id, recipe.servings_used;
$function$;

-- -------------------------------------------------------------
-- 6. Copy week und Uebernahme ins Tagebuch.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.copy_meal_plan_week(
  p_week_id uuid,
  p_target_week_start date
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_old nutrition.meal_plan_weeks%ROWTYPE;
  v_new_week_id uuid := gen_random_uuid();
  v_auth uuid := auth.uid();
BEGIN
  SELECT * INTO v_old
  FROM nutrition.meal_plan_weeks
  WHERE id = p_week_id;

  IF v_old.id IS NULL THEN
    RAISE EXCEPTION 'copy_meal_plan_week: Woche % nicht gefunden', p_week_id
      USING ERRCODE = '02000';
  END IF;
  IF v_auth IS NOT NULL AND v_old.user_id <> v_auth THEN
    RAISE EXCEPTION 'copy_meal_plan_week: fremde Woche'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO nutrition.meal_plan_weeks (
    id, plan_id, user_id, week_start, name, copied_from_week_id
  )
  VALUES (
    v_new_week_id,
    v_old.plan_id,
    v_old.user_id,
    p_target_week_start,
    COALESCE(v_old.name, 'Kopierte Woche'),
    v_old.id
  );

  INSERT INTO nutrition.meal_plan_days (
    week_id, user_id, plan_date, day_index, notes
  )
  SELECT
    v_new_week_id,
    d.user_id,
    p_target_week_start + (d.day_index - 1),
    d.day_index,
    d.notes
  FROM nutrition.meal_plan_days d
  WHERE d.week_id = v_old.id
  ORDER BY d.day_index;

  INSERT INTO nutrition.meal_plan_entries (
    day_id, user_id, meal_type, planned_time, slot_order, entry_type,
    recipe_id, food_id, custom_food_id, amount_g, planned_servings,
    portion_name, portion_quantity, portion_amount_g, note
  )
  SELECT
    nd.id,
    e.user_id,
    e.meal_type,
    e.planned_time,
    e.slot_order,
    e.entry_type,
    e.recipe_id,
    e.food_id,
    e.custom_food_id,
    e.amount_g,
    e.planned_servings,
    e.portion_name,
    e.portion_quantity,
    e.portion_amount_g,
    e.note
  FROM nutrition.meal_plan_entries e
  JOIN nutrition.meal_plan_days od ON od.id = e.day_id
  JOIN nutrition.meal_plan_days nd
    ON nd.week_id = v_new_week_id
   AND nd.day_index = od.day_index
  WHERE od.week_id = v_old.id
  ORDER BY od.day_index, e.meal_type, e.slot_order;

  RETURN v_new_week_id;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.meal_plan_day_to_diary(
  p_day_id uuid,
  p_entry_date date DEFAULT NULL
)
RETURNS TABLE (
  meal_id uuid,
  meal_type text,
  item_count integer
)
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_day nutrition.meal_plan_days%ROWTYPE;
  v_auth uuid := auth.uid();
  v_entry_date date;
  v_slot record;
  v_meal_id uuid;
  v_inserted integer;
  v_scale numeric;
  v_food record;
BEGIN
  SELECT * INTO v_day
  FROM nutrition.meal_plan_days
  WHERE id = p_day_id;

  IF v_day.id IS NULL THEN
    RAISE EXCEPTION 'meal_plan_day_to_diary: Plantag % nicht gefunden', p_day_id
      USING ERRCODE = '02000';
  END IF;
  IF v_auth IS NOT NULL AND v_day.user_id <> v_auth THEN
    RAISE EXCEPTION 'meal_plan_day_to_diary: fremder Plantag'
      USING ERRCODE = '42501';
  END IF;

  v_entry_date := COALESCE(p_entry_date, v_day.plan_date);

  FOR v_slot IN
    SELECT
      e.meal_type,
      COALESCE(min(e.planned_time), CASE e.meal_type
        WHEN 'breakfast' THEN TIME '07:30'
        WHEN 'lunch' THEN TIME '12:30'
        WHEN 'snack' THEN TIME '16:00'
        WHEN 'dinner' THEN TIME '19:30'
        WHEN 'pre_workout' THEN TIME '17:00'
        WHEN 'post_workout' THEN TIME '19:00'
        ELSE TIME '12:00'
      END) AS meal_time
    FROM nutrition.meal_plan_entries e
    WHERE e.day_id = v_day.id
    GROUP BY e.meal_type
    ORDER BY min(COALESCE(e.planned_time, TIME '12:00')), e.meal_type
  LOOP
    v_meal_id := gen_random_uuid();

    INSERT INTO nutrition.meals (
      id, user_id, entry_date, meal_type, meal_time, notes,
      entry_source, source_detail
    )
    VALUES (
      v_meal_id,
      v_day.user_id,
      v_entry_date,
      v_slot.meal_type,
      v_slot.meal_time,
      'Aus Wochenplan uebernommen',
      'seed',
      'meal_plan_day_to_diary'
    );

    v_inserted := 0;

    FOR v_food IN
      SELECT
        e.entry_type AS food_source,
        e.food_id,
        e.custom_food_id,
        e.amount_g,
        e.portion_name,
        e.portion_quantity,
        e.portion_amount_g
      FROM nutrition.meal_plan_entries e
      WHERE e.day_id = v_day.id
        AND e.meal_type = v_slot.meal_type
        AND e.entry_type IN ('bls','custom')
      UNION ALL
      SELECT
        ri.food_source,
        ri.food_id,
        ri.custom_food_id,
        round(ri.amount_g * e.planned_servings / r.servings, 2) AS amount_g,
        ri.portion_name,
        CASE
          WHEN ri.portion_quantity IS NULL THEN NULL
          ELSE round(ri.portion_quantity * e.planned_servings / r.servings, 3)
        END AS portion_quantity,
        ri.portion_amount_g
      FROM nutrition.meal_plan_entries e
      JOIN nutrition.recipes r ON r.id = e.recipe_id
      JOIN nutrition.recipe_ingredients ri ON ri.recipe_id = r.id
      WHERE e.day_id = v_day.id
        AND e.meal_type = v_slot.meal_type
        AND e.entry_type = 'recipe'
      ORDER BY food_source, amount_g DESC
    LOOP
      INSERT INTO nutrition.meal_items (
        meal_id, user_id, food_id, food_source, custom_food_id,
        food_name, amount_g,
        portion_name, portion_quantity, portion_amount_g,
        enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g,
        nutrients, measurement_source, source_detail
      )
      SELECT
        v_meal_id,
        v_day.user_id,
        CASE WHEN v_food.food_source = 'bls' THEN v_food.food_id ELSE NULL END,
        v_food.food_source,
        CASE WHEN v_food.food_source = 'custom' THEN v_food.custom_food_id ELSE NULL END,
        snap.food_name,
        v_food.amount_g,
        v_food.portion_name,
        v_food.portion_quantity,
        v_food.portion_amount_g,
        snap.enercc,
        snap.prot625,
        snap.fat,
        snap.cho,
        snap.fibt,
        snap.sugar,
        snap.fasat,
        snap.nacl,
        snap.water_g,
        snap.nutrients,
        'seed',
        'Aus Wochenplan uebernommen'
      FROM nutrition.food_nutrient_snapshot(
        v_food.food_source,
        v_food.food_id,
        v_food.custom_food_id,
        v_food.amount_g
      ) snap;

      v_inserted := v_inserted + 1;
    END LOOP;

    meal_id := v_meal_id;
    meal_type := v_slot.meal_type;
    item_count := v_inserted;
    RETURN NEXT;
  END LOOP;
END;
$function$;

-- -------------------------------------------------------------
-- 7. Rechte und Zeilenschutz.
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.recipes,
  nutrition.recipe_ingredients,
  nutrition.meal_plans,
  nutrition.meal_plan_weeks,
  nutrition.meal_plan_days,
  nutrition.meal_plan_entries,
  nutrition.meal_plan_logs,
  nutrition.shopping_lists,
  nutrition.shopping_list_items
TO authenticated;

GRANT ALL ON
  nutrition.recipes,
  nutrition.recipe_ingredients,
  nutrition.meal_plans,
  nutrition.meal_plan_weeks,
  nutrition.meal_plan_days,
  nutrition.meal_plan_entries,
  nutrition.meal_plan_logs,
  nutrition.shopping_lists,
  nutrition.shopping_list_items
TO service_role;

REVOKE ALL ON FUNCTION nutrition.food_nutrient_snapshot(text, uuid, uuid, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.recipe_nutrition(uuid, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.copy_meal_plan_week(uuid, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.meal_plan_day_to_diary(uuid, date) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION nutrition.food_nutrient_snapshot(text, uuid, uuid, numeric)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.recipe_nutrition(uuid, numeric)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.copy_meal_plan_week(uuid, date)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.meal_plan_day_to_diary(uuid, date)
  TO authenticated, service_role;

ALTER TABLE nutrition.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.meal_plan_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.meal_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.meal_plan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recipes_select ON nutrition.recipes;
DROP POLICY IF EXISTS recipes_insert ON nutrition.recipes;
DROP POLICY IF EXISTS recipes_update ON nutrition.recipes;
DROP POLICY IF EXISTS recipes_delete ON nutrition.recipes;
CREATE POLICY recipes_select ON nutrition.recipes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY recipes_insert ON nutrition.recipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipes_update ON nutrition.recipes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipes_delete ON nutrition.recipes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS recipe_ingredients_select ON nutrition.recipe_ingredients;
DROP POLICY IF EXISTS recipe_ingredients_insert ON nutrition.recipe_ingredients;
DROP POLICY IF EXISTS recipe_ingredients_update ON nutrition.recipe_ingredients;
DROP POLICY IF EXISTS recipe_ingredients_delete ON nutrition.recipe_ingredients;
CREATE POLICY recipe_ingredients_select ON nutrition.recipe_ingredients
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY recipe_ingredients_insert ON nutrition.recipe_ingredients
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipe_ingredients_update ON nutrition.recipe_ingredients
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipe_ingredients_delete ON nutrition.recipe_ingredients
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meal_plans_select ON nutrition.meal_plans;
DROP POLICY IF EXISTS meal_plans_insert ON nutrition.meal_plans;
DROP POLICY IF EXISTS meal_plans_update ON nutrition.meal_plans;
DROP POLICY IF EXISTS meal_plans_delete ON nutrition.meal_plans;
CREATE POLICY meal_plans_select ON nutrition.meal_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_plans_insert ON nutrition.meal_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plans_update ON nutrition.meal_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plans_delete ON nutrition.meal_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meal_plan_weeks_select ON nutrition.meal_plan_weeks;
DROP POLICY IF EXISTS meal_plan_weeks_insert ON nutrition.meal_plan_weeks;
DROP POLICY IF EXISTS meal_plan_weeks_update ON nutrition.meal_plan_weeks;
DROP POLICY IF EXISTS meal_plan_weeks_delete ON nutrition.meal_plan_weeks;
CREATE POLICY meal_plan_weeks_select ON nutrition.meal_plan_weeks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_plan_weeks_insert ON nutrition.meal_plan_weeks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_weeks_update ON nutrition.meal_plan_weeks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_weeks_delete ON nutrition.meal_plan_weeks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meal_plan_days_select ON nutrition.meal_plan_days;
DROP POLICY IF EXISTS meal_plan_days_insert ON nutrition.meal_plan_days;
DROP POLICY IF EXISTS meal_plan_days_update ON nutrition.meal_plan_days;
DROP POLICY IF EXISTS meal_plan_days_delete ON nutrition.meal_plan_days;
CREATE POLICY meal_plan_days_select ON nutrition.meal_plan_days
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_plan_days_insert ON nutrition.meal_plan_days
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_days_update ON nutrition.meal_plan_days
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_days_delete ON nutrition.meal_plan_days
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meal_plan_entries_select ON nutrition.meal_plan_entries;
DROP POLICY IF EXISTS meal_plan_entries_insert ON nutrition.meal_plan_entries;
DROP POLICY IF EXISTS meal_plan_entries_update ON nutrition.meal_plan_entries;
DROP POLICY IF EXISTS meal_plan_entries_delete ON nutrition.meal_plan_entries;
CREATE POLICY meal_plan_entries_select ON nutrition.meal_plan_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_plan_entries_insert ON nutrition.meal_plan_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_entries_update ON nutrition.meal_plan_entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_entries_delete ON nutrition.meal_plan_entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meal_plan_logs_select ON nutrition.meal_plan_logs;
DROP POLICY IF EXISTS meal_plan_logs_insert ON nutrition.meal_plan_logs;
DROP POLICY IF EXISTS meal_plan_logs_update ON nutrition.meal_plan_logs;
DROP POLICY IF EXISTS meal_plan_logs_delete ON nutrition.meal_plan_logs;
CREATE POLICY meal_plan_logs_select ON nutrition.meal_plan_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_plan_logs_insert ON nutrition.meal_plan_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_logs_update ON nutrition.meal_plan_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_logs_delete ON nutrition.meal_plan_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS shopping_lists_select ON nutrition.shopping_lists;
DROP POLICY IF EXISTS shopping_lists_insert ON nutrition.shopping_lists;
DROP POLICY IF EXISTS shopping_lists_update ON nutrition.shopping_lists;
DROP POLICY IF EXISTS shopping_lists_delete ON nutrition.shopping_lists;
CREATE POLICY shopping_lists_select ON nutrition.shopping_lists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY shopping_lists_insert ON nutrition.shopping_lists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_lists_update ON nutrition.shopping_lists
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_lists_delete ON nutrition.shopping_lists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS shopping_list_items_select ON nutrition.shopping_list_items;
DROP POLICY IF EXISTS shopping_list_items_insert ON nutrition.shopping_list_items;
DROP POLICY IF EXISTS shopping_list_items_update ON nutrition.shopping_list_items;
DROP POLICY IF EXISTS shopping_list_items_delete ON nutrition.shopping_list_items;
CREATE POLICY shopping_list_items_select ON nutrition.shopping_list_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY shopping_list_items_insert ON nutrition.shopping_list_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_list_items_update ON nutrition.shopping_list_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_list_items_delete ON nutrition.shopping_list_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMENT ON TABLE nutrition.recipes IS
  'C-150: user-private Rezepte; Naehrwerte werden aus Zutaten berechnet, nicht als zweite Wahrheit gespeichert.';
COMMENT ON TABLE nutrition.meal_plan_weeks IS
  'C-150: Wocheninstanz eines Meal Plans. copied_from_week_id dokumentiert Copy week.';
COMMENT ON TABLE nutrition.meal_plan_logs IS
  'C-238: Ausfuehrung eines Plan-Entries an einem Kalendertag. pending bleibt offen, bis der User auch rueckwirkend bestaetigt oder ueberspringt; die Vorlage meal_plan_entries bleibt unveraendert.';
COMMENT ON FUNCTION nutrition.meal_plan_day_to_diary(uuid, date) IS
  'C-150: uebernimmt einen geplanten Tag als normale meals/meal_items und friert Naehrwerte erst dort ein.';
COMMENT ON TABLE nutrition.shopping_lists IS
  'C-187/C-150: user-private Einkaufslisten aus Rezept, Wochenplan oder manuell. Supplements-Reorder kann bis zu einem eigenen Einkaufsmodell free_text-Positionen anlegen.';
COMMENT ON TABLE nutrition.shopping_list_items IS
  'C-187/C-150: Einkaufslistenpositionen mit optionalem Food-/Custom-Food-Bezug; free_text bleibt fuer nicht-nutrition Artikel sichtbar statt geraten.';

DO $$
DECLARE
  v_tables integer;
  v_policies integer;
  v_columns integer;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'nutrition'
    AND table_name IN ('shopping_lists', 'shopping_list_items')
    AND table_type = 'BASE TABLE';

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'nutrition'
    AND tablename IN ('shopping_lists', 'shopping_list_items');

  SELECT count(*) INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'nutrition'
    AND table_name = 'shopping_list_items'
    AND column_name IN ('item_source', 'food_id', 'custom_food_id', 'food_name', 'amount_g', 'quantity', 'unit_display', 'is_checked');

  IF v_tables <> 2 THEN
    RAISE EXCEPTION 'C-187 shopping tables: %, erwartet 2', v_tables;
  END IF;
  IF v_policies <> 8 THEN
    RAISE EXCEPTION 'C-187 shopping policies: %, erwartet 8', v_policies;
  END IF;
  IF v_columns <> 8 THEN
    RAISE EXCEPTION 'C-187 shopping item columns: %, erwartet 8', v_columns;
  END IF;
END $$;

COMMIT;
