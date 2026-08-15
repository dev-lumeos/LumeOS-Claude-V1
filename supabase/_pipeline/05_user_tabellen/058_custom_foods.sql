-- =============================================================
-- 058 — Eigene Lebensmittel (C-34)
-- Zweck: nutrition.foods_custom user-privat anlegen und meal_items
--        um den dritten Food-Zustand 'custom' erweitern.
-- Grundlage:
--   [read] ADR_CUSTOM_FOODS_V1.md: getrennte Tabelle, user-privat,
--          Pflichtmakros je 100 g, source in user/manual/import/admin.
--   [read] SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md: flache Spalten,
--          kein Merge mit nutrition.foods.
--   [read] Tom 2026-08-15: mealcam ist kein source-Wert; MealCam
--          schreibt source='user'.
--
-- NICHT Teil dieses Schritts:
--   * keine Oberflaeche
--   * keine Admin-Freigabe
--   * keine Suche ueber foods_custom
--   * keine Aenderung an daily_summary
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. User-private Custom Foods, vollstaendig getrennt von BLS.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.foods_custom (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,

  name_de         TEXT NOT NULL CHECK (length(trim(name_de)) >= 2),
  name_en         TEXT,
  name_th         TEXT,
  brand           TEXT,
  barcode         TEXT,

  serving_size_g  NUMERIC(8,2) NOT NULL DEFAULT 100 CHECK (serving_size_g > 0),
  serving_name    TEXT,

  source          TEXT NOT NULL DEFAULT 'user'
    CHECK (source IN ('user','manual','import','admin')),

  -- Phase 2 laut ADR: anlegen, aber in V1 nicht benutzen.
  is_public       BOOLEAN NOT NULL DEFAULT false,
  shared_by       UUID,

  -- Pflicht: Makros je 100 g.
  enercc          NUMERIC(8,2) NOT NULL CHECK (enercc >= 0),
  prot625         NUMERIC(8,3) NOT NULL CHECK (prot625 >= 0),
  fat             NUMERIC(8,3) NOT NULL CHECK (fat >= 0),
  cho             NUMERIC(8,3) NOT NULL CHECK (cho >= 0),

  -- Optional: weitere Makros je 100 g.
  fibt            NUMERIC(8,3) CHECK (fibt >= 0),
  sugar           NUMERIC(8,3) CHECK (sugar >= 0),
  fasat           NUMERIC(8,3) CHECK (fasat >= 0),
  nacl            NUMERIC(8,3) CHECK (nacl >= 0),
  water_g         NUMERIC(8,3) CHECK (water_g >= 0),
  alc             NUMERIC(8,3) CHECK (alc >= 0),

  -- Optional: Mikro-Subset aus der Spec, flach statt EAV.
  vita_ug         NUMERIC(10,3) CHECK (vita_ug >= 0),
  vitd_ug         NUMERIC(10,3) CHECK (vitd_ug >= 0),
  vite_mg         NUMERIC(10,3) CHECK (vite_mg >= 0),
  vitk_ug         NUMERIC(10,3) CHECK (vitk_ug >= 0),
  vitc_mg         NUMERIC(10,3) CHECK (vitc_mg >= 0),
  thia_mg         NUMERIC(10,3) CHECK (thia_mg >= 0),
  ribf_mg         NUMERIC(10,3) CHECK (ribf_mg >= 0),
  nia_mg          NUMERIC(10,3) CHECK (nia_mg >= 0),
  vitb6_ug        NUMERIC(10,3) CHECK (vitb6_ug >= 0),
  fol_ug          NUMERIC(10,3) CHECK (fol_ug >= 0),
  vitb12_ug       NUMERIC(10,3) CHECK (vitb12_ug >= 0),
  na_mg           NUMERIC(10,3) CHECK (na_mg >= 0),
  k_mg            NUMERIC(10,3) CHECK (k_mg >= 0),
  ca_mg           NUMERIC(10,3) CHECK (ca_mg >= 0),
  mg_mg           NUMERIC(10,3) CHECK (mg_mg >= 0),
  p_mg            NUMERIC(10,3) CHECK (p_mg >= 0),
  fe_mg           NUMERIC(10,3) CHECK (fe_mg >= 0),
  zn_mg           NUMERIC(10,3) CHECK (zn_mg >= 0),
  id_ug           NUMERIC(10,3) CHECK (id_ug >= 0),
  cu_ug           NUMERIC(10,3) CHECK (cu_ug >= 0),
  mn_ug           NUMERIC(10,3) CHECK (mn_ug >= 0),

  custom_allergens TEXT[] NOT NULL DEFAULT '{}'::text[]
    CHECK (custom_allergens <@ ARRAY[
      'allergen_gluten',
      'allergen_milk',
      'allergen_eggs',
      'allergen_fish',
      'allergen_crustaceans',
      'allergen_molluscs',
      'allergen_peanuts',
      'allergen_nuts',
      'allergen_soy',
      'allergen_celery',
      'allergen_mustard',
      'allergen_sesame',
      'allergen_sulphites',
      'allergen_lupin'
    ]::text[]),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_foods_custom_user
  ON nutrition.foods_custom(user_id, name_de);

CREATE INDEX IF NOT EXISTS idx_foods_custom_barcode
  ON nutrition.foods_custom(user_id, barcode)
  WHERE barcode IS NOT NULL;

DROP TRIGGER IF EXISTS foods_custom_touch_updated_at ON nutrition.foods_custom;
CREATE TRIGGER foods_custom_touch_updated_at
  BEFORE UPDATE ON nutrition.foods_custom
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

-- -------------------------------------------------------------
-- 2. meal_items: dritter Zustand fuer wiederverwendbare Custom Foods.
-- -------------------------------------------------------------
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS custom_food_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_items_custom_food_id_fkey'
      AND conrelid = 'nutrition.meal_items'::regclass
  ) THEN
    ALTER TABLE nutrition.meal_items
      ADD CONSTRAINT meal_items_custom_food_id_fkey
      FOREIGN KEY (custom_food_id)
      REFERENCES nutrition.foods_custom(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meal_items_custom_food
  ON nutrition.meal_items(custom_food_id)
  WHERE custom_food_id IS NOT NULL;

ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_food_source_check;

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_food_source_check
  CHECK (food_source IN ('bls','manual','custom'));

ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_source_target_check;

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_source_target_check CHECK (
    (food_source = 'bls'    AND food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (food_source = 'custom' AND food_id IS NULL     AND custom_food_id IS NOT NULL) OR
    (food_source = 'manual' AND food_id IS NULL     AND custom_food_id IS NULL)
  );

-- -------------------------------------------------------------
-- 3. Plausibilitaet: melden, nicht blockieren.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.custom_food_energy_plausibility(
  p_enercc numeric,
  p_prot625 numeric,
  p_fat numeric,
  p_cho numeric,
  p_alc numeric DEFAULT NULL,
  p_tolerance numeric DEFAULT 0.10
)
RETURNS TABLE (
  calculated_enercc numeric,
  deviation_ratio numeric,
  plausible boolean,
  message text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $plausibility$
DECLARE
  v_calculated numeric;
  v_base numeric;
  v_ratio numeric;
BEGIN
  v_calculated :=
    4 * COALESCE(p_prot625, 0) +
    9 * COALESCE(p_fat, 0) +
    4 * COALESCE(p_cho, 0) +
    7 * COALESCE(p_alc, 0);

  v_base := GREATEST(ABS(COALESCE(p_enercc, 0)), ABS(v_calculated), 1);
  v_ratio := ABS(COALESCE(p_enercc, 0) - v_calculated) / v_base;

  RETURN QUERY SELECT
    ROUND(v_calculated, 2),
    ROUND(v_ratio, 4),
    v_ratio <= COALESCE(p_tolerance, 0.10),
    CASE
      WHEN v_ratio <= COALESCE(p_tolerance, 0.10)
        THEN 'Makroenergie passt innerhalb der Toleranz'
      ELSE 'Makroenergie weicht um mehr als die Toleranz ab'
    END;
END;
$plausibility$;

-- -------------------------------------------------------------
-- 4. Rechte und RLS nach dem Muster aus 052.
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.foods_custom TO authenticated;
GRANT ALL ON nutrition.foods_custom TO service_role;
GRANT EXECUTE ON FUNCTION nutrition.custom_food_energy_plausibility(numeric, numeric, numeric, numeric, numeric, numeric)
  TO authenticated, service_role;

ALTER TABLE nutrition.foods_custom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS foods_custom_select ON nutrition.foods_custom;
DROP POLICY IF EXISTS foods_custom_insert ON nutrition.foods_custom;
DROP POLICY IF EXISTS foods_custom_update ON nutrition.foods_custom;
DROP POLICY IF EXISTS foods_custom_delete ON nutrition.foods_custom;

CREATE POLICY foods_custom_select ON nutrition.foods_custom
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY foods_custom_insert ON nutrition.foods_custom
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY foods_custom_update ON nutrition.foods_custom
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY foods_custom_delete ON nutrition.foods_custom
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;
