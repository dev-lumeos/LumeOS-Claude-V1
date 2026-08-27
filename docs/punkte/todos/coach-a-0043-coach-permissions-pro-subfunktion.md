---
nr: A-43
typ: entscheidung
modul: coach
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/todo/TODO.md"]
zahlen: null
---

# A-43 - Coach-Permissions pro Subfunktion

## Befund

(neu 2026-08-21).
  **Entscheidung fuer Tom.** Abgespalten von A-37.

  `[read]` **A-37 traegt zwei Titel** — in `TODO.md` *„Zwoelf ADRs"*, in
  der Entscheidungsliste *„Coach-Permissions pro Subfunktion"*. **Das
  ist ein eigener Punkt.**

  `[cmd]` **`ADR_COACH_PERMISSIONS_V1`:** *„User kann **pro Modul und
  Subfunktion** freigeben"* — mit Beispielen: `nutrition.diary`,
  `nutrition.water`, `nutrition.micronutrient`, `nutrition.mealcam_*`.

  `[cmd]` **Gebaut ist nur pro Modul** — `client_permissions` hat
  `nutrition_visibility`, nicht `nutrition_diary_visibility`.

  `[read]` **Das betrifft die Kernanforderung des Coach-Portals.**
  **Zu entscheiden: reicht die Modulstufe, oder kommt die Feinstufe?**

  `[cmd]` **F-06 hat gemessen, dass die Freigabe ueberhaupt erst seit
  C-162 wirkt** — 22 `coach_read`-Policies ueber sechs Module. **Eine
  Feinstufe waere sechs mal soviel.**
