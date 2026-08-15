-- =============================================================
-- 059 — Tagesbilanz gegen Referenzwerte (C-47)
-- Zweck: nutrition.daily_reference_assessment(user_id, date) verbindet
--        daily_summary, public.profiles und nutrient_reference_values.
--
-- Bewusst als Funktion, nicht als breite Sicht:
--   * public.profiles liegt nicht in nutrition; SECURITY INVOKER laesst
--     RLS auf profiles, meals und meal_items greifen.
--   * Ein Naehrstoff kann mehrere passende Wertarten haben, z. B. PRI
--     und UL. Die Funktion gibt dann mehrere Zeilen aus, statt die
--     Bedeutung in eine Spalte zu quetschen.
--   * daily_summary bleibt unveraendert. Sie summiert; diese Funktion
--     bewertet numerisch, aber ohne Ampel oder Worturteil.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION nutrition.daily_reference_assessment(
  p_user_id UUID,
  p_entry_date DATE
)
RETURNS TABLE (
  user_id UUID,
  entry_date DATE,
  nutrient_code TEXT,
  nutrient_name_de TEXT,
  nutrient_unit TEXT,
  actual_value NUMERIC,
  missing_count INTEGER,
  value_complete BOOLEAN,
  reference_kind TEXT,
  reference_direction TEXT,
  reference_value_min NUMERIC,
  reference_value_max NUMERIC,
  reference_unit TEXT,
  reference_basis TEXT,
  reference_pct NUMERIC,
  reference_pct_min NUMERIC,
  reference_pct_max NUMERIC,
  reference_status TEXT,
  profile_age_years INTEGER,
  profile_biological_sex TEXT,
  profile_is_pregnant BOOLEAN,
  profile_is_lactating BOOLEAN,
  source TEXT,
  source_locator TEXT,
  notes TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH profile AS (
  SELECT
    p_user_id AS user_id,
    p_entry_date AS entry_date,
    p.birth_date,
    p.biological_sex,
    CASE
      WHEN p.birth_date IS NULL THEN NULL
      ELSE EXTRACT(YEAR FROM age(p_entry_date, p.birth_date))::INTEGER
    END AS age_years,
    (
      p.pregnancy_started_on IS NOT NULL
      AND p_entry_date >= p.pregnancy_started_on
      AND (p.pregnancy_ended_on IS NULL OR p_entry_date <= p.pregnancy_ended_on)
    ) AS is_pregnant,
    (
      p.lactation_started_on IS NOT NULL
      AND p_entry_date >= p.lactation_started_on
      AND (p.lactation_ended_on IS NULL OR p_entry_date <= p.lactation_ended_on)
    ) AS is_lactating
  FROM public.profiles p
  WHERE p.id = p_user_id
),
profile_one AS (
  SELECT
    p_user_id AS user_id,
    p_entry_date AS entry_date,
    pr.birth_date,
    pr.biological_sex,
    pr.age_years,
    COALESCE(pr.is_pregnant, false) AS is_pregnant,
    COALESCE(pr.is_lactating, false) AS is_lactating,
    (pr.birth_date IS NOT NULL AND pr.biological_sex IS NOT NULL) AS profile_complete
  FROM (SELECT 1) seed
  LEFT JOIN profile pr ON true
),
day_values AS (
  SELECT v.nutrient_code, v.actual_value, v.missing_count
  FROM nutrition.daily_summary ds
  CROSS JOIN LATERAL (VALUES
    ('ENERCC', ds.enercc, ds.enercc_missing),
    ('PROT625', ds.prot625, ds.prot625_missing),
    ('FAT', ds.fat, ds.fat_missing),
    ('CHO', ds.cho, ds.cho_missing),
    ('FIBT', ds.fibt, ds.fibt_missing),
    ('SUGAR', ds.sugar, ds.sugar_missing),
    ('FASAT', ds.fasat, ds.fasat_missing),
    ('NACL', ds.nacl, ds.nacl_missing),
    ('WATER', ds.water_g, ds.water_g_missing),
    ('VITA', ds.vita, ds.vita_missing),
    ('VITD', ds.vitd, ds.vitd_missing),
    ('VITE', ds.vite, ds.vite_missing),
    ('VITK', ds.vitk, ds.vitk_missing),
    ('THIA', ds.thia, ds.thia_missing),
    ('RIBF', ds.ribf, ds.ribf_missing),
    ('NIA', ds.nia, ds.nia_missing),
    ('VITB6', ds.vitb6, ds.vitb6_missing),
    ('FOL', ds.fol, ds.fol_missing),
    ('VITB12', ds.vitb12, ds.vitb12_missing),
    ('VITC', ds.vitc, ds.vitc_missing),
    ('NA', ds.na, ds.na_missing),
    ('K', ds.k, ds.k_missing),
    ('CA', ds.ca, ds.ca_missing),
    ('MG', ds.mg, ds.mg_missing),
    ('P', ds.p, ds.p_missing),
    ('FE', ds.fe, ds.fe_missing),
    ('ZN', ds.zn, ds.zn_missing),
    ('ID', ds.iodid, ds.iodid_missing),
    ('CHORL', ds.chorl, ds.chorl_missing),
    ('FAPUN3', ds.fapun3, ds.fapun3_missing),
    ('FAPUN6', ds.fapun6, ds.fapun6_missing),
    ('AAE9', ds.aae9, ds.aae9_missing),
    ('LEU', ds.leu, ds.leu_missing)
  ) AS v(nutrient_code, actual_value, missing_count)
  WHERE ds.user_id = p_user_id
    AND ds.entry_date = p_entry_date
),
reference_candidates AS (
  SELECT
    dv.nutrient_code,
    r.reference_kind,
    r.value_min,
    r.value_max,
    r.unit,
    r.basis,
    r.source,
    r.source_locator,
    r.notes,
    CASE
      WHEN r.reference_kind IN ('UL', 'ALAP') THEN 'upper_limit'
      WHEN r.reference_kind = 'RI' THEN 'range'
      WHEN r.reference_kind IN ('NO_REFERENCE', 'NO_STANDALONE_REFERENCE') THEN 'not_applicable'
      ELSE 'target'
    END AS reference_direction,
    ROW_NUMBER() OVER (
      PARTITION BY dv.nutrient_code, r.reference_kind
      ORDER BY
        CASE
          WHEN r.is_pregnant = p.is_pregnant AND r.is_lactating = p.is_lactating THEN 2
          WHEN NOT r.is_pregnant AND NOT r.is_lactating THEN 1
          ELSE 0
        END DESC,
        CASE WHEN r.sex = p.biological_sex THEN 1 ELSE 0 END DESC,
        COALESCE(r.age_max - r.age_min, 999) ASC
    ) AS rn
  FROM day_values dv
  CROSS JOIN profile_one p
  JOIN nutrition.nutrient_reference_values r
    ON r.nutrient_code = dv.nutrient_code
   AND p.profile_complete
   AND (r.age_min IS NULL OR p.age_years >= r.age_min)
   AND (r.age_max IS NULL OR p.age_years <= r.age_max)
   AND (r.sex = 'both' OR r.sex = p.biological_sex)
   AND (
     (r.is_pregnant = p.is_pregnant AND r.is_lactating = p.is_lactating)
     OR (NOT r.is_pregnant AND NOT r.is_lactating)
   )
),
selected_references AS (
  SELECT *
  FROM reference_candidates
  WHERE rn = 1
)
SELECT
  p.user_id,
  p.entry_date,
  dv.nutrient_code,
  nd.name_de AS nutrient_name_de,
  nd.unit AS nutrient_unit,
  dv.actual_value,
  dv.missing_count::INTEGER,
  (dv.missing_count = 0 AND dv.actual_value IS NOT NULL) AS value_complete,
  sr.reference_kind,
  sr.reference_direction,
  sr.value_min AS reference_value_min,
  sr.value_max AS reference_value_max,
  sr.unit AS reference_unit,
  sr.basis AS reference_basis,
  CASE
    WHEN dv.missing_count > 0 OR dv.actual_value IS NULL THEN NULL
    WHEN sr.reference_kind IN ('NO_REFERENCE', 'NO_STANDALONE_REFERENCE') THEN NULL
    WHEN COALESCE(sr.value_min, sr.value_max) IS NULL OR COALESCE(sr.value_min, sr.value_max) = 0 THEN NULL
    ELSE ROUND(dv.actual_value / COALESCE(sr.value_min, sr.value_max) * 100, 1)
  END AS reference_pct,
  CASE
    WHEN dv.missing_count > 0 OR dv.actual_value IS NULL THEN NULL
    WHEN sr.value_min IS NULL OR sr.value_min = 0 THEN NULL
    ELSE ROUND(dv.actual_value / sr.value_min * 100, 1)
  END AS reference_pct_min,
  CASE
    WHEN dv.missing_count > 0 OR dv.actual_value IS NULL THEN NULL
    WHEN sr.value_max IS NULL OR sr.value_max = 0 THEN NULL
    ELSE ROUND(dv.actual_value / sr.value_max * 100, 1)
  END AS reference_pct_max,
  CASE
    WHEN NOT p.profile_complete THEN 'missing_profile'
    WHEN sr.reference_kind IS NULL THEN 'no_applicable_reference'
    WHEN dv.missing_count > 0 THEN 'incomplete'
    WHEN dv.actual_value IS NULL THEN 'no_value'
    WHEN sr.reference_kind IN ('NO_REFERENCE', 'NO_STANDALONE_REFERENCE') THEN 'not_applicable'
    ELSE 'complete'
  END AS reference_status,
  p.age_years AS profile_age_years,
  p.biological_sex AS profile_biological_sex,
  p.is_pregnant AS profile_is_pregnant,
  p.is_lactating AS profile_is_lactating,
  sr.source,
  sr.source_locator,
  sr.notes
FROM day_values dv
CROSS JOIN profile_one p
JOIN nutrition.nutrient_defs nd ON nd.code = dv.nutrient_code
LEFT JOIN selected_references sr ON sr.nutrient_code = dv.nutrient_code
ORDER BY nd.display_tier, nd.sort_index, sr.reference_kind NULLS LAST;
$$;

COMMENT ON FUNCTION nutrition.daily_reference_assessment(UUID, DATE) IS
  'C-47: Numerischer Vergleich von daily_summary mit nutrient_reference_values anhand public.profiles. '
  'Fuehrt reference_kind und reference_direction mit; keine Ampel, kein Score, keine Wortbewertung. '
  'Bei *_missing > 0 bleibt reference_pct NULL, damit eine unvollstaendige Summe nicht als Deckung erscheint.';

GRANT EXECUTE ON FUNCTION nutrition.daily_reference_assessment(UUID, DATE)
  TO authenticated, service_role;

COMMIT;
