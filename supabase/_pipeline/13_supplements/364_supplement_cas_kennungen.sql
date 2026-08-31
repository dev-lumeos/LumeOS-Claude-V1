-- C-365: 33 einzeln belegte CAS-Nummern aus dem aktuellen maschinenlesbaren
-- Kimi-Bestand. Sie sind eigene Kennungen, nicht die unsicheren
-- cas_candidates. Peptidsequenzen bleiben bewusst ohne Ziel.

BEGIN;

CREATE TEMP TABLE tmp_c365_cas (
  slug TEXT PRIMARY KEY,
  cas_number TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_c365_cas (slug, cas_number) VALUES
  ('sub_dcb8ab1209', '137525-51-0'),
  ('sub_d4f140bc56', '885340-08-9'),
  ('sub_fcb3b6dc30', '77591-33-4'),
  ('sub_271e0f2373', '67727-97-3'),
  ('sub_d6690ba08f', '49557-75-7'),
  ('sub_73ea811e99', '597562-32-8'),
  ('sub_848a3aaf7f', '1627580-64-6'),
  ('sub_a21a1bf992', '221231-10-3'),
  ('sub_74cb0c22b1', '863288-34-0'),
  ('sub_18fdc6c754', '863288-34-0'),
  ('sub_55820f027f', '446262-89-1'),
  ('sub_16306ba3e5', '170851-70-4'),
  ('sub_50a7fb5f3c', '158861-67-7'),
  ('sub_a1c4492d17', '87616-84-0'),
  ('sub_60eed56d73', '140703-51-1'),
  ('sub_85c8d4ddec', '86168-78-7'),
  ('sub_313fdcf581', '218949-48-5'),
  ('sub_8bddfad866', '68562-41-4'),
  ('sub_f4dce63643', '946870-92-4'),
  ('sub_1c34a9f129', '112603-35-7'),
  ('sub_4d6afb6227', '80714-61-0'),
  ('sub_5959e28c02', '129954-34-3'),
  ('sub_12eddaf876', '62568-57-4'),
  ('sub_d9569c9e86', '1401708-83-5'),
  ('sub_e5dc9f8f1f', '175175-23-2'),
  ('sub_4b528225b1', '204271-66-9'),
  ('sub_7c0f9133e7', '45234-02-4'),
  ('sub_e092c450ce', '335591-03-2'),
  ('sub_a12cc12158', '307297-39-8'),
  ('sub_58ea56993c', '75921-69-6'),
  ('sub_15f568b407', '121062-08-6'),
  ('sub_36d3652f3c', '189691-06-3'),
  ('sub_d1b4922e08', '62304-98-7');

DO $$
DECLARE
  v_missing_targets INTEGER;
  v_invalid_format INTEGER;
  v_invalid_checksum INTEGER;
  r RECORD;
  v_digits TEXT;
  v_sum INTEGER;
  v_weight INTEGER;
  v_pos INTEGER;
BEGIN
  SELECT count(*) INTO v_missing_targets
  FROM tmp_c365_cas c
  LEFT JOIN supplements.supplements s ON s.slug = c.slug
  WHERE s.id IS NULL;

  IF v_missing_targets <> 0 THEN
    RAISE EXCEPTION 'C-365: % CAS-Zielstoffe fehlen im bestehenden Katalog', v_missing_targets;
  END IF;

  SELECT count(*) INTO v_invalid_format
  FROM tmp_c365_cas
  WHERE cas_number !~ '^[0-9]{2,7}-[0-9]{2}-[0-9]$';

  IF v_invalid_format <> 0 THEN
    RAISE EXCEPTION 'C-365: % CAS-Nummern haben kein gueltiges Format', v_invalid_format;
  END IF;

  FOR r IN SELECT cas_number FROM tmp_c365_cas LOOP
    v_digits := replace(r.cas_number, '-', '');
    v_sum := 0;
    v_weight := 1;
    FOR v_pos IN REVERSE length(v_digits) - 1 .. 1 LOOP
      v_sum := v_sum + substring(v_digits FROM v_pos FOR 1)::integer * v_weight;
      v_weight := v_weight + 1;
    END LOOP;
    IF mod(v_sum, 10) <> substring(v_digits FROM length(v_digits) FOR 1)::integer THEN
      v_invalid_checksum := coalesce(v_invalid_checksum, 0) + 1;
    END IF;
  END LOOP;

  IF coalesce(v_invalid_checksum, 0) <> 0 THEN
    RAISE EXCEPTION 'C-365: % CAS-Nummern bestehen die CAS-Pruefziffer nicht', v_invalid_checksum;
  END IF;
END $$;

INSERT INTO supplements.supplement_identifiers (
  supplement_id,
  status,
  identifier_type,
  identifier_value,
  evidence_provenance,
  source
)
SELECT
  s.id,
  'bekannt',
  'CAS',
  c.cas_number,
  jsonb_build_object(
    'dataset', 'docs/kimi_research/supplement_performance_database/data/substances',
    'source_record_id', c.slug,
    'source_field', 'cas_number',
    'selection', 'C-260: current machine-readable record matched to crawl_027_ws A.json'
  ),
  'kimi:c365'
FROM tmp_c365_cas c
JOIN supplements.supplements s ON s.slug = c.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM supplements.supplement_identifiers i
  WHERE i.supplement_id = s.id
    AND i.identifier_type = 'CAS'
    AND i.identifier_value = c.cas_number
);

DO $$
DECLARE
  v_cas INTEGER;
BEGIN
  SELECT count(*) INTO v_cas
  FROM tmp_c365_cas c
  JOIN supplements.supplements s ON s.slug = c.slug
  JOIN supplements.supplement_identifiers i
    ON i.supplement_id = s.id
   AND i.identifier_type = 'CAS'
   AND i.identifier_value = c.cas_number
   AND i.status = 'bekannt';

  IF v_cas <> 33 THEN
    RAISE EXCEPTION 'C-365: eindeutige CAS-Kennungen %, erwartet 33', v_cas;
  END IF;

  RAISE NOTICE 'OK C-365: 33 belegte CAS-Nummern als Kennungen eingetragen; Peptidsequenzen unveraendert ohne Leser';
END $$;

COMMIT;
