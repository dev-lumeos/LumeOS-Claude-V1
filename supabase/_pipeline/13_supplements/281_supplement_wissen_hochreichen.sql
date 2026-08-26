BEGIN;

CREATE SCHEMA IF NOT EXISTS supplements;

CREATE OR REPLACE FUNCTION pg_temp.c281_uuid(p_text text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5('c281:' || p_text), 1, 8) || '-' ||
    substr(md5('c281:' || p_text), 9, 4) || '-' ||
    substr(md5('c281:' || p_text), 13, 4) || '-' ||
    substr(md5('c281:' || p_text), 17, 4) || '-' ||
    substr(md5('c281:' || p_text), 21, 12)
  )::uuid
$$;

DROP TABLE IF EXISTS tmp_c281_dosing_inherit;
CREATE TEMP TABLE tmp_c281_dosing_inherit AS
WITH child_rows AS (
  SELECT
    c.parent_id,
    c.id AS child_id,
    c.name_en AS child_name,
    d.*
  FROM supplements.supplement_dosing d
  JOIN supplements.supplements c ON c.id = d.supplement_id
  WHERE c.parent_id IS NOT NULL
),
grouped AS (
  SELECT
    parent_id,
    count(*) AS child_rows,
    array_agg(child_id ORDER BY child_name, child_id) AS child_ids,
    array_agg(child_name ORDER BY child_name, child_id) AS child_names,
    CASE WHEN count(DISTINCT official_label_dose)
              FILTER (WHERE official_label_dose IS NOT NULL AND official_label_dose <> '{}'::jsonb) = 1
         THEN min(official_label_dose::text)::jsonb END AS official_label_dose,
    CASE WHEN count(DISTINCT guideline_dose)
              FILTER (WHERE guideline_dose IS NOT NULL AND guideline_dose <> '{}'::jsonb) = 1
         THEN min(guideline_dose::text)::jsonb END AS guideline_dose,
    CASE WHEN count(DISTINCT studied_dose_ranges)
              FILTER (WHERE studied_dose_ranges IS NOT NULL AND studied_dose_ranges <> '[]'::jsonb AND studied_dose_ranges <> '{}'::jsonb) = 1
         THEN min(studied_dose_ranges::text)::jsonb END AS studied_dose_ranges,
    CASE WHEN count(DISTINCT anecdotal_dose_ranges)
              FILTER (WHERE anecdotal_dose_ranges IS NOT NULL AND anecdotal_dose_ranges <> '[]'::jsonb AND anecdotal_dose_ranges <> '{}'::jsonb) = 1
         THEN min(anecdotal_dose_ranges::text)::jsonb END AS anecdotal_dose_ranges,
    CASE WHEN count(DISTINCT upper_limit)
              FILTER (WHERE upper_limit IS NOT NULL AND upper_limit <> '{}'::jsonb) = 1
         THEN min(upper_limit::text)::jsonb END AS upper_limit,
    CASE WHEN count(DISTINCT nullif(dose_unit, ''))
              FILTER (WHERE nullif(dose_unit, '') IS NOT NULL) = 1
         THEN min(nullif(dose_unit, '')) END AS dose_unit,
    CASE WHEN count(DISTINCT nullif(frequency_en, ''))
              FILTER (WHERE nullif(frequency_en, '') IS NOT NULL) = 1
         THEN min(nullif(frequency_en, '')) END AS frequency_en,
    CASE WHEN count(DISTINCT nullif(duration_studied_en, ''))
              FILTER (WHERE nullif(duration_studied_en, '') IS NOT NULL) = 1
         THEN min(nullif(duration_studied_en, '')) END AS duration_studied_en
  FROM child_rows
  GROUP BY parent_id
)
SELECT
  *,
  (
    (official_label_dose IS NOT NULL)::int +
    (guideline_dose IS NOT NULL)::int +
    (studied_dose_ranges IS NOT NULL)::int +
    (anecdotal_dose_ranges IS NOT NULL)::int +
    (upper_limit IS NOT NULL)::int +
    (dose_unit IS NOT NULL)::int +
    (frequency_en IS NOT NULL)::int +
    (duration_studied_en IS NOT NULL)::int
  ) AS inherited_fields
FROM grouped;

