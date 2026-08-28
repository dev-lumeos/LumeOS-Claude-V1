---
nr: G-241
typ: entscheidung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-241 — zwei Reiterschnitte im Medical-Mockup

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **`module-medical.jsx` (810 Zeilen) fuehrt sechs Reiter:**
Overview · Labs · Medications · History · Documents · Appointments.

`[cmd]` **`module-medical-v2.jsx` (819 Zeilen) fuehrt fuenf:**
Dashboard · Biomarkers · Import · Tracking · Insights — **mit dem
Vermerk *,,5 spec tabs"*.**

`[read]` **Beide liegen nebeneinander im selben Ordner.** `[cmd]` Der
gebaute Stand hat `tab-biomarker`, `tab-tracking`, `tab-wirkstoffe`.

**Welcher Schnitt gilt?** `[read]` `History`, `Documents` und
`Appointments` gibt es im v2-Schnitt nicht — **sind sie entfallen oder
verschoben?**
