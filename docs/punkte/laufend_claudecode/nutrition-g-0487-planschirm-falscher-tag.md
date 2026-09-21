---
nr: G-487
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-487 - der Tageswechsler startet nicht auf heute

## Toms Befund

Tom, 2026-09-08:

> der daychooser war auf 18.9. und nicht heute, sprich das ist
> eine boesartige falle

> der tageswechsler muss bloss auf heute gestellt werden, wenn
> ein refresh/server restart/F5/ctrl F5 gemacht wird

> ich sehe die eintraege ja jetzt, wenn ich auf heute stehe. so
> umgehen wir, dass ein user nicht auf dem alten datum
> stehenbleibt, wenn er mal paar tage nicht online ist

## Warum es zaehlt

`[cmd]` **Heute ist der 2026-09-21, der Schirm zeigte den
18.09.**

`[cmd]` **Am 18.09. hat der aktive Plan null Eintraege, am
21.09. vier** ? **Tom sah *,,kein Eintrag"* und hielt es fuer
einen Fehler.**

`[read]` **Wer ein paar Tage nicht online war, sieht einen
alten Tag ohne Hinweis.**

## Abnahmebedingungen

    A1  nach F5 steht der Tageswechsler auf HEUTE.
        Foto vorher (alter Tag) und nachher.
    A2  das gilt fuer jeden Tageswechsler -- miss,
        welche es gibt.
    A3  ein Waechter faengt es. Sabotageprobe.
    A4  vier Module unveraendert.
    A5  apps/web 1893 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