UPDATE supplements.supplement_dosing d
SET
  status = CASE WHEN i.inherited_fields > 0 THEN 'bekannt' ELSE d.status END,
  official_label_dose = COALESCE(d.official_label_dose, i.official_label_dose),
  guideline_dose = COALESCE(d.guideline_dose, i.guideline_dose),
  studied_dose_ranges = COALESCE(d.studied_dose_ranges, i.studied_dose_ranges),
  anecdotal_dose_ranges = COALESCE(d.anecdotal_dose_ranges, i.anecdotal_dose_ranges),
  upper_limit = COALESCE(d.upper_limit, i.upper_limit),
  dose_unit = COALESCE(NULLIF(d.dose_unit, ''), i.dose_unit),
  frequency_en = COALESCE(NULLIF(d.frequency_en, ''), i.frequency_en),
  duration_studied_en = COALESCE(NULLIF(d.duration_studied_en, ''), i.duration_studied_en),
  source = 'c281:inherited_from_children',
  provenance_note = 'C-281: feldweise von einheitlichen Unterformen hochgereicht; abweichende Kindfelder bleiben an den Unterformen.',
  integration_note = 'C-281: Herkunft siehe sources.child_supplement_ids und sources.child_names.',
  sources = jsonb_build_object(
    'source', 'c281',
    'inheritance', 'uniform_child_fields',
    'child_supplement_ids', to_jsonb(i.child_ids),
    'child_names', to_jsonb(i.child_names),
    'inherited_fields', jsonb_strip_nulls(jsonb_build_object(
      'official_label_dose', i.official_label_dose,
      'guideline_dose', i.guideline_dose,
      'studied_dose_ranges', i.studied_dose_ranges,
      'anecdotal_dose_ranges', i.anecdotal_dose_ranges,
      'upper_limit', i.upper_limit,
      'dose_unit', i.dose_unit,
      'frequency_en', i.frequency_en,
      'duration_studied_en', i.duration_studied_en
    ))
  ),
  updated_at = now()
FROM tmp_c281_dosing_inherit i
WHERE d.supplement_id = i.parent_id
  AND i.inherited_fields > 0;

INSERT INTO supplements.supplement_dosing(
  id, supplement_id, status, official_label_dose, guideline_dose,
  studied_dose_ranges, anecdotal_dose_ranges, upper_limit, dose_unit,
  source, frequency_en, duration_studied_en, provenance_note, integration_note, sources
)
SELECT
  pg_temp.c281_uuid('dosing:' || i.parent_id::text),
  i.parent_id,
  'bekannt',
  i.official_label_dose,
  i.guideline_dose,
  i.studied_dose_ranges,
  i.anecdotal_dose_ranges,
  i.upper_limit,
  i.dose_unit,
  'c281:inherited_from_children',
  i.frequency_en,
  i.duration_studied_en,
  'C-281: feldweise von einheitlichen Unterformen hochgereicht; abweichende Kindfelder bleiben an den Unterformen.',
  'C-281: Herkunft siehe sources.child_supplement_ids und sources.child_names.',
  jsonb_build_object(
    'source', 'c281',
    'inheritance', 'uniform_child_fields',
    'child_supplement_ids', to_jsonb(i.child_ids),
    'child_names', to_jsonb(i.child_names),
    'inherited_fields', jsonb_strip_nulls(jsonb_build_object(
      'official_label_dose', i.official_label_dose,
      'guideline_dose', i.guideline_dose,
      'studied_dose_ranges', i.studied_dose_ranges,
      'anecdotal_dose_ranges', i.anecdotal_dose_ranges,
      'upper_limit', i.upper_limit,
      'dose_unit', i.dose_unit,
      'frequency_en', i.frequency_en,
      'duration_studied_en', i.duration_studied_en
    ))
  )
FROM tmp_c281_dosing_inherit i
WHERE i.inherited_fields > 0
  AND NOT EXISTS (
    SELECT 1 FROM supplements.supplement_dosing d WHERE d.supplement_id = i.parent_id
  );

