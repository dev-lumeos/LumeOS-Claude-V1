-- C-484 / E-81: Kartenzeilen nach parent_id und art; keine Seitenzeilen.
-- Voraussetzung: 107/108 haben die zehn C-482-Namen auf 105 Gruppen gebracht.
BEGIN;

DO $$
DECLARE
  v_c482 integer;
BEGIN
  SELECT count(*) INTO v_c482
  FROM training.muscle_groups
  WHERE name IN (
    'Vastus Lateralis', 'Vastus Medialis',
    'Gastrocnemius Lateral Head', 'Gastrocnemius Medial Head',
    'Triceps Brachii Long Head', 'Triceps Brachii Lateral Head',
    'Triceps Brachii Medial Head', 'External Oblique',
    'Serratus Anterior', 'Posterior Neck Muscles'
  );
  IF v_c482 <> 10 THEN
    RAISE EXCEPTION 'C-484 braucht zehn C-482-Namen, hat %', v_c482;
  END IF;
END $$;

-- Zuerst nur die 34 historischen Seitenzeilen: 68 -> 34.
DELETE FROM public.koerperflaechen WHERE code ~ '-[lr]$';

-- Nicht mehr gezeichnete Sammelflaechen weichen den 43 G-434-Codes.
DELETE FROM public.koerperflaechen
WHERE parent_id IS NOT NULL
  AND code NOT IN (
    'achillessehne', 'adductor-brevis', 'adductor-longus', 'adductor-magnus',
    'ankles', 'biceps', 'biceps-femoris', 'brachioradialis', 'chest', 'deltoids',
    'erector-spinae', 'external-oblique', 'feet', 'flanke', 'forearm-extensors',
    'forearm-extensors-ulnar', 'forearm-flexors', 'gastrocnemius-lateralis',
    'gastrocnemius-medialis', 'gluteus-maximus', 'gluteus-medius', 'hair', 'hands',
    'head', 'kehle', 'knees', 'latissimus', 'nacken', 'rectus-abdominis',
    'rectus-femoris', 'semitendinosus', 'serratus-anterior', 'sternocleidomastoid',
    'tendinous-inscriptions', 'teres-major', 'teres-minor', 'tibialis', 'trapezius',
    'triceps-lateralis', 'triceps-longum', 'triceps-mediale', 'vastus-lateralis',
    'vastus-medialis'
  );

INSERT INTO public.koerperflaechen
  (code, parent_id, name_de, name_en, art, muscle_group_id, hinweis, sortierung)
SELECT
  v.code, parent.id, v.name_de, v.name_en, v.art,
  (SELECT g.id FROM training.muscle_groups AS g WHERE g.name = v.muskel),
  v.hinweis, v.sortierung
