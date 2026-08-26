BEGIN;

CREATE SCHEMA IF NOT EXISTS supplements;

CREATE OR REPLACE FUNCTION pg_temp.c282_uuid(p_text text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5('c282:' || p_text), 1, 8) || '-' ||
    substr(md5('c282:' || p_text), 9, 4) || '-' ||
    substr(md5('c282:' || p_text), 13, 4) || '-' ||
    substr(md5('c282:' || p_text), 17, 4) || '-' ||
    substr(md5('c282:' || p_text), 21, 12)
  )::uuid
$$;

DELETE FROM supplements.wada_conflict_records
WHERE source = 'c282:wada_status_category_self_conflict';

WITH contradictions AS (
  SELECT
    s.id AS supplement_id,
    s.slug,
    s.name_en,
    w.id AS wada_id,
    w.wada_status,
    w.wada_category,
    w.list_year,
    w.last_verified,
    w.sources,
    w.raw,
    CASE
      WHEN w.wada_status = 'prohibited' AND w.wada_category ILIKE '%not prohibited%'
        THEN 'prohibited_status_with_not_prohibited_category'
      WHEN w.wada_status = 'not_prohibited'
           AND w.wada_category ILIKE '%prohibited%'
           AND w.wada_category NOT ILIKE '%not prohibited%'
        THEN 'not_prohibited_status_with_prohibited_category'
    END AS contradiction_type
  FROM supplements.supplement_wada w
  JOIN supplements.supplements s ON s.id = w.supplement_id
  WHERE (w.wada_status = 'prohibited' AND w.wada_category ILIKE '%not prohibited%')
     OR (w.wada_status = 'not_prohibited'
         AND w.wada_category ILIKE '%prohibited%'
         AND w.wada_category NOT ILIKE '%not prohibited%')
)
INSERT INTO supplements.wada_conflict_records(
  id, conflict_id, entity_id, canonical_name, field_name,
  current_value, corrected_value, category, reason, list_year,
  last_verified, source_url, application_note, raw, source
)
SELECT
  pg_temp.c282_uuid('wada_self_conflict:' || supplement_id::text || ':' || contradiction_type),
  'c282_' || slug || '_' || contradiction_type,
  slug,
  name_en,
  'wada_status_vs_wada_category',
  jsonb_build_object(
    'wada_status', wada_status,
    'wada_category', wada_category
  )::text,
  NULL,
  'VALUE_CONFLICT',
  'C-282: wada_status und wada_category widersprechen sich in derselben Zeile. Nicht korrigiert; Konflikt muss fachlich aufgeloest werden.',
  list_year,
  last_verified,
  NULL,
  'Anzeige darf die widerspruechliche Kategorie unterdruecken, aber die Datenbank haelt den Konflikt fest.',
  jsonb_build_object(
    'source', 'c282',
    'wada_id', wada_id,
    'contradiction_type', contradiction_type,
    'sources', sources,
    'raw', raw
  ),
  'c282:wada_status_category_self_conflict'
FROM contradictions;

DO $$
DECLARE
  v_forward int;
  v_reverse int;
  v_conflicts int;
  v_names text;
  v_im int;
  v_children int;
BEGIN
  SELECT count(*), string_agg(s.name_en, ', ' ORDER BY s.name_en)
  INTO v_forward, v_names
  FROM supplements.supplement_wada w
  JOIN supplements.supplements s ON s.id = w.supplement_id
  WHERE w.wada_status = 'prohibited'
    AND w.wada_category ILIKE '%not prohibited%';

  SELECT count(*)
  INTO v_reverse
  FROM supplements.supplement_wada w
  WHERE w.wada_status = 'not_prohibited'
    AND w.wada_category ILIKE '%prohibited%'
    AND w.wada_category NOT ILIKE '%not prohibited%';

  SELECT count(*)
  INTO v_conflicts
  FROM supplements.wada_conflict_records
  WHERE source = 'c282:wada_status_category_self_conflict';

  SELECT count(*) FILTER (WHERE im_katalog AND parent_id IS NULL),
         count(*) FILTER (WHERE im_katalog AND parent_id IS NOT NULL)
  INTO v_im, v_children
  FROM supplements.supplements;

  IF v_forward <> 2 THEN
    RAISE EXCEPTION 'C-282 Forward-Widerspruch % statt 2: %', v_forward, coalesce(v_names, '');
  END IF;
  IF v_reverse <> 0 THEN
    RAISE EXCEPTION 'C-282 Rueckrichtung not_prohibited mit Verbotskategorie % statt 0', v_reverse;
  END IF;
  IF v_conflicts <> 2 THEN
    RAISE EXCEPTION 'C-282 Konflikt-Records % statt 2', v_conflicts;
  END IF;
  IF v_im <> 412 OR v_children <> 0 THEN
    RAISE EXCEPTION 'C-282 im_katalog %, sichtbare Unterformen %, erwartet 412/0', v_im, v_children;
  END IF;

  RAISE NOTICE 'OK C-282: WADA-Selbstwidersprueche 2 als Konflikt-Records, Rueckrichtung 0, Namen %', v_names;
END $$;

COMMIT;
