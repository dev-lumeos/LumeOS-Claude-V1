-- v100 — Validierung Schema `training` (Block 17)
-- Deckt 100 (Schema) und 101 (Seed) ab. Stil wie v052/v053/v055.

-- --- Existenz ---
SELECT 'schema_training_exists', (to_regnamespace('training') IS NOT NULL)::text;
SELECT 'muscle_groups_exists', (to_regclass('training.muscle_groups') IS NOT NULL)::text;
SELECT 'equipment_exists', (to_regclass('training.equipment') IS NOT NULL)::text;
SELECT 'exercises_exists', (to_regclass('training.exercises') IS NOT NULL)::text;
SELECT 'exercise_muscles_exists', (to_regclass('training.exercise_muscles') IS NOT NULL)::text;

-- =============================================================
-- BESTAND — Herkunft der Zahlen, damit niemand Datenverlust vermutet
-- =============================================================
-- Cloud-Altbestand -> hier, je mit Grund:
--   muscle_groups     157 -> 108  (45 Dubletten: Klammer, Schreibweise,
--                                  doppeltes Leerzeichen; + 2 Platzhalter
--                                  "none"/"None" entfernt; + 3 Plural-
--                                  Paare, Einzelfall Tom/Block 18)
--   equipment          61 ->  58  (3 Schreibweisen-Dubletten)
--   exercises       1.448 -> 1.416 (32 Schreibweisen-Dubletten, [cmd]
--                                  alle mit IDENTISCHEN Medienpfaden)
--   exercise_muscles 6.398 -> 6.624 Zuordnungen (6.625 aus dem Seed,
--                                  minus 1 Kollision beim mideus-Merge, 105)
-- Die Zuordnungen NEHMEN ZU, obwohl Zeilen zusammengefallen sind: die
-- Quelle sind die Arrays (6.796 Paare), nicht die alte Tabelle. Davon
-- entfallen 14 auf den Platzhalter "none", der Rest faellt durch die
-- Zusammenfuehrung zusammen — was uebrig bleibt, ist die Vereinigung.
-- =============================================================
SELECT 'muscle_groups_rows', COUNT(*)::text FROM training.muscle_groups;   -- 108
SELECT 'equipment_rows', COUNT(*)::text FROM training.equipment;           -- 58
SELECT 'exercises_rows', COUNT(*)::text FROM training.exercises;           -- 1416
SELECT 'exercise_muscles_rows', COUNT(*)::text FROM training.exercise_muscles; -- 6624

-- --- DIE Kernpruefung: mehr Zuordnungen als die alte Tabelle ---
SELECT 'zuordnungen_mehr_als_altbestand', (COUNT(*) - 6398)::text
FROM training.exercise_muscles;
SELECT 'zuordnungen_erwartet', (COUNT(*) = 6624)::text
FROM training.exercise_muscles;
SELECT 'uebungen_erwartet', (COUNT(*) = 1416)::text FROM training.exercises;
SELECT 'zuordnungen_primary', COUNT(*)::text FROM training.exercise_muscles WHERE role='primary';
SELECT 'zuordnungen_secondary', COUNT(*)::text FROM training.exercise_muscles WHERE role='secondary';

-- --- 0 Waisen, jetzt ERZWUNGEN statt gehofft ---
SELECT 'waisen_exercise_equipment', COUNT(*)::text
FROM training.exercises e
WHERE e.equipment_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM training.equipment q WHERE q.id = e.equipment_id);
SELECT 'waisen_em_exercise', COUNT(*)::text
FROM training.exercise_muscles em
WHERE NOT EXISTS (SELECT 1 FROM training.exercises e WHERE e.id = em.exercise_id);
SELECT 'waisen_em_muscle', COUNT(*)::text
FROM training.exercise_muscles em
WHERE NOT EXISTS (SELECT 1 FROM training.muscle_groups m WHERE m.id = em.muscle_group_id);

