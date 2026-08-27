---
nr: G-112
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-112 - Der Food-DB-Filter laesst nur einen Wert zu

## Befund

(neu
  2026-08-20). Toms Befund.

  **Tom:** *„Foodsdb-Filter ist immer nur einer waehlbar, da muss auch
  eine Kombination ueber Gruppen filtern."*

  `[cmd]` **Die Ursache steht in C-120:** *„`p_tag_code` ist Singular —
  kein ODER/UND, nur Einfachauswahl."*

  `[read]` **Das ist eine Schemafrage, keine Anzeigefrage.**
  `food_search` muesste mehrere Tags entgegennehmen — **ODER innerhalb
  einer Gruppe, UND zwischen den Gruppen**, wie die Recherche zu
  Faceted Search es vorgibt.

  `[cmd]` **Und der Ausschluss fehlt ganz** — C-120: *„kein
  Ausschluss-Parameter, die Allergen-Schalter wirken nur auf der
  angezeigten Seite."*
