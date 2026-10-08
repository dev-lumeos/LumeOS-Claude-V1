---
nr: G-625
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08

braucht: [G-617]
kind_von: G-617

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen:
    - goals.goal_programs
    - goals.goal_program_positions
    - goals.goal_strategies
    - goals.user_goals
  dateien: []
---

# Ein Plan ist der Inhalt des steuernden Ziels

## Entschieden - 2026-10-08 11:59, Tom

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Jedes steuernde Ziel hat genau einen Plan (`goal_programs.goal_id` besteht). Eine Richtung aus Goals erzeugt einen Plan mit einer Phase. Mehrere Pläne je Nutzer, genau einer aktiv – dieselbe Regel wie „ein Ziel steuert“. Plan-Status: Entwurf, aktiv, pausiert, abgeschlossen. Termine je Plan frei benennbar: Name, Art (Wettkampf A, Wettkampf B, Sperrtermin, Sonstiges), Datum. Phasen tragen entweder ein Katalogprogramm oder eigene Werte (Tempo %/Woche bzw. kcal % zu Erhaltung, Protein g/kg, Fett g/kg, Cardio/Woche, Refeed/Woche, Maximaldauer). Katalog ergänzt um Fett, Cardio, Refeed je Programm und einen Eintrag „Eigene Werte“ ab Pro in jeder Auswahlgruppe. `requirements.min_experience` entfällt (`min_erfahrung` ist die eine Wahrheit).

## Was zu tun ist (Codex)

Datenmodell, Lese- und Schreibfunktionen, Bestand umhängen (jedes bestehende steuernde Ziel bekommt seinen Plan), Tageszielrechnung liest eigene Werte.


## Ist - 2026-10-08 [cmd]

`goal_programs` hat nur id, goal_id (FK cascade), name; kein Status, keine Termine; live 0 Zeilen, `goal_program_positions` 0 Zeilen. 4 steuernde Ziele ohne Plan. `goal_strategies` traegt `requirements` und `min_erfahrung` nebeneinander.

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-625: Ein Plan ist der Inhalt des steuernden Ziels
    Bereich: supabase/_pipeline/ (Kette). Live erst nach Toms Freigabe.
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08, HEAD 3b58a278


## Teil 1 committet - 2026-10-08, Commit `0ff58083`

`[cmd]` 12 Dateien nur supabase/_pipeline: neun Schritte 625_* (model, runtime, execution, limits, phase_guard, goal_update_guard, custom_calculation, daily_targets, strategy_plan_values) + Probe goals-g625-plans.test.ts. Modell gelesen: status CHECK entwurf/aktiv/pausiert/abgeschlossen, UNIQUE(goal_id), Unique-Index ein aktiver Plan je Nutzer, Position CHECK Katalog XOR eigene Werte, Termine kind A/B/S/X. Gate grün.

`[read]` Codex: 379 Schritte grün, G-625-Probe 14/14, testdaten-pruefen 186/0, Sabotage 2/2 rot. Live nur gelesen: 4 steuernde Ziele, 0 Pläne, 0 Positionen.

Offen:
1. Ändern einer laufenden Position braucht einen gemeinsamen Schreibweg für Position und Phase. Das ist Teil des Auftrags (Phase Engine editiert), also Teil 2.
2. Katalogwerte für Fett g/kg, Cardio/Woche, Refeed/Woche fehlen und stehen auf NULL. `[cmd]` Der Katalog hat bereits fat_percent (Anteil kcal, 0,15-0,30) bei allen ausser expert_bb_annual, und refeeds als Rhythmus (moderate_cut alle 8 Wochen 1 Woche, aggressive_cut alle 4 Wochen 1 Woche). Cardio fehlt ganz. Entscheidung Tom.

## Entschieden - 2026-10-08 17:40, Tom: Katalogwerte

Katalog behaelt Fett als Anteil kcal (fat_percent) und seinen Refeed-Rhythmus (refeeds). Die neuen Spalten Fett g/kg, Cardio/Woche, Refeed/Woche bleiben im Katalog NULL = "keine Vorgabe" und gelten nur fuer eigene Werte. Keine doppelte Fett-Wahrheit.


## Kette committet - 2026-10-08, Commit `72ca5fb3` (mit G-625 Teil 2, G-633, G-634)

`[cmd]` 7 Dateien nur supabase/_pipeline, neue Schritte 625_goal_plan_position_revision, 633_goal_limit_german_numbers, 634_measurement_goal_start_preview (+ je Probe). Gelesen: 634 – der Snapshot-Trigger `g617_measurement_goal_snapshot` ruft `measurement_goal_start_preview` (eine Abfrage, `auth.uid()`, Kennung `erst_messen`). 633 – Wrapper um `ziel_grenzen_pruefen` (Basis umbenannt), Regex nur auf den Hinweistext, Schlüssel gleich. 625 Teil 2 – Position mit `FOR UPDATE` nur für `auth.uid()`. Gate grün.

`[read]` Codex: 385 Schritte grün, Proben G-625 2/2, G-633 1/1 (Hex 31 36 2c 38 = "16,8"), G-634 1/1 (Gewicht, Umfang, e1RM, Gewicht×Wdh, Training, Schlaf, eigener Wert), testdaten-pruefen 186/0, Sabotage 3/3 rot. Katalog: 17 Programme mit NULL in den neuen Spalten, Rechnung mit fat_percent belegt. Erledigt erst nach Live.

## Live gestoppt - 2026-10-08 18:17, Codex (vor dem ersten Schritt)

`[read]` Codex: Die Ausgangszählung stimmt (4 steuernde Ziele, 0 Pläne, 0 Positionen). Bei dev ist das steuernde Ziel aktiv, seine letzte Phase ist aber seit 29.09. beendet. Der Backfill (`625_goal_plan_model.sql:182`) würde genau diese beendete Phase als einzige Position eines aktiven Plans übernehmen. Nichts eingespielt.

`[cmd]` Orchestrator nachgemessen, dev, Ziel "Lean Bulk bis September" (active, controlling, Frist 2026-12-16). Phasen: maintain 21.05.–03.06. (beendet), lean_bulk 04.06.–29.09. (beendet, transition_reason "test", recommended_next mini_cut). `berechne_zielwerte(dev, heute)` liefert hindernis `kein_aktives_ziel`, goal_id leer, kcal = TDEE 2480,7. Das Ziel ist aber aktiv → G-637.

Offene Entscheidung Tom: Was übernimmt der Backfill bei einem aktiven Ziel ohne laufende Phase?