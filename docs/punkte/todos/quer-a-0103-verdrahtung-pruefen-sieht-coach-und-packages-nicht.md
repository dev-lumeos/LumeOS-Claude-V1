---
nr: A-103
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-05

braucht: [A-102]
kind_von: A-102

quellen:
  - docs/punkte/erledigt/quer-a-0102-verdrahtung-pruefen-ist-rot-und-steht-nicht-im-gate.md

beruehrt:
  tabellen: []
  dateien:
    - tools/verdrahtung-pruefen.mjs
---

# verdrahtung-pruefen sieht coach und packages nicht

## Befund

`[read]` Claude Code, Bericht A-102: `tools/verdrahtung-pruefen.mjs` liest
nur `apps/web/src`. `apps/coach` und `packages/` verdrahten ebenfalls
Tabellen und RPCs und sind unbewacht. `[annahme]` Erweitern bringt neue
unbewachte Namen.

## Was zu tun ist

Lesebereich auf `apps/coach/src` und `packages/*/src` erweitern, neue
Namen messen und einordnen wie in A-102, Restbestand einfrieren, Gate
gruen, Sabotage je Bereich.
