---
nr: G-494
typ: aufraeumen
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-520
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/produkte-read.ts
zahlen:
  gemessen: 2026-09-08
---

# G-494 - die Form-Nachlese aus G-492 entfernen

## Befund

`[cmd]` **C-520 ist live: `search_supplier_products` gibt
`produktform` zurueck, `p_formen text[]` trifft `Powder` auf
`Powder [E0162]`.**

`[cmd]` **G-492 hat bis dahin eine Nachlese gebaut:
`produkte-read.ts`, 2,8 ms je 500 Zeilen, markiert zum
Entfernen.**

## Ein Haken

`[cmd]` **Die neue Signatur mit `p_formen` hat KEINE
Vorgabewerte** ? **wer sie nutzt, muss alle elf Parameter
uebergeben.**

`[cmd]` **Die alte Signatur (mit Vorgaben) gibt `produktform`
jetzt ebenfalls zurueck** ? **fuer die Nachlese reicht die
alte.**

## Abnahmebedingungen

    A1  die Nachlese ist weg. Belegt.
    A2  die Spalte FORM ist in der Liste gefuellt. Foto.
    A3  der Knopf bietet bei Pulver weiter beides an.
        Foto.
    A4  Laufzeit vorher/nachher.
    A5  vier Module unveraendert.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
