-- C-343/E-38: BLS-Wertzustand getrennt vom Importweg.
-- `data_source` bleibt der technische Importweg; `bls_value_status`
-- traegt nur die fuer Bilanz und Anzeige relevante BLS-Aussage.

BEGIN;

ALTER TABLE nutrition.food_nutrients
  ALTER COLUMN value DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS bls_value_status text NOT NULL DEFAULT 'measured';

ALTER TABLE nutrition.food_nutrients
  DROP CONSTRAINT IF EXISTS food_nutrients_bls_value_status_ck;

ALTER TABLE nutrition.food_nutrients
  ADD CONSTRAINT food_nutrients_bls_value_status_ck CHECK (
    bls_value_status IN ('measured', 'censored', 'missing', 'logical_zero', 'trace')
  );

COMMENT ON COLUMN nutrition.food_nutrients.bls_value_status IS
  'C-343/E-38: BLS-Wertzustand, getrennt vom technischen data_source. censored ist nach Lower Bound als 0 gespeichert; missing und trace tragen keinen Zahlenwert.';

-- Nullwerte duerfen nicht als JSON-Schluessel eingefroren werden: nur
-- zensierte Lower-Bound-Nullen und echte/logische Zahlen sind vorhanden.
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
        'WATER', round(fc.water_g * p_amount_g / 100, 5)
      )) AS nutrients
    FROM nutrition.foods_custom fc
    WHERE fc.id = p_custom_food_id;

    RETURN;
  END IF;

  RAISE EXCEPTION 'food_nutrient_snapshot: unbekannte Quelle %', p_food_source
    USING ERRCODE = '22023';
END;
$function$;

COMMIT;
