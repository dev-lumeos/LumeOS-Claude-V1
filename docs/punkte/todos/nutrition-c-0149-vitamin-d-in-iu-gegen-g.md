---
nr: C-149
typ: blocker
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-91
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-149 - Vitamin D in IU gegen µg

## Befund

(neu 2026-08-20). Befund aus
  G-91.

  `[cmd]` **Naiv addiert: 33.430 % statt rund 930 %** — **Faktor 40.**
  Supplement in IU, Mikro-Pfad in µg.

  `[cmd]` **Ein Umrechnungsfaktor liegt nirgends im Repo, auch nicht im
  Vorgaengerrepo.** Betroffen ist **genau eine von 11 Zeilen.**

  `[read]` **Nicht gesetzt** — *„das waere die Zahl ohne Beleg."*
  **Richtig: 1 µg Vitamin D3 sind 40 IU, aber der Faktor gehoert
  belegt, nicht aus dem Kopf.**

  `[cmd]` **Und der halbe Blocker ist weg:**
  `nutrition.micronutrient_snapshot` hat 8 echte Zeilen, **7 der 8 Codes
  kommen in `nutrients_provided` vor.**
