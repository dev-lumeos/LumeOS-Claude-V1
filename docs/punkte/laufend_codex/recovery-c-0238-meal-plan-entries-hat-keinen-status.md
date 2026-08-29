---
nr: C-238
typ: blocker
modul: recovery
schwere: hoch
angelegt: 2026-08-23
braucht: []
kind_von: G-161
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-238 - `meal_plan_entries` hat keinen Status

## Befund

(neu
  2026-08-23). Aus G-161. **Blockiert drei Kacheln.**

  `[cmd]` Die Spalten sind `id, day_id, user_id, meal_type,
  planned_time, slot_order, entry_type, recipe_id, food_id,
  custom_food_id, amount_g, planned_servings, portion_name,
  portion_quantity, portion_amount_g, note, created_at, updated_at` —
  **kein `status`.**

  `[read]` **Ohne ihn ist keine Einhaltung rechenbar.** Ghost entries
  und beide Compliance-Kacheln brauchen einen Ist-Soll-Vergleich je
  Eintrag: `pending | confirmed | deviated | skipped`.

  `[read]` **Claude Code hat den Compliance-Ring bewusst entfernt**,
  statt eine Zahl zu zeigen, die niemand rechnen kann — richtig. Eine
  erfundene Prozentzahl waere dasselbe wie die Modalitaets-Boni, ACWR
  und die Evidenzgewichte.

## Auftrag

**Mitbeauftragt mit C-239 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.
