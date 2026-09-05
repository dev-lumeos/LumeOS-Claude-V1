---
nr: C-193
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Nutrition/04_adrs/ADR_MEALCAM_V1.md"]
zahlen: null
---

# C-193 - MealCam warnt bei hart ausgeschlossenen Zutaten

## Befund

(neu
  2026-08-22).

  **Tom, 2026-08-22:** *„MealCam kann alles einlesen, muss aber bei
  Erkennung darauf hinweisen, dass X laut Preferences hard excluded
  ist, und der User muss das bestaetigen."*

  `[read]` **Der Unterschied zum Katalog:** die FoodDB WENDET
  Preferences AN. **MealCam ERKENNT, was auf dem Teller liegt** —
  wegfiltern waere dort falsch. Einlesen, benennen, bestaetigen lassen.

  `[cmd]` **Nur `hard` loest aus** (Allergen, Diet type). Food ±100,
  Category ±50, Tag ±30 sind Bewertung, keine Sperre.

  `[cmd]` `ADR_MEALCAM_V1.md` kennt bisher nur *„Erst nach
  User-Bestaetigung: Meal Item erstellen"*. Der Preference-Hinweis
  fehlt dort und gehoert ergaenzt.

  **Offen:** ob ein bestaetigter Treffer die Preference dauerhaft
  aendern darf oder einmalig durchgewunken wird.

## Auftrag

**Mitbeauftragt mit C-379 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: offen, aus anderem Grund

`[cmd]` **Die Suche entfernt harte Nuss-Ausschluesse weiterhin** —
A-47 bestaetigt.

`[cmd]` **Aber MealCam ist rein statisch und hat keinen Leseweg** —
**weder dieselbe Filterung noch eine Zutatenwarnung.**

`[read]` **Der Punkt ist kein Vergleichsbefund mehr, sondern eine
Anforderung an einen Leseweg, der noch nicht existiert** (G-276).

## Gemessen am 2026-09-07: die Reihenfolge steht

`[read]` **Codex:** *,,MealCam muss BLS-Kandidaten ungefiltert lesen
und erst danach Konflikte pro Food/Zutat als Warnung
zurueckgeben."*

`[cmd]` **Die Suche entfernt aktuell alle 120 `contains_nuts`-Foods**
(A-47).

`[read]` **Fuer eine Suche ist das richtig** — **wer nach Nuss sucht,
will keine vorgeschlagen bekommen.**

`[read]` **Fuer eine Kamera ist es falsch:** **wer eine Nuss
fotografiert, hat sie vor sich.** `[read]` **Sie zu verschweigen
waere gefaehrlicher als sie zu benennen.**

`[cmd]` **SPEC_11 Abschnitt 5 traegt es bereits:** `IMAGE` **ist
etwas anderes als** `DATABASE`.

**Gebaut wird es mit MealCam Phase 1.**
