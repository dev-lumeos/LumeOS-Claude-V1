-- =============================================================
-- 468b - C-468: die 23 Flaechen als Hierarchie
-- Datum: 2026-09-11
-- =============================================================
--
-- [read] DIE ZEILEN STAMMEN AUS DER KARTE, NICHT AUS DEM KOPF.
--   Jede Flaeche auf Ebene 2 traegt den Schluessel aus MUSKELN
--   (`packages/ui/src/koerperkarte-pfade.ts`) - gemessen, nicht
--   abgeschrieben.
--
-- [cmd] Die Muskelnamen sind gegen `training.muscle_groups`
--   geprueft: alle neunzehn gesuchten stehen dort. Die Bruecke
--   sucht per Namen, damit keine Kennung doppelt gepflegt wird.
--
-- [read] WIEDERHOLBAR: `ON CONFLICT (code) DO UPDATE` - ein zweiter
--   Kettenlauf schreibt dieselben Zeilen, nicht neue.
-- =============================================================

BEGIN;

-- ── Ebene 1: die Wurzeln ────────────────────────────────────────
--
-- [cmd] Dieselben sieben wie `training.muscle_groups`, plus eine
--   achte fuer alles, was kein Muskel ist.
-- [read] Ohne die achte haetten `hands` und `head` keinen
--   Elternteil - und die Regel „Ebene 2 hat einen" fiele.

INSERT INTO public.koerperflaechen (code, name_de, name_en, ebene, art, sortierung)
VALUES
  ('wurzel-ruecken',   'Rücken',       'Back',          1, 'muskel',  10),
  ('wurzel-brust',     'Brust',        'Chest',         1, 'muskel',  20),
  ('wurzel-rumpf',     'Rumpf',        'Core',          1, 'muskel',  30),
  ('wurzel-arme',      'Arme',         'Arms',          1, 'muskel',  40),
  ('wurzel-schultern', 'Schultern',    'Shoulders',     1, 'muskel',  50),
  ('wurzel-beine',     'Beine',        'Legs',          1, 'muskel',  60),
  ('wurzel-hals',      'Hals',         'Neck',          1, 'muskel',  70),
  ('wurzel-umriss',    'Umriss',       'Outline',       1, 'umriss',  80)
ON CONFLICT (code) DO UPDATE
  SET name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en,
      ebene = EXCLUDED.ebene, art = EXCLUDED.art,
      sortierung = EXCLUDED.sortierung;

-- ── Ebene 2: die 23 Flaechen der Karte ──────────────────────────
--
-- [read] `hinweis` traegt, WAS GEMESSEN wurde - je Flaeche die
--   Pfadzahl und ob sie einen oder mehrere Muskeln zeichnet.

INSERT INTO public.koerperflaechen
  (code, parent_id, name_de, name_en, ebene, art, muscle_group_id, hinweis, sortierung)
SELECT v.code, w.id, v.name_de, v.name_en, 2, v.art,
       (SELECT id FROM training.muscle_groups g
         WHERE lower(g.name) = lower(v.muskel) LIMIT 1),
       v.hinweis, v.sortierung
