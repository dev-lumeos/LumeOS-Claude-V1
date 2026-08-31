---
nr: G-302
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-289
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-302 — die Zielzeile bricht um

## Befund

`[cmd]` **Bildschirmfoto vom 2026-08-31, Breite 1440, Plans-Reiter.**

`[cmd]` **Die Zeile *kcal Ziel 2.500 · Protein 170 g · Kohlenhydrate
313 g · Fett 75 g* bricht:** **die 313 g stehen ueber der
Beschriftung, nicht daneben.**

`[read]` **Vier Werte in einer Zeile, und der dritte hat die
laengste Beschriftung** — **der Umbruch trifft genau ihn.**

## Warum es zaehlt

`[read]` **Es ist kein Datenfehler, es sieht nur kaputt aus.**
`[cmd]` **Und es tritt bei 1440 px auf** — **nicht erst auf einem
schmalen Schirm.**

`[read]` **Dieselbe Klasse wie die Raster-Regression in G-298:** dort
standen Samstag und Sonntag ausserhalb der Karte. **Beide entstehen
beim Nebeneinandersetzen von Werten mit ungleich langen
Beschriftungen.**

## Auftrag

`[read]` **Vorbereitet am 2026-08-31.**

`[cmd]` **Vier Werte in einer Zeile, der dritte hat die laengste
Beschriftung, der Umbruch trifft genau ihn.** **Bei 1440 px.**

`[read]` **Dieselbe Klasse wie die Raster-Regression in G-298.**
