---
nr: C-178
typ: messung
modul: medical
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: G-135
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["medical.biomarker_spec_enrichment"]
  dateien: []
zahlen: null
---

# C-178 - Prolactin und ApoB fehlen dem Health score

## Befund

(neu 2026-08-21). Befund aus G-135. **Zwei Zeilen in
  `medical.biomarker_spec_enrichment`, mehr nicht.**

  `[cmd]` **Prolactin:** Der Nutzer hat **4 Werte** unter LOINC
  `2842-3`, `enrichment` hat **keine Zeile**. Mit ihr haette `hormonal`
  sieben statt sechs Marker.

  `[cmd]` **ApoB:** Der Bestand fuehrt ihn unter **1884-6**,
  `enrichment` unter **1869-7** — dieselbe Groesse, zwei Codes.
  `[read]` **Das ist der Marker, den Tom in G-84 ausdruecklich genannt
  hat** (*„die beiden wichtigsten Lipidmarker"*); **LDL trifft, ApoB
  nicht.**

  `[read]` **Erst pruefen, ob es dieselbe Messgroesse ist** — bei
  Glukose und Vitamin D war es das nicht (G-85: `1558-6` ist *Fasting*,
  `2345-7` nicht). **Keine Aliasfrage, eine inhaltliche.**
