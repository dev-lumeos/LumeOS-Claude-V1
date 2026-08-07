-- =============================================================
-- 102 — Plural-Paare zusammenfuehren (muscle_groups)
-- Datum: 2026-08-07 · Freigabe: Tom, Block 18
-- Laeuft NACH 101. Idempotent: ein zweiter Lauf findet nichts mehr.
-- =============================================================
--
-- WARUM VON HAND UND NICHT PER REGEL
-- Die Dublettensuche in 101 laeuft ueber EINEN Vergleichsschluessel
-- (trim + Klammer + Kleinschreibung + Leerzeichen). Singular/Plural
-- steht bewusst NICHT darin: [cmd] eine Regel "End-s entfernen"
-- wuerde in exercises "Single Arm" und "Single Arms" verschmelzen,
-- und [cmd] deren Medienpfade sind verschieden — zwei Uebungen.
-- Dieselbe Regel wuerde "Both Arms"/"Both Arm" treffen (beidarmig
-- gegen einarmig). Der Plural TRAEGT dort die Bedeutung.
--
-- Diese drei Paare sind deshalb eine HANDVERLESENE AUSNAHME nach
-- Toms Entscheidung, keine anwendbare Regel. Wer hier eine
-- Verallgemeinerung herausliest, zerstoert echte Uebungen.
--
-- BELEG je Paar [cmd] 2026-08-07 gegen live:
--   gleiche body_region, je genau eine Zeile pro Schreibweise,
--   und 0 Uebungen tragen BEIDE Varianten (keine Kollision).
--
-- REGEL (Toms Entscheidung):
--   Es ueberlebt die Zeile mit MEHR NUTZUNGEN, sie behaelt ihre ID
--   und bekommt den SINGULAR-Namen. Das haelt die Zahl der
--   umzuhaengenden Zuordnungen klein (8 statt 45).
--
--   Paar 1  Inner Thighs      (11) BLEIBT -> "Inner Thigh"
--           Inner Thigh       ( 1) faellt weg
--   Paar 2  Internal Obliques (33) BLEIBT -> "Internal Oblique"
--           Internal Oblique  ( 6) faellt weg
--   Paar 3  Outer Thigh       ( 3) BLEIBT, Name schon Singular
--           Outer Thighs      ( 1) faellt weg
--
-- REIHENFOLGE IST NICHT BELIEBIG — hier steckt die Falle:
--   training.muscle_groups traegt einen UNIQUE-Index auf name
--   ([cmd] muscle_groups_name_key). Die Zielnamen "Inner Thigh"
--   und "Internal Oblique" sind AKTUELL VERGEBEN — naemlich von
--   den Zeilen, die aufgeloest werden. Ein UPDATE des Namens VOR
--   dem DELETE bricht mit Unique-Verletzung ab.
--   Deshalb: 1. umhaengen  2. loeschen  3. erst dann umbenennen.
--
-- NICHT ANGEFASST, mit Grund:
--   "Obliques" (219x) — gaengiger anatomischer Begriff, kein
--       Singular-Zwilling vorhanden.
--   "Thighs" (1x) — [cmd] KEINE Dublette: die eine Uebung
--       ("Resistance Band Clam") traegt Thighs neben Glutes als
--       primary und hat KEIN Inner/Outer Thigh. Eine grobe
--       Aussage ueber den ganzen Oberschenkel, keine Variante.
-- =============================================================

BEGIN;

-- --- Schritt 1: Zuordnungen auf die ueberlebende Zeile umhaengen ---
-- ON CONFLICT DO NOTHING faengt den Fall ab, dass eine Uebung
-- BEIDEN Varianten mit derselben role zugeordnet war. [cmd] am
-- 2026-08-07 sind das 0 Faelle; die Klausel steht als Schutz fuer
-- einen Wiederholungslauf auf veraendertem Bestand, nicht als
-- Notnagel fuer heute. Sinkt die Summe, war es genau dieser Fall.
UPDATE training.exercise_muscles m
   SET muscle_group_id = v.bleibt
  FROM (VALUES
    ('be4df651-1acd-402a-aebc-2fd8ee08efe9'::uuid, 'd46ddb12-f9b9-4fbf-ae2d-0a2dc0809514'::uuid),
    ('7fa41d97-18e9-48cf-8342-81b571ec737d'::uuid, 'cc755ab4-4f26-438b-a7da-3df575ff3804'::uuid),
    ('866bd105-c95f-407d-8fa8-20fae1b9ed0a'::uuid, 'cd50499c-089c-414b-ae23-27ceb9f1b775'::uuid)
  ) AS v(faellt_weg, bleibt)
 WHERE m.muscle_group_id = v.faellt_weg
   AND NOT EXISTS (
     SELECT 1 FROM training.exercise_muscles x
      WHERE x.exercise_id = m.exercise_id
        AND x.muscle_group_id = v.bleibt
        AND x.role = m.role);

