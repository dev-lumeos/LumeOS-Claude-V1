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
erledigt: 2026-08-28
commit: daf4f7a1
durch: G-70
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/tab-foods.tsx]
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

## Abnahme

**2026-08-28, Orchestrator. Durch G-70 erledigt.**

`[read]` **Der Punkt sagte *,,das ist eine Schemafrage"* — er war
keine.** `[cmd]` `p_filters.tag_groups` nimmt seit C-164 mehrere Tags
entgegen, ODER innerhalb, UND zwischen. **Der Typ fuehrte das Feld
bereits, mit dem Vermerk *,,wird hier noch nicht gesetzt"*.**

`[cmd]` **Gemessen:** vegan 1.377, high_protein 1.400, ODER 2.712,
UND 65 — **ueber die echte Route durchgestochen, `food_search`
unangetastet.**

**Abgenommen.**
