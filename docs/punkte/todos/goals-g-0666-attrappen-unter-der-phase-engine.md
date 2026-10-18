---
nr: G-666
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-18

braucht: []
kind_von: G-649

quellen:
  - apps/web/src/app/v2/goals/fehlende-kacheln.tsx
  - apps/web/src/app/v2/goals/tab-phase.tsx
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals/fehlende-kacheln.tsx
    - apps/web/src/app/v2/goals/tab-phase.tsx
---
# Attrappen unter der Phase Engine: Weekly auto-adjustment, Kennzahlen, Expert BB annual

## Befund

`[read]` Tom (18.10.): Unten in der Phase Engine stehen noch Attrappen mit erfundenen Werten:
- "Weekly auto-adjustment"
- die Kennzahlen Weight trend / Strength / Body fat / Adherence
- "Expert BB annual"

`[cmd]` Die Quellen sind `fehlende-kacheln.tsx` (Z. 101-170, `PHASE_STATE`) und `tab-phase.tsx` (Z. 74-238). Im Entwurf `PhaseEngine.dc.html` kommt keiner dieser drei Abschnitte vor.

`[read]` Die Inhalte sind inzwischen echt umgesetzt, und zwar an den Stellen, die der Entwurf vorsieht:
- Weekly auto-adjustment → Wochentabelle "Wöchentliche Anpassung" (G-627/G-662)
- Weight trend / Strength / Body fat → Wachen der aktuellen Phase (G-644) sowie "Diese Woche" und die Steuerung in Goals (G-654)
- Adherence → Modul-Kachel Ernährung, kcal-Treue (G-522)
- Expert BB annual → Vorlage "Expert BB Jahreszyklus" (G-644)

## Entscheidung (Orchestrator, Entwurf verbindlich)

Nicht anbinden, sondern entfernen. Die drei Abschnitte fallen weg. Eine zweite Darstellung neben dem Entwurf würde nur doppeln.

## Was zu tun ist (Claude Code)

- Die Abschnitte und `PHASE_STATE` entfernen. Aufrufer per `rg` belegen. Was danach keinen Aufrufer mehr hat, wird mitgelöscht (wie in G-656).
- Meldet `mockup-deckung` fehlende Titel: die Liste melden. Den Eintrag in `mockup-verworfen.json` macht Tom bzw. der Orchestrator mit Toms Freigabe.
- Bildpaar der ganzen Phase-Engine-Seite gegen den Entwurf.
