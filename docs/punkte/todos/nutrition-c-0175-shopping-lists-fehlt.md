---
nr: C-175
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: A-37
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["nutrition.recipes"]
  dateien: []
zahlen: null
---

# C-175 - `shopping_lists` fehlt

## Befund

(neu 2026-08-20). Aus A-37.

  `[cmd]` **`ADR_RECIPES_SCHEMA_ONLY` fuehrt sie als V1-Pflicht:**
  *„Tabellen anlegen: `nutrition.recipes`, `recipe_items`,
  `meal_plans`, `meal_plan_days`, …"* — **und Shopping Lists in der
  Aufzaehlung.**

  `[read]` **C-150 hat alles ausser dieser gebaut.** **Ein Wochenplan
  ohne Einkaufsliste ist halb** — die Zutaten stehen bereits in
  `recipe_ingredients`.