DROP TABLE IF EXISTS tmp_c281_lab_inherit;
CREATE TEMP TABLE tmp_c281_lab_inherit AS
WITH grouped AS (
  SELECT
    c.parent_id,
    p.name_en AS parent_name,
    le.lab_marker_id,
    le.loinc_code,
    le.effect_type,
    le.analyte_de,
    le.analyte_en,
    le.analyte_th,
    count(*) AS child_rows,
    array_agg(c.id ORDER BY c.name_en, c.id) AS child_ids,
    array_agg(c.name_en ORDER BY c.name_en, c.id) AS child_names,
    count(DISTINCT jsonb_build_object(
      'direction', le.direction,
      'mechanism_de', le.mechanism_de,
      'mechanism_en', le.mechanism_en,
      'mechanism_th', le.mechanism_th,
      'clinical_consequence_de', le.clinical_consequence_de,
      'clinical_consequence_en', le.clinical_consequence_en,
      'clinical_consequence_th', le.clinical_consequence_th,
      'evidence', le.evidence,
      'monitoring_link', le.monitoring_link,
      'effect_class', le.effect_class,
      'magnitude_context', le.magnitude_context,
      'clinical_relevance', le.clinical_relevance,
      'source_ids', le.source_ids
    )) AS variants,
    min(le.direction) AS direction,
    min(le.mechanism_de) AS mechanism_de,
    min(le.mechanism_en) AS mechanism_en,
    min(le.mechanism_th) AS mechanism_th,
    min(le.clinical_consequence_de) AS clinical_consequence_de,
    min(le.clinical_consequence_en) AS clinical_consequence_en,
    min(le.clinical_consequence_th) AS clinical_consequence_th,
    min(le.evidence) AS evidence,
    min(le.monitoring_link) AS monitoring_link,
    min(le.effect_class) AS effect_class,
    min(le.magnitude_context) AS magnitude_context,
    min(le.clinical_relevance) AS clinical_relevance,
    ARRAY[]::text[] AS source_ids
  FROM supplements.supplement_lab_effects le
  JOIN supplements.supplements c ON c.id = le.supplement_id
  JOIN supplements.supplements p ON p.id = c.parent_id
  WHERE c.parent_id IS NOT NULL
  GROUP BY c.parent_id, p.name_en, le.lab_marker_id, le.loinc_code, le.effect_type, le.analyte_de, le.analyte_en, le.analyte_th
)
SELECT * FROM grouped;

DELETE FROM supplements.supplement_lab_effects WHERE source = 'c281:inherited_from_children';

INSERT INTO supplements.supplement_lab_effects(
  id, supplement_id, status, lab_marker_id, loinc_code, effect_type,
  analyte_de, analyte_en, analyte_th, direction,
  mechanism_de, mechanism_en, mechanism_th,
  clinical_consequence_de, clinical_consequence_en, clinical_consequence_th,
  evidence, monitoring_link, source, effect_class, magnitude_context,
  clinical_relevance, source_ids, enrichment_raw
)
SELECT
  pg_temp.c281_uuid('lab:' || parent_id::text || ':' || coalesce(lab_marker_id,'') || ':' || coalesce(loinc_code,'') || ':' || coalesce(effect_type,'') || ':' || coalesce(analyte_en,'')),
  parent_id,
  'bekannt',
  lab_marker_id,
  loinc_code,
  effect_type,
  analyte_de,
  analyte_en,
  analyte_th,
  direction,
  mechanism_de,
  mechanism_en,
  mechanism_th,
  clinical_consequence_de,
  clinical_consequence_en,
  clinical_consequence_th,
  evidence,
  monitoring_link,
  'c281:inherited_from_children',
  effect_class,
  magnitude_context,
  clinical_relevance,
  source_ids,
  jsonb_build_object(
    'source', 'c281',
    'inheritance', 'uniform_child_lab_effect',
    'child_supplement_ids', to_jsonb(child_ids),
    'child_names', to_jsonb(child_names)
  )
FROM tmp_c281_lab_inherit i
WHERE variants = 1
  AND NOT EXISTS (
    SELECT 1
    FROM supplements.supplement_lab_effects existing
    WHERE existing.supplement_id = i.parent_id
      AND coalesce(existing.lab_marker_id, '') = coalesce(i.lab_marker_id, '')
      AND coalesce(existing.loinc_code, '') = coalesce(i.loinc_code, '')
      AND coalesce(existing.effect_type, '') = coalesce(i.effect_type, '')
      AND coalesce(existing.analyte_en, '') = coalesce(i.analyte_en, '')
      AND existing.source <> 'c281:inherited_from_children'
  );

