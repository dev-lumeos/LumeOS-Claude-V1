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
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 6d089067
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-diary.tsx
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

## Auftrag

**Mitbeauftragt mit A-62 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Nachgemessen, 2026-08-30

`[cmd]` **Den Befund gibt es noch — G-272 hat den Dialog nicht
angefasst.** `mahlzeiten.tsx` wird weiter ueber `ansicht.tsx:49`
ausgeliefert, die drei Stellen stehen unveraendert an **750, 766,
535**.

`[cmd]` **5.014 von 7.140 abweichend** — die Zahl im Kopf stimmt.

`[cmd]` **Eine Praemisse ist gekippt:** der Befund sagt, der Rueckfall
sei noetig, *,,weil nicht jeder Eintrag einen Anzeigenamen hat"*.
**Heute haben 0 von 7.140 keinen.** Der Rueckfall bleibt als
Absicherung richtig, seine Begruendung nicht — **A-62 im Punkttext
selbst.**

`[read]` **Behoben sind zwei der drei Stellen.** Zeile 535 behaelt
`name_de` mit Absicht: der Wert geht ins **Suchfeld**, und
`name_display_de` als Suchbegriff liefert 0 Treffer (G-265).

## Abnahme

**2026-08-30, mit A-62 abgenommen:** zwei von drei behoben; Zeile 535 bewusst mit `name_de`, weil
sie das Suchfeld speist.
