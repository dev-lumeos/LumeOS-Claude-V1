---
nr: G-419
typ: feature
modul: nutrition
schwere: niedrig
angelegt: 2026-09-08
erledigt: 2026-09-08
commit: 5171fc3f
braucht: []
kind_von: G-417
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  attrappen_vorher: 7
  attrappen_nachher: 1
---

# G-419 — der Insights-Block ist abgenommen

## Befund

Tom, 2026-09-08: *,,ok, insights kann die mockuplinie und das
darunter weg."*

`[cmd]` **`ansicht.tsx:984`: `<NutritionInsightsReferenz />`** ?
**drei Karten, 87 Zeilen in `mockup-referenz.tsx`.**

## Was darunter stand, und wo es jetzt ist

    Nutrition score           angebunden G-412, rechnet G-417
    Pre-workout window        angebunden G-412
    Micronutrient snapshot    ins Netz der oberen Kachel, G-412

`[read]` **Alle drei haben eine echte Entsprechung.**

`[cmd]` **Plus die Kurve (G-416) und die Heatmap (G-416/417).**

## Gemessen

`[cmd]` **Attrappen im Insights-Reiter: 7 -> 1.**

`[read]` **Die eine ist Buddy in der Kontextspalte** ? **G-02, ein
anderer Punkt.**

`[cmd]` **`apps/web` 1570 gruen, tsc gruen.**

## Der Waechter zog nach

`[cmd]` **`g412-attrappen.test.ts` verlangte SIEBEN Bloecke** ?
**jetzt sechs.**

`[read]` **Und der Kommentar sagt die Regel:**

> *,,Ein Block faellt, wenn Tom ihn ABGENOMMEN hat ? nicht, wenn
> der Orchestrator ihn fuer fertig haelt."*

`[cmd]` **Sechs bleiben:** Nutrients, Plans, Prefs, Planner,
Einkauf, Foods.
