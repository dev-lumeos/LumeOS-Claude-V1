---
nr: G-630
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-08

braucht: [G-622]
kind_von: G-622

quellen:
  - docs/punkte/erledigt/goals-g-0622-ohne-aktives-ziel-gibt-es-keine-tagesziele.md
  - docs/spezifikation/goals-ziel-setzen/README.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/lib/profile/zielwerte-read.ts
---

# Die Warnung ohne aktives Ziel ist unsichtbar

## Befund

`[read]` Codex, G-622: `apps/web/src/lib/profile/zielwerte-read.ts:194` macht aus der neuen Herkunft `formel` und reicht das Hindernis (`kein_aktives_ziel`, `erhaltung_nicht_berechenbar`) nicht durch. Die Datenbank kennzeichnet Erhaltung ohne Ziel, die Oberfläche zeigt es nicht.

## Entschieden - 2026-10-08 08:18, Tom

„erhaltung aktiv aber klare warnung dass kein goal aktiv ist, der user muss wissen dass er planlos laeuft“

## Was zu tun ist (Claude Code)

Herkunft und Hindernis durchreichen; sichtbare Warnung überall, wo Tagesziele stehen (Today, Nutrition, Goals-Steuerungskarte wie im Entwurf `entwurf/Main.dc.html` Zustand „kein Ziel“), mit Weg zu „Ziel setzen“ bzw. Fortsetzen. Schirmnachweis erst nach G-622 live.