DROP TABLE IF EXISTS tmp_c281_wada_inherit;
CREATE TEMP TABLE tmp_c281_wada_inherit AS
WITH grouped AS (
  SELECT
    c.parent_id,
    p.name_en AS parent_name,
    count(*) AS child_rows,
    array_agg(c.id ORDER BY c.name_en, c.id) AS child_ids,
    array_agg(c.name_en ORDER BY c.name_en, c.id) AS child_names,
    count(DISTINCT jsonb_build_object(
      'wada_status', w.wada_status,
      'wada_category', w.wada_category,
      'detection_time_days', w.detection_time_days,
      'note_de', w.note_de,
      'note_en', w.note_en,
      'note_th', w.note_th,
      'scope_class', w.scope_class,
      'scope_note_de', w.scope_note_de,
      'scope_note_en', w.scope_note_en,
      'scope_note_th', w.scope_note_th,
      'sports_scope', w.sports_scope,
      'tue_relevance', w.tue_relevance,
      'list_year', w.list_year,
      'last_verified', w.last_verified
    )) AS variants,
    min(w.wada_status) AS wada_status,
    min(w.wada_category) AS wada_category,
    min(w.detection_time_days) AS detection_time_days,
    min(w.note_de) AS note_de,
    min(w.note_en) AS note_en,
    min(w.note_th) AS note_th,
    min(w.scope_class) AS scope_class,
    min(w.scope_note_de) AS scope_note_de,
    min(w.scope_note_en) AS scope_note_en,
    min(w.scope_note_th) AS scope_note_th,
    min(w.sports_scope) AS sports_scope,
    min(w.tue_relevance) AS tue_relevance,
    min(w.list_year) AS list_year,
    min(w.last_verified) AS last_verified,
    jsonb_agg(w.sources) FILTER (WHERE w.sources IS NOT NULL) AS sources
  FROM supplements.supplement_wada w
  JOIN supplements.supplements c ON c.id = w.supplement_id
  JOIN supplements.supplements p ON p.id = c.parent_id
  WHERE c.parent_id IS NOT NULL
  GROUP BY c.parent_id, p.name_en
)
SELECT * FROM grouped;

DELETE FROM supplements.supplement_wada WHERE source = 'c281:inherited_from_children';

INSERT INTO supplements.supplement_wada(
  id, supplement_id, status, wada_status, wada_category, detection_time_days,
  note_de, note_en, note_th, source, scope_class, scope_note_de, scope_note_en,
  scope_note_th, sports_scope, tue_relevance, list_year, last_verified, sources, raw
)
SELECT
  pg_temp.c281_uuid('wada:' || parent_id::text),
  parent_id,
  CASE WHEN coalesce(wada_status, '') IN ('', 'unknown') THEN 'unbekannt' ELSE 'bekannt' END,
  wada_status,
  wada_category,
  detection_time_days,
  note_de,
  note_en,
  note_th,
  'c281:inherited_from_children',
  scope_class,
  scope_note_de,
  scope_note_en,
  scope_note_th,
  sports_scope,
  tue_relevance,
  list_year,
  last_verified,
  jsonb_build_object(
    'source', 'c281',
    'inheritance', 'uniform_child_wada',
    'child_sources', coalesce(sources, '[]'::jsonb)
  ),
  jsonb_build_object(
    'source', 'c281',
    'inheritance', 'uniform_child_wada',
    'child_supplement_ids', to_jsonb(child_ids),
    'child_names', to_jsonb(child_names)
  )
FROM tmp_c281_wada_inherit i
WHERE variants = 1
  AND NOT EXISTS (
    SELECT 1 FROM supplements.supplement_wada existing
    WHERE existing.supplement_id = i.parent_id
      AND existing.source <> 'c281:inherited_from_children'
  );

