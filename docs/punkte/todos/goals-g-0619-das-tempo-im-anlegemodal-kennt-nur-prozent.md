---
nr: G-619
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-08

braucht: []
kind_von: G-610

quellen:
  - docs/punkte/erledigt/goals-g-0610-contest-prep-ist-in-der-app-nicht-anlegbar.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals/modale.tsx
---

# Das Tempo im Anlegemodal kennt nur Prozent Koerpergewicht

## Befund

`[read]` Claude Code, G-610: das Tempo laesst sich im Anlegemodal nur in
% Koerpergewicht je Woche eingeben; der kcal-Schalter aus G-565 fehlt dort.

## Was zu tun ist

Denselben Schalter wie beim Phasenstart (G-565) ins Modal, dieselbe Pruefung
(pruefeRate). Kein zweiter Umrechnungsweg.
## Aufgegangen - 2026-10-08

In G-628: Eigene Werte ab Pro ersetzen den kcal-Schalter.
