-- =============================================================
-- C-479 — Fuenf Rueckenflaechen und ihre Kartenbruecken
-- =============================================================
-- Daten, nicht Struktur: C-479s Migration legt den Vertragsrahmen an.
-- Die alten Regionsnamen werden ersetzt, weil G-430 sie nicht mehr
-- zeichnet; neue Zeilen haengen direkt unter wurzel-ruecken.

BEGIN;

-- Erst Kinder, dann Eltern: parent_id nutzt ON DELETE RESTRICT.
DELETE FROM public.koerperflaechen
WHERE code IN ('upper-back-l', 'upper-back-r', 'lower-back-l', 'lower-back-r');

DELETE FROM public.koerperflaechen
WHERE code IN ('upper-back', 'lower-back');

INSERT INTO public.koerperflaechen
  (code, parent_id, name_de, name_en, ebene, art, muscle_group_id, hinweis, sortierung)
SELECT v.code, wurzel.id, v.name_de, v.name_en, 2, 'muskel',
       (SELECT g.id FROM training.muscle_groups g
        WHERE lower(g.name) = lower(v.muskel) LIMIT 1),
       v.hinweis, v.sortierung
FROM (VALUES
  ('latissimus', 'Latissimus', 'Latissimus dorsi', 'latissimus dorsi',
   'Zwei Kartenpfade; groesster Rueckenmuskel der ehemaligen upper-back-Region.', 110),
  ('teres-major', 'Großer Rundmuskel', 'Teres major', 'Teres Major',
   'Zwei Kartenpfade; eigener Muskel der ehemaligen upper-back-Region.', 120),
  ('teres-minor', 'Kleiner Rundmuskel', 'Teres minor', 'Teres Minor',
   'Zwei Kartenpfade; eigener Muskel der ehemaligen upper-back-Region.', 130),
  ('erector-spinae', 'Rueckenstrecker', 'Erector spinae', 'erector spinae',
   'Zwei Kartenpfade der ehemaligen lower-back-Region.', 140),
  ('flanke', 'Flanke', 'Flank', NULL,
   'Zwei Kartenpfade. Kein eigener Muskelgruppenname: Obliques faerben die Flanke mit; nichts erfunden.', 150)
) AS v(code, name_de, name_en, muskel, hinweis, sortierung)
JOIN public.koerperflaechen wurzel ON wurzel.code = 'wurzel-ruecken'
ON CONFLICT (code) DO UPDATE
  SET parent_id = EXCLUDED.parent_id,
      name_de = EXCLUDED.name_de,
      name_en = EXCLUDED.name_en,
      ebene = EXCLUDED.ebene,
      art = EXCLUDED.art,
      muscle_group_id = EXCLUDED.muscle_group_id,
      hinweis = EXCLUDED.hinweis,
      sortierung = EXCLUDED.sortierung;

INSERT INTO public.koerperflaechen
  (code, parent_id, name_de, name_en, ebene, art, seite, muscle_group_id, sortierung)
SELECT f.code || '-' || s.kuerzel, f.id,
       f.name_de || ' ' || s.name_de, f.name_en || ' ' || s.name_en,
       3, 'muskel', s.seite, f.muscle_group_id, f.sortierung + s.versatz
FROM public.koerperflaechen f
CROSS JOIN (VALUES
  ('l', 'links',  'links',  'left',  1),
  ('r', 'rechts', 'rechts', 'right', 2)
) AS s(kuerzel, seite, name_de, name_en, versatz)
WHERE f.code IN ('latissimus', 'teres-major', 'teres-minor', 'erector-spinae', 'flanke')
ON CONFLICT (code) DO UPDATE
  SET parent_id = EXCLUDED.parent_id,
      name_de = EXCLUDED.name_de,
      name_en = EXCLUDED.name_en,
      ebene = EXCLUDED.ebene,
      art = EXCLUDED.art,
      seite = EXCLUDED.seite,
      muscle_group_id = EXCLUDED.muscle_group_id,
      sortierung = EXCLUDED.sortierung;

-- Die Karte zeichnet diese Blattmuskeln, nicht nur ihre Sammelgruppen.
-- Alle anderen der 78 Namen bleiben bewusst ohne direkte Ein-Flaechen-Bruecke.
UPDATE public.koerperflaechen f
SET muscle_group_id = g.id
FROM (VALUES
  ('chest', 'Pectoralis Major'),
  ('abs', 'Rectus Abdominis'),
  ('biceps', 'Brachialis'),
  ('tibialis', 'Anterior Tibialis'),
  ('gluteal', 'Gluteus Maximus')
) AS v(flaeche, muskel)
JOIN training.muscle_groups g ON g.name = v.muskel
WHERE f.code = v.flaeche;

-- Seiten sind keine zweiten Muskeln. Nach einer kanonischen Umhaengung
-- erben sie daher stets dieselbe Gruppe wie ihre Elternflaeche.
UPDATE public.koerperflaechen kind
SET muscle_group_id = eltern.muscle_group_id
FROM public.koerperflaechen eltern
WHERE kind.parent_id = eltern.id
  AND eltern.code IN ('chest', 'abs', 'biceps', 'tibialis', 'gluteal');

DO $$
DECLARE
  v_total integer;
  v_ebene_2 integer;
  v_ebene_3 integer;
  v_fehlend integer;
  v_verbundene_gruppen integer;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE ebene = 2), count(*) FILTER (WHERE ebene = 3)
    INTO v_total, v_ebene_2, v_ebene_3
  FROM public.koerperflaechen;

  SELECT count(DISTINCT muscle_group_id) INTO v_verbundene_gruppen
  FROM public.koerperflaechen
  WHERE muscle_group_id IS NOT NULL;

  SELECT count(*) INTO v_fehlend
  FROM (VALUES
    ('latissimus'), ('teres-major'), ('teres-minor'), ('erector-spinae'), ('flanke'),
    ('latissimus-l'), ('latissimus-r'), ('teres-major-l'), ('teres-major-r'),
    ('teres-minor-l'), ('teres-minor-r'), ('erector-spinae-l'), ('erector-spinae-r'),
    ('flanke-l'), ('flanke-r')
  ) AS erwartet(code)
  WHERE NOT EXISTS (SELECT 1 FROM public.koerperflaechen f WHERE f.code = erwartet.code);

  IF v_total <> 68 OR v_ebene_2 <> 26 OR v_ebene_3 <> 34 OR v_fehlend <> 0
     OR v_verbundene_gruppen <> 19 THEN
    RAISE EXCEPTION 'C-479: erwartet 68 Zeilen (26 Ebene 2, 34 Ebene 3), 15 neue Codes und 19 kanonische Gruppen; ist %, %, %, fehlend %, Gruppen %',
      v_total, v_ebene_2, v_ebene_3, v_fehlend, v_verbundene_gruppen;
  END IF;
END $$;

COMMIT;
