---
nr: G-476
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-474
entscheidung: null
beruehrt:
  dateien:
    - tools/schuss.mjs
zahlen:
  gemessen: 2026-09-08
---

# G-476 - der Produktionsbau nimmt den Dev-Server mit

## Befund

`[cmd]` **Nach G-474 gemessen: `3200` horcht nicht mehr,
`3220` laeuft.**

`[cmd]` **Tom:** *,,server laeuft nicht"*

`[read]` **`_g474-anstrich.mjs` startet den Produktionsbau
und beendet ihn** ? **dabei ist der Dev-Server gestorben.**

## Warum es zaehlt

`[read]` **Die Regel lautet: NIE start, neustart,
aufraeumen** ? **weil Tom den Server besitzt.**

`[read]` **Ein Werkzeug, das ihn versehentlich beendet,
bricht dieselbe Regel.**

## Was zu messen ist

    A  beendet _g474-anstrich.mjs zu breit?
       (alle node-Prozesse statt nur seinem)
    B  oder faellt 3200 aus einem anderen Grund?
    C  kann das Werkzeug seinen eigenen Prozess
       merken und nur den beenden?

`[cmd]` **`tools/lauf.py` hat `CREATE_NO_WINDOW` und
`shell=False`** ? **miss, ob das Werkzeug dieselbe Bauform
nutzt.**

## Abnahmebedingungen

    A1  die Ursache, gemessen.
    A2  das Werkzeug beendet NUR seinen eigenen Bau.
    A3  Gegenprobe: 3200 laeuft waehrend und nach
        einem Werkzeuglauf.
    A4  KEIN Server gestartet -- gemeldet, wenn einer
        fehlt.
