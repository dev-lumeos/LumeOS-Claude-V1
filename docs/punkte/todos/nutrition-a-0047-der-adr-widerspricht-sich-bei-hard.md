---
nr: A-47
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: G-154
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-47 - Der ADR widerspricht sich bei `hard`

## Befund

(neu 2026-08-22).
  Befund aus G-154. **Dokumentenfrage, kein Code.**

  `[cmd]` **`ADR_NUTRITION_PREFERENCES_V1` sagt zweimal
  Verschiedenes.** Die Entscheidungstabelle: Allergie ist `hard`,
  *„absoluter Ausschluss — nie anzeigen, nie vorschlagen"*. Der
  Abschnitt *„Food Search Ranking-Einfluss"* darunter: `-300 fuer
  allergen match (hard constraint)`.

  `[read]` **Punkte schliessen nicht aus.** Ein Eintrag mit -300 steht
  weiter in der Liste, nur weiter unten. **Die Implementierung folgt
  der Tabelle** (`preference_excluded`), nicht dem Rangmodell — und
  das ist die richtige Wahl.

  `[cmd]` **Weitere Abweichungen zwischen ADR und Bestand:** die
  Spalte heisst `strength`, nicht `severity`; es gibt
  `general_exclusions`, nicht `excluded_foods`; `religious_dietary`
  und `religious_is_hard` fehlen ganz.

  **Zu tun:** den ADR nachziehen oder den Widerspruch als bewusst
  vermerken. **Nicht den Code aendern** — er tut das Richtige.
