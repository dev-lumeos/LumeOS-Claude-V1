-- C-350 / E-34: Vitamin A nur aus seinen BLS-Bestandteilen in IE und
-- EFSA als primaere Magnesium-UL. NAM bleibt als belegte zweite Zeile.

BEGIN;

-- C-350: Quellen werden nie aus ihrem Datensatz geloescht. Wo zwei sonst
-- gleich passende Quellen dieselbe Wertart tragen, bestimmt die explizite
-- Prioritaet die Auswahl in daily_reference_assessment.
ALTER TABLE nutrition.nutrient_reference_values
  ADD COLUMN IF NOT EXISTS source_priority smallint NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.nutrient_reference_values'::regclass
      AND conname = 'nutrient_reference_values_source_priority_check'
  ) THEN
    ALTER TABLE nutrition.nutrient_reference_values
      ADD CONSTRAINT nutrient_reference_values_source_priority_check
      CHECK (source_priority >= 0);
  END IF;
END $$;

COMMENT ON COLUMN nutrition.nutrient_reference_values.source_priority IS
  'C-350: Auswahlprioritaet nur bei sonst gleich passenden Referenzzeilen. 0 ist der Normalfall; ein hoeherer Wert waehlt die fachlich entschiedene Quelle, ohne die andere Quelle zu loeschen.';

UPDATE nutrition.nutrient_reference_values
SET source_priority = 0
WHERE nutrient_code = 'MG'
  AND reference_kind = 'UL'
  AND source = 'National Academies Dietary Reference Intakes';

INSERT INTO nutrition.nutrient_reference_values (
  nutrient_code, reference_kind, population_group, age_min, age_max, sex,
  is_pregnant, is_lactating, value_min, value_max, unit, basis,
  target_applies_to, applies_to_intake_sources, source_priority, source,
  source_version, source_locator, source_url, notes
)
SELECT
  'MG', 'UL', 'adult', 18, NULL, 'both', false, false,
  250, 250, 'mg', 'per_day',
  ARRAY['MG'], ARRAY['supplements', 'pharmacological'], 100,
  'EFSA tolerable upper intake level for magnesium',
  'EFSA UL Summary Tables, version 10, accessed 2026-08-30',
  'Magnesium: adults UL 250 mg/day; limitation applies to supplemental magnesium, not naturally present food magnesium.',
  'https://www.efsa.europa.eu/sites/default/files/assets/UL_Summary_tables.pdf',
  'E-34: primaere LumeOS-UL. Der NAM-UL 350 mg/day bleibt mit source_priority 0 als zweite, belegte Bezugsgroesse erhalten.'
WHERE NOT EXISTS (
  SELECT 1
  FROM nutrition.nutrient_reference_values
  WHERE nutrient_code = 'MG'
    AND reference_kind = 'UL'
    AND source = 'EFSA tolerable upper intake level for magnesium'
);

UPDATE nutrition.nutrient_reference_values
SET
  value_min = 250,
  value_max = 250,
  unit = 'mg',
  basis = 'per_day',
  target_applies_to = ARRAY['MG'],
  applies_to_intake_sources = ARRAY['supplements', 'pharmacological'],
  source_priority = 100,
  source_version = 'EFSA UL Summary Tables, version 10, accessed 2026-08-30',
  source_locator = 'Magnesium: adults UL 250 mg/day; limitation applies to supplemental magnesium, not naturally present food magnesium.',
  source_url = 'https://www.efsa.europa.eu/sites/default/files/assets/UL_Summary_tables.pdf',
  notes = 'E-34: primaere LumeOS-UL. Der NAM-UL 350 mg/day bleibt mit source_priority 0 als zweite, belegte Bezugsgroesse erhalten.'
WHERE nutrient_code = 'MG'
  AND reference_kind = 'UL'
  AND source = 'EFSA tolerable upper intake level for magnesium';

