---
nr: G-636
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-09
erledigt: 2026-10-09
commit: afd814d3

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
## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-635, danach G-618 + G-636
    Bereich: apps/web/src/app/v2/goals, apps/web/src/lib/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-09

## Erledigt - 2026-10-09, Commit `afd814d3`, mit G-618

`[read]` Kopf, Bedienung und Composition zaehlen die Zeilen aus `phase_am`. Am Schirm: 1 laufend, pausiert 0 (vorher "2 Phasen laufen").
