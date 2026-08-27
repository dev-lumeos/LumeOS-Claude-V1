---
nr: C-174
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
  dateien: []
zahlen: null
---

# C-174 - `ADR_NUTRITION_PREFERENCES_V1` kennt drei Constraint-Stufen

## Befund

(neu 2026-08-20). **Betrifft GO-22.**

  `[cmd]` **Die ADR:**

  | Typ | Stufe | Wirkung |
  |---|---|---|
  | **Allergie** | `hard` | *„absoluter Ausschluss — nie anzeigen, nie vorschlagen"* |
  | **Unvertraeglichkeit** | **`strong`** | *„nur auf **explizite User-Suche** anzeigen"* |
  | Religioes/kulturell | `hard` | wenn der User es so setzt |

  `[cmd]` **Toms Entscheidung vom 2026-08-20 (GO-22):** generelle
  Ausschluesse **bewerten mit 0**, statt zu filtern.

  `[read]` **Die ADR ist naeher dran, als es aussieht:** *„nur auf
  explizite Suche"* heisst — wer `schokolade` tippt, bekommt sie;
  **wer blaettert, nicht.** **Toms `0` heisst: wer blaettert, findet sie
  ganz unten.**

  **Zu klaeren:** Bleibt es bei `0`, oder wird `strong` als eigene Stufe
  gebaut? `[cmd]` **Heute kennt `food_preference_items` nur `liked`,
  `disliked`, `hard_exclude`, `soft_dislike`.**
