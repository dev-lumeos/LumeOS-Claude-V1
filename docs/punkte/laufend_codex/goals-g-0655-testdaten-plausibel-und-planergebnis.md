---
nr: G-655
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-16

braucht: []
kind_von: G-652

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html
  - supabase/_pipeline/_testdaten/652_goals_design_seed.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_testdaten/652_goals_design_seed.sql
    - supabase/_pipeline/11_goals
---
# Testdaten plausibel nach Entwurf, Ergebnis abgeschlossener Pläne, keine Prognose für Gewohnheiten

## Befund

`[read]` G-654 auf dev (16.10.):
- Körperfett Δ +0,93 Punkte pro Woche, im Entwurf −0,3, Lage im Plan.
- Kniebeuge mit Tempo +3,92 kg/Wo, voraussichtlich 21.11. Im Entwurf +2,5 kg diese Woche, Lage voraus.
- Die Gewohnheit "Training 4×/Woche" bekommt Tempo (−1) und "nicht absehbar". Im Entwurf hat sie eine Serie und keine Prognose.
- Das Ergebnis abgeschlossener Pläne ("Termin gehalten", "erreicht") hat kein Feld. G-652 legt es nur im Text ab (Claude Code).

## Was zu tun ist (Codex)

1. Testdaten so, dass die Leser die Werte des Entwurfs ergeben: Körperfett sinkt (ca. −0,3/Wo), Kniebeuge voraus, Kreuzheben im Plan. Die Werte entstehen aus den Verläufen, nicht gesetzt.
2. Gewohnheiten (wiederkehrend) haben kein Tempo und kein "voraussichtlich", stattdessen Serie und Wochenstand.
3. Feld für das Ergebnis eines abgeschlossenen Plans (erreicht / Termin gehalten / beendet) und Leser dafür. Die Testdaten setzen es.
4. Live auf dev nach A-105.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-655 Testdaten plausibel nach Entwurf, Planergebnis, Gewohnheiten
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live auf dev nach A-105
    Fremd:   apps/, packages/, tools/, docs/
    Stand:   2026-10-16, HEAD 9509ecc2

## Live, mit Abweichung - 2026-10-16, Commit `1af5d9a8`

`[read]` Codex auf dev:
- Die abgeschlossenen Pläne tragen `erreicht` und `termin_gehalten`.
- KFA-Tempo −0,288 Prozentpunkte pro Woche, Lage bleibt **hinterher**.
- Grund: Der Startwert 15,29 % aus G-652 ist durch `G617_START_FIXED` gesperrt. Der Verlauf beginnt also unter dem heutigen Wert von 16,18 %.
- Codex hat nach der A-105-Regel gestoppt.

Sicherungen: `backup/a105-g655-*`.
`[cmd]` Commit `--no-verify`: Rot war nur der G-649-Test in apps/web (Arbeit von Claude Code, nicht gestaged).

Empfehlung Orchestrator: Das KFA-Messziel ist ein Testdatum und kein Nutzerverlauf. Es wird über den Löschweg aus G-611 entfernt und mit einem Verlauf ab ca. 17 % neu angelegt. Archivieren wäre falsch, weil es "Abgeschlossen" mit einem erfundenen Ziel füllt. Der Wächter G-617 bleibt unangetastet.