-- --- Die Fremdschluessel existieren wirklich (nicht nur 0 Waisen) ---
-- Aus 0 Waisen folgt NICHT, dass ein Constraint sie erzwingt — genau das
-- war der Befund im Altbestand.
SELECT 'fremdschluessel_anzahl', COUNT(*)::text
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'training'
WHERE c.contype = 'f';

-- --- Bereinigungen belegt ---
SELECT 'muskelnamen_mit_klammer', COUNT(*)::text
FROM training.muscle_groups WHERE name LIKE '%)';
SELECT 'body_region_other', COUNT(*)::text
FROM training.muscle_groups WHERE body_region = 'other';
SELECT 'body_region_null', COUNT(*)::text
FROM training.muscle_groups WHERE body_region IS NULL;
SELECT 'category_kleingeschrieben', COUNT(*)::text
FROM training.exercises WHERE category = 'bodyweight';

-- --- E-06: relative Pfade, keine absoluten URLs ---
SELECT 'exercises_mit_medien', COUNT(*)::text
FROM training.exercises WHERE media_paths <> '{}'::jsonb;
SELECT 'medienpfade_gesamt', COALESCE(SUM((SELECT COUNT(*) FROM jsonb_object_keys(media_paths))),0)::text
FROM training.exercises;
SELECT 'medienpfade_mit_http', COUNT(*)::text
FROM training.exercises WHERE media_paths::text LIKE '%http%';

-- --- Zeilenschutz an, je Tabelle eine SELECT-Policy ---
SELECT 'rls_alle_vier', COUNT(*)::text
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='training' AND c.relkind='r' AND c.relrowsecurity;
SELECT 'select_policies', COUNT(*)::text
FROM pg_policies WHERE schemaname='training' AND cmd='SELECT';
SELECT 'schreib_policies_mit_with_check', COUNT(*)::text
FROM pg_policies WHERE schemaname='training'
  AND cmd IN ('INSERT','UPDATE') AND with_check IS NOT NULL;

-- --- Rechte: DML-Grant vorhanden, Eingrenzung ueber die Policies ---
-- Ein GRANT nur auf SELECT wuerde die Admin-Schreib-Policies zu totem
-- Text machen: das Tabellenrecht wird VOR RLS geprueft (060 §3c).
-- [cmd] 2026-08-07 genau so passiert — der Admin bekam "permission
-- denied", obwohl seine Policy existierte. Diese Pruefung haelt das fest.
SELECT 'grants_authenticated', COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type),'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema='training' AND grantee='authenticated';
SELECT 'dml_grant_vorhanden', (COUNT(*) = 12)::text
FROM information_schema.role_table_grants
WHERE table_schema='training' AND grantee='authenticated'
  AND privilege_type IN ('INSERT','UPDATE','DELETE');

-- Die Eingrenzung MUSS dann aus den Policies kommen: je Tabelle drei
-- Schreib-Policies, alle an public.is_admin() gebunden.
SELECT 'schreib_policies_an_is_admin', COUNT(*)::text
FROM pg_policies WHERE schemaname='training'
  AND cmd IN ('INSERT','UPDATE','DELETE')
  AND (COALESCE(qual,'') || COALESCE(with_check,'')) LIKE '%is_admin%';

-- --- Eindeutigkeit, exakt ---
SELECT 'doppelte_uebungsnamen', COUNT(*)::text FROM (
  SELECT name FROM training.exercises GROUP BY name HAVING COUNT(*)>1) d;
SELECT 'doppelte_muskelnamen', COUNT(*)::text FROM (
  SELECT name FROM training.muscle_groups GROUP BY name HAVING COUNT(*)>1) d;

