---
nr: C-176
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-176 - `biomarkerDetails.ts` im Vorgaengerrepo — 121 KB

## Befund

(neu
  2026-08-20). Aus SSOT 173. **Das Pendant zu `nutrientDetails.ts`.**

  `[cmd]` **1.564 Zeilen, zweisprachig:**

  ```ts
  interface BiomarkerDetail {
    description, description_de
    whatItMeasures, whatItMeasures_de
    ifHigh, ifHigh_de        // was ein hoher Wert bedeutet
    ifLow,  ifLow_de         // was ein niedriger bedeutet
    ranges: { male: { lab, optimal, athlete? } , female: … }
  }
  ```

  `[read]` **`athlete` ist der Wert, den es fuer LumeOS braucht** —
  dieselbe Lage wie `rda_athlete` bei den Naehrstoffen (C-161).

  `[cmd]` **Und `ifHigh` / `ifLow` sind genau das, was Tom fuer die
  Naehrstoffe verlangt hat:** *„im Detail dann die Erklaerungen, was bei
  Mangel, was bei zuviel."*

  `[cmd]` **Die Gegenseite steht:** `biomarker_catalog` mit 11.676
  LOINC-Codes, `biomarker_reference_ranges` mit 560 Bereichen.
