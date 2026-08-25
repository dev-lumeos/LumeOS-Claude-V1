-- =============================================================
-- 138 -- Supplements-Neuaufbau Schritt 3: Stack-Items umhaengen
-- Datum: 2026-08-23
-- Zweck:
--   C-243/C-242: Katalogsicht markieren und stack_items.supplement_id
--   von supplements.supplement_catalog auf supplements.supplements
--   umhaengen. Keine Lesepfade, kein Loeschen alter Tabellen.
--
-- Entscheidung:
--   Magnesium und Vitamin D3 werden NICHT auf eine Kimi-Salzform geraten.
--   Wenn ein altes stack_item nicht eindeutig ueber
--   stack_item_substance_matches.kimi_substance_id aufloesbar ist, bleibt
--   die Zeile erhalten, bekommt den bisherigen Katalognamen als custom_name
--   und supplement_id wird NULL. Damit bleibt der Nutzerbestand sichtbar,
--   ohne eine fachliche Salzform zu behaupten.
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'supplements'
      AND table_name = 'supplements'
      AND column_name = 'im_katalog'
  ) THEN
    ALTER TABLE supplements.supplements
      ADD COLUMN im_katalog boolean GENERATED ALWAYS AS (
        NULLIF(btrim(COALESCE(description_de, '')), '') IS NOT NULL
        OR NULLIF(btrim(COALESCE(description_en, '')), '') IS NOT NULL
        OR evidence_grade IS NOT NULL
      ) STORED;
  END IF;
END $$;

CREATE TEMP TABLE tmp_c243_stack_resolution AS
SELECT
  si.id AS stack_item_id,
  si.supplement_id AS old_supplement_id,
  si.custom_name AS old_custom_name,
  sc.slug AS old_slug,
  sc.name AS old_name,
  sc.name_de AS old_name_de,
  m.kimi_substance_id,
  ns.id AS new_supplement_id,
  ns.name_en AS new_name_en
FROM supplements.stack_items si
LEFT JOIN supplements.supplement_catalog sc ON sc.id = si.supplement_id
LEFT JOIN LATERAL (
  SELECT DISTINCT ON (sim.stack_item_id)
    sim.kimi_substance_id
  FROM supplements.stack_item_substance_matches sim
  WHERE sim.stack_item_id = si.id
  ORDER BY sim.stack_item_id, sim.kimi_substance_id
) m ON true
LEFT JOIN supplements.supplements ns ON ns.slug = m.kimi_substance_id
WHERE si.supplement_id IS NOT NULL;

ALTER TABLE supplements.stack_items
  DROP CONSTRAINT IF EXISTS stack_items_supplement_id_fkey;

UPDATE supplements.stack_items si
SET supplement_id = r.new_supplement_id,
    custom_name = NULL,
    updated_at = now()
FROM tmp_c243_stack_resolution r
WHERE r.stack_item_id = si.id
  AND r.new_supplement_id IS NOT NULL;

UPDATE supplements.stack_items si
SET supplement_id = NULL,
    custom_name = COALESCE(
      NULLIF(si.custom_name, ''),
      NULLIF(r.old_name_de, ''),
      NULLIF(r.old_name, ''),
      NULLIF(r.old_slug, ''),
      'Unaufgeloestes Supplement'
    ),
    notes = concat_ws(
      E'\n',
      NULLIF(si.notes, ''),
      'C-243: Nicht automatisch auf supplements.supplements umgehaengt; Salzform/fachliche Identitaet offen.'
    ),
    updated_at = now()
FROM tmp_c243_stack_resolution r
WHERE r.stack_item_id = si.id
  AND r.new_supplement_id IS NULL;

ALTER TABLE supplements.stack_items
  ADD CONSTRAINT stack_items_supplement_id_fkey
  FOREIGN KEY (supplement_id) REFERENCES supplements.supplements(id) ON DELETE RESTRICT;