-- Reste, die wegen einer Kollision nicht umgehaengt werden konnten,
-- entfallen — die Aussage steht bereits auf der ueberlebenden Zeile.
DELETE FROM training.exercise_muscles
 WHERE muscle_group_id IN (
   'be4df651-1acd-402a-aebc-2fd8ee08efe9',
   '7fa41d97-18e9-48cf-8342-81b571ec737d',
   '866bd105-c95f-407d-8fa8-20fae1b9ed0a');

-- --- Schritt 2: aufgeloeste Zeilen entfernen (gibt die Namen frei) ---
DELETE FROM training.muscle_groups
 WHERE id IN (
   'be4df651-1acd-402a-aebc-2fd8ee08efe9',   -- Inner Thigh
   '7fa41d97-18e9-48cf-8342-81b571ec737d',   -- Internal Oblique
   '866bd105-c95f-407d-8fa8-20fae1b9ed0a');  -- Outer Thighs

-- --- Schritt 3: erst JETZT umbenennen, Namen sind frei ---
UPDATE training.muscle_groups
   SET name = 'Inner Thigh'
 WHERE id = 'd46ddb12-f9b9-4fbf-ae2d-0a2dc0809514';

UPDATE training.muscle_groups
   SET name = 'Internal Oblique'
 WHERE id = 'cc755ab4-4f26-438b-a7da-3df575ff3804';

-- --- Schritt 4: Selbstkontrolle, bevor committet wird ---
-- Eine Migration, die ihr eigenes Ergebnis nicht prueft, behauptet
-- Sicherheit, ohne sie zu erzeugen. Stimmt etwas nicht, bricht die
-- Transaktion ab und live bleibt unveraendert.
DO $$
DECLARE
  v_gruppen  int;
  v_zuord    int;
  v_waisen   int;
  v_alt      int;
  v_neu      int;
BEGIN
  SELECT COUNT(*) INTO v_gruppen FROM training.muscle_groups;
  SELECT COUNT(*) INTO v_zuord   FROM training.exercise_muscles;
  SELECT COUNT(*) INTO v_waisen  FROM training.exercise_muscles m
    LEFT JOIN training.muscle_groups g ON g.id = m.muscle_group_id
   WHERE g.id IS NULL;
  SELECT COUNT(*) INTO v_alt FROM training.muscle_groups
   WHERE name IN ('Inner Thighs','Internal Obliques','Outer Thighs');
  SELECT COUNT(*) INTO v_neu FROM training.muscle_groups
   WHERE name IN ('Inner Thigh','Internal Oblique','Outer Thigh');

  IF v_gruppen <> 109 THEN
    RAISE EXCEPTION 'Muskelgruppen: % statt 109', v_gruppen;
  END IF;
  IF v_zuord <> 6625 THEN
    RAISE EXCEPTION 'Zuordnungen: % statt 6625 — Kollision aufgetreten?', v_zuord;
  END IF;
  IF v_waisen <> 0 THEN
    RAISE EXCEPTION 'Waisen: %', v_waisen;
  END IF;
  IF v_alt <> 0 THEN
    RAISE EXCEPTION 'Plural-Namen noch vorhanden: %', v_alt;
  END IF;
  IF v_neu <> 3 THEN
    RAISE EXCEPTION 'Singular-Namen: % statt 3', v_neu;
  END IF;
  RAISE NOTICE 'OK: 109 Gruppen, 6625 Zuordnungen, 0 Waisen, 3 Singular-Namen';
END $$;

COMMIT;