DO $$
DECLARE
  v_dosing_groups int;
  v_dosing_parents int;
  v_dosing_fields int;
  v_dosing_rows int;
  v_lab_uniform int;
  v_lab_nonuniform int;
  v_lab_inserted int;
  v_wada_uniform int;
  v_wada_nonuniform int;
  v_wada_inserted int;
  v_caffeine_parent uuid;
  v_caffeine_parent_wada int;
  v_magnesium_parent uuid;
  v_magnesium_dose_unit text;
  v_im int;
  v_children int;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE inherited_fields > 0), coalesce(sum(inherited_fields), 0)
  INTO v_dosing_groups, v_dosing_parents, v_dosing_fields
  FROM tmp_c281_dosing_inherit;
  SELECT count(*) INTO v_dosing_rows FROM supplements.supplement_dosing WHERE source = 'c281:inherited_from_children';

  SELECT count(*) FILTER (WHERE variants = 1), count(*) FILTER (WHERE variants > 1)
  INTO v_lab_uniform, v_lab_nonuniform
  FROM tmp_c281_lab_inherit;
  SELECT count(*) INTO v_lab_inserted FROM supplements.supplement_lab_effects WHERE source = 'c281:inherited_from_children';

  SELECT count(*) FILTER (WHERE variants = 1), count(*) FILTER (WHERE variants > 1)
  INTO v_wada_uniform, v_wada_nonuniform
  FROM tmp_c281_wada_inherit;
  SELECT count(*) INTO v_wada_inserted FROM supplements.supplement_wada WHERE source = 'c281:inherited_from_children';

  SELECT id INTO v_caffeine_parent FROM supplements.supplements WHERE name_en = 'Caffeine' AND parent_id IS NULL;
  SELECT count(*) INTO v_caffeine_parent_wada FROM supplements.supplement_wada WHERE supplement_id = v_caffeine_parent AND source = 'c281:inherited_from_children';

  SELECT id INTO v_magnesium_parent FROM supplements.supplements WHERE name_en = 'Magnesium' AND parent_id IS NULL;
  SELECT dose_unit INTO v_magnesium_dose_unit FROM supplements.supplement_dosing WHERE supplement_id = v_magnesium_parent LIMIT 1;

  SELECT count(*) FILTER (WHERE im_katalog AND parent_id IS NULL),
         count(*) FILTER (WHERE im_katalog AND parent_id IS NOT NULL)
  INTO v_im, v_children
  FROM supplements.supplements;

  IF v_dosing_parents <> 22 OR v_dosing_fields <> 109 THEN
    RAISE EXCEPTION 'C-281 Dosing-Erwartung verletzt: Gruppen %, Eltern %, Felder % statt */22/109',
      v_dosing_groups, v_dosing_parents, v_dosing_fields;
  END IF;
  IF v_dosing_rows <> 22 THEN
    RAISE EXCEPTION 'C-281 Dosing hochgereicht % statt 22', v_dosing_rows;
  END IF;
  IF v_lab_uniform <> 46 OR v_lab_nonuniform <> 1 OR v_lab_inserted <> 46 THEN
    RAISE EXCEPTION 'C-281 Lab-Erwartung verletzt: uniform %, uneinheitlich %, eingefuegt % statt 46/1/46',
      v_lab_uniform, v_lab_nonuniform, v_lab_inserted;
  END IF;
  IF v_wada_uniform <> 17 OR v_wada_nonuniform <> 1 OR v_wada_inserted <> 17 THEN
    RAISE EXCEPTION 'C-281 WADA-Erwartung verletzt: uniform %, uneinheitlich %, eingefuegt % statt 17/1/17',
      v_wada_uniform, v_wada_nonuniform, v_wada_inserted;
  END IF;
  IF v_caffeine_parent_wada <> 0 THEN
    RAISE EXCEPTION 'C-281 Koffein darf wegen monitored/not_prohibited keinen geerbten WADA-Status tragen';
  END IF;
  IF coalesce(v_magnesium_dose_unit, '') <> '' THEN
    RAISE EXCEPTION 'C-281 Magnesium darf keine einheitliche dose_unit erben, gemessen: %', v_magnesium_dose_unit;
  END IF;
  IF v_im <> 412 OR v_children <> 0 THEN
    RAISE EXCEPTION 'C-281 im_katalog %, sichtbare Unterformen %, erwartet 412/0', v_im, v_children;
  END IF;

  RAISE NOTICE 'OK C-281: Dosis 22 Eltern/109 Felder, Lab 46 geerbt/1 gemeldet, WADA 17 geerbt/1 gemeldet; Koffein und Magnesium nicht blind vererbt';
END $$;

COMMIT;
