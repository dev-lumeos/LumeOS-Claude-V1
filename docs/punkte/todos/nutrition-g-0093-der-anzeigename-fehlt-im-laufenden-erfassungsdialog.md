---
nr: G-93
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-13
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/app/v2/nutrition/erfassen.tsx", "apps/web/src/app/v2/nutrition/mahlzeiten.tsx", "apps/web/src/lib/nutrition/food-search.ts"]
zahlen:
  gemessen: 2026-08-20
  name_display_de_abweichend: 5014
  eintraege_gesamt: 7140
  frueher_notiert: 2870
---

# G-93 - Der Anzeigename fehlt im laufenden Erfassungsdialog

## Befund

(neu 2026-08-20, aus G-13).

  **Tom, 2026-08-17:** *„richtige Begriffe wie weisser Reis anstatt
  Reis poliert."*

  `[cmd]` **Der Punkt galt weiter, nur nicht dort, wo G-13 ihn suchte.**
  Der G-13-Auftrag hielt ihn fuer erledigt — **erledigt ist er in
  `erfassen.tsx`, und die Datei wird nicht ausgeliefert.**

  `[cmd]` **Die laufende Fassung `mahlzeiten.tsx` zeigt `name_de` an
  drei Stellen:** **750** (Trefferliste), **766** (Auswahlkopf), **535**
  (was nach der Auswahl im Suchfeld steht).

  `[cmd]` **5.014 von 7.140** Eintraegen tragen einen abweichenden
  `name_display_de` — gemessen 2026-08-20, **nicht 2.870 wie frueher
  notiert.** `food_search` liefert beide Felder, `food-search.ts` kennt
  beide.

  `[read]` **Eine Zeile je Stelle:** `f.name_display_de || f.name_de`.
  Der Rueckfall bleibt noetig, weil nicht jeder Eintrag einen
  Anzeigenamen hat.
