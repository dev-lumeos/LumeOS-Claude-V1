---
nr: G-98
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-97
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-98 - Meal plans braucht einen Zustand und eine Herkunft

## Befund

(neu 2026-08-20, aus G-97). **Schemafrage — Codex.**

  `[cmd]` **`MealPlansView` IST im Mockup definiert**, entgegen der
  Annahme in G-97 und C-150: `module-nutrition-spec.jsx:334`. **Beide
  suchten in `module-nutrition.jsx`**, die es ueber die Dateigrenze
  hinweg als `window.MealPlansView` aufruft.

  **Der Tab hat also eine Vorlage. Ihm fehlen die Daten:**

  `[cmd]` **1. Ein Zustand je Planeintrag.** `meal_plan_entries` fuehrt
  keine Spalte fuer `confirmed`/`deviated`/`skipped`/`pending`. Die
  Kachel „Today's ghost entries" und die 7-Tage-Compliance rechnen
  genau darueber.

  `[cmd]` **2. Eine Herkunft am Tagebuch.** `meals` und `meal_items`
  tragen **keinen Verweis auf einen Planeintrag**. Ohne ihn ist nicht
  entscheidbar, ob ein erfasster Eintrag der geplante war.

  `[read]` **Zusammen heisst das: Compliance ist heute nicht
  ableitbar, auch nicht naeherungsweise.** Die beiden Punkte gehoeren
  zusammen entschieden — ein Zustand ohne Herkunft bliebe Handarbeit.

  `[cmd]` **3. Lebenszyklus und Urheberschaft.** Der Entwurf zeigt
  *„Day 3 of 7 · started May 14"* und die Quellen `coach`/`user`/
  `marketplace`/`buddy`. `meal_plans` fuehrt weder Startdatum noch
  Laufzeit noch Urheber; `measurement_source` meint die Messherkunft.

  `[read]` **4. Die Einkaufsliste waere OHNE Schemaaenderung baubar** —
  `[cmd]` **72 von 112** Planeintraegen haengen an Rezepten mit Mengen.
  Es fehlt nur eine Kategorie je Lebensmittel („Fleisch & Fisch") und
  die Umrechnung in Einkaufseinheiten. **Der guenstigste der vier
  Punkte.**
