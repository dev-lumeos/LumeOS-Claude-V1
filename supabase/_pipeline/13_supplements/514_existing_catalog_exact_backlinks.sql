BEGIN;

-- C-514: Glycerin ist die eindeutige exakte Schreibvariante des vorhandenen
-- Glycerol-Katalogeintrags. Gelatin bleibt offen: der bestehende Alias zeigt
-- auf hydrolysierte Kollagenpeptide und ist damit keine sichere Identitaet.
DO $do$
DECLARE
  v_glycerol_id uuid;
BEGIN
  SELECT s.id INTO v_glycerol_id
  FROM supplements.supplements s
  WHERE s.slug = 'sub_8b577bdc91'
    AND nutrition.search_fold(s.name_en) = nutrition.search_fold('Glycerol (hyperhydration)')
    AND s.parent_id IS NULL
    AND s.im_katalog;

  IF v_glycerol_id IS NULL THEN
    RAISE EXCEPTION 'C-514: eindeutiges Glycerol-Katalogziel fehlt';
  END IF;

  UPDATE supplements.product_contents pc
  SET supplement_id = v_glycerol_id
  WHERE pc.source = 'dsld'
    AND pc.supplement_id IS NULL
    AND nutrition.search_fold(pc.ingredient_name) = nutrition.search_fold('Glycerin');
END;
$do$;

COMMIT;