-- E-34: Die BLS-Komponenten sind die Formangabe. Jeder Faktor bezieht
-- sich auf die gespeicherte Komponente in ug, nie auf den Gesamtwert VITA.
INSERT INTO nutrition.nutrient_unit_conversion_factors (
  nutrient_code, form_code, form_label, from_unit, to_unit, factor,
  source, source_version, source_locator, source_url
) VALUES
  ('RETOL', 'bls_retinol', 'BLS Retinol', 'ug', 'IU', 3.3333333333,
    'Bundeslebensmittelschluessel (BLS)', 'BLS 4.0 Components, accessed 2026-08-30',
    'E-34: IE = Retinol/0.3 + Beta-Carotin/0.6 + uebrige Carotinoide/1.2; Retinol-Faktor 1/0.3.',
    'docs/BrainstormDocs/Nutrition/BLS_4_0_Components_DE_EN.xlsx'),
  ('CARTB', 'bls_beta_carotene', 'BLS Beta-Carotin', 'ug', 'IU', 1.6666666667,
    'Bundeslebensmittelschluessel (BLS)', 'BLS 4.0 Components, accessed 2026-08-30',
    'E-34: IE = Retinol/0.3 + Beta-Carotin/0.6 + uebrige Carotinoide/1.2; Beta-Carotin-Faktor 1/0.6.',
    'docs/BrainstormDocs/Nutrition/BLS_4_0_Components_DE_EN.xlsx'),
  ('CAROTPAXB', 'bls_other_carotenoids', 'BLS Carotinoide ausser Beta-Carotin', 'ug', 'IU', 0.8333333333,
    'Bundeslebensmittelschluessel (BLS)', 'BLS 4.0 Components, accessed 2026-08-30',
    'E-34: IE = Retinol/0.3 + Beta-Carotin/0.6 + uebrige Carotinoide/1.2; Rest-Faktor 1/1.2.',
    'docs/BrainstormDocs/Nutrition/BLS_4_0_Components_DE_EN.xlsx')
ON CONFLICT (nutrient_code, form_code, from_unit, to_unit) DO UPDATE SET
  form_label = EXCLUDED.form_label,
  factor = EXCLUDED.factor,
  source = EXCLUDED.source,
  source_version = EXCLUDED.source_version,
  source_locator = EXCLUDED.source_locator,
  source_url = EXCLUDED.source_url,
  updated_at = now();

CREATE OR REPLACE FUNCTION nutrition.vitamin_a_iu_daily(
  p_user_id uuid,
  p_entry_date date
)
RETURNS TABLE (
  user_id uuid,
  entry_date date,
  total_iu numeric,
  incomplete_component_count integer,
  value_complete boolean,
  status text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $vitamin_a$
  WITH expected_components(nutrient_code) AS (
    VALUES ('RETOL'::text), ('CARTB'::text), ('CAROTPAXB'::text)
  ), component_values AS (
    SELECT
      e.nutrient_code,
      f.factor,
      d.total_value,
      COALESCE(d.value_complete, false) AS component_complete
    FROM expected_components e
    JOIN nutrition.nutrient_unit_conversion_factors f
      ON f.nutrient_code = e.nutrient_code
     AND f.from_unit = 'ug'
     AND f.to_unit = 'IU'
    LEFT JOIN nutrition.daily_nutrient_summary_long d
      ON d.user_id = p_user_id
     AND d.entry_date = p_entry_date
     AND d.nutrient_code = e.nutrient_code
  )
  SELECT
    p_user_id,
    p_entry_date,
    CASE WHEN count(*) FILTER (WHERE total_value IS NOT NULL) > 0
      THEN round(sum(COALESCE(total_value, 0) * factor), 4)
      ELSE NULL
    END AS total_iu,
    count(*) FILTER (WHERE NOT component_complete)::integer AS incomplete_component_count,
    bool_and(component_complete) AS value_complete,
    CASE
      WHEN count(*) FILTER (WHERE total_value IS NOT NULL) = 0 THEN 'no_data'
      WHEN bool_and(component_complete) THEN 'complete'
      ELSE 'incomplete'
    END AS status
  FROM component_values;
$vitamin_a$;

COMMENT ON FUNCTION nutrition.vitamin_a_iu_daily(uuid, date) IS
  'C-398/E-61: Vitamin A in IE aus BLS RETOL, CARTB und CAROTPAXB. Kein Gesamtfaktor. Vorhandene Komponentensummen werden mit ihren drei Faktoren addiert; censored, trace und missing tragen 0 bei. value_complete zeigt die Komponentenluecken weiter ehrlich an.';

REVOKE ALL ON FUNCTION nutrition.vitamin_a_iu_daily(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.vitamin_a_iu_daily(uuid, date)
  TO authenticated, service_role;

COMMIT;
