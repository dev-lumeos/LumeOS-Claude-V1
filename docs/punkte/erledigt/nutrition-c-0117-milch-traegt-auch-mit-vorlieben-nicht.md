---
nr: C-117
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-29
commit: 5f8414b0
beruehrt:
  dateien: [supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
zahlen: null
---

# C-117 - `milch` traegt auch mit Vorlieben nicht

## Befund

(neu
  2026-08-19). Rest aus C-94, **ersetzt C-102 nicht, praezisiert es.**

  `[cmd]` **Gemessen nach C-94:** MealCam gewinnt weiterhin mit
  **Joghurt (0,5 % Fett)**, Soll bleibt **Vollmilch.**

  `[read]` **Damit ist die Hoffnung aus C-102 widerlegt:** *„G-65 loest
  es womoeglich von selbst — wer Joghurt abwertet, sieht ihn nicht mehr
  oben."* **Die Vorlieben greifen, aber sie loesen die Rangfrage
  nicht** — weil niemand Joghurt abgewertet hat und es auch niemand
  tun sollte.

  `[cmd]` **Die Ursache bleibt die Formel:** Joghurt hat mehr Protein je
  100 g als Milch, und `sort_weight` belohnt Dichte. **Der Pulverabzug
  aus C-100 hat den ersten Fehler behoben, nicht den zweiten.**

  `[read]` **Die zwei Wege aus C-102 stehen weiter offen:** *Trinkform
  vor Pulverform* als Regel, **oder Haeufigkeit statt Dichte** —
  `meal_items` protokolliert, was gegessen wird.

## Auftrag

**Mitbeauftragt mit C-20 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

Ueberholt gemessen am 2026-08-29. Der Nachweis mit `dev@lumeos.app` und die offene, nicht entschiedene Rangfrage stehen in C-20, `docs/punkte/laufend_codex/nutrition-c-0020-treffer-am-wortanfang-schlagt-treffer-in-der-wortmitte.md`.

## Abnahme

**2026-08-29, mit C-20 abgenommen.** Messung und Begruendung
stehen dort.
