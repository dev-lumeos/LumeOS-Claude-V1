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
--   muscle_groups     157 -> 109  (45 Dubletten: Klammer, Schreibweise,
--                                  doppeltes Leerzeichen; + 2 Platzhalter
--                                  "none"/"None" entfernt; + 3 Plural-
--                                  Paare, Einzelfall Tom/Block 18)
--   equipment          61 ->  58  (3 Schreibweisen-Dubletten)
--   exercises       1.448 -> 1.416 (32 Schreibweisen-Dubletten, [cmd]
--                                  alle mit IDENTISCHEN Medienpfaden)
--   exercise_muscles 6.398 -> 6.625 Zuordnungen
-- Die Zuordnungen NEHMEN ZU, obwohl Zeilen zusammengefallen sind: die
-- Quelle sind die Arrays (6.796 Paare), nicht die alte Tabelle. Davon
-- entfallen 14 auf den Platzhalter "none", der Rest faellt durch die
-- Zusammenfuehrung zusammen — was uebrig bleibt, ist die Vereinigung.
-- =============================================================
SELECT 'muscle_groups_rows', COUNT(*)::text FROM training.muscle_groups;   -- 109
SELECT 'equipment_rows', COUNT(*)::text FROM training.equipment;           -- 58
SELECT 'exercises_rows', COUNT(*)::text FROM training.exercises;           -- 1416
SELECT 'exercise_muscles_rows', COUNT(*)::text FROM training.exercise_muscles; -- 6625

-- --- DIE Kernpruefung: mehr Zuordnungen als die alte Tabelle ---
SELECT 'zuordnungen_mehr_als_altbestand', (COUNT(*) - 6398)::text
FROM training.exercise_muscles;
SELECT 'zuordnungen_erwartet', (COUNT(*) = 6625)::text
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

-- --- body_region: Luecke bekannt, hier gemessen statt behauptet ---
-- [cmd] 45 von 109 Gruppen ohne Region (vor dem Plural-Merge 47 von
-- 112 — die zwei aufgeloesten Thigh-Zeilen trugen selbst keine),
-- und die Luecke folgt NICHT
-- der Seltenheit: Semimembranosus/Semitendinosus tragen je 381
-- Nutzungen ohne Region. Das ist fehlende Quelldatenpflege, keine
-- Absicht. Als Kennzahl gefuehrt, damit eine spaetere Nachpflege
-- sichtbar wird; kein Sollwert, deshalb keine harte Pruefung.
SELECT 'gruppen_ohne_body_region', COUNT(*)::text
FROM training.muscle_groups WHERE body_region IS NULL;