FROM (VALUES
  ('latissimus', 'wurzel-ruecken', 'Latissimus', 'Latissimus dorsi', 'muskel', 'latissimus dorsi', NULL, 110),
  ('teres-major', 'wurzel-ruecken', 'Grosser Rundmuskel', 'Teres major', 'muskel', 'Teres Major', NULL, 120),
  ('erector-spinae', 'wurzel-ruecken', 'Rueckenstrecker', 'Erector spinae', 'muskel', 'erector spinae', NULL, 130),
  ('trapezius', 'wurzel-ruecken', 'Trapezmuskel', 'Trapezius', 'muskel', 'Trapezius', NULL, 140),
  ('chest', 'wurzel-brust', 'Brust', 'Chest', 'gruppe', 'Chest', 'Pectoralis Major und Upper Chest sind nicht getrennt gezeichnet.', 210),
  ('rectus-abdominis', 'wurzel-rumpf', 'Gerader Bauchmuskel', 'Rectus abdominis', 'muskel', 'Rectus Abdominis', NULL, 310),
  ('tendinous-inscriptions', 'wurzel-rumpf', 'Sehnenzwischenstuecke', 'Tendinous inscriptions', 'umriss', NULL, 'Sehnenzwischenstuecke des Rectus abdominis; anwählbar fuer Painpoints, kein Muskel.', 320),
  ('external-oblique', 'wurzel-rumpf', 'Aeussere schräge Bauchmuskeln', 'External oblique', 'muskel', 'External Oblique', NULL, 330),
  ('flanke', 'wurzel-rumpf', 'Flanke', 'Flank', 'muskel', NULL, 'Kein eigener Muskelgruppenname; Obliques decken die Flaeche mit ab.', 340),
  ('biceps', 'wurzel-arme', 'Bizeps', 'Biceps', 'gruppe', 'Biceps', 'Die Grafik trennt den Brachialis nicht vom Bizeps.', 410),
  ('triceps-longum', 'wurzel-arme', 'Trizeps, langer Kopf', 'Triceps brachii long head', 'muskel', 'Triceps Brachii Long Head', NULL, 420),
  ('triceps-lateralis', 'wurzel-arme', 'Trizeps, seitlicher Kopf', 'Triceps brachii lateral head', 'muskel', 'Triceps Brachii Lateral Head', NULL, 430),
  ('triceps-mediale', 'wurzel-arme', 'Trizeps, medialer Kopf', 'Triceps brachii medial head', 'muskel', 'Triceps Brachii Medial Head', NULL, 440),
  ('forearm-flexors', 'wurzel-arme', 'Unterarmbeuger', 'Forearm flexors', 'gruppe', 'Forearm Flexors', 'Die Grafik zeigt das Buendel, nicht die einzelnen Beuger.', 450),
  ('brachioradialis', 'wurzel-arme', 'Oberarmspeichenmuskel', 'Brachioradialis', 'muskel', 'Brachioradialis', NULL, 460),
  ('forearm-extensors', 'wurzel-arme', 'Unterarmstrecker', 'Forearm extensors', 'gruppe', 'Forearm Extensors', 'Die Grafik zeigt das Buendel, nicht die einzelnen Strecker.', 470),
  ('forearm-extensors-ulnar', 'wurzel-arme', 'Ellenseitiger Handstrecker', 'Extensor carpi ulnaris', 'muskel', 'Extensor Carpi Ulnaris', NULL, 480),
  ('deltoids', 'wurzel-schultern', 'Deltamuskeln', 'Deltoids', 'gruppe', 'Deltoids', 'Vordere und hintere Deltoiden sind nicht als eigene Flaechen getrennt.', 510),
  ('serratus-anterior', 'wurzel-schultern', 'Vorderer Saegemuskel', 'Serratus anterior', 'muskel', 'Serratus Anterior', NULL, 520),
  ('teres-minor', 'wurzel-schultern', 'Kleiner Rundmuskel', 'Teres minor', 'muskel', 'Teres Minor', NULL, 530),
  ('rectus-femoris', 'wurzel-beine', 'Gerader Oberschenkelmuskel', 'Rectus femoris', 'muskel', 'Rectus Femoris', NULL, 610),
  ('vastus-lateralis', 'wurzel-beine', 'Aeusserer breiter Oberschenkelmuskel', 'Vastus lateralis', 'muskel', 'Vastus Lateralis', NULL, 620),
  ('vastus-medialis', 'wurzel-beine', 'Innerer breiter Oberschenkelmuskel', 'Vastus medialis', 'muskel', 'Vastus Medialis', NULL, 630),
  ('adductor-brevis', 'wurzel-beine', 'Kurzer Adduktor', 'Adductor brevis', 'muskel', 'adductor brevis', NULL, 640),
  ('adductor-longus', 'wurzel-beine', 'Langer Adduktor', 'Adductor longus', 'muskel', 'Adductor Longus', NULL, 650),
  ('adductor-magnus', 'wurzel-beine', 'Grosser Adduktor', 'Adductor magnus', 'muskel', 'adductor magnus', NULL, 660),
  ('gastrocnemius-lateralis', 'wurzel-beine', 'Wadenmuskel, lateraler Kopf', 'Gastrocnemius lateral head', 'muskel', 'Gastrocnemius Lateral Head', NULL, 670),
  ('gastrocnemius-medialis', 'wurzel-beine', 'Wadenmuskel, medialer Kopf', 'Gastrocnemius medial head', 'muskel', 'Gastrocnemius Medial Head', NULL, 680),
  ('achillessehne', 'wurzel-beine', 'Achillessehne', 'Achilles tendon', 'umriss', NULL, 'Sehne, kein Muskel; anwählbar fuer Painpoints.', 690),
  ('tibialis', 'wurzel-beine', 'Schienbeinmuskel', 'Tibialis', 'muskel', 'Tibialis', NULL, 700),
  ('gluteus-maximus', 'wurzel-beine', 'Grosser Gesässmuskel', 'Gluteus maximus', 'muskel', 'Gluteus Maximus', NULL, 710),
  ('gluteus-medius', 'wurzel-beine', 'Mittlerer Gesässmuskel', 'Gluteus medius', 'muskel', 'Gluteus Medius', NULL, 720),
  ('biceps-femoris', 'wurzel-beine', 'Zweiköpfiger Oberschenkelmuskel', 'Biceps femoris', 'muskel', 'Biceps Femoris', NULL, 730),
  ('semitendinosus', 'wurzel-beine', 'Halbsehnenmuskel', 'Semitendinosus', 'muskel', 'Semitendinosus', NULL, 740),
  ('sternocleidomastoid', 'wurzel-hals', 'Kopfwender', 'Sternocleidomastoid', 'muskel', 'Sternocleidomastoid', NULL, 810),
  ('nacken', 'wurzel-hals', 'Hintere Nackenmuskeln', 'Posterior neck muscles', 'muskel', 'Posterior Neck Muscles', 'Die Vorlage trennt Scalenes und Splenius capitis nicht.', 820),
  ('head', 'wurzel-umriss', 'Kopf', 'Head', 'umriss', NULL, 'Kein Muskel; zeichnet die Figur.', 910),
  ('hair', 'wurzel-umriss', 'Haar', 'Hair', 'umriss', NULL, 'Kein Muskel; zeichnet die Figur.', 920),
  ('hands', 'wurzel-umriss', 'Haende', 'Hands', 'umriss', NULL, 'Kein Muskel; zeichnet die Figur.', 930),
  ('feet', 'wurzel-umriss', 'Fuesse', 'Feet', 'umriss', NULL, 'Kein Muskel; zeichnet die Figur.', 940),
  ('ankles', 'wurzel-umriss', 'Knoechel', 'Ankles', 'umriss', NULL, 'Kein Muskel; Gelenk.', 950),
  ('knees', 'wurzel-umriss', 'Knie', 'Knees', 'umriss', NULL, 'Kein Muskel; Gelenk.', 960),
  ('kehle', 'wurzel-umriss', 'Kehle', 'Throat', 'umriss', NULL, 'Kein Muskel; Umrissdetail zwischen den Halsstraengen.', 970)
) AS v(code, wurzel, name_de, name_en, art, muskel, hinweis, sortierung)
JOIN public.koerperflaechen AS parent ON parent.code = v.wurzel
ON CONFLICT (code) DO UPDATE
  SET parent_id = EXCLUDED.parent_id,
      name_de = EXCLUDED.name_de,
      name_en = EXCLUDED.name_en,
      art = EXCLUDED.art,
      muscle_group_id = EXCLUDED.muscle_group_id,
      hinweis = EXCLUDED.hinweis,
      sortierung = EXCLUDED.sortierung;

