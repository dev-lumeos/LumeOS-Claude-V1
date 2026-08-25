-- =============================================================
-- 141e -- Supplements: Kern-Dubletten in Unterformen ziehen (C-276)
-- Datum: 2026-08-25
-- Zweck:
--   C-275 machte Kimi-Formen sichtbar, die C-244 noch nicht kannte.
--   Sammelname + Form wird per parent_id abgebildet. Zwei fachlich
--   unterschiedliche Formen ohne Sammelnamen bleiben sichtbar.
--
-- Grenze:
--   Keine Substanz wird geloescht oder zusammengefuehrt. parent_id
--   beschreibt nur die Kataloghierarchie. Cross-Ref-Zeilen bleiben
--   sichtbare Ausnahmen, weil sie Verweise und keine Formen sind.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stable_uuid(p_key text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5(p_key), 1, 8) || '-' ||
    substr(md5(p_key), 9, 4) || '-' ||
    substr(md5(p_key), 13, 4) || '-' ||
    substr(md5(p_key), 17, 4) || '-' ||
    substr(md5(p_key), 21, 12)
  )::uuid;
$$;

CREATE OR REPLACE FUNCTION pg_temp.c276_core(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  WITH stripped AS (
    SELECT regexp_replace(coalesce(p_name, ''), '\s*\([^)]*\)', '', 'g') AS value
  )
  SELECT regexp_replace(lower(value), '[^a-z0-9]+', '', 'g') FROM stripped;
$$;

CREATE TEMP TABLE tmp_c276_visible_form_map (
  child_slug text PRIMARY KEY,
  parent_slug text NOT NULL,
  form_note_en text NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_c276_visible_form_map(child_slug, parent_slug, form_note_en) VALUES
  ('sub_c92eb30265', 'ashwagandha-ksm66', 'Kimi root-extract form for the Ashwagandha KSM-66/Sensoril catalog entry.'),
  ('f05_boldenone_acetate', 'sub_af6dd9482e', 'Boldenone acetate ester under the Boldenone undecylenate catalog branch.'),
  ('f05_boldenone_cypionate', 'sub_af6dd9482e', 'Boldenone cypionate ester under the Boldenone undecylenate catalog branch.'),
  ('sub_2c308411e9', 'caffeine', 'Anhydrous caffeine form under the caffeine umbrella entry.'),
  ('sub_7f400b189e', 'calcium', 'Calcium carbonate form under the calcium umbrella entry.'),
  ('sub_4aff89287a', 'calcium', 'Calcium citrate form under the calcium umbrella entry.'),
  ('sub_96dc337b14', 'iron', 'Ferrous bisglycinate form under the iron umbrella entry.'),
  ('sub_1b98d69c9a', 'iron', 'Ferrous sulfate form under the iron umbrella entry.'),
  ('sub_ca8d1dd406', 'lions-mane', 'Hericium erinaceus form under the Lion''s Mane umbrella entry.'),
  ('f05_nac', 'nac', 'C-276: Kimi NAC was resolved onto the old f05 slug; it is kept as a child of the NAC umbrella entry.'),
  ('sub_f4b95e805a', 'nac', 'N-acetylcysteine form under the NAC umbrella entry.'),
  ('sub_73c6284113', 'tongkat-ali', 'Eurycoma longifolia form under the Tongkat Ali umbrella entry.'),
  ('sub_d370f8f2d6', 'vitamin-a', 'Retinol form under the Vitamin A umbrella entry.'),
  ('sub_72b40a8c12', 'vitamin-b12', 'Cyanocobalamin form under the Vitamin B12 umbrella entry.'),
  ('sub_471f5dcf68', 'vitamin-b12', 'Methylcobalamin form under the Vitamin B12 umbrella entry.'),
  ('sub_df4b1c61d9', 'vitamin-b6', 'Pyridoxine form under the Vitamin B6 umbrella entry.'),
  ('sub_d0c44bc87d', 'vitamin-c', 'Ascorbic-acid form under the Vitamin C umbrella entry.'),
  ('sub_479964998b', 'vitamin-d3', 'Cholecalciferol form under the Vitamin D3 umbrella entry.'),
  ('sub_adb0d25fb4', 'vitamin-e', 'Alpha-tocopherol form under the Vitamin E umbrella entry.'),
  ('sub_6764c8891c', 'vitamin-k2-mk7', 'Kimi menaquinone-7 form under the existing Vitamin K2 MK-7 entry.'),
  ('sub_28b365f4e1', 'zinc', 'Zinc gluconate form under the zinc umbrella entry.'),
  ('sub_7eec2628a4', 'zinc', 'Zinc picolinate form under the zinc umbrella entry.');

WITH resolved AS (
  SELECT child.id AS child_id, parent.id AS parent_id, child.name_en AS child_name, parent.name_en AS parent_name, m.form_note_en
  FROM tmp_c276_visible_form_map m
  JOIN supplements.supplements child ON child.slug = m.child_slug
  JOIN supplements.supplements parent ON parent.slug = m.parent_slug
)
UPDATE supplements.supplements child
SET parent_id = resolved.parent_id,
    form_note_de = 'Unterform von ' || resolved.parent_name || '; die obere Katalogebene bleibt der Sammelname.',
    form_note_en = resolved.form_note_en,
    updated_at = now()
FROM resolved
WHERE child.id = resolved.child_id
  AND child.parent_id IS DISTINCT FROM resolved.parent_id;

CREATE TEMP TABLE tmp_c276_hidden_candidates AS
WITH visible AS (
  SELECT id, slug, name_en, source, pg_temp.c276_core(name_en) AS core
  FROM supplements.supplements
  WHERE im_katalog
    AND parent_id IS NULL
), candidates AS (
  SELECT
    hidden.id AS hidden_id,
    hidden.slug AS hidden_slug,
    hidden.name_en AS hidden_name,
    visible.id AS parent_id,
    visible.slug AS parent_slug,
    visible.name_en AS parent_name,
    row_number() OVER (
      PARTITION BY hidden.id
      ORDER BY
        CASE WHEN visible.source = 'lumeos_supplement_catalog' THEN 0 ELSE 1 END,
        CASE WHEN lower(visible.name_en) = lower(hidden.name_en) THEN 0 ELSE 1 END,
        char_length(visible.name_en),
        visible.slug
    ) AS rank
  FROM supplements.supplements hidden
  JOIN visible ON visible.core = pg_temp.c276_core(hidden.name_en)
  WHERE NOT hidden.im_katalog
    AND hidden.parent_id IS NULL
    AND pg_temp.c276_core(hidden.name_en) <> ''
)
SELECT * FROM candidates WHERE rank = 1;

UPDATE supplements.supplements hidden
SET parent_id = c.parent_id,
    form_note_de = 'Verborgene F-05-Huelle mit gleichem Namenskern; haengt am sichtbaren Katalogeintrag ' || c.parent_name || '.',
    form_note_en = 'Hidden F-05 shell with the same name core; attached to the visible catalog entry ' || c.parent_name || '.',
    updated_at = now()
FROM tmp_c276_hidden_candidates c
WHERE hidden.id = c.hidden_id
  AND hidden.parent_id IS DISTINCT FROM c.parent_id;

WITH newly_parented AS (
  SELECT child.id AS child_id, parent.id AS parent_id, coalesce(child.name_en, child.name_de, child.slug) AS alias
  FROM supplements.supplements child
  JOIN supplements.supplements parent ON parent.id = child.parent_id
  WHERE child.slug IN (SELECT child_slug FROM tmp_c276_visible_form_map)
     OR child.id IN (SELECT hidden_id FROM tmp_c276_hidden_candidates)
)
INSERT INTO supplements.supplement_aliases (id, supplement_id, alias, locale, source, confidence)
SELECT
  pg_temp.stable_uuid('c276_parent_alias:' || parent_id::text || ':' || lower(alias)),
  parent_id,
  alias,
  'und',
  'c276_parent_resolution',
  1.0
FROM newly_parented
WHERE alias IS NOT NULL
  AND btrim(alias) <> ''
ON CONFLICT DO NOTHING;

CREATE TEMP TABLE tmp_c276_allowed_duplicate_cores(core text PRIMARY KEY, reason text NOT NULL) ON COMMIT DROP;
INSERT INTO tmp_c276_allowed_duplicate_cores(core, reason) VALUES
  ('boron', 'Boron and hormonal cross-ref are separate visible records, not salt forms.'),
  ('caffeine', 'Caffeine and fat-loss context cross-ref are separate visible records; anhydrous caffeine is a child.'),
  ('panaxginseng', 'American and Korean red ginseng remain separate visible botanical forms; no umbrella record exists.'),
  ('vitaminb3', 'Nicotinic acid and nicotinamide differ pharmacologically; no umbrella record exists.'),
  ('vitamink2', 'MK-4 and MK-7 remain separate visible forms; the duplicate MK-7 Kimi row is a child.'),
  ('zinc', 'Zinc and testosterone-context cross-ref are separate visible records; salt forms are children.');

DO $$
DECLARE
  v_visible_forms integer;
  v_hidden_parented integer;
  v_parented_total integer;
  v_unknown_duplicate_groups integer;
  v_top_level_duplicates integer;
  v_vitamin_c_parent text;
  v_vitamin_b3_visible integer;
  v_nac_top integer;
BEGIN
  SELECT count(*) INTO v_visible_forms
  FROM supplements.supplements s
  JOIN tmp_c276_visible_form_map m ON m.child_slug = s.slug
  WHERE s.parent_id IS NOT NULL;
  IF v_visible_forms <> 22 THEN
    RAISE EXCEPTION 'C-276 sichtbare Formen parented: %, erwartet 22', v_visible_forms;
  END IF;

  SELECT count(*) INTO v_hidden_parented
  FROM tmp_c276_hidden_candidates c
  JOIN supplements.supplements s ON s.id = c.hidden_id
  WHERE s.parent_id IS NOT NULL;
  IF v_hidden_parented NOT IN (0, 50, 66) THEN
    RAISE EXCEPTION 'C-276 unsichtbare Huellen parented: %, erwartet 0 (idempotenter Wiederlauf), 50 (frische Kette) oder 66 (Live-Drift)', v_hidden_parented;
  END IF;

  SELECT count(*) INTO v_parented_total FROM supplements.supplements WHERE parent_id IS NOT NULL;

  WITH top_level AS (
    SELECT slug, name_en, pg_temp.c276_core(name_en) AS core
    FROM supplements.supplements
    WHERE im_katalog
      AND parent_id IS NULL
  ), dupes AS (
    SELECT core, count(*) AS n
    FROM top_level
    WHERE core <> ''
    GROUP BY core
    HAVING count(*) > 1
  )
  SELECT count(*),
         count(*) FILTER (WHERE a.core IS NULL)
  INTO v_top_level_duplicates, v_unknown_duplicate_groups
  FROM dupes d
  LEFT JOIN tmp_c276_allowed_duplicate_cores a ON a.core = d.core;
  IF v_top_level_duplicates NOT IN (4, 6) OR v_unknown_duplicate_groups <> 0 THEN
    RAISE EXCEPTION 'C-276 Top-Level-Kerndubletten: % Gruppen, % unbekannt; erwartet 4 oder 6 / 0 unbekannt',
      v_top_level_duplicates, v_unknown_duplicate_groups;
  END IF;

  SELECT parent.name_en INTO v_vitamin_c_parent
  FROM supplements.supplements child
  JOIN supplements.supplements parent ON parent.id = child.parent_id
  WHERE child.slug = 'sub_d0c44bc87d';
  IF v_vitamin_c_parent <> 'Vitamin C' THEN
    RAISE EXCEPTION 'C-276 Gegenprobe Vitamin C parent: %, erwartet Vitamin C', v_vitamin_c_parent;
  END IF;

  SELECT count(*) INTO v_vitamin_b3_visible
  FROM supplements.supplements
  WHERE im_katalog
    AND parent_id IS NULL
    AND slug IN ('sub_2baf990d69', 'sub_7dc88a93db');
  IF v_vitamin_b3_visible <> 2 THEN
    RAISE EXCEPTION 'C-276 Gegenprobe Vitamin B3 sichtbar: %, erwartet 2', v_vitamin_b3_visible;
  END IF;

  SELECT count(*) INTO v_nac_top
  FROM supplements.supplements
  WHERE im_katalog
    AND parent_id IS NULL
    AND pg_temp.c276_core(name_en) = 'nac';
  IF v_nac_top <> 1 THEN
    RAISE EXCEPTION 'C-276 NAC Top-Level: %, erwartet 1', v_nac_top;
  END IF;

  RAISE NOTICE 'OK C-276: sichtbare Formen %, unsichtbare Huellen %, parent_id gesamt %, erlaubte Top-Level-Kerndubletten %',
    v_visible_forms, v_hidden_parented, v_parented_total, v_top_level_duplicates;
END $$;

COMMIT;
