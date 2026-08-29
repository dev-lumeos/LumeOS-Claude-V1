---
nr: G-259
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: C-323
entscheidung: null
beruehrt:
  dateien: [apps/web/src/lib/nutrition]
zahlen:
  gemessen: 2026-08-29
  fensterlaufzeit_90d_ms: 1786
  billiger_weg_ms: 195
---

# G-259 — toter Leseweg und die Fensterlaufzeit

## Zwei Befunde aus C-323

`[cmd]` **`getNaehrstoffZeitraum` hat keinen Aufrufer** — **und
traegt die G-249-Falle:** `.limit(20000)` fuer 12.420 Zeilen, ohne
seitenweises Laden. `[read]` **Heute harmlos, weil nichts sie
aufruft.** `[read]` **A-59 sagt loeschen:** Code ohne Aufrufer wird
beim naechsten Auftrag fuer gebaut gehalten — **und dieser traegt
zusaetzlich einen bekannten Defekt.**

`[cmd]` **`reference_assessment_window` kostet 1.786 ms fuer 90
Tage.** `[cmd]` **Die Kosten liegen in der Rechnung, nicht in der
Datenmenge** — Filtern spart nichts.

`[cmd]` **Ein billigerer Weg existiert bei 195 ms**, wuerde aber die
Referenzlogik nachrechnen. `[read]` **Beide Dateikoepfe verbieten
das** — es waere die zweite Wahrheit, die G-250 offenhaelt.

## Die Frage

`[read]` **Sind 1.786 ms fuer eine Flag-Ansicht vertretbar, oder
braucht es eine zaehlende Funktion in der Datenbank?**

`[read]` **Der Unterschied zum billigen Weg:** eine zaehlende
Funktion wuerde dieselbe Referenzlogik nutzen und nur weniger
zurueckgeben. **Das ist etwas anderes als sie nachzubauen.**
