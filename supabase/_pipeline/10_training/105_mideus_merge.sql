-- =============================================================
-- 105 — Tippfehler-Dublette `gluteus mideus` zusammenfuehren
-- Datum: 2026-08-13 · Laeuft NACH 104. Idempotent.
-- =============================================================
--
-- ANLASS: `[cmd]` `gluteus mideus` (383 Nutzungen) und `Gluteus Medius`
-- (20) sind derselbe Muskel, einmal falsch geschrieben. Gefunden nicht
-- durch den normalisierten Vergleichsschluessel — der trennt sie —,
-- sondern durch die Levenshtein-Meldung in v100.
--
-- =============================================================
-- DER BELEG: eine gemeinsame Uebung BELASTET, sie entlastet nicht
-- =============================================================
-- `[cmd]` Die beiden Zeilen sind FUENF Uebungen gemeinsam zugeordnet:
--
--   Resistance Band Lying Abduction                 secondary / primary
--   Resistance Band Lying Bent Knee Hip Abduction   secondary / primary
--   Resistance Band Lying Hyperextension Abduction  primary   / primary
--   Resistance Band Seated Bent Knee Abduction      secondary / primary
--   Resistance Band Seated Hip Abduction            secondary / primary
--
-- Dieselbe Muskelgruppe steht dort zweimal an derselben Uebung, unter
-- zwei Schreibweisen — bei zwei VERSCHIEDENEN Muskeln kaeme das nicht
-- vor. Alle fuenf sind ausserdem Abduktionsuebungen, und der Gluteus
-- medius ist der Hauptabduktor der Huefte: auch die Verwendung trennt
-- die Namen nicht.
--
-- =============================================================
-- REGEL wie in 102/103/104, hier mit einer Besonderheit
-- =============================================================
-- Es ueberlebt die Zeile mit MEHR NUTZUNGEN, behaelt ihre ID und
-- bekommt den RICHTIG geschriebenen Namen.
-- **Anders als bei `Calvicular Head` faellt beides hier AUSEINANDER:**
-- die meistgenutzte Zeile (383) traegt den FALSCHEN Namen. Sie ueberlebt
-- trotzdem — das haelt die Zahl der umzuhaengenden Zuordnungen bei 20
-- statt 383 — und wird umbenannt.
--
-- REIHENFOLGE IST NICHT BELIEBIG, dieselbe Falle wie in 102:
-- `[cmd]` `muscle_groups_name_key` ist ein UNIQUE-Index auf `name`. Der
-- Zielname `Gluteus Medius` ist AKTUELL VERGEBEN — naemlich von der
-- Zeile, die aufgeloest wird. Ein UPDATE des Namens VOR dem DELETE
-- bricht mit Unique-Verletzung ab.
-- Deshalb: 1. umhaengen  2. loeschen  3. erst dann umbenennen.
--
-- KOLLISIONEN: `[cmd]` genau EINE — "Resistance Band Lying
-- Hyperextension Abduction", wo beide Zeilen `primary` tragen. Sie geht
-- beim Umhaengen verloren; die Aussage bleibt auf der ueberlebenden
-- Zeile erhalten. Die vier uebrigen gemeinsamen Uebungen tragen
-- verschiedene Rollen und ueberleben beide.
-- Erwartete Summe: 6.625 - 1 = 6.624.
--
-- WAS DIESER SCHRITT NICHT ENTSCHEIDET: ob die vier Uebungen mit
-- `primary` UND `secondary` fachlich richtig sind. Nach dem Merge steht
-- dort derselbe Muskel in beiden Rollen. Das ist ein Erfassungsfehler
-- der Quelle, keine Frage der Zusammenfuehrung — siehe TODO E-16.
-- =============================================================

BEGIN;

-- --- Schritt 1: Zuordnungen der aufzuloesenden Zeile umhaengen ---
-- NOT EXISTS faengt die Kollision ab (gleiche Uebung UND gleiche role).
UPDATE training.exercise_muscles m
   SET muscle_group_id = (SELECT id FROM training.muscle_groups
                           WHERE name = 'gluteus mideus')
 WHERE m.muscle_group_id = (SELECT id FROM training.muscle_groups
                             WHERE name = 'Gluteus Medius')
   AND NOT EXISTS (
     SELECT 1 FROM training.exercise_muscles x
      WHERE x.exercise_id = m.exercise_id
        AND x.muscle_group_id = (SELECT id FROM training.muscle_groups
                                  WHERE name = 'gluteus mideus')
        AND x.role = m.role);

-- Der Rest ist die Kollision: die Aussage steht bereits auf der
-- ueberlebenden Zeile.
DELETE FROM training.exercise_muscles
 WHERE muscle_group_id = (SELECT id FROM training.muscle_groups
                           WHERE name = 'Gluteus Medius');

-- --- Schritt 2: die aufgeloeste Zeile entfernen (gibt den Namen frei) ---
DELETE FROM training.muscle_groups WHERE name = 'Gluteus Medius';

-- --- Schritt 3: erst JETZT umbenennen, der Name ist frei ---
UPDATE training.muscle_groups
   SET name = 'Gluteus Medius'
 WHERE name = 'gluteus mideus';

-- --- Schritt 4: Selbstkontrolle vor dem Commit ---
DO $$
DECLARE
  v_gruppen int;
  v_zuord   int;
  v_waisen  int;
  v_falsch  int;
  v_richtig int;
  v_region  text;
BEGIN
  SELECT COUNT(*) INTO v_gruppen FROM training.muscle_groups;
  SELECT COUNT(*) INTO v_zuord   FROM training.exercise_muscles;
  SELECT COUNT(*) INTO v_waisen  FROM training.exercise_muscles m
    LEFT JOIN training.muscle_groups g ON g.id = m.muscle_group_id
   WHERE g.id IS NULL;
  SELECT COUNT(*) INTO v_falsch FROM training.muscle_groups
   WHERE name = 'gluteus mideus';
  SELECT COUNT(*) INTO v_richtig FROM training.exercise_muscles m
    JOIN training.muscle_groups g ON g.id = m.muscle_group_id
   WHERE g.name = 'Gluteus Medius';
  SELECT body_region INTO v_region FROM training.muscle_groups
   WHERE name = 'Gluteus Medius';

  IF v_gruppen <> 107 THEN
    RAISE EXCEPTION 'Muskelgruppen: % statt 107', v_gruppen;
  END IF;
  IF v_zuord <> 6624 THEN
    RAISE EXCEPTION 'Zuordnungen: % statt 6624 (6625 minus 1 Kollision)', v_zuord;
  END IF;
  IF v_waisen <> 0 THEN
    RAISE EXCEPTION 'Waisen: %', v_waisen;
  END IF;
  IF v_falsch <> 0 THEN
    RAISE EXCEPTION 'Schreibfehler-Zeile noch vorhanden';
  END IF;
  IF v_richtig <> 402 THEN
    RAISE EXCEPTION 'Gluteus Medius: % Zuordnungen statt 402 (383+20-1)', v_richtig;
  END IF;
  -- Die ueberlebende Zeile trug schon `legs` (aus 104) — der Merge darf
  -- die Region nicht verlieren.
  IF v_region IS DISTINCT FROM 'legs' THEN
    RAISE EXCEPTION 'body_region: % statt legs', COALESCE(v_region,'NULL');
  END IF;
  RAISE NOTICE 'OK: 107 Gruppen, 6624 Zuordnungen, 0 Waisen, Gluteus Medius 402 / legs';
END $$;

COMMIT;
