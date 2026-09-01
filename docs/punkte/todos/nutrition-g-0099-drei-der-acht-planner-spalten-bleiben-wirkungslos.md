---
nr: G-99
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-97
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["nutrition.recipes"]
  dateien: []
zahlen:
  gemessen: 2026-08-20
  planner_spalten: 8
  wirkungslos: 3
---

# G-99 - Drei der acht Planner-Spalten bleiben wirkungslos

## Befund

(neu 2026-08-20, aus G-97).

  `[cmd]` **Gemessen am 2026-08-20:**

  | Spalte | Wert bei `dev` | Zustand |
  |---|---|---|
  | `meals_per_day` | 4 | **wirkt** — Rasterzeilen |
  | `snacks_per_day` | 1 | **wirkt** — Snackreihe |
  | `cooking_skill` | `advanced` | sichtbar je Rezept |
  | `prep_time_max_min` | 30 | sichtbar vergleichbar |
  | `preferred_cuisines` | `{mediterranean}` | sichtbar je Rezept |
  | `budget_level` | `medium` | **wirkungslos** |
  | `meal_prep_ok` | `true` | **wirkungslos** |
  | `planner_notes` | Testtext | **wirkungslos** |

  `[cmd]` **Der Grund ist kein Anzeigefehler:** `nutrition.recipes`
  fuehrt **kein Preis- und kein Vorkochfeld** — gegen
  `information_schema` geprueft. Von den acht Spalten hat **nur
  `cooking_skill`** eine Entsprechung an `recipes`.

  `[read]` **„Sichtbar" ist nicht „filtert".** Die drei mittleren lassen
  sich vergleichen; ein Filter waere eine Rezeptauswahl und gehoert zum
  Schreibpfad.

## Nachgemessen 2026-08-31

`[cmd]` **`recipes` traegt `cooking_skill` und `prep_time_min`** —
**kein Preis-, kein Budget-, kein Vorkochfeld.**

`[read]` **Der Befund von 2026-08-20 gilt unveraendert**, obwohl
Rezepte seit G-289 gebaut sind.

`[read]` **Damit ist es kein Anzeigefehler, sondern eine
Schemaentscheidung:** **`budget_level`, `meal_prep_ok` und
`planner_notes` brauchen Gegenstuecke an `recipes` — oder sie
gehoeren weg.**
