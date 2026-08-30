-- C-352: Nur regelbasierte deutsche Stoffschreibweisen setzen.
-- Keine Trivial-, Handels- oder Forschungsnamen uebersetzen; fuer diese
-- Eintraege ist name_en der absichtliche Rueckfall.

BEGIN;

CREATE TEMP TABLE tmp_c352_deutsche_nomenklatur (
  slug text PRIMARY KEY,
  expected_name_en text NOT NULL,
  name_de text NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_c352_deutsche_nomenklatur (slug, expected_name_en, name_de) VALUES
  ('sub_b3777be16d', 'Acetyl-L-carnitine (ALCAR)', 'Acetyl-L-Carnitin'),
  ('sub_7504c16f98', 'Anastrozole (PCT/estrogen control)', 'Anastrozol'),
  ('sub_ba827fc312', 'Berberine', 'Berberin'),
  ('sub_baec078bee', 'Beta-alanine', 'Beta-Alanin'),
  ('sub_f14e403589', 'Beta-carotene (provitamin A)', 'Beta-Carotin'),
  ('sub_b30d752d32', 'Bromocriptine', 'Bromocriptin'),
  ('caffeine', 'Caffeine', 'Koffein'),
  ('sub_21eaf09b6b', 'Choline bitartrate', 'Cholinbitartrat'),
  ('sub_5fcb987b01', 'Citrulline malate', 'Citrullinmalat'),
  ('sub_3701d02096', 'Creatine hydrochloride (HCl)', 'Kreatinhydrochlorid'),
  ('sub_9f9bb8c160', 'Creatine monohydrate', 'Kreatinmonohydrat'),
  ('sub_6251e6e553', 'Creatine nitrate', 'Kreatinnitrat'),
  ('folate-b9', 'Folate (B9)', 'Folat (B9)'),
  ('glucosamine', 'Glucosamine', 'Glucosamin'),
  ('sub_bcf4e6fe9e', 'L-Carnitine L-tartrate', 'L-Carnitin-L-tartrat'),
  ('sub_26bd715a8f', 'L-Citrulline', 'L-Citrullin'),
  ('sub_8f0587d87f', 'Semaglutide', 'Semaglutid'),
  ('sub_a5bfaf045f', 'Taurine', 'Taurin'),
  ('sub_af6dc7a9dd', 'Tirzepatide', 'Tirzepatid'),
  ('zinc', 'Zinc', 'Zink');

DO $$
DECLARE
  v_missing_or_changed integer;
BEGIN
  SELECT count(*) INTO v_missing_or_changed
  FROM tmp_c352_deutsche_nomenklatur m
  LEFT JOIN supplements.supplements s
    ON s.slug = m.slug
   AND s.name_en = m.expected_name_en
   AND s.im_katalog
  WHERE s.id IS NULL;

  IF v_missing_or_changed <> 0 THEN
    RAISE EXCEPTION 'C-352: % Nomenklaturziele fehlen, sind unsichtbar oder haben einen anderen name_en', v_missing_or_changed;
  END IF;
END $$;

UPDATE supplements.supplements s
SET name_de = m.name_de,
    updated_at = now()
FROM tmp_c352_deutsche_nomenklatur m
WHERE s.slug = m.slug
  AND s.name_en = m.expected_name_en
  AND s.im_katalog
  AND s.name_de IS DISTINCT FROM m.name_de;

DO $$
DECLARE
  v_mapped integer;
  v_visible_with_name_de integer;
BEGIN
  SELECT count(*) INTO v_mapped
  FROM supplements.supplements s
  JOIN tmp_c352_deutsche_nomenklatur m
    ON m.slug = s.slug AND m.name_de = s.name_de
  WHERE s.im_katalog;

  SELECT count(*) INTO v_visible_with_name_de
  FROM supplements.supplements
  WHERE im_katalog AND name_de IS NOT NULL;

  IF v_mapped <> 20 THEN
    RAISE EXCEPTION 'C-352: Nomenklaturzuordnungen %, erwartet 20', v_mapped;
  END IF;
  IF v_visible_with_name_de <> 20 THEN
    RAISE EXCEPTION 'C-352: sichtbare Eintraege mit name_de %, erwartet 20', v_visible_with_name_de;
  END IF;

  RAISE NOTICE 'OK C-352: 20 regelbasierte deutsche Nomenklaturfaelle gesetzt; 392 sichtbare Eintraege bleiben beim EN-Rueckfall';
END $$;

COMMIT;
