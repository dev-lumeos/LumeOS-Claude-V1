---
nr: C-212
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: G-126
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 7017e5e3
beruehrt:
  tabellen: [nutrition.nutrient_defs]
zahlen: null
---

# C-212 - `CHORL` haengt nicht im Naehrstoffbaum

## Befund

(neu
  2026-08-22). Aus G-126.

  `[cmd]` Cholesterin heisst `CHORL` und hat `parent_code = NULL`.
  `[cmd]` Von 138 Naehrstoffen sind 40 Wurzeln und 98 Kinder —
  gewollt oder nicht, ist ungeprueft. Codex hat gemeldet statt gesetzt.

## Auftrag

**Mitbeauftragt mit C-346 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Verweis

Ergebnis: [C-346 — zwei Detailtexte neu verknuepfen](nutrition-c-0346-zwei-detailtexte-neu-verknuepfen.md).

## Abnahme

**2026-08-29, mit C-346 abgenommen: ueberholt.**

`[cmd]` CHORL ist Wurzel mit `parent_code = NULL`, Gruppe
*Sonstige Naehrstoffe* — genau wie die BLS-Komponententabelle.
