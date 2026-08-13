-- =============================================================
-- 104 — body_region nachpflegen (E-13)
-- Datum: 2026-08-13 · Laeuft NACH 103. Idempotent.
-- =============================================================
--
-- REIHENFOLGE: 103 (Calvicular-Merge) MUSS vorher laufen. Sonst traegt
-- dieser Schritt eine Region in eine Zeile ein, die 103 anschliessend
-- entfernt — Arbeit an einer Leiche. Deshalb wurde die Dublettenfrage
-- zuerst geklaert und diese Datei von 103 auf 104 umbenannt.
-- =============================================================
--
-- ANLASS: `[cmd]` 45 von 109 Muskelgruppen ohne Region, und die Luecke
-- folgt NICHT der Seltenheit: Semimembranosus und Semitendinosus tragen
-- je 381 Nutzungen. 22 % aller Zuordnungen zeigen auf regionslose
-- Gruppen.
--
-- WOHER DIE EINTEILUNG KOMMT — keine Erfindung:
-- `[read]` SPEC_06 laesst genau sieben Werte zu; der CHECK in
-- 100_training_schema.sql fuehrt sie:
--   chest, back, shoulders, arms, core, legs, full_body
-- `full_body` ist erlaubt, wird aber `[cmd]` von keiner Zeile benutzt
-- und auch hier nicht vergeben.
--
-- REGEL, nach der zugeordnet wurde: nur was anatomisch eindeutig ist.
-- Was mehrdeutig bleibt, bleibt NULL und ist unten benannt. Eine falsche
-- Region ist schlechter als keine — sie wird spaeter zum Filtern benutzt
-- und niemand prueft sie nach.
--
-- =============================================================
-- WAS NICHT ZUGEORDNET WIRD (4 Gruppen, bleiben NULL)
-- =============================================================
-- `Neck Muscles` (5 Nutzungen), `Scalenes` (2),
-- `Sternocleidomastoid` (2), `splenius capitis` (1).
-- Alle vier sind Hals-/Nackenmuskulatur. SPEC_06 kennt dafuer KEINE
-- Region: weder `back` noch `shoulders` trifft zu, `full_body` waere
-- eine Behauptung. Das ist eine Produktentscheidung (achte Region
-- aufnehmen? unter `back` fuehren?), keine anatomische Frage —
-- deshalb hier offen gelassen statt geraten.
--
-- =============================================================
-- WAS BEIM PRUEFEN AUFFIEL — Altbestand, hier NICHT angefasst
-- =============================================================
-- `[cmd]` Vier bereits gesetzte Regionen sind anatomisch falsch:
--   `Biceps Femoris`      -> arms   (ist ein Hamstring, also legs)
--   `Rectus Femoris`      -> core   (ist ein Quadrizepskopf, also legs)
--   `Tensor Fasciae Latae`-> back   (ist ein Hueftmuskel, also legs)
--   `Hip Rotators`        -> shoulders (Huefte, also legs)
-- Sie stehen so seit dem Import. **Bewusst nicht mitkorrigiert:** der
-- Auftrag war das Nachpflegen der Luecke, nicht das Umschreiben
-- vorhandener Werte. Wer sie aendert, aendert bestehende Filterergebnisse
-- — das gehoert entschieden, nicht nebenbei erledigt. Als eigener Punkt
-- zu fuehren.
-- =============================================================

BEGIN;