-- --- Eindeutigkeit, NORMALISIERT: findet Dubletten JEDER Art ---
-- Der UNIQUE-Index auf `name` faengt nur exakte Dubletten. Der
-- Altbestand fuehrte denselben Muskel in DREI Varianten, die alle
-- verschieden waren und den Index deshalb passiert haetten:
--   "Trapezius" / "trapezius" / "Trapezius)" / "trapezius)"
-- [cmd] 157 Zeilen -> 136 (Klammer) -> 114 (Schreibweise) -> 113
-- (doppeltes Leerzeichen). Ohne diese Pruefung faellt eine VIERTE
-- Klasse beim naechsten Seed wieder niemandem auf.
-- Der Schluessel hier muss derselbe sein wie im Seed-Erzeuger.
SELECT 'muskelnamen_normalisiert_eindeutig',
       (COUNT(DISTINCT regexp_replace(lower(regexp_replace(btrim(name), '\s*\)+\s*$', '')), '\s+', ' ', 'g'))
        = COUNT(*))::text
FROM training.muscle_groups;
SELECT 'muskelnamen_dubletten_normalisiert',
       (COUNT(*) - COUNT(DISTINCT regexp_replace(lower(regexp_replace(btrim(name), '\s*\)+\s*$', '')), '\s+', ' ', 'g')))::text
FROM training.muscle_groups;

