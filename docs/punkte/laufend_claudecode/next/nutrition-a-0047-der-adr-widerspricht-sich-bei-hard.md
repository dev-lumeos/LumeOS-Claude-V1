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

## Auftrag — drei Widersprueche in den Nutrition-Specs

**Mitbeauftragt: C-174, A-13.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-02.**

### Warum diese drei zusammen

`[read]` **Alle drei sagen dasselbe von verschiedenen Seiten:**
**die Spec widerspricht sich bei den Ausschlussstufen.**

`[cmd]` **A-47: der ADR widerspricht sich bei `hard`.**
`[cmd]` **C-174: `ADR_NUTRITION_PREFERENCES_V1` kennt drei
Constraint-Stufen.**
`[cmd]` **A-13: das Konsolidierungsregister ist abzuarbeiten.**

`[read]` **Und seit heute gibt es Entscheidungen, die sie
beruehren:** `[cmd]` **E-49 teilt die Filtergruppen, E-58 und E-59
regeln die Mahlzeitenstruktur.**

### Was zu tun ist

**Lesen, messen, und sagen was gilt.**

`[read]` **Nicht bauen** — **die drei Punkte fragen, was die Spec
meint, nicht was der Code tun soll.**

`[cmd]` **`SPEC_03` und `SPEC_10` sind die Quellen**, dazu
`ADR_NUTRITION_PREFERENCES_V1`.

`[read]` **Und wo eine Entscheidung von heute den Widerspruch
aufloest: sag es** — **statt einen alten ADR nachzuziehen, der
ueberholt ist.**

### Wo der Code widerspricht

`[cmd]` **`tab-vorlieben.tsx` zeigt *hard exclusion · no scoring
override*** — **eine harte Stufe.**

`[cmd]` **Der ADR nennt drei.** `[read]` **Miss, welche der drei im
Code ankommen.**

### Was nicht zu tun ist

**Keine Spec aendern** — `docs/` gehoert dem Orchestrator.
**Melden, was gilt, mit Fundstelle.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    A-47    was widerspricht sich, mit Zeilennummer
    C-174   drei Stufen -- welche wirken im Code
    A-13    was im Register noch offen ist, gezaehlt
    heute   welche Entscheidung loest was auf

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
