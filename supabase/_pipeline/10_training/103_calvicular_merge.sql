-- =============================================================
-- 103 — Tippfehler-Dublette zusammenfuehren (muscle_groups)
-- Datum: 2026-08-13 · Laeuft NACH 102, VOR 104. Idempotent.
-- =============================================================
--
-- ANLASS: `[cmd]` "Calvicular Head" (2 Nutzungen) und "Clavicular Head"
-- (22) stehen beide im Bestand. Beim Nachpflegen von body_region (E-13)
-- fiel auf, dass beide dieselbe Region bekaemen — also erst klaeren, ob
-- die eine Zeile ueberhaupt bleibt, sonst waere die Region Arbeit an
-- einer Leiche.
--
-- =============================================================
-- DIE SECHSTE DUBLETTENKLASSE: TIPPFEHLER
-- =============================================================
-- Die fuenf bisher behandelten Klassen (ueberzaehlige Klammer,
-- Schreibweise, doppeltes Leerzeichen, Plural, plus gepaarte Klammer als
-- Nicht-Klasse) fallen alle unter einen NORMALISIERTEN
-- Vergleichsschluessel. Ein Tippfehler nicht: `calvicular` und
-- `clavicular` sind nach jeder Normalisierung verschieden.
-- **Genau deshalb ist dieser Fall durchgerutscht.**
--
-- =============================================================
-- DER BELEG — eine Frage an die DATEN, nicht an die Namen
-- =============================================================
-- Bei den Uebungs-Dubletten lautete sie "zeigen sie auf identische
-- Medien?". Muskelgruppen tragen keine Medien; hier entscheidet, WOFUER
-- die beiden Namen benutzt werden.
--
-- `[cmd]` 2026-08-13 gegen live:
--   1. Beide je DERSELBEN Uebung zugeordnet:            0 Faelle.
--      (Zwei Namen desselben Muskels koennen das nicht — eine Uebung
--      listet einen Muskel nicht zweimal.)
--   2. body_region beide NULL, display_order beide 0 — kein Unterschied,
--      der eine getrennte Fuehrung rechtfertigte.
--   3. DER EIGENTLICHE BELEG, die Verwendung:
--      "Clavicular Head" steht 16 von 22 Mal an einer INCLINE-Uebung
--      (Band/Barbell/Dumbbell Incline Press, Incline Fly). Der
--      Schluesselbeinanteil des Pectoralis major ist genau der Muskel,
--      den Schraegbank-Druecken trifft.
--      "Calvicular Head" steht an "Cable low fly" und "Cable machine
--      high to low" — Kabelzug von unten bzw. oben, ebenfalls
--      Oberbrust. Dieselbe Funktionsgruppe.
--      Gegenprobe: auch unter den 22 steht "Dumbbell One Arm Low Fly".
--      Die Verwendung trennt die beiden Namen also NICHT.
--
-- Ergebnis: dieselbe Muskelgruppe, einmal falsch geschrieben.
--
-- REGEL wie bei den Plural-Paaren in 102: es ueberlebt die Zeile mit
-- MEHR NUTZUNGEN, sie behaelt ihre ID und den RICHTIG geschriebenen
-- Namen. Hier faellt beides zusammen — "Clavicular Head" ist sowohl die
-- meistgenutzte (22 gegen 2) als auch die korrekte Schreibweise.
-- `[cmd]` 0 echte Kollisionen (keine Uebung traegt beide mit derselben
-- role), die Zuordnungssumme bleibt deshalb bei 6.625.
-- =============================================================

BEGIN;

-- --- Schritt 1: Zuordnungen auf die ueberlebende Zeile umhaengen ---
-- NOT EXISTS faengt den Fall ab, dass eine Uebung beide Schreibweisen
-- mit derselben role traegt. `[cmd]` heute 0 Faelle; die Klausel steht
-- als Schutz fuer einen Wiederholungslauf auf veraendertem Bestand.
UPDATE training.exercise_muscles m
   SET muscle_group_id = (SELECT id FROM training.muscle_groups
                           WHERE name = 'Clavicular Head')
 WHERE m.muscle_group_id = (SELECT id FROM training.muscle_groups
                             WHERE name = 'Calvicular Head')
   AND NOT EXISTS (
     SELECT 1 FROM training.exercise_muscles x
      WHERE x.exercise_id = m.exercise_id
        AND x.muscle_group_id = (SELECT id FROM training.muscle_groups
                                  WHERE name = 'Clavicular Head')
        AND x.role = m.role);

-- Reste, die wegen einer Kollision nicht umgehaengt werden konnten,
-- entfallen — die Aussage steht bereits auf der ueberlebenden Zeile.
DELETE FROM training.exercise_muscles
 WHERE muscle_group_id = (SELECT id FROM training.muscle_groups
                           WHERE name = 'Calvicular Head');

-- --- Schritt 2: die falsch geschriebene Zeile entfernen ---
DELETE FROM training.muscle_groups WHERE name = 'Calvicular Head';

-- --- Schritt 3: Selbstkontrolle vor dem Commit ---
DO $$
DECLARE
  v_gruppen int;
  v_zuord   int;
  v_waisen  int;
  v_falsch  int;
  v_richtig int;
BEGIN
  SELECT COUNT(*) INTO v_gruppen FROM training.muscle_groups;
  SELECT COUNT(*) INTO v_zuord   FROM training.exercise_muscles;
  SELECT COUNT(*) INTO v_waisen  FROM training.exercise_muscles m
    LEFT JOIN training.muscle_groups g ON g.id = m.muscle_group_id
   WHERE g.id IS NULL;
  SELECT COUNT(*) INTO v_falsch FROM training.muscle_groups
   WHERE name = 'Calvicular Head';
  SELECT COUNT(*) INTO v_richtig FROM training.exercise_muscles m
    JOIN training.muscle_groups g ON g.id = m.muscle_group_id
   WHERE g.name = 'Clavicular Head';

  IF v_gruppen <> 108 THEN
    RAISE EXCEPTION 'Muskelgruppen: % statt 108', v_gruppen;
  END IF;
  IF v_zuord <> 6625 THEN
    RAISE EXCEPTION 'Zuordnungen: % statt 6625 — Kollision aufgetreten?', v_zuord;
  END IF;
  IF v_waisen <> 0 THEN
    RAISE EXCEPTION 'Waisen: %', v_waisen;
  END IF;
  IF v_falsch <> 0 THEN
    RAISE EXCEPTION 'Schreibfehler-Zeile noch vorhanden';
  END IF;
  IF v_richtig <> 24 THEN
    RAISE EXCEPTION 'Clavicular Head: % Zuordnungen statt 24 (22+2)', v_richtig;
  END IF;
  RAISE NOTICE 'OK: 108 Gruppen, 6625 Zuordnungen, 0 Waisen, Clavicular Head 24';
END $$;

COMMIT;
