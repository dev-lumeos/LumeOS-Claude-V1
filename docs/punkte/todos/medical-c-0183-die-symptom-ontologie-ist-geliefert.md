---
nr: C-183
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-180
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-183 - Die Symptom-Ontologie ist geliefert

## Befund

(neu 2026-08-20).
  Aus C-180. **Betrifft C-159 und C-171.**

  `[cmd]` **`symptom_ontology_seed.json` — 21 Symptome**,
  MedlinePlus-verifiziert, **ausdruecklich ohne Diagnosen.**

  `[cmd]` **Je Eintrag:** `symptom_id`, `canonical_name`, **`synonyms`**,
  `system`, **`severity_dimensions`** (mild bis
  `functional_impairment`), **`time_dimensions`** (Beginn, Dauer,
  Haeufigkeit, Muster).

  `[read]` **C-159 meldet *„keine Symptomtabelle im ganzen Schema"*** —
  **und das Mockup hat `SYMPTOM_BIOMARKER_MAP`.** **Jetzt gibt es
  beides: die Ontologie und die Zuordnung.**
