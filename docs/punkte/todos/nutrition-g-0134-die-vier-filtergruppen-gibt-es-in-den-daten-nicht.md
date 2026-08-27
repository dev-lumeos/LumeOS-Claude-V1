---
nr: G-134
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-164
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-134 - Die vier Filtergruppen gibt es in den Daten nicht

## Befund

(neu
  2026-08-20). **Entscheidung.** Befund aus C-164.

  `[cmd]` **`tag_type` traegt drei Werte:** `diet` (9 Codes),
  `processing` (2), `allergen` (3).

  `[read]` **Die Oberflaeche zeigt vier Gruppen** — Ernaehrungsform,
  Naehrwert, Verarbeitung, Allergene. **„Ernaehrungsform" und „Naehrwert"
  sind beide `diet`.**

  `[cmd]` **Folge:** *„Wer stumpf nach `tag_type` gruppiert, verodert
  `vegan` mit `high_protein`."*

  `[read]` **Damit ist die Gruppierung eine Entscheidung, keine
  Ablesung.** **Entweder eine Gruppenspalte in `tag_definitions`, oder
  die Zuordnung bleibt in der Anzeige** — dann steht sie an zwei
  Stellen.