-- Uebungen und Geraete: HART, nicht mehr nur gemessen.
-- Die Uebungspruefung stand bis 2026-08-07 als OFFEN drin (32 Dubletten);
-- nach dem Merge muss sie true liefern.
-- ANDERER SCHLUESSEL als bei muscle_groups: hier OHNE Klammerregel.
-- [cmd] Alle 58 Klammer-Namen in exercises sind GEPAART
-- ("Chest dip (on dip station)"). Die muscle_groups-Regel wuerde daraus
-- "Chest dip (on dip station" machen und 56 echte Namen zerstoeren.
SELECT 'uebungsnamen_normalisiert_eindeutig',
       (COUNT(DISTINCT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g')) = COUNT(*))::text
FROM training.exercises;
SELECT 'uebungsnamen_dubletten_normalisiert',
       (COUNT(*) - COUNT(DISTINCT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g')))::text
FROM training.exercises;
SELECT 'geraetenamen_normalisiert_eindeutig',
       (COUNT(DISTINCT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g')) = COUNT(*))::text
FROM training.equipment;
SELECT 'geraetenamen_dubletten_normalisiert',
       (COUNT(*) - COUNT(DISTINCT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g')))::text
FROM training.equipment;

-- exercise_muscles braucht keine Namenspruefung (kein Name), aber die
-- Vollstaendigkeit des Schluessels: keine Zeile darf doppelt sein.
-- Der Primaerschluessel erzwingt es; hier gegengeprueft.
SELECT 'zuordnungen_doppelt', COUNT(*)::text FROM (
  SELECT exercise_id, muscle_group_id, role
  FROM training.exercise_muscles
  GROUP BY 1,2,3 HAVING COUNT(*) > 1) d;

-- Gepaarte Klammern in exercises sind ECHTE Namen und muessen BLEIBEN.
-- Diese Pruefung faengt den Fehler ab, die muscle_groups-Regel hier
-- anzuwenden: sie wuerde die Zahl auf 0 druecken.
SELECT 'uebungen_mit_gepaarter_klammer', COUNT(*)::text
FROM training.exercises WHERE name LIKE '%(%' AND name LIKE '%)%';
SELECT 'uebungen_mit_UNGEPAARTER_klammer', COUNT(*)::text
FROM training.exercises
WHERE (name LIKE '%)%' AND name NOT LIKE '%(%')
   OR (name LIKE '%(%' AND name NOT LIKE '%)%');

-- --- Kein Platzhalter in den Stammdaten ---
-- "none"/"None" war [cmd] 14x als sekundaerer Muskel eingetragen und
-- 0x als primaerer — eine Abwesenheit, als Wert kodiert.
SELECT 'platzhalter_none', COUNT(*)::text
FROM training.muscle_groups WHERE lower(btrim(name)) = 'none';

-- --- Keine ueberzaehligen Leerzeichen oder Klammern mehr ---
SELECT 'namen_mit_doppeltem_leerzeichen', COUNT(*)::text
FROM training.muscle_groups WHERE name ~ '\s{2,}';
SELECT 'namen_mit_randleerzeichen', COUNT(*)::text
FROM training.muscle_groups WHERE name <> btrim(name);

-- =============================================================
-- PLURAL-AUSNAHME (Tom, Block 18) — haelt der Zustand?
-- =============================================================
-- Diese drei Paare sind KEINE Regel, sondern eine Einzelfall-
-- entscheidung. Genau deshalb muessen sie geprueft werden: eine
-- Ausnahme, die niemand nachhaelt, kommt beim naechsten Seed-Lauf
-- stillschweigend zurueck. Die aufgeloesten Namen muessen ABWESEND,
-- die Singular-Namen VORHANDEN sein.
SELECT 'plural_namen_abwesend', (COUNT(*) = 0)::text
FROM training.muscle_groups
WHERE name IN ('Inner Thighs', 'Internal Obliques', 'Outer Thighs');
SELECT 'singular_namen_vorhanden', (COUNT(*) = 3)::text
FROM training.muscle_groups
WHERE name IN ('Inner Thigh', 'Internal Oblique', 'Outer Thigh');

-- Die ueberlebenden Zeilen behalten ihre IDs — sonst waeren die
-- Zuordnungen auf neue Zeilen gewandert statt umgehaengt worden.
SELECT 'plural_ueberlebende_ids', (COUNT(*) = 3)::text
FROM training.muscle_groups WHERE id IN (
  'd46ddb12-f9b9-4fbf-ae2d-0a2dc0809514',   -- Inner Thigh (war Thighs)
  'cc755ab4-4f26-438b-a7da-3df575ff3804',   -- Internal Oblique
  'cd50499c-089c-414b-ae23-27ceb9f1b775');  -- Outer Thigh
SELECT 'plural_aufgeloeste_ids_weg', (COUNT(*) = 0)::text
FROM training.muscle_groups WHERE id IN (
  'be4df651-1acd-402a-aebc-2fd8ee08efe9',
  '7fa41d97-18e9-48cf-8342-81b571ec737d',
  '866bd105-c95f-407d-8fa8-20fae1b9ed0a');

-- NICHT angetastet: "Obliques" ist der gaengige anatomische Begriff
-- ohne Singular-Zwilling, "Thighs" [cmd] keine Dublette (steht neben
-- Glutes in "Resistance Band Clam", ohne Inner/Outer Thigh).
-- Verschwinden sie, hat jemand die Ausnahme zur Regel gemacht.
SELECT 'obliques_und_thighs_unberuehrt', (COUNT(*) = 2)::text
FROM training.muscle_groups WHERE name IN ('Obliques', 'Thighs');

-- --- body_region ---
-- [cmd] Bis 2026-08-13: 45 von 109 Gruppen ohne Region. Nach 104
-- (E-13) sind es 4 von 108 — die vier Hals-Gruppen, fuer die SPEC_06
-- keine Region kennt. Das ist eine bewusste Luecke, kein Rest:
-- `Neck Muscles`, `Scalenes`, `Sternocleidomastoid`, `splenius capitis`.
SELECT 'gruppen_ohne_body_region', COUNT(*)::text
FROM training.muscle_groups WHERE body_region IS NULL;
SELECT 'ohne_region_sind_die_hals_gruppen',
       (COUNT(*) = 4)::text
FROM training.muscle_groups
WHERE body_region IS NULL
  AND name IN ('Neck Muscles','Scalenes','Sternocleidomastoid','splenius capitis');
SELECT 'zuordnungen_auf_gruppen_ohne_region', COUNT(*)::text
FROM training.exercise_muscles m
JOIN training.muscle_groups g ON g.id = m.muscle_group_id
WHERE g.body_region IS NULL;

-- =============================================================
-- SECHSTE DUBLETTENKLASSE: TIPPFEHLER — MELDUNG mit Ausnahmeliste
-- =============================================================
-- Die fuenf frueheren Klassen (Klammer, Schreibweise, doppeltes
-- Leerzeichen, Plural, gepaarte Klammer als Nicht-Klasse) fallen alle
-- unter einen NORMALISIERTEN Vergleichsschluessel. Ein Tippfehler nicht:
-- `calvicular`/`clavicular` und `medius`/`mideus` bleiben nach jeder
-- Normalisierung verschieden. Genau deshalb sind beide durchgerutscht.
--
-- -------------------------------------------------------------
-- KORRIGIERT 2026-08-13: der erste Waechter zaehlte in die FALSCHE
-- RICHTUNG. Er meldete `tippfehler_ohne_gegenbeleg` — Paare OHNE
-- gemeinsame Uebung — in der Annahme, eine gemeinsame Uebung entlaste.
-- `[cmd]` Das Gegenteil ist der Fall:
--
--   Paar                              dist  gemeinsam  Befund
--   Biceps / Triceps                   2      11       zwei Muskeln
--   Gluteus Medius / gluteus mideus    2       5       TIPPFEHLER
--   Abductors / Adductors              1       1       zwei Muskeln
--   Hip Abductors / Hip Adductors      1       1       zwei Muskeln
--   Back Muscles / Neck Muscles        2       0       zwei Muskeln
--   Gluteus Maximus / Gluteus Minimus  2       0       zwei Muskeln
--   Lats / Legs                        2       0       zwei Muskeln
--   Teres Major / Teres Minor          2       0       zwei Muskeln
--
-- Die vier mit 0 gemeinsamen Uebungen sind ALLE Scheintreffer; der eine
-- echte Tippfehler hat FUENF. Der alte Waechter meldete also vier
-- Nicht-Faelle und uebersah den einzigen, der zaehlte.
-- Eine gemeinsame Uebung ENTLASTET nicht, sie BELASTET: dieselbe
-- Muskelgruppe zweimal an einer Uebung kommt bei zwei verschiedenen
-- Muskeln nicht vor.
--
-- -------------------------------------------------------------
-- WARUM ES KEINE AUTOMATISCHE TRENNUNG GIBT — gesucht, nicht behauptet:
-- `[cmd]` 2026-08-13 drei Merkmale geprueft, keines traegt:
--   1. Gemeinsame Uebung: mideus 5, Biceps/Triceps 11 — beide "auffaellig".
--   2. Gleiche Rolle in derselben Uebung: mideus 1, Biceps/Triceps 8,
--      Abductors/Adductors 1. mideus liegt NIEDRIGER als zwei echte
--      Muskelpaare — das Merkmal trennt nicht.
--   3. Kleinschreibung: trennt `gluteus mideus` heute sauber ab, findet
--      aber eine FORMATIERUNGS-Abweichung, keinen Tippfehler. Der
--      naechste Tippfehler kommt in Titelform.
-- Ein viertes Merkmal (gleiche Buchstaben-Multimenge = reine Umstellung)
-- traefe alle acht Faelle korrekt, ist aber eine Ueberanpassung an genau
-- diese acht: es faende `mideus`/`Medius` und `Calvicular`/`Clavicular`,
-- aber kein `Cavicular` (ausgelassener Buchstabe) — ein ebenso
-- wahrscheinlicher Tippfehler. Ein Merkmal, das acht von acht Faellen
-- passt, ist noch keine Regel.
--
-- DESHALB: reine MELDUNG mit fester Ausnahmeliste. Die Liste traegt je
-- Eintrag eine Begruendung — das ist mehr wert als eine Zahl, die in die
-- falsche Richtung zeigt. Steigt `tippfehler_unerklaert` ueber 0, ist ein
-- neues Paar aufgetaucht und gehoert VON HAND geprueft.
-- =============================================================

-- Alle Kandidaten, unbewertet — als Kennzahl, damit ein Anstieg auffaellt.
SELECT 'tippfehler_kandidaten_muskeln', COUNT(*)::text FROM (
  SELECT 1
  FROM (SELECT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g') AS norm
          FROM training.muscle_groups) a
  JOIN (SELECT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g') AS norm
          FROM training.muscle_groups) b ON a.norm < b.norm
  WHERE levenshtein(a.norm, b.norm) BETWEEN 1 AND 2
) t;

-- DIE eigentliche Pruefung: Kandidaten, die NICHT auf der geprueften
-- Ausnahmeliste stehen. Muss 0 sein; jeder Treffer ist ein neues Paar.
-- Die Liste enthaelt AUSSCHLIESSLICH Paare, die von Hand als zwei
-- verschiedene Muskeln bestaetigt wurden:
--   Abductors/Adductors, Hip Abductors/Hip Adductors — Gegenspieler
--   Biceps/Triceps                                   — Gegenspieler
--   Back Muscles/Neck Muscles                        — Rumpf gegen Hals
--   Gluteus Maximus/Gluteus Minimus                  — zwei Gesaessmuskeln
--   Lats/Legs                                        — Ruecken gegen Bein
--   Teres Major/Teres Minor                          — zwei Muskeln,
--       Major NICHT Teil der Rotatorenmanschette, Minor schon
SELECT 'tippfehler_unerklaert', COUNT(*)::text FROM (
  SELECT a.norm AS na, b.norm AS nb
  FROM (SELECT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g') AS norm
          FROM training.muscle_groups) a
  JOIN (SELECT regexp_replace(lower(btrim(name)), '\s+', ' ', 'g') AS norm
          FROM training.muscle_groups) b ON a.norm < b.norm
  WHERE levenshtein(a.norm, b.norm) BETWEEN 1 AND 2
    AND (a.norm, b.norm) NOT IN (
      ('abductors',       'adductors'),
      ('hip abductors',   'hip adductors'),
      ('biceps',          'triceps'),
      ('back muscles',    'neck muscles'),
      ('gluteus maximus', 'gluteus minimus'),
      ('lats',            'legs'),
      ('teres major',     'teres minor'))
) t;

-- Zusatzmeldung, weil sie die Richtung des Verdachts umdreht: Paare mit
-- GEMEINSAMER Uebung. Dieselbe Muskelgruppe zweimal an einer Uebung
-- kommt bei zwei verschiedenen Muskeln nicht vor — jeder Treffer hier
-- ausserhalb der Ausnahmeliste ist ein starker Tippfehler-Verdacht.
SELECT 'tippfehler_mit_gemeinsamer_uebung', COUNT(*)::text FROM (
  SELECT a.id
  FROM training.muscle_groups a JOIN training.muscle_groups b
    ON regexp_replace(lower(btrim(a.name)),'\s+',' ','g')
     < regexp_replace(lower(btrim(b.name)),'\s+',' ','g')
  WHERE levenshtein(regexp_replace(lower(btrim(a.name)),'\s+',' ','g'),
                    regexp_replace(lower(btrim(b.name)),'\s+',' ','g')) BETWEEN 1 AND 2
    AND EXISTS (
      SELECT 1 FROM training.exercise_muscles x
      JOIN training.exercise_muscles y ON x.exercise_id = y.exercise_id
      WHERE x.muscle_group_id = a.id AND y.muscle_group_id = b.id)
) t;

-- Die beiden entschiedenen Faelle: tauchen sie wieder auf, hat jemand
-- einen alten Seed eingespielt.
SELECT 'calvicular_head_abwesend', (COUNT(*) = 0)::text
FROM training.muscle_groups WHERE name = 'Calvicular Head';
SELECT 'gluteus_mideus_abwesend', (COUNT(*) = 0)::text
FROM training.muscle_groups WHERE name = 'gluteus mideus';