UPDATE public.koerperflaechen
SET art = 'wurzel', muscle_group_id = NULL
WHERE code IN (
  'wurzel-ruecken', 'wurzel-brust', 'wurzel-rumpf', 'wurzel-arme',
  'wurzel-schultern', 'wurzel-beine', 'wurzel-hals', 'wurzel-umriss'
);

DO $$
DECLARE
  v_total integer;
  v_cards integer;
  v_sides integer;
  v_roots integer;
  v_unlinked integer;
BEGIN
  SELECT count(*) INTO v_total FROM public.koerperflaechen;
  SELECT count(*) INTO v_cards FROM public.koerperflaechen
  WHERE code IN (
    'achillessehne', 'adductor-brevis', 'adductor-longus', 'adductor-magnus',
    'ankles', 'biceps', 'biceps-femoris', 'brachioradialis', 'chest', 'deltoids',
    'erector-spinae', 'external-oblique', 'feet', 'flanke', 'forearm-extensors',
    'forearm-extensors-ulnar', 'forearm-flexors', 'gastrocnemius-lateralis',
    'gastrocnemius-medialis', 'gluteus-maximus', 'gluteus-medius', 'hair', 'hands',
    'head', 'kehle', 'knees', 'latissimus', 'nacken', 'rectus-abdominis',
    'rectus-femoris', 'semitendinosus', 'serratus-anterior', 'sternocleidomastoid',
    'tendinous-inscriptions', 'teres-major', 'teres-minor', 'tibialis', 'trapezius',
    'triceps-lateralis', 'triceps-longum', 'triceps-mediale', 'vastus-lateralis',
    'vastus-medialis'
  );
  SELECT count(*) INTO v_sides FROM public.koerperflaechen WHERE code ~ '-[lr]$';
  SELECT count(*) INTO v_roots FROM public.koerperflaechen WHERE art = 'wurzel';
  SELECT count(*) INTO v_unlinked FROM public.koerperflaechen
  WHERE art = 'muskel' AND code NOT IN ('flanke') AND muscle_group_id IS NULL;
  IF v_total <> 51 OR v_cards <> 43 OR v_sides <> 0 OR v_roots <> 8 OR v_unlinked <> 0 THEN
    RAISE EXCEPTION 'C-484: total %, Karten %, Seiten %, Wurzeln %, unverbundene Muskeln %',
      v_total, v_cards, v_sides, v_roots, v_unlinked;
  END IF;
END $$;

COMMIT;
