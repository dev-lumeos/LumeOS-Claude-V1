---
nr: C-239
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-161
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-239 - `meal_plans` kennt keinen Lebenszyklus

## Befund

(neu
  2026-08-23). Aus G-161.

  `[cmd]` Es fehlen `lifecycle`, `started_at`, `days_count`,
  `confirm_mode`, `next_plan_id`. **Die Kachel „Lifecycle types" ist
  eine Legende ueber Spalten, die es nicht gibt.**

  `[cmd]` Vorhanden sind `name, description, target_kcal,
  target_protein_g, target_carbs_g, target_fat_g, is_active,
  measurement_source, source_detail`.

  `[read]` `is_active` traegt heute die ganze Zustandslogik — ein Plan
  ist an oder aus. Ein Plan, der laeuft, pausiert oder abgeloest wird,
  ist damit nicht abbildbar.