INSERT INTO supplements.stack_items (
  id, stack_id, supplement_id, custom_name, notes, dose, dose_unit,
  frequency, timing, stock_remaining, stock_unit, low_stock_threshold,
  sort_order, is_active
)
SELECT
  pg_temp.stable_uuid('c243:test-user:creatine'),
  us.id,
  s.id,
  NULL,
  'C-243 Seed: test-user Nachweisposition auf neuem supplements.supplements-Katalog.',
  5,
  'g',
  'daily',
  'any',
  NULL,
  NULL,
  NULL,
  10,
  true
FROM supplements.user_stacks us
JOIN auth.users u ON u.id = us.user_id
JOIN supplements.supplements s ON s.slug = 'sub_9f9bb8c160'
WHERE u.email = 'test-user@lumeos.local'
  AND NOT EXISTS (
    SELECT 1 FROM supplements.stack_items x
    WHERE x.id = pg_temp.stable_uuid('c243:test-user:creatine')
  );

INSERT INTO supplements.stack_items (
  id, stack_id, supplement_id, custom_name, notes, dose, dose_unit,
  frequency, timing, stock_remaining, stock_unit, low_stock_threshold,
  sort_order, is_active
)
SELECT
  pg_temp.stable_uuid('c243:test-user:omega3'),
  us.id,
  s.id,
  NULL,
  'C-243 Seed: test-user Nachweisposition auf neuem supplements.supplements-Katalog.',
  2,
  'g',
  'daily',
  'with_meal',
  NULL,
  NULL,
  NULL,
  11,
  true
FROM supplements.user_stacks us
JOIN auth.users u ON u.id = us.user_id
JOIN supplements.supplements s ON s.slug = 'sub_4480fcfa86'
WHERE u.email = 'test-user@lumeos.local'
  AND NOT EXISTS (
    SELECT 1 FROM supplements.stack_items x
    WHERE x.id = pg_temp.stable_uuid('c243:test-user:omega3')
  );

DO $$
DECLARE
  v_true integer;
  v_false integer;
  v_total integer;
  v_bad_fk integer;
  v_resolved integer;
  v_unresolved integer;
  v_custom integer;
  v_test_seed integer;
BEGIN
  SELECT count(*) FILTER (WHERE im_katalog),
         count(*) FILTER (WHERE NOT im_katalog),
         count(*)
    INTO v_true, v_false, v_total
  FROM supplements.supplements;

  IF v_true <> 291 OR v_false <> 276 OR v_total <> 566 THEN
    RAISE EXCEPTION 'C-243 im_katalog: true %, false %, total %, erwartet 290/276/566',
      v_true, v_false, v_total;
  END IF;

  SELECT count(*) INTO v_bad_fk
  FROM supplements.stack_items si
  LEFT JOIN supplements.supplements s ON s.id = si.supplement_id
  WHERE si.supplement_id IS NOT NULL
    AND s.id IS NULL;

  IF v_bad_fk <> 0 THEN
    RAISE EXCEPTION 'C-243 stack_items: % supplement_id ohne supplements.supplements-Ziel', v_bad_fk;
  END IF;

  SELECT count(*) INTO v_resolved
  FROM supplements.stack_items si
  JOIN supplements.supplements s ON s.id = si.supplement_id
  WHERE s.slug IN ('sub_9f9bb8c160', 'sub_4480fcfa86');

  SELECT count(*) INTO v_unresolved
  FROM supplements.stack_items
  WHERE supplement_id IS NULL
    AND notes LIKE '%C-243:%';

  SELECT count(*) INTO v_custom
  FROM supplements.stack_items
  WHERE supplement_id IS NULL
    AND custom_name IS NOT NULL;

  SELECT count(*) INTO v_test_seed
  FROM supplements.stack_items si
  JOIN supplements.user_stacks us ON us.id = si.stack_id
  JOIN auth.users u ON u.id = us.user_id
  WHERE u.email = 'test-user@lumeos.local'
    AND si.supplement_id IS NOT NULL;

  RAISE NOTICE
    'OK C-243/C-242: im_katalog true %, false %, stack_items resolved %, unresolved %, custom %, test-user supplement_id %',
    v_true, v_false, v_resolved, v_unresolved, v_custom, v_test_seed;
END $$;

COMMIT;
