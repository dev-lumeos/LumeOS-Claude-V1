---
nr: C-518
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-475
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# C-518 - keine Bruecke zwischen Produkt und Substanz

## Befund

Aus G-475, Claude Code, 2026-09-08:

> *,,`intake_logs` -> `stack_items.supplement_id` fuehrt
SUBSTANZEN, das Tagebuch fuehrt PRODUKTE, und
`supplier_products` hat keine Substanzspalte. *Dasselbe
Produkt* ist nicht entscheidbar; entscheidbar ist nur der
Name."*

`[cmd]` **Selbst nachgemessen: `supplier_products` hat keine
Spalte mit `supplement` oder `substan`.**

## Was daran haengt

`[cmd]` **C-513s A7 hat eine Nachfragefunktion gebaut, die
auf `supplier_product_id` vergleicht** ? **im Stack steht
aber keine.**

`[read]` **Toms Wunsch war:** *,,allenfalls wenn es exakt
dieselben supplements wie zb whey xy in etwa zur selben zeit,
koennten wir den user nachfragen"*.

`[read]` **Das ist heute nicht entscheidbar.**

## Was zu messen ist

    A  wie fuehrt der Stack seine Eintraege?
       stack_items.supplement_id -> Substanz
       gibt es daneben ein Produkt?
    B  wie viele Stack-Eintraege haetten ein Produkt,
       wenn es die Spalte gaebe?
    C  reicht der Produktname fuer die Nachfrage?
       Toms Wort war "exakt dieselben supplements".

`[read]` **MESSEN und VORSCHLAGEN, nicht bauen** ? **ob der
Stack Produkte fuehren soll, ist eine Entscheidung.**

## Abnahmebedingungen

    A1  wie fuehrt der Stack heute? Gemessen.
    A2  waere eine Produktspalte im Stack sinnvoll?
        Begruendet, nicht gebaut.
    A3  reicht der Name? Mit Zahl belegt.
    A4  eine Empfehlung fuer Toms Entscheidung.

## BERICHTIGT durch E-83, 2026-09-08

`[cmd]` **Die Bruecke GIBT es:** `product_contents`, **3,0 Mio
Zeilen, 66,7 % der On-Market-Produkte haben mindestens eine
aufgeloeste Substanz.**

> *,,Aber bei Toms Whey loest sie Kalium, Kalzium, Lactase
auf und VERFEHLT Protein ? sie trifft die Spurenstoffe, nicht
den Zweck."*

`[read]` **Die Frage ist also nicht *,,gibt es eine
Bruecke?"*, sondern *,,welche Substanz MEINT das Produkt?"*.**

`[read]` **Ein Whey-Produkt hat zwanzig Zutaten und EINEN
Zweck.**

