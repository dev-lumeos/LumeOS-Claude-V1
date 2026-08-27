---
nr: C-304
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: G-207
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["medical.symptom_biomarker_map"]
  dateien: []
zahlen: null
---

# C-304 - 51 Zuordnungen zeigen ins Leere

## Befund

(neu 2026-08-27).
  Aus G-207.

  `[cmd]` **`medical.symptom_biomarker_map` hat 102 Zeilen. Die
  Tabelle weiss selbst, dass sie luecken hat** — sie fuehrt
  `symptom_match_status` und `marker_match_status`:

      symptom_not_in_catalog        49 von 102
      marker_not_in_explanations     2 von 102

  `[cmd]` **Die zwei Marker sind `lab_bnp` bei `sym_edema` (HIGH) und
  `lab_crp` bei `sym_abdominal_pain` (MODERATE).** `[read]` **`lab_bnp`
  ist die schlechteste Kombination von beidem** — hoechste
  Aussagekraft in der Tabelle, und der Marker existiert nicht.

  `[cmd]` **Die 49 sind 48 Prozent der Tabelle.** Entweder fehlen 49
  Symptomarten im Katalog, oder die Zuordnungen sind Altlast.
  `[read]` **Das ist eine Frage an die Datenquelle, keine ans UI** —
  und sie wird gestellt, bevor jemand die Zuordnungen loescht.

  `[cmd]` **Nicht dringend, weil es sichtbar ist:** seit G-207 zeigt
  die Oberflaeche `lab_bnp - unbekannt - hoch` in Warnfarbe, statt es
  mit `.filter(Boolean)` wegzuwerfen.
