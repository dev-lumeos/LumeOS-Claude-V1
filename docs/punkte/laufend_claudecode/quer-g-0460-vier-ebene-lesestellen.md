---
nr: G-460
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-458
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/koerper/hierarchie.ts
zahlen:
  gemessen: 2026-09-08
---

# G-460 - vier Lesestellen auf die gefallene Spalte ebene

## Befund

Aus G-458, Codex, 2026-09-08:

> *,,`gefallene-spalten-pruefen`: VIER bestehende
`ebene`-Lesestellen nach C-484."*

`[cmd]` **C-484 hat `public.koerperflaechen.ebene`
entfernt** ? **E-81: `parent_id` traegt die Tiefe.**

`[read]` **Vier Stellen lesen sie noch.**

## Warum es zaehlt

`[read]` **Eine Lesestelle auf eine gefallene Spalte gibt
`undefined`, keinen Fehler** ? **dieselbe Falle wie der
Vorgabewert in G-450.**

`[cmd]` **G-435 hat drei Zeilen nachgezogen** ? **vier sind
geblieben.**

## Was zu tun ist

`[cmd]` **`gefallene-spalten-pruefen` nennt sie** ? **miss, ob
sie wirken oder toter Code sind.**

`[read]` **Ein toter Zweig ist etwas anderes als eine falsche
Anzeige.**
