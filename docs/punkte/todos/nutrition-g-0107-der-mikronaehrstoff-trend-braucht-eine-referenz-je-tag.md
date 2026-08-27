---
nr: G-107
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-101
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-107 - Der Mikronaehrstoff-Trend braucht eine Referenz je Tag

## Befund

(neu 2026-08-20, aus G-101).

  `[cmd]` **Die Werte liegen je Tag vor** — `daily_summary` fuehrt 28
  Mikronaehrstoffe als Spalten. Ein Trend waere rechenbar.

  `[cmd]` **Was fehlt, ist die Referenz je Tag.**
  `daily_reference_assessment` rechnet **einen Tag auf einmal**; ein
  Trend ueber 30 Tage braeuchte 30 Aufrufe je Seitenaufruf.

  `[read]` **Zwei Wege:** eine Sammelfunktion in der Datenbank (die
  bessere), oder die Referenz einmal holen und ueber den Zeitraum
  konstant halten (die billigere — sie unterschlaegt aber, dass sich
  Profilwerte aendern koennen).
