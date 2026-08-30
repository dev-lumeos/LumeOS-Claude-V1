---
nr: G-173
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-160
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/lib/recovery/scores-read.ts"]
zahlen: null
---

# G-173 - Ein falscher Punktverweis in `scores-read.ts`

## Befund

(neu
  2026-08-23). Aus G-160. Eine Zeile.

  `[cmd]` `scores-read.ts:42` sagt *„C-195 hat die Spalte entfernt"* —
  **es war C-215.** C-195 war der Substanzkatalog.

  `[read]` Kleinigkeit, aber ein falscher Verweis fuehrt beim naechsten
  Suchen in die Irre — dasselbe Muster wie `training.sessions` gegen
  `workout_sessions`.

## Auftrag

**Vorbereitet mit A-29 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
