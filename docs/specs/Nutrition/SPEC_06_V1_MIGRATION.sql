-- ============================================================
-- SPEC_06 V1 MIGRATION PATCH — April 2026
-- Datei: SPEC_06_V1_MIGRATION.sql
-- Enthält alle Änderungen aus dem V1-Entscheidungsdokument
-- ============================================================

-- --------------------------------------------------------
-- FIX 1: food_categories — name_th ergänzen
-- --------------------------------------------------------
ALTER TABLE nutrition.food_categories
  ADD COLUMN IF NOT EXISTS name_th TEXT;

-- --------------------------------------------------------
-- FIX 2: foods_custom — source bereinigen (openfoodfacts entfernt)
-- --------------------------------------------------------
-- Alte Constraint entfernen (name ermitteln via information_schema)
ALTER TABLE nutrition.foods_custom
  DROP CONSTRAINT IF EXISTS foods_custom_source_check;

ALTER TABLE nutrition.foods_custom
  ADD CONSTRAINT foods_custom_source_check
    CHECK (source IN ('user','manual','import','admin'));

-- Alte mealcam-Werte migrieren falls vorhanden
UPDATE nutrition.foods_custom SET source = 'user' WHERE source = 'mealcam';
UPDATE nutrition.foods_custom SET source = 'user' WHERE source = 'openfoodfacts';

-- --------------------------------------------------------
-- FIX 3: foods_custom — name_th ergänzen
-- --------------------------------------------------------
ALTER TABLE nutrition.foods_custom
  ADD COLUMN IF NOT EXISTS name_th TEXT;