FROM (VALUES
  -- Ruecken. [cmd] G-425 hat die sechs upper-back-Pfade einzeln
  -- angesehen: drei Muskelpaare, keine Rhomboiden.
  ('upper-back', 'wurzel-ruecken', 'Oberer Rücken', 'Upper Back', 'muskel',
   'latissimus dorsi',
   'SECHS Pfade, DREI Muskelpaare (G-425): 1/4 Teres major, 2/5 Teres minor, '
   || '3/6 Latissimus dorsi. Die Bruecke zeigt auf den groessten. '
   || 'RHOMBOIDEN FEHLEN: muskel-ebenen.ts wirft sie hierher, kein Pfad zeichnet sie.', 110),
  ('lower-back', 'wurzel-ruecken', 'Unterer Rücken', 'Lower Back', 'muskel',
   'erector spinae',
   'VIER Pfade, ZWEI Muskelpaare (G-425): 2/3 Erector spinae, 1/4 Flanke '
   || '(Obliquus externus / QL). Die Flanke hat in muskel-ebenen.ts keinen Namen.', 120),
  ('trapezius', 'wurzel-ruecken', 'Trapezmuskel', 'Trapezius', 'muskel',
   'Trapezius',
   'Vier Pfade, EIN Muskel: je Ansicht zwei Haelften (G-425).', 130),

  -- Brust
  ('chest', 'wurzel-brust', 'Brust', 'Chest', 'muskel', 'Chest',
   'Zwei Pfade, ein Muskelpaar - linke und rechte Haelfte.', 210),

  -- Rumpf
  ('abs', 'wurzel-rumpf', 'Bauch', 'Abdominals', 'muskel', 'Abdominals',
   'Acht Pfade, EIN Muskel: die Segmente des Rectus abdominis.', 310),
  ('obliques', 'wurzel-rumpf', 'Schräge Bauchmuskeln', 'Obliques', 'muskel',
   'Obliques',
   'SECHZEHN Pfade, EIN Muskelpaar: Pfad 8 und 16 sind der Obliquus-externus-Bauch, '
   || '1-7 und 9-15 die Verzahnung mit dem Serratus. '
   || 'OBLIQUUS INTERNUS FEHLT: die Karte zeichnet nur die aeussere Lage.', 320),

  -- Arme
  ('biceps', 'wurzel-arme', 'Bizeps', 'Biceps', 'muskel', 'Biceps',
   'Zwei Pfade, ein Muskelpaar.', 410),
  ('triceps', 'wurzel-arme', 'Trizeps', 'Triceps', 'muskel', 'Triceps',
   'Acht Pfade, EIN Muskel: drei Koepfe je Arm hinten, zwei Raender vorne (G-425).', 420),
  ('forearm', 'wurzel-arme', 'Unterarm', 'Forearms', 'muskel', 'Forearms',
   'Vierzehn Pfade, ZWEI Buendel: vorne die Beuger (6), hinten die Strecker (8). '
   || 'Einzelne Unterarmmuskeln trennt die Karte nicht.', 430),

  -- Schultern
  ('deltoids', 'wurzel-schultern', 'Deltamuskel', 'Deltoids', 'muskel', 'Deltoids',
   'Vier Pfade, ein Muskelpaar: je Ansicht zwei Haelften.', 510),

  -- Beine
  ('quadriceps', 'wurzel-beine', 'Quadrizeps', 'Quadriceps', 'muskel', 'Quadriceps',
   'Sechs Pfade, EIN Muskel: drei sichtbare Koepfe je Bein '
   || '(Vastus lateralis, Rectus femoris, Vastus medialis).', 610),
  ('hamstring', 'wurzel-beine', 'Beinbeuger', 'Hamstrings', 'muskel', 'Hamstrings',
   'Acht Pfade, EINE Gruppe: drei Muskelstreifen je Bein plus eine Sehnenlinie. '
   || 'Biceps femoris aussen, Semitendinosus/-membranosus innen.', 620),
  ('adductors', 'wurzel-beine', 'Adduktoren', 'Adductors', 'muskel', 'Adductors',
   'Acht Pfade, EINE Gruppe: die Innenseite des Oberschenkels.', 630),
  ('calves', 'wurzel-beine', 'Waden', 'Calves', 'muskel', 'Calves',
   'Zwoelf Pfade: hinten je Bein zwei Gastrocnemius-Koepfe plus Soleusrand. '
   || 'SOLEUS NICHT TRENNBAR: er liegt unter dem Gastrocnemius.', 640),
  ('tibialis', 'wurzel-beine', 'Schienbeinmuskel', 'Tibialis', 'muskel', 'Tibialis',
   'Zwei Pfade, ein Muskelpaar.', 650),
  ('gluteal', 'wurzel-beine', 'Gesäß', 'Glutes', 'muskel', 'Glutes',
   'Vier Pfade, ein Muskelpaar: Spiegelhaelften mit Oberkante (G-425).', 660),

  -- Hals
  ('neck', 'wurzel-hals', 'Hals', 'Neck Muscles', 'muskel', 'Neck Muscles',
   'Sieben Pfade: vorne fuenf (darunter die Drosselgrube als Umrissdetail), hinten zwei.', 710),

  -- Umriss. [read] Tom: "brauchen wir, dass wir einen mensch
  -- erkennen" - sie bleiben, tragen aber keinen Muskel.
  ('head', 'wurzel-umriss', 'Kopf', 'Head', 'umriss', NULL,
   'Kein Muskel - zeichnet den Menschen.', 810),
  ('hair', 'wurzel-umriss', 'Haar', 'Hair', 'umriss', NULL,
   'Kein Muskel - zeichnet den Menschen.', 820),
  ('hands', 'wurzel-umriss', 'Hände', 'Hands', 'umriss', NULL,
   'Dreiundzwanzig Pfade - Finger und Handflaechen, kein Muskel.', 830),
  ('feet', 'wurzel-umriss', 'Füße', 'Feet', 'umriss', NULL,
   'Kein Muskel - zeichnet den Menschen.', 840),
  ('ankles', 'wurzel-umriss', 'Knöchel', 'Ankles', 'umriss', NULL,
   'Gelenk, kein Muskel.', 850),
  ('knees', 'wurzel-umriss', 'Knie', 'Knees', 'umriss', NULL,
   'Gelenk, kein Muskel.', 860)
) AS v(code, wurzel, name_de, name_en, art, muskel, hinweis, sortierung)
JOIN public.koerperflaechen w ON w.code = v.wurzel
ON CONFLICT (code) DO UPDATE
  SET parent_id = EXCLUDED.parent_id, name_de = EXCLUDED.name_de,
      name_en = EXCLUDED.name_en, ebene = EXCLUDED.ebene, art = EXCLUDED.art,
      muscle_group_id = EXCLUDED.muscle_group_id, hinweis = EXCLUDED.hinweis,
      sortierung = EXCLUDED.sortierung;