-- Zuordnung ueber den NAMEN, nicht ueber die ID: die Namen sind seit
-- 102 eindeutig (UNIQUE-Index), und ein Name ist lesbar pruefbar.
-- WHERE body_region IS NULL macht den Schritt idempotent und schuetzt
-- davor, eine bereits gesetzte Region zu ueberschreiben.
UPDATE training.muscle_groups AS g
   SET body_region = v.region
  FROM (VALUES
    -- --- legs (19) ---
    ('Semimembranosus',                'legs'),   -- Hamstring
    ('Semitendinosus',                 'legs'),   -- Hamstring
    ('Calves',                         'legs'),
    ('Soleus',                         'legs'),   -- Schollenmuskel
    ('Anterior Tibialis',              'legs'),
    ('Tibialis',                       'legs'),
    ('Tibialis Posterior',             'legs'),
    ('Peroneals',                      'legs'),
    ('Peroneus Brevis',                'legs'),
    ('Fibularis Muscles',              'legs'),   -- Fibularis = Peroneus
    ('Flexor Digitorum Longus',        'legs'),   -- langer Zehenbeuger
    ('Foot Muscles',                   'legs'),
    ('Achilles Tendon',                'legs'),   -- Sehne, siehe Anmerkung
    ('Inner Thigh',                    'legs'),
    ('Outer Thigh',                    'legs'),
    ('Thighs',                         'legs'),
    ('Buttocks',                       'legs'),   -- wie Glutes im Bestand
    ('piriformis',                     'legs'),   -- Hueftaussenrotator
    ('Iliopsoas',                      'legs'),   -- wie Hip Flexors im Bestand

    -- --- arms (14), einschliesslich Unterarm ---
    ('Brachioradialis',                'arms'),
    ('Brachialis',                     'arms'),
    ('Arms',                           'arms'),
    ('Flexor Carpi Ulnaris',           'arms'),
    ('Flexor Carpi Radialis',          'arms'),
    ('Extensor Carpi Ulnaris',         'arms'),
    ('Extensor Carpi Radialis',        'arms'),
    ('Extensor Carpi Radialis Longus', 'arms'),
    ('Extensor Carpi Radialis Brevis', 'arms'),
    ('Flexor Digitorum Profundus',     'arms'),
    ('Fingers Flexors',                'arms'),
    ('Palmaris Longus',                'arms'),
    ('Pronator Teres',                 'arms'),
    ('Grip Muscles',                   'arms'),   -- Griffkraft = Unterarm

    -- --- shoulders (3): Rotatorenmanschette, wie `Rotator Cuff` ---
    ('Teres Minor',                    'shoulders'),
    ('Infraspinatus',                  'shoulders'),
    ('Subscapularis',                  'shoulders'),

    -- --- back (2) ---
    ('Teres Major',                    'back'),   -- wie Lats/Rhomboids
    ('levator scapulae',               'back'),   -- wie Trapezius

    -- --- chest (3): Anteile des Pectoralis major ---
    ('Clavicular Head',                'chest'),
    ('Sternal Head',                   'chest')
    -- "Calvicular Head" stand hier bis 2026-08-13 mit derselben Region.
    -- `[cmd]` Die Zeile ist eine Tippfehler-Dublette und wird von 103
    -- entfernt; ein Eintrag hier waere ins Leere gelaufen.
  ) AS v(name, region)
 WHERE g.name = v.name
   AND g.body_region IS NULL;

-- --- Selbstkontrolle, bevor committet wird ---
-- Eine Migration, die ihr eigenes Ergebnis nicht prueft, behauptet
-- Sicherheit, ohne sie zu erzeugen.
DO $$
DECLARE
  v_ohne   int;
  v_gesamt int;
  v_hals   int;
BEGIN
  SELECT COUNT(*) INTO v_gesamt FROM training.muscle_groups;
  SELECT COUNT(*) INTO v_ohne FROM training.muscle_groups
   WHERE body_region IS NULL;
  SELECT COUNT(*) INTO v_hals FROM training.muscle_groups
   WHERE body_region IS NULL
     AND name IN ('Neck Muscles','Scalenes','Sternocleidomastoid','splenius capitis');

  -- 108, nicht 109: 103 hat die Tippfehler-Dublette entfernt.
  IF v_gesamt <> 108 THEN
    RAISE EXCEPTION 'Muskelgruppen: % statt 108 — lief 103 vorher?', v_gesamt;
  END IF;
  IF v_ohne <> 4 THEN
    RAISE EXCEPTION 'Ohne Region: % statt 4 — Zuordnung unvollstaendig', v_ohne;
  END IF;
  IF v_hals <> 4 THEN
    RAISE EXCEPTION 'Die 4 verbliebenen sind nicht die Hals-Gruppen (%)', v_hals;
  END IF;
  RAISE NOTICE 'OK: 108 Gruppen, 104 mit Region, 4 ohne (Hals, bewusst)';
END $$;

COMMIT;

-- =============================================================
-- ANMERKUNGEN, die beim Zuordnen aufgefallen sind
-- =============================================================
-- 1. `Achilles Tendon` (1 Nutzung) ist eine SEHNE, keine Muskelgruppe.
--    Sie bekommt `legs`, damit sie nicht durch jeden Regionsfilter
--    faellt — richtiger waere, sie gar nicht als Muskelgruppe zu fuehren.
-- 2. `Calvicular Head` (2 Nutzungen) ist ein Schreibfehler von
--    `Clavicular Head` (22 Nutzungen). Beide bekommen `chest`. Eine
--    Zusammenfuehrung waere sinnvoll, ist aber eine Dublettenentscheidung
--    wie in 102 — nicht Teil von E-13.
-- 3. `Grip Muscles`, `Fingers Flexors`, `Foot Muscles`, `Neck Muscles`
--    sind Sammelbegriffe, keine einzelnen Muskeln. Sie bleiben, weil
--    Uebungen sie benutzen.
