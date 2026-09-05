---
nr: C-193
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Nutrition/04_adrs/ADR_MEALCAM_V1.md"]
zahlen: null
---

# C-193 - MealCam warnt bei hart ausgeschlossenen Zutaten

## Befund

(neu
  2026-08-22).

  **Tom, 2026-08-22:** *„MealCam kann alles einlesen, muss aber bei
  Erkennung darauf hinweisen, dass X laut Preferences hard excluded
  ist, und der User muss das bestaetigen."*

  `[read]` **Der Unterschied zum Katalog:** die FoodDB WENDET
  Preferences AN. **MealCam ERKENNT, was auf dem Teller liegt** —
  wegfiltern waere dort falsch. Einlesen, benennen, bestaetigen lassen.

  `[cmd]` **Nur `hard` loest aus** (Allergen, Diet type). Food ±100,
  Category ±50, Tag ±30 sind Bewertung, keine Sperre.

  `[cmd]` `ADR_MEALCAM_V1.md` kennt bisher nur *„Erst nach
  User-Bestaetigung: Meal Item erstellen"*. Der Preference-Hinweis
  fehlt dort und gehoert ergaenzt.

  **Offen:** ob ein bestaetigter Treffer die Preference dauerhaft
  aendern darf oder einmalig durchgewunken wird.

## Auftrag

**Mitbeauftragt mit C-379 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
