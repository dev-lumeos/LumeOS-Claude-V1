---
nr: C-306
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: G-208
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-306 - `atc_code` traegt JSON in einer `text`-Spalte

## Befund

(neu
  2026-08-27). Aus G-208.

  `[cmd]` **419 von 497 gefuellten Werten sind JSON-Literale** —
  ungefiltert steht `["B02AA"]` woertlich in der Oberflaeche.

  `[read]` **In G-208 abgefangen, aber die naechste Anzeige faellt
  wieder darauf herein** — dieselbe Falle wie G-191. **`text[]` oder
  `jsonb` waere ehrlich; `text` mit JSON darin ist eine Falle, die
  jeder Leseweg neu entdecken muss.**
