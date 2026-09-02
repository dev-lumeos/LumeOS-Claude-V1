-- C-324 / E-25: Nutrition-Tagesscore ausschliesslich nach der belegten
-- NRF9.3-Originalformel. EFSA-Referenzen und Sportleranpassungen bleiben
-- ausserhalb dieser Funktion. Fehlende Eingaben ergeben nie einen Score.

BEGIN;

CREATE OR REPLACE FUNCTION nutrition.nrf93_score_from_amounts(
  p_protein_g NUMERIC,
  p_fiber_g NUMERIC,
  p_vitamin_a_iu NUMERIC,
  p_vitamin_c_mg NUMERIC,
  p_vitamin_e_mg_alpha_tocopherol NUMERIC,
  p_calcium_mg NUMERIC,
  p_iron_mg NUMERIC,
  p_magnesium_mg NUMERIC,
  p_potassium_mg NUMERIC,
  p_saturated_fat_g NUMERIC,
  p_total_sugar_g NUMERIC,
  p_sodium_mg NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = ''
AS $nrf93_score$
  SELECT round((
    LEAST(GREATEST(p_protein_g / 50, 0), 1)
    + LEAST(GREATEST(p_fiber_g / 25, 0), 1)
    + LEAST(GREATEST(p_vitamin_a_iu / 5000, 0), 1)
    + LEAST(GREATEST(p_vitamin_c_mg / 60, 0), 1)
    + LEAST(GREATEST(p_vitamin_e_mg_alpha_tocopherol / 20, 0), 1)
    + LEAST(GREATEST(p_calcium_mg / 1000, 0), 1)
    + LEAST(GREATEST(p_iron_mg / 18, 0), 1)
    + LEAST(GREATEST(p_magnesium_mg / 400, 0), 1)
    + LEAST(GREATEST(p_potassium_mg / 3500, 0), 1)
    - LEAST(GREATEST(p_saturated_fat_g / 20, 0), 1)
    - LEAST(GREATEST(p_total_sugar_g / 50, 0), 1)
    - LEAST(GREATEST(p_sodium_mg / 2400, 0), 1)
  ) * 100, 2);
$nrf93_score$;

COMMENT ON FUNCTION nutrition.nrf93_score_from_amounts(
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) IS
  'C-324/E-25: reine NRF9.3-Originalformel mit US-Referenzen und 100%-Deckel je positivem und begrenztem Eingang. Vitamin E nutzt die Originalreferenz 30 IU als 20 mg Alpha-Tocopherol, weil daily_summary diese Einheit fuehrt. Zucker ist Gesamtzucker, nicht added sugars.';

CREATE OR REPLACE FUNCTION nutrition.nrf93_daily(
  p_user_id UUID,
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id UUID,
  entry_date DATE,
  score NUMERIC,
  status TEXT,
  value_complete BOOLEAN,
  item_count INTEGER,
  incomplete_input_codes TEXT[],
  reference_set TEXT,
  sugar_input TEXT,
  components JSONB
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $nrf93_daily$
  WITH day_value AS (
    SELECT
      d.*,
      va.total_iu AS vitamin_a_iu,
      va.value_complete AS vitamin_a_complete,
      va.status AS vitamin_a_status
    FROM (SELECT p_user_id AS user_id, p_entry_date AS entry_date) p
    LEFT JOIN nutrition.daily_summary d
      ON d.user_id = p.user_id
     AND d.entry_date = p.entry_date
    CROSS JOIN LATERAL nutrition.vitamin_a_iu_daily(p.user_id, p.entry_date) va
  ), completeness AS (
    SELECT
      d.*,
      CASE
        WHEN d.item_count IS NULL OR d.item_count = 0 THEN 'no_data'
        WHEN d.prot625 IS NULL OR d.prot625_missing <> 0
          OR d.fibt IS NULL OR d.fibt_missing <> 0
          OR d.vitamin_a_iu IS NULL
          OR d.vitc IS NULL OR d.vitc_missing <> 0
          OR d.vite IS NULL OR d.vite_missing <> 0
          OR d.ca IS NULL OR d.ca_missing <> 0
          OR d.fe IS NULL OR d.fe_missing <> 0
          OR d.mg IS NULL OR d.mg_missing <> 0
          OR d.k IS NULL OR d.k_missing <> 0
          OR d.fasat IS NULL OR d.fasat_missing <> 0
          OR d.sugar IS NULL OR d.sugar_missing <> 0
          OR d.na IS NULL OR d.na_missing <> 0
          THEN 'incomplete'
        ELSE 'complete'
      END AS score_status
    FROM day_value d
  ), inputs AS (
    SELECT
      c.*,
      ARRAY_REMOVE(ARRAY[
        CASE WHEN c.prot625 IS NULL OR c.prot625_missing <> 0 THEN 'PROT625' END,
        CASE WHEN c.fibt IS NULL OR c.fibt_missing <> 0 THEN 'FIBT' END,
        CASE WHEN c.vitamin_a_iu IS NULL THEN 'VITA' END,
        CASE WHEN c.vitc IS NULL OR c.vitc_missing <> 0 THEN 'VITC' END,
        CASE WHEN c.vite IS NULL OR c.vite_missing <> 0 THEN 'VITE' END,
        CASE WHEN c.ca IS NULL OR c.ca_missing <> 0 THEN 'CA' END,
        CASE WHEN c.fe IS NULL OR c.fe_missing <> 0 THEN 'FE' END,
        CASE WHEN c.mg IS NULL OR c.mg_missing <> 0 THEN 'MG' END,
        CASE WHEN c.k IS NULL OR c.k_missing <> 0 THEN 'K' END,
        CASE WHEN c.fasat IS NULL OR c.fasat_missing <> 0 THEN 'FASAT' END,
        CASE WHEN c.sugar IS NULL OR c.sugar_missing <> 0 THEN 'SUGAR' END,
        CASE WHEN c.na IS NULL OR c.na_missing <> 0 THEN 'NA' END
      ], NULL) AS missing_codes
    FROM completeness c
  )
  SELECT
    p_user_id,
    p_entry_date,
    CASE WHEN i.score_status = 'complete' THEN nutrition.nrf93_score_from_amounts(
      i.prot625, i.fibt, i.vitamin_a_iu, i.vitc, i.vite, i.ca,
      i.fe, i.mg, i.k, i.fasat, i.sugar, i.na
    ) END AS score,
    i.score_status AS status,
    i.score_status = 'complete' AS value_complete,
    coalesce(i.item_count, 0)::INTEGER AS item_count,
    CASE WHEN i.score_status = 'no_data' THEN ARRAY[]::TEXT[] ELSE i.missing_codes END AS incomplete_input_codes,
    'NRF9.3 original US Daily Values'::TEXT AS reference_set,
    'total_sugar'::TEXT AS sugar_input,
    jsonb_build_object(
      'protein', jsonb_build_object('code', 'PROT625', 'amount', i.prot625, 'unit', 'g', 'reference', 50, 'capped_ratio', CASE WHEN i.prot625 IS NOT NULL AND i.prot625_missing = 0 THEN LEAST(GREATEST(i.prot625 / 50, 0), 1) END),
      'fiber', jsonb_build_object('code', 'FIBT', 'amount', i.fibt, 'unit', 'g', 'reference', 25, 'capped_ratio', CASE WHEN i.fibt IS NOT NULL AND i.fibt_missing = 0 THEN LEAST(GREATEST(i.fibt / 25, 0), 1) END),
      'vitamin_a', jsonb_build_object('code', 'VITA', 'amount', i.vitamin_a_iu, 'unit', 'IU', 'reference', 5000, 'status', i.vitamin_a_status, 'capped_ratio', CASE WHEN i.vitamin_a_iu IS NOT NULL THEN LEAST(GREATEST(i.vitamin_a_iu / 5000, 0), 1) END),
      'vitamin_c', jsonb_build_object('code', 'VITC', 'amount', i.vitc, 'unit', 'mg', 'reference', 60, 'capped_ratio', CASE WHEN i.vitc IS NOT NULL AND i.vitc_missing = 0 THEN LEAST(GREATEST(i.vitc / 60, 0), 1) END),
      'vitamin_e', jsonb_build_object('code', 'VITE', 'amount', i.vite, 'unit', 'mg_alpha_tocopherol', 'reference', '30 IU', 'capped_ratio', CASE WHEN i.vite IS NOT NULL AND i.vite_missing = 0 THEN LEAST(GREATEST(i.vite / 20, 0), 1) END),
      'calcium', jsonb_build_object('code', 'CA', 'amount', i.ca, 'unit', 'mg', 'reference', 1000, 'capped_ratio', CASE WHEN i.ca IS NOT NULL AND i.ca_missing = 0 THEN LEAST(GREATEST(i.ca / 1000, 0), 1) END),
      'iron', jsonb_build_object('code', 'FE', 'amount', i.fe, 'unit', 'mg', 'reference', 18, 'capped_ratio', CASE WHEN i.fe IS NOT NULL AND i.fe_missing = 0 THEN LEAST(GREATEST(i.fe / 18, 0), 1) END),
      'magnesium', jsonb_build_object('code', 'MG', 'amount', i.mg, 'unit', 'mg', 'reference', 400, 'capped_ratio', CASE WHEN i.mg IS NOT NULL AND i.mg_missing = 0 THEN LEAST(GREATEST(i.mg / 400, 0), 1) END),
      'potassium', jsonb_build_object('code', 'K', 'amount', i.k, 'unit', 'mg', 'reference', 3500, 'capped_ratio', CASE WHEN i.k IS NOT NULL AND i.k_missing = 0 THEN LEAST(GREATEST(i.k / 3500, 0), 1) END),
      'saturated_fat', jsonb_build_object('code', 'FASAT', 'amount', i.fasat, 'unit', 'g', 'reference', 20, 'capped_ratio', CASE WHEN i.fasat IS NOT NULL AND i.fasat_missing = 0 THEN LEAST(GREATEST(i.fasat / 20, 0), 1) END),
      'sugar', jsonb_build_object('code', 'SUGAR', 'amount', i.sugar, 'unit', 'g', 'input', 'total_sugar', 'reference', 50, 'capped_ratio', CASE WHEN i.sugar IS NOT NULL AND i.sugar_missing = 0 THEN LEAST(GREATEST(i.sugar / 50, 0), 1) END),
      'sodium', jsonb_build_object('code', 'NA', 'amount', i.na, 'unit', 'mg', 'reference', 2400, 'capped_ratio', CASE WHEN i.na IS NOT NULL AND i.na_missing = 0 THEN LEAST(GREATEST(i.na / 2400, 0), 1) END)
    ) AS components
  FROM inputs i;
$nrf93_daily$;

COMMENT ON FUNCTION nutrition.nrf93_daily(UUID, DATE) IS
  'C-324/E-25, C-398/E-61: Tages-NRF9.3 mit Original-US-Referenzen und Gesamtzucker. Vitamin A kommt nur aus vitamin_a_iu_daily; vorhandene BLS-Komponentensummen werden dort trotz Komponentenluecke addiert. Fehlende Eingaben ohne Tageswert ergeben status=incomplete und score=NULL.';

REVOKE ALL ON FUNCTION nutrition.nrf93_score_from_amounts(
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.nrf93_daily(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.nrf93_score_from_amounts(
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.nrf93_daily(UUID, DATE)
  TO authenticated, service_role;

COMMIT;
