---
nr: C-407
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-344
entscheidung: E-64
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
  listen: 4
  posten: 17
---

# C-407 — der Leseweg fuer Wochenlisten

## Befund

Aus E-64, 2026-09-07.

`[cmd]` **`shopping_lists` und `shopping_list_items` sind gebaut und
gefuellt** — vier Listen, 17 Posten.

`[cmd]` **Keine API-Route nennt `shopping`.** `[cmd]` **In `apps/`
steht der Name nur in Tests.**

`[read]` **Dieselbe Klasse wie `meal_plan_slots` vor G-336:** gebaut,
gefuellt, kein Aufrufer.

## Was zu bauen ist

### 1 · Aus einer Planwoche eine Liste

`[cmd]` **`source_type = 'meal_plan'` verlangt
`meal_plan_week_id`** — der CHECK steht.

`[read]` **Die Posten werden zusammengefasst:** **sieben Tage
Huehnchen ergeben eine Zeile.**

`[cmd]` **`shopping_list_items` traegt `amount_g` und `quantity`
getrennt**, dazu `unit_display`.

`[read]` **Miss, wie das Zusammenfassen aussieht:** **gleiche
`food_id` addieren, oder auch gleiche `food_name` bei manuellen
Posten?**

### 2 · Der Leseweg

`[read]` **Eine Liste mit ihren Posten, sortiert nach
`sort_order`.**

`[cmd]` **`is_checked` je Posten** — **das Abhaken schreibt dorthin.**

### 3 · `status = 'archived'`

`[cmd]` **Der CHECK kennt `open`, `completed`, `archived`.**

`[read]` **Loeschen heisst archivieren** — **eine Einkaufsliste ist
ein Beleg, was man gekauft hat.**

## Was nicht dazugehoert

`[read]` **Die Oberflaeche ist ein UI-Auftrag** — **melde, was sie
braucht.**

`[read]` **Und der Vorrat kommt spaeter** (C-408) — **`supplement_
reorder` bleibt vorerst unbenutzt.**
