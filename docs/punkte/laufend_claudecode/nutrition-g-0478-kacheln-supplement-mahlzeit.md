---
nr: G-478
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-475
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/supplement-posten-read.ts
zahlen:
  gemessen: 2026-09-08
---

# G-478 - die Kacheln fuer Supplemente in der Mahlzeit

## Was G-475 gebaut hat

`[cmd]` **Drei Dateien:** `supplement-posten-read.ts`,
`supplement-posten-lage.ts`, **plus Probe.**

`[cmd]` **Gegen die Datenbank belegt, mit ROLLBACK:**

    1 x 31 Gram(s)   120 kcal, 24 g
    2 x 31 Gram(s)   240 kcal, 48 g

`[cmd]` **Und der Satz fuer Produkte ohne Naehrwerte steht:**
*,,Fuer dieses Produkt sind keine Naehrwerte hinterlegt. Es
wird erfasst, zaehlt aber nicht in die Tagesbilanz."*

## Sein eigener Vorschlag

> *,,Der Folgeauftrag muss nur noch Kacheln bauen ? Suchfeld,
Portions-Pulldown, Posten in der Liste, separate Bilanzzeile,
Rueckfrage."*

## Abnahmebedingungen

    A1  ein Supplement laesst sich einer Mahlzeit
        hinzufuegen. Foto.
    A2  die Tagesbilanz weist es SEPARAT aus. Foto.
    A3  Toms Fruehstueck ERFASST: Haferflocken,
        Blaubeeren, Mandelmus, Whey. Foto mit der
        Summe, und die Zeilen stehen in der Datenbank.
    A4  mehrere Portionsgroessen: die Wahl steht. Foto.
    A5  ein Produkt ohne Naehrwerte: der Satz steht.
        Foto.
    A6  Kontraste gemessen, nicht geschaetzt.
    A7  vier Module unveraendert.
    A8  apps/web 1857 oder mehr, apps/coach 65.

## Was NICHT in diesen Auftrag gehoert

`[cmd]` **Die Rueckfrage bei doppelter Erfassung** ? **sie
braucht die Produkt-Substanz-Bruecke, und die gibt es nicht
(C-518).**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

