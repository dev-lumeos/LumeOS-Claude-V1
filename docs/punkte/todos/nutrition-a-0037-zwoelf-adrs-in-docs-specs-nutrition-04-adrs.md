---
nr: A-37
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md", "docs/spezifikation/00-QUELLEN.md"]
zahlen: null
---

# A-37 - Zwoelf ADRs in `docs/specs/Nutrition/04_adrs/`

## Befund

(neu
  2026-08-20). **Entscheidungen, die niemand kannte.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Nutrition/` hat sieben Unterordner mit 45
  Dateien** — `00_decisions/` (22 KB), `01_current_specs/` (10 Dateien,
  darunter `SPEC_06_DATABASE_SCHEMA.md` mit **64 KB**), `02_patches/`
  (13), `03_sql/`, **`04_adrs/` (12 ADRs)**, `05_reviews/` (122 KB
  Opus-Reviews), `06_workorder_planning/`.

  `[read]` **Rekursiv gezaehlt sind es 160 Spec-Dateien, nicht 120** —
  `00-QUELLEN.md` ist berichtigt.

  ### Was bestaetigt wird

  `[cmd]` **`ADR_BLS_ONLY`** — *„BLS 4.0 ist die einzige
  Master-Food-Datenquelle fuer V1. OpenFoodFacts und USDA sind nicht
  Teil von V1."* **Deckt sich mit dem Bau.** `[read]` **Und beantwortet
  G-126:** Selen fehlt, weil BLS es nicht fuehrt — **eine zweite Quelle
  waere ein ADR-Bruch.**

  `[cmd]` **`ADR_WATER_TOTAL_HYDRATION`** — *„Gesamt-Hydration =
  geloggtes Wasser + Wasser aus Lebensmitteln."* **Gebaut:**
  `hydration_summary` mit `logged_ml`, `food_ml`, `total_ml`,
  `total_complete`. **Passt genau.**

  `[cmd]` **`ADR_SUPPLEMENTS_API_BOUNDARY`** — *„Supplements-Modul
  speichert alle Supplement-Daten, Nutrition fragt nur per API ab."*
  **C-158 hat `supplement_nutrient_mappings` in `supplements` gebaut** —
  richtig.

  ### Was abweicht

  `[cmd]` **`ADR_COACH_PERMISSIONS_V1`:** *„User kann **pro Modul und
  Subfunktion** freigeben"* — mit Beispielen: `nutrition.diary`,
  `nutrition.water`, `nutrition.micronutrient`, `nutrition.mealcam_*`.

  `[cmd]` **Gebaut ist nur pro Modul** — `client_permissions` hat
  `nutrition_visibility`, nicht `nutrition_diary_visibility`.

  `[read]` **Das ist eine echte Abweichung**, und sie betrifft die
  Kernanforderung des Coach-Portals. **Zu entscheiden: reicht die
  Modulstufe, oder kommt die Feinstufe?**

  `[cmd]` **`ADR_RECIPES_SCHEMA_ONLY`** nennt `recipe_items`,
  **gebaut ist `recipe_ingredients`.** Und **`shopping_lists` fehlt
  ganz** — die ADR fuehrt sie als V1-Pflicht.

  `[read]` **Der Rest passt:** `recipes`, `meal_plans`,
  `meal_plan_days`, `meal_plan_weeks`, `meal_plan_entries`. **C-150 hat
  mehr gebaut als die ADR verlangt** — kein Fehler.

  ### Was noch offen ist

  `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`** — *„Ghost Entries aus einem
  Rezept zeigen **immer alle Einzelzutaten**, nie das Rezept als
  Einheit."* **Zu pruefen, ob G-97 sich daran haelt.**

  `[cmd]` **`ADR_MEALCAM_V1`** — *„MealCam ist V1, Barcode Scanner ist
  Phase 2."* **Mit Begruendung:** *„Es gibt keinen serioesen Competitor,
  der Teller-Erkennung mit BLS-Matching und Portionsschaetzung
  anbietet."*

  `[cmd]` **`ADR_MEALCAM_CONSENT`** — Bilder standardmaessig privat,
  Training-Freigabe **ausdruecklich nicht im Onboarding.**

  `[cmd]` **`ADR_CUSTOM_FOODS_V1`** — nur nutzerprivat, `is_public` ist
  Phase 2, mit Pflichtfeldern. **`foods_custom` existiert.**

  `[cmd]` **`ADR_RECIPE_SOURCE_BUDDY`** — `source` bekommt den Wert
  `buddy`, **in V1 nur als Schemawert vorbereitet.**
