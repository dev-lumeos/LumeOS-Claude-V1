---
nr: G-636
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-08

braucht: []
kind_von: G-630

quellen:
  - docs/punkte/erledigt/goals-g-0630-die-warnung-ohne-aktives-ziel-ist-unsichtbar.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---

# Der Goals-Kopf zählt Phasen eines pausierten Ziels als laufend

## Befund

`[read]` Claude Code, G-630 am Schirm: Bei pausiertem Ziel zeigt der Goals-Kopf "0 active goals · 2 Phasen laufen". Seit G-613 läuft die Phase eines pausierten Ziels nicht. Die Zählung im Kopf weiß das nicht.

## Was zu tun ist (Claude Code)

Der Kopf zählt nur Phasen, die die Kette als laufend liefert (dieselben Leser wie G-613). Eine eigene Regel im Code ist nicht erlaubt. Mit dem Umbau des Reiters (G-618) prüfen.