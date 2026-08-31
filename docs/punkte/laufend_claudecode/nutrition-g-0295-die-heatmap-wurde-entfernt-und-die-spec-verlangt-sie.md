---
nr: G-295
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-295 — Die Heatmap wurde entfernt, und die Spec verlangt sie

## Befund

`[cmd]` **`SPEC_10` nennt `NutrientHeatmap`:** *,,28-Tage Grid:
Compliance-Farbe pro Tag"*.

`[cmd]` **Sie wurde am 30.08. in G-264 entfernt** — mit meiner
Abnahme.

`[read]` **Die Begruendung war: *,,der Nutrients-Reiter zeigt
denselben Verlauf je Naehrstoff"*.** `[read]` **Das war falsch.**

`[cmd]` **Der Nutrients-Reiter zeigt eine Sparkline je Naehrstoff
ueber den gewaehlten Zeitraum.** `[cmd]` **Die Heatmap zeigt einen
Tag je Feld, gefaerbt nach Vollstaendigkeit** — **28 Tage
nebeneinander, alle Naehrstoffe zusammen.**

`[read]` **Das ist eine andere Frage: nicht *,,wie lief Vitamin C"*,
sondern *,,welche Tage waren gut"*.**

## Die Daten stehen

`[cmd]` **74 Tage mit vollstaendiger Bilanz in den letzten 30 Tagen**
— `daily_nutrient_summary_long` traegt `value_complete` je Naehrstoff
und Tag.

`[read]` **Die entfernte Attrappe war richtig entfernt** — sie war
erfunden. **Der Platz bleibt trotzdem leer.**

## Auftrag

**Mitbeauftragt mit G-291 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
