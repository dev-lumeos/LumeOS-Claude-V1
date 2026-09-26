-- =============================================================
-- C-544 - Kanonische Koerperorte der 16 Injektionsstellen
-- Datum: 2026-09-26
-- =============================================================
--
-- D-17: Daten gehoeren in die lokale Aufbaukette, nicht in die
-- Strukturmigration. Die Zielstruktur ist entscheidend:
--   IM -> Muskelort
--   SC -> Fettdepot unter der Haut, nicht der benachbarte Muskel
--
-- Die vorhandenen Standortdaten bleiben unangetastet; diese Datei
-- setzt nur den neuen Fremdschluessel.

BEGIN;

INSERT INTO public.koerperorte (
  code, name_de, name_en, art, beschreibung, quelle_url
)
VALUES
  (
    'deltoid-muskelregion',
    'Deltamuskelregion',
    'Deltoid muscle region',
    'muskel',
    'Intramuskulaerer Zielort am Deltamuskel.',
    'https://www.cdc.gov/vaccines/hcp/imz-best-practices/vaccine-administration.html'
  ),
  (
    'dorsogluteale-muskelregion',
    'Dorsogluteale Muskelregion',
    'Dorsogluteal muscle region',
    'muskel',
    'Dorsoglutealer Zielort in Gluteus maximus und Gluteus medius.',
    'https://pmc.ncbi.nlm.nih.gov/articles/PMC10415997/'
  ),
  (
    'ventrogluteale-muskelregion',
    'Ventrogluteale Muskelregion',
    'Ventrogluteal muscle region',
    'muskel',
    'Ventroglutealer Zielort in Gluteus medius und Gluteus minimus.',
    'https://pmc.ncbi.nlm.nih.gov/articles/PMC10415997/'
  ),
  (
    'vastus-lateralis-muskelregion',
    'Vastus-lateralis-Muskelregion',
    'Vastus lateralis muscle region',
    'muskel',
    'Intramuskulaerer Zielort am anterolateralen Oberschenkel.',
    'https://www.cdc.gov/vaccines/hcp/imz-best-practices/vaccine-administration.html'
  ),
  (
    'latissimus-dorsi-muskelregion',
    'Latissimus-dorsi-Muskelregion',
    'Latissimus dorsi muscle region',
    'muskel',
    'Intramuskulaerer Zielort am Latissimus dorsi aus dem bestehenden Injektionskatalog.',
    'https://www.ncbi.nlm.nih.gov/books/NBK556121/'
  ),
  (
    'abdominales-subkutanes-fett',
    'Subkutanes Bauchfett',
    'Abdominal subcutaneous fat',
    'fettdepot',
    'Subkutanes Fettgewebe am Bauch; kein Muskelort.',
    'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-6-vaccine-administration.html'
  ),
  (
    'posteriores-oberarmfett',
    'Subkutanes Fett am hinteren Oberarm',
    'Posterior upper-arm subcutaneous fat',
    'fettdepot',
    'Subkutanes Fettgewebe am hinteren Oberarm; kein Deltamuskelort.',
    'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-6-vaccine-administration.html'
  ),
  (
    'anterolaterales-oberschenkelfett',
    'Subkutanes Fett am anterolateralen Oberschenkel',
    'Anterolateral thigh subcutaneous fat',
    'fettdepot',
    'Subkutanes Fettgewebe am anterolateralen Oberschenkel; kein Quadrizepsort.',
    'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-6-vaccine-administration.html'
  )
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  art = EXCLUDED.art,
  beschreibung = EXCLUDED.beschreibung,
  quelle_url = EXCLUDED.quelle_url;

WITH zuordnung(ort_code, muskel_name) AS (
  VALUES
    ('deltoid-muskelregion', 'Deltoids'),
    ('dorsogluteale-muskelregion', 'Gluteus Maximus'),
    ('dorsogluteale-muskelregion', 'Gluteus Medius'),
    ('ventrogluteale-muskelregion', 'Gluteus Medius'),
    ('ventrogluteale-muskelregion', 'Gluteus Minimus'),
    ('vastus-lateralis-muskelregion', 'Vastus Lateralis'),
    ('latissimus-dorsi-muskelregion', 'latissimus dorsi')
)
INSERT INTO public.koerperort_muskeln (koerperort_id, muscle_group_id)
SELECT ort.id, muskel.id
FROM zuordnung AS z
JOIN public.koerperorte AS ort
  ON ort.code = z.ort_code
 AND ort.art = 'muskel'
JOIN training.muscle_groups AS muskel
  ON muskel.name = z.muskel_name
 AND muskel.canonical_muscle_group_id IS NULL
ON CONFLICT (koerperort_id, muscle_group_id) DO NOTHING;

WITH zuordnung(site_id, ort_code) AS (
  VALUES
    ('delt_l', 'deltoid-muskelregion'),
    ('delt_r', 'deltoid-muskelregion'),
    ('glute_l', 'dorsogluteale-muskelregion'),
    ('glute_r', 'dorsogluteale-muskelregion'),
    ('vglute_l', 'ventrogluteale-muskelregion'),
    ('vglute_r', 'ventrogluteale-muskelregion'),
    ('quad_l', 'vastus-lateralis-muskelregion'),
    ('quad_r', 'vastus-lateralis-muskelregion'),
    ('lat_l', 'latissimus-dorsi-muskelregion'),
    ('lat_r', 'latissimus-dorsi-muskelregion'),
    ('abd_l', 'abdominales-subkutanes-fett'),
    ('abd_r', 'abdominales-subkutanes-fett'),
    ('sq_delt_l', 'posteriores-oberarmfett'),
    ('sq_delt_r', 'posteriores-oberarmfett'),
    ('thigh_sq_l', 'anterolaterales-oberschenkelfett'),
    ('thigh_sq_r', 'anterolaterales-oberschenkelfett')
)
UPDATE medical.injection_sites AS site
SET koerperort_id = ort.id
FROM zuordnung AS z
JOIN public.koerperorte AS ort ON ort.code = z.ort_code
WHERE site.id = z.site_id;

DO $$
DECLARE
  v_orte integer;
  v_muskeln integer;
  v_stellen integer;
  v_falsch integer;
BEGIN
  SELECT count(*) INTO v_orte FROM public.koerperorte;
  SELECT count(*) INTO v_muskeln FROM public.koerperort_muskeln;
  SELECT count(*) INTO v_stellen
  FROM medical.injection_sites
  WHERE koerperort_id IS NOT NULL;

  SELECT count(*) INTO v_falsch
  FROM medical.injection_sites AS site
  JOIN public.koerperorte AS ort ON ort.id = site.koerperort_id
  WHERE (site.route = 'im' AND ort.art <> 'muskel')
     OR (site.route = 'sc' AND ort.art <> 'fettdepot')
     OR site.route NOT IN ('im', 'sc');

  IF v_orte <> 8 OR v_muskeln <> 7 OR v_stellen <> 16 OR v_falsch <> 0 THEN
    RAISE EXCEPTION
      'C-544 unvollstaendig: Orte %, Muskelrelationen %, Stellen %, falsche Gewebe %',
      v_orte, v_muskeln, v_stellen, v_falsch;
  END IF;
END;
$$;

COMMIT;