-- ── Ebene 3: links und rechts ───────────────────────────────────
--
-- [read] TOMS DRITTE EBENE. Nur fuer Flaechen, die die Karte
--   WIRKLICH zweiseitig zeichnet - `abs` und `obliques` haben
--   Segmente, aber keine getrennten Haelften im Datenmodell.
--
-- [cmd] Gemessen: bei diesen Flaechen liegen die Pfade links und
--   rechts der Mittellinie (x ~ 362 vorne, ~ 1086 hinten).

INSERT INTO public.koerperflaechen
  (code, parent_id, name_de, name_en, ebene, art, seite, muscle_group_id, sortierung)
SELECT f.code || '-' || s.kuerzel, f.id,
       f.name_de || ' ' || s.name_de, f.name_en || ' ' || s.name_en,
       3, f.art, s.seite, f.muscle_group_id, f.sortierung + s.versatz
FROM public.koerperflaechen f
CROSS JOIN (VALUES
  ('l', 'links',  'links',  'left',  1),
  ('r', 'rechts', 'rechts', 'right', 2)
) AS s(kuerzel, seite, name_de, name_en, versatz)
WHERE f.ebene = 2
  AND f.art = 'muskel'
  -- [read] `abs` und `obliques` zeichnet die Karte als Segmentmuster,
  --   nicht als zwei Haelften - eine Seitenzeile waere dort eine
  --   Zusage, die kein Pfad einloest.
  AND f.code NOT IN ('abs', 'obliques', 'neck')
ON CONFLICT (code) DO UPDATE
  SET parent_id = EXCLUDED.parent_id, name_de = EXCLUDED.name_de,
      name_en = EXCLUDED.name_en, ebene = EXCLUDED.ebene, art = EXCLUDED.art,
      seite = EXCLUDED.seite, muscle_group_id = EXCLUDED.muscle_group_id,
      sortierung = EXCLUDED.sortierung;

COMMIT;
