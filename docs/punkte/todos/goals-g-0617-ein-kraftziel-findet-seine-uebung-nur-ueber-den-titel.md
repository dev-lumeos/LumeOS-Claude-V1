---
nr: G-617
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07

braucht: []
kind_von: null

quellen:
  - supabase/_pipeline/11_goals/113_goal_milestones_adaptive_tdee.sql

beruehrt:
  tabellen:
    - goals.user_goals
    - training.workout_sets
  dateien:
    - supabase/_pipeline/11_goals/113_goal_milestones_adaptive_tdee.sql
    - apps/web/src/app/v2/goals/modale.tsx
---

# Ein Kraftziel findet seine Uebung nur ueber den Titel

## Befund

`[cmd]` `goals.user_goals` hat keine Spalte fuer die Uebung (nur goal_type,
subtype, title, target_value/unit ...).

`[cmd]` `113_goal_milestones_adaptive_tdee.sql`, `performance_map`: die einzige
Zuordnung ist fest im Code -
`lower(g.title) LIKE '%bankdruecken%' THEN 'Barbell Bench Press'`, sonst NULL.
Der Istwert ist dann `max(estimated_1rm)` dieser Uebung aus allen
abgeschlossenen Sessions bis zum Stichtag.

`[cmd]` `lower('Bankdrücken 1RM') LIKE '%bankdruecken%'` = false. Der
Platzhalter im Anlegemodal (`modale.tsx:222`) schlaegt genau
,Bankdrücken 1RM" vor - ein so angelegtes Ziel bekommt nie einen Istwert.
Jede andere Uebung (Kniebeuge, Kreuzheben ...) ebenso nicht.

`[cmd]` Das Anlegemodal hat keine Uebungsauswahl.

`[read]` Folgefund aus der Anzeige (Tom, 07.10.): aktives Ziel mit Frist
18.08. steht 50 Tage nach Frist weiter auf `active`/,behind"; Seed-Daten
(Tom: Enddatum verschieben).

## Was zu tun ist

Daten (Codex): Kraftziel traegt die Uebung als Bezug auf den Uebungskatalog
(und die Messart, z. B. e1RM), die Istwert-Rechnung liest den Bezug statt
des Titels; Titelregel weg; Bestandsziele umhaengen.
Oberflaeche (Claude Code): Anlegemodal ,Kraft" mit Uebungsauswahl; der
Titel ist frei und hat keine Wirkung.

## Erweitert - 2026-10-07 16:32, Tom

*,umgekehrt sollte es in den uebungen moeglich sein targets zu setzen die dann auch in goals kommen. im spaeteren cardiomodul dasselbe"*

Festlegung (Orchestrator): EIN Ziel, ZWEI Eingaenge. Das Ziel lebt nur in `goals.user_goals`; der Uebungsdialog in Training schreibt dieselbe Zeile (mit Uebungsbezug), keine zweite Zieltabelle. Training zeigt das Ziel an der Uebung an.

`[cmd]` Abgrenzung: `training.routine_exercises.target_sets/reps/weight_kg/percent_1rm` sind Vorgaben je Einheit im Plan, KEINE Ziele - nicht vermischen.

`[cmd]` Uebungskatalog `training.exercises` existiert; ein Cardio-Schema gibt es noch nicht. Darum die Messart jetzt allgemein anlegen (e1RM, Gewicht x Wdh, spaeter Zeit, Distanz, Pace), damit Cardio ohne Umbau andockt.

## Entschieden - 2026-10-07 16:39, Tom

1. Steuernde und messende Ziele werden unterschieden: genau EIN steuerndes Ziel aktiv (Abnehmen/Halten/Aufbauen mit Strategie und Phasen), messende Ziele unbegrenzt (,der user definiert seine ziele"). Ersetzt `docs/specs/Goals/OPEN_ITEMS.md:63` ,Max. 3 aktive Goals".
2. Messende Ziele sind ,kleine messbare ziele" - keine Strategie, keine Phasen, keine Wirkung auf Kalorien.
3. Keine Eltern-Kind-Verknuepfung. Unterscheidung nur grafisch nach Kategorie.

`[cmd]` Kategorie gibt es schon: `goal_type`/`subtype` (body_composition: cut, gain_muscle; performance: strength, training_capacity; lifestyle: cardio_frequency). Die Slot-Regel steht in `111_goals_ziele_phasen.sql` und `602_goal_order_and_measurement_snapshot.sql`, Tests c432/g602.

Darstellung im Reiter Goals: G-618.
