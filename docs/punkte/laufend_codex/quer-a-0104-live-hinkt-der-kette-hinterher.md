---
nr: A-104
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-06
agent: codex
beauftragt: 2026-10-06

braucht: []
kind_von: G-562

quellen:
  - docs/punkte/erledigt/goals-g-0562-die-teilphasen-haben-keine-zeitachse-mehr.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/kette.json
---

# Live hinkt der Kette hinterher, und niemand zaehlt wie weit

## Auftrag - Kopf

    AUFTRAG FUER Codex - A-104: Abstand zwischen Kette und Live messen
    Bereich: supabase/_pipeline/, Live nur LESEND
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-06

## Befund

`[cmd]` 06.10.: G-562 liess sich nicht live einspielen, weil G-560 live
fehlt - `goals.goal_programs` und `goals.goal_program_positions` gibt es
live nicht, `contest_prep` traegt live weder `duration_ratio_pct` noch
`dauer_anteil`. G-560 ist seit Tagen abgenommen. **Abgenommen heisst
,in der Kette gruen", nicht ,live".** Live wird nur gezielt eingespielt
(G-602 bis G-605), was dazwischen lag, ist nie angekommen.

`[annahme]` G-560 ist nicht der einzige Schritt.

## Was zu tun ist

1. Frische Wegwerf-Kette bauen, Schema beider Seiten vergleichen
   (Schemata, Tabellen, Spalten, Funktionen mit Rumpf-Hash, Trigger,
   Policies, Grants). Live nur lesen.
2. Jede Abweichung einem Kettenschritt (`kette.json`-id) und, wo
   moeglich, einem Punkt zuordnen. Tabelle: Objekt, Art, Kette/Live,
   Schritt, Punkt.
3. Auch Katalogdaten vergleichen, die Schritte schreiben (z. B.
   `goal_strategies.sub_phases`) - Zeilenzahl und Inhalts-Hash je
   Katalogtabelle.
4. Die Reihenfolge vorschlagen, in der die fehlenden Schritte live
   muessten, mit Abhaengigkeiten. **Nichts einspielen.**
5. Wegwerf-DBs loeschen und zaehlen. Kein Commit.
