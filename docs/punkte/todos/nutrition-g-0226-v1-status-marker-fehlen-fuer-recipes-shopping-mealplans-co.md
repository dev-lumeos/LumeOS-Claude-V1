---
nr: G-226
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-226 — V1-Status-Marker fehlen für Recipes/Shopping/MealPlans Components in SPEC_10

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-4.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`ADR_RECIPES_SCHEMA_ONLY.md`:
> V1: Schema vorbereiten — kein Full-UI, kein Full-API Pflicht.
> Wenn Zeit knapp: Recipes, Meal Plans und Shopping Lists komplett auf Phase 2 verschoben.

`SPEC_10_COMPONENTS.md` listet:
- 5 Recipe Components (`RecipeList`, `RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`)
- 3 Shopping List Components (`ShoppingListView`, `ShoppingListDetail`, `ShoppingListItem`)
- 8 Meal Plan Components (`MealPlanList`, `MealPlanCard`, ...)

Ohne V1-Status-Hinweis. Reader interpretiert sie als V1-Pflicht.

`SPEC_10_PASS2_PATCH.md` adressiert das nicht. Der Pass-2-Patch ergänzt nur neue Components.

`SPEC_03_USER_FLOWS.md §Flow 7` (Rezepte) und §Flow 8 (Einkaufsliste) sind als komplette V1-Flows beschrieben — ohne Phase-2-Markierung.

**Konsequenz:** WO-Generator könnte vollen Recipe-Builder als V1-Pflicht-WO schreiben, obwohl ADR sagt: optional.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

