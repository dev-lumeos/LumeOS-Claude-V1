---
nr: C-120
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-120 - Drei Sperren in `food_search`

## Befund

(neu 2026-08-19). Befund
  aus G-73.

  `[cmd]` **Alle drei in der Suchfunktion, die C-94 gesperrt hat:**

  | | |
  |---|---|
  | **`p_tag_code` ist Singular** | kein ODER/UND, nur Einfachauswahl |
  | **kein Ausschluss-Parameter** | die Allergen-Schalter wirken **nur auf der angezeigten Seite** — und sagen das an |
  | **kein `processing_level`** | die acht Stufen aus C-100 sind **nicht filterbar** |

  `[read]` **Der G-73-Agent hat sie gemeldet statt umgangen** — richtig,
  denn ein zweiter Suchweg neben `food_search` waere die schlechtere
  Loesung.

  `[cmd]` **Und ein Befund, der die Bauform bestimmt hat:** *„jeder
  vegane Eintrag traegt auch `vegetarian` (Schnittmenge 0) — „vegan ODER
  vegetarisch" waere also eine Scheinwahl."*
