---
nr: G-617
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: codex
beauftragt: 2026-10-08

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

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-617: Messziele mit Uebungsbezug und Messart, nur ein steuerndes Ziel
    Bereich: supabase/_pipeline/ (Kette), danach Live nach Toms Freigabe
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07 (Block im Chat 07.10. 16:39)

## Bericht Kette - 2026-10-08 08:02, Codex

`[cmd]` Gelesen: Schritt `617_measurement_goal_exercise_and_role.sql` (407 Zeilen): Spalten goal_role (NOT NULL, controlling|measurement), exercise_id -> training.exercises, measurement_type (e1rm, weight_reps, duration, distance, pace), measurement_reps; `user_goals_check1` und `uq_user_goals_active_slot` entfernt, neu `uq_user_goals_one_active_controlling`; Trigger: Messziel ohne Phase/Programm, Phase und Programm nur an steuerndem Ziel. Istwert ueber exercise_id, Titelregel weg; weight_reps mit FILTER reps >= measurement_reps.

`[read]` Codex: 361 Schritte gruen, testdaten-pruefen 186/0, G-617-Probe 3/3. Ohne Zuordnung: ,Mehr Trainingsleistung", 2x ,Vier Cardio-Einheiten". Live aktiv steuernd/messend: dev 1/1, max.seed 0/1, test-user 1/0, tom.seed 1/1.

Abweichung von der Annahme 07.10.: Rolle = steuernd fuer JEDES body_composition-Ziel (auch ohne Strategie), nicht nur fuer Ziele mit Strategie. Backfill nennt vier feste IDs (zwei Kettendaten, zwei dev live) mit Titel-Guard.

Oberflaechenanschluss (priority/is_primary, Drei-Plaetze-Pruefung in `lib/goals/lesen.ts` u. a.): G-618. Befund Messarten: G-620.

## Entschieden - 2026-10-08 08:18, Tom: Variante B

*,ja logisch B. wir koennen immer noch abhaengigkeiten pruefen ob es ueberhaupt ein valides ziel ist und den user darauf hinweisen"*

Steuernd ist ein Ziel genau dann, wenn es eine Phase oder einen Plan traegt - NICHT jedes body_composition-Ziel. Ein Koerperziel ohne Richtung (,12 % Koerperfett", ,80 kg") ist ein Messziel und darf neben dem steuernden Ziel aktiv sein. Bekommt es eine Richtung, wird es steuernd.

`[cmd]` Begruendung gemessen: Kalorien/Makros kommen nur aus der Phase; `target_value` lesen nur `111` und `113` (Fortschritt, Meilensteine).

Plausibilitaet (Messziel widerspricht der Richtung): G-621.

## Bericht Nachtrag B - 2026-10-08 08:37, Codex

`[cmd]` Gelesen (401 Zeilen): `goal_role` wird nachgefuehrt - AFTER-Trigger `a617_phase_role_sync` (goal_phases) und `a617_program_role_sync` (goal_programs) bei INSERT, UPDATE OF goal_id, DELETE; Standard beim Anlegen `measurement` ohne Phase/Plan. Abgeschlossene Phase am Ziel zaehlt weiter als Beziehung. Ein Messziel mit Uebung kann wegen `user_goals_measurement_source_check` nicht steuernd werden.

`[read]` Codex: Kette 361 gruen, G-617-Probe 4/4 (12 % KFA neben aktivem Cut; Phase daran abgewiesen, nach Pausieren erlaubt; Rueckbau; gefaelschte Rolle), testdaten-pruefen 186/0, 0 Rollenabweichungen. Live gelesen, Zaehlung unveraendert: dev 1/1, max.seed 0/1, test-user 1/0, tom.seed 1/1. Commit nach G-615 (Gate rot durch fremde Arbeit), Live mit G-613 und G-622 zusammen.

## Kette committet - 2026-10-08, Commit `fb115173`

Gate gruen. kette.json/testdaten-pruefen getrennt nach 613/617/622 (Codex' G-622 lag schon im Baum). Erledigt erst nach Live.

## Erweitert - 2026-10-08 12:16, vor Live

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Die Messarten reichen nicht: Messziele gibt es auch für Körper (Gewicht, Körperfett, Umfang mit Stelle aus den 13), Gewohnheit (Quelle: Trainings/Woche, Cardio/Woche, Schritte/Tag, Schlaf h/Nacht – was gemessen wird; Rest vorgemerkt) und Eigenes (Einheit, Richtung mehr/weniger besser, Istwert von Hand). Rhythmus einmalig oder wiederkehrend (pro Woche, Serie). Startwert wird beim Anlegen gemessen und festgehalten. Live erst mit dieser Erweiterung.


## Erweiterung committet - 2026-10-08, Commit `4961f7ba`

`[cmd]` Vier Dateien nur `supabase/_pipeline`: `617_measurement_goal_expansion.sql`, Probe `goals-g617-measurement-expansion.test.ts`, `kette.json`, `schema-sollstand.json`. Neue Schritte nur `617_measurement_goal_expansion(_probe)`; 622 hängt jetzt an der Erweiterungsprobe. Gate grün.

`[read]` Codex: 369 Schritte grün. Körper, Kraft, Gewohnheit (Trainings/Woche, Schlaf) und Eigenes mit Start-Snapshot, Datenpunkten und Wochenserie. Cardio/Woche und Schritte/Tag sind vorgemerkt und werden abgewiesen. Erledigt erst nach Live (Paket 613 → 617 → 617-Erweiterung → 622 → 626).
