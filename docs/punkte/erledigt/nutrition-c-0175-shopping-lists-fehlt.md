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
erledigt: 2026-08-29
commit: 1a2032b0
durch: G-271
beruehrt:
  tabellen: [nutrition.shopping_lists]
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

## Abnahme

**2026-08-29, ueberholt. Aus G-271 gemessen.**

`[cmd]` **`nutrition.shopping_lists` existiert** — mit `source_type`,
`status`, einer Zeile und sechs Positionen.

`[read]` **Der Punkt hiess *,,shopping_lists fehlt"*, und ein
Kommentar im Code behauptete dasselbe.** `[read]` **Beide sind
veraltet** — ein Kommentar altert zu einer falschen Behauptung, und
niemand prueft ihn.

`[cmd]` **Die Kachel ist Attrappe, weil `dev` keine Liste hat, nicht
weil die Tabelle fehlt.** `[read]` **Das ist ein anderer Befund und
steht in G-270.**

**Geschlossen.**