-- --------------------------------------------------------
-- NEU: nutrient_reference_values
-- Speichert RDA/AI/UL pro Nährstoff, Alter-Range, Geschlecht
-- V1 aktiv: Alter + Geschlecht
-- V1 schema-vorbereitet: is_pregnant, is_lactating
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.nutrient_reference_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_code   TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  unit            TEXT NOT NULL,

  -- Gültigkeitsbereich
  age_min         INTEGER,         -- Mindestalter (inkl.)
  age_max         INTEGER,         -- Maximalalter (inkl.) — NULL = unbegrenzt
  sex             TEXT CHECK (sex IN ('male','female','both')),
  is_pregnant     BOOLEAN DEFAULT false,  -- Schema vorbereitet, V1 nicht aktiv
  is_lactating    BOOLEAN DEFAULT false,  -- Schema vorbereitet, V1 nicht aktiv

  -- Referenzwerte
  rda             NUMERIC(12,4),   -- Recommended Dietary Allowance
  ai              NUMERIC(12,4),   -- Adequate Intake (wenn kein RDA)
  ul              NUMERIC(12,4),   -- Upper Limit — NULL wenn kein UL belegt
  target_min      NUMERIC(12,4),   -- belegbarer Zielbereich Minimum
  target_max      NUMERIC(12,4),   -- belegbarer Zielbereich Maximum

  -- Metadaten
  source          TEXT NOT NULL,   -- z.B. 'DACH 2020', 'EFSA 2017', 'IOM 2011'
  source_version  TEXT,
  notes           TEXT,
  effective_from  DATE NOT NULL DEFAULT '2020-01-01',

  CONSTRAINT uq_nutrient_ref_values
    UNIQUE (nutrient_code, age_min, age_max, sex, is_pregnant, is_lactating, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_nutrient_ref_code ON nutrition.nutrient_reference_values(nutrient_code);
CREATE INDEX IF NOT EXISTS idx_nutrient_ref_sex  ON nutrition.nutrient_reference_values(sex, age_min, age_max);

ALTER TABLE nutrition.nutrient_reference_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrient_ref_select" ON nutrition.nutrient_reference_values FOR SELECT USING (true);

-- --------------------------------------------------------
-- NEU: food_portions
-- Portionsgrößen pro Food
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.food_portions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id         UUID REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  custom_food_id  UUID REFERENCES nutrition.foods_custom(id) ON DELETE CASCADE,

  portion_name_de TEXT NOT NULL,   -- z.B. "1 Stück", "1 Scheibe", "1 Glas"
  portion_name_en TEXT,
  portion_name_th TEXT,
  amount_g        NUMERIC(8,2) NOT NULL,  -- Gramm-Äquivalent
  sort_order      INTEGER DEFAULT 0,

  -- Quelle: aus BLS importiert, oder user-definiert
  source          TEXT NOT NULL DEFAULT 'editorial'
    CHECK (source IN ('editorial','bls_import','user')),

  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT food_portions_one_food CHECK (
    (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_food_portions_food   ON nutrition.food_portions(food_id);
CREATE INDEX IF NOT EXISTS idx_food_portions_custom ON nutrition.food_portions(custom_food_id);

ALTER TABLE nutrition.food_portions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_portions_select" ON nutrition.food_portions FOR SELECT USING (true);
CREATE POLICY "food_portions_custom_user" ON nutrition.food_portions
  FOR ALL USING (
    custom_food_id IS NULL  -- BLS portions: jeder lesen
    OR EXISTS (
      SELECT 1 FROM nutrition.foods_custom fc
      WHERE fc.id = food_portions.custom_food_id AND auth.uid()::text = fc.user_id::text
    )
  );

-- --------------------------------------------------------
-- NEU: user_recent_portions
-- Zuletzt genutzte Portionsgrößen pro User und Food
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.user_recent_portions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  food_id         UUID REFERENCES nutrition.foods(id),
  custom_food_id  UUID REFERENCES nutrition.foods_custom(id),
  amount_g        NUMERIC(8,2) NOT NULL,
  portion_name    TEXT,            -- z.B. "1 Stück" — denormalisiert
  used_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT recent_portions_one_food CHECK (
    (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_user_recent_portions_user ON nutrition.user_recent_portions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_portions_food ON nutrition.user_recent_portions(user_id, food_id);

ALTER TABLE nutrition.user_recent_portions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_recent_portions_owner" ON nutrition.user_recent_portions
  USING (auth.uid()::text = user_id::text);

-- --------------------------------------------------------
-- NEU: mealcam_scans
-- MealCam V1 — Scan-Ergebnisse + User-Korrekturen
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.mealcam_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  meal_id         UUID REFERENCES nutrition.meals(id),  -- NULL bis User bestätigt

  -- Bild
  image_path      TEXT,            -- Storage-Pfad
  image_url       TEXT,            -- Signed URL
  image_stored    BOOLEAN DEFAULT false,
  training_consent BOOLEAN DEFAULT false,  -- Opt-in für Modell-Training

  -- Erkennungs-Ergebnisse (raw von Vision-Provider)
  scan_status     TEXT NOT NULL DEFAULT 'pending'
    CHECK (scan_status IN ('pending','processing','completed','failed','user_corrected','user_confirmed')),
  confidence_level TEXT CHECK (confidence_level IN ('high','suggest','low')),
  provider_response JSONB,         -- Raw Vision-Provider Response

  -- Erkannte Items (nach BLS-Match)
  detected_items  JSONB DEFAULT '[]',
  -- Format: [{ "food_id": "uuid", "food_name": "...", "confidence": 0.78, "estimated_amount_g": 180 }]

  -- User-Korrekturen
  user_corrections JSONB DEFAULT '[]',
  -- Format: [{ "original_food_id": "uuid", "corrected_food_id": "uuid", "corrected_amount_g": 200 }]

  -- Plan-Kontext (optional)
  plan_item_id    UUID REFERENCES nutrition.meal_plan_items(id),

  created_at      TIMESTAMPTZ DEFAULT now(),
  confirmed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mealcam_scans_user ON nutrition.mealcam_scans(user_id);

ALTER TABLE nutrition.mealcam_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mealcam_scans_owner" ON nutrition.mealcam_scans
  USING (auth.uid()::text = user_id::text);

-- --------------------------------------------------------
-- FIX 4: meal_items — food_source um 'mealcam' erweitern
-- --------------------------------------------------------
ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_food_source_check;

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_food_source_check
    CHECK (food_source IN ('bls','custom','mealcam','manual'));

-- Snapshot-Version für Recalculate-Audit
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS snapshot_version  INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS data_source        TEXT DEFAULT 'bls'
    CHECK (data_source IN ('bls','custom','mealcam','manual')),
  ADD COLUMN IF NOT EXISTS scan_id            UUID REFERENCES nutrition.mealcam_scans(id);

-- --------------------------------------------------------
-- FIX 5: food_preferences — erweitert auf Hard/Strong/Soft/Boost
-- Preference-Tabelle bleibt, aber source und severity ergänzen
-- --------------------------------------------------------
ALTER TABLE nutrition.food_preference_items
  ADD COLUMN IF NOT EXISTS severity  TEXT DEFAULT 'soft'
    CHECK (severity IN ('hard','strong','soft','boost')),
  ADD COLUMN IF NOT EXISTS source    TEXT DEFAULT 'settings'
    CHECK (source IN ('onboarding','settings','coach_suggestion','import'));

-- Bestehende liked → boost, disliked → soft (soft default)
UPDATE nutrition.food_preference_items
  SET severity = 'boost'
  WHERE preference = 'liked' AND severity IS NULL;

UPDATE nutrition.food_preference_items
  SET severity = 'soft'
  WHERE preference = 'disliked' AND severity IS NULL;

-- Neue Präferenz-Typen zu food_preferences
ALTER TABLE nutrition.food_preferences
  ADD COLUMN IF NOT EXISTS excluded_foods      UUID[] DEFAULT '{}',   -- absolute No-Go food_ids
  ADD COLUMN IF NOT EXISTS preferred_foods     UUID[] DEFAULT '{}',   -- bevorzugte food_ids
  ADD COLUMN IF NOT EXISTS religious_dietary   TEXT,                   -- z.B. 'halal', 'kosher', 'hindu_vegetarian'
  ADD COLUMN IF NOT EXISTS religious_is_hard   BOOLEAN DEFAULT false,  -- Wenn true → Hard Constraint
  ADD COLUMN IF NOT EXISTS meal_slots          JSONB DEFAULT '[]',    -- Konfigurierte Meal-Slots
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- --------------------------------------------------------
-- NEU: shopping_lists + shopping_list_items (bereits in SPEC_02 definiert)
-- Schema-only V1 — keine API/UI Pflicht
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.shopping_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  name        TEXT NOT NULL,
  recipe_id   UUID REFERENCES nutrition.recipes(id),
  servings    NUMERIC(6,2) DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON nutrition.shopping_lists(user_id);

ALTER TABLE nutrition.shopping_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shopping_lists_owner" ON nutrition.shopping_lists
  USING (auth.uid()::text = user_id::text);

CREATE TABLE IF NOT EXISTS nutrition.shopping_list_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id  UUID NOT NULL REFERENCES nutrition.shopping_lists(id) ON DELETE CASCADE,
  food_id           UUID REFERENCES nutrition.foods(id),
  custom_food_id    UUID REFERENCES nutrition.foods_custom(id),
  food_name         TEXT NOT NULL,
  amount_g          NUMERIC(10,2) NOT NULL,
  unit_display      TEXT DEFAULT 'g',
  is_checked        BOOLEAN DEFAULT false,
  sort_order        INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list ON nutrition.shopping_list_items(shopping_list_id);

ALTER TABLE nutrition.shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shopping_list_items_owner" ON nutrition.shopping_list_items
  USING (EXISTS (
    SELECT 1 FROM nutrition.shopping_lists sl
    WHERE sl.id = shopping_list_items.shopping_list_id AND auth.uid()::text = sl.user_id::text
  ));

-- --------------------------------------------------------
-- GRANTS für neue Tabellen
-- --------------------------------------------------------
GRANT SELECT ON
  nutrition.nutrient_reference_values,
  nutrition.food_portions
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.user_recent_portions,
  nutrition.mealcam_scans,
  nutrition.shopping_lists,
  nutrition.shopping_list_items
TO authenticated;

GRANT ALL ON
  nutrition.nutrient_reference_values,
  nutrition.food_portions,
  nutrition.user_recent_portions,
  nutrition.mealcam_scans,
  nutrition.shopping_lists,
  nutrition.shopping_list_items
TO service_role;
