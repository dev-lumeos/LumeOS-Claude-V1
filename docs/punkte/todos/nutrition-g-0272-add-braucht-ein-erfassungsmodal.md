---
nr: G-272
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-265
entscheidung: null
beruehrt:
  tabellen: [nutrition.meals, nutrition.meal_items]
  dateien: [apps/web/src/app/v2/nutrition/tab-foods.tsx]
zahlen: null
---

# G-272 — `+ Add` braucht ein Erfassungsmodal

## Befund

Aus G-271, Claude Code, 2026-08-29.

`[cmd]` **`+ Add` fuehrt seit G-265 auf die Detailsuche mit gefuelltem
Feld** — drei Treffer, Lebensmittel ausgewaehlt, 101 Naehrstoffe.

`[read]` **Aber das ist nicht, was der Knopf verspricht.** `[read]`
*,,Add"* heisst hinzufuegen, nicht suchen.

`[cmd]` **Keins der vier vorhandenen Modale schreibt ein Lebensmittel
in `meals` / `meal_items`.**

## Was zu klaeren ist

`[read]` **Ein Erfassungsmodal braucht mehr als das Lebensmittel:**
Menge, Einheit, Mahlzeit, Tag. `[cmd]` **`PortionSelector` und
`FoodAmountInput` stehen in `SPEC_10`.**

`[read]` **Und der Schreibweg selbst ist zu messen** — ob er
existiert oder ob dies der erste ist.

## Berichtigung, 2026-08-29

`[cmd]` **`nutrition.diary_entries` gibt es nicht.** Das Tagebuch
schreibt in **`meals`** und **`meal_items`** — der Waechter hat es
gefangen.

`[read]` **Der Begriff stammt aus dem Bericht und ich habe ihn
uebernommen, ohne ihn zu pruefen** — dieselbe Klasse wie
`nutrition.nutrition_targets` am 28.08., das in `goals` liegt.
