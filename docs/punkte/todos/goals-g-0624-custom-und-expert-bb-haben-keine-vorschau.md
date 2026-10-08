---
nr: G-624
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-08

braucht: []
kind_von: G-615

quellen:
  - docs/punkte/erledigt/goals-g-0615-der-planer-legt-plaene-vom-termin-rueckwaerts-an.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - apps/web/src/lib/goals/planer.ts
---

# Custom und Expert BB Jahreszyklus haben im Planer keine Vorschau

## Befund

`[read]` Claude Code, G-615: Plaene ohne Dauer im Katalog (`custom`,
`expert_bb_annual`) zeigen einen Grund statt einer Vorschau. Anlegen geht,
aber der Nutzer sieht nicht, was er bekommt.

## Was zu tun ist

Messen, was der Katalog fuer beide traegt. Expert BB: Jahreszyklus aus dem
Mockup `module-goals-editor.jsx` (Bausteine); Custom: der Nutzer setzt die
Phasen selbst zusammen. Daten (Codex) vor Oberflaeche.
## Aufgegangen - 2026-10-08

In G-629 und G-625 (Phasen mit Programmwerten oder eigenen Werten).
