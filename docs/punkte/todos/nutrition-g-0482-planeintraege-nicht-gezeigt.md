---
nr: G-482
typ: fehler
modul: nutrition
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
  heute: 4
---

# G-482 - die Planeintraege sind da und werden nicht gezeigt

## Toms Befund

Tom, 2026-09-08:

> ghostentries kannst mir erzaehlen was du willst, ich sehe
> keine und das ist tatsache

## Er hat recht, und der Bericht war falsch

`[cmd]` **Selbst gemessen, heute ist der 2026-09-18:**

    2026-09-15    4 Eintraege
    2026-09-16    4
    2026-09-17    4
    2026-09-18    4     <- HEUTE
    2026-09-19   12     <- der aktive Plan beginnt
    2026-09-20   12
    2026-09-21   12
    2026-09-22   12

`[cmd]` **Insgesamt: 756 Eintraege, 231 Plantage, ein aktiver
Plan (*,,Aufbau-Wochenplan"*, ab 2026-09-19, 28 Tage).**

### Was E-83 behauptet hat

> Claude Code: *,,Gebaut, 558 Zeilen. Gemessen: 0 Eintraege
heute, 4 morgen ? Toms aktiver Plan beginnt am 19.09., heute
ist der 18."*

`[read]` **Beide Zahlen falsch.** **Es sind 4 heute und 12
morgen.**

`[read]` **Und ich habe es uebernommen, ohne zu messen** ?
**genau Toms Vorwurf.**

## Damit ist es ein Anzeigefehler

`[read]` **Die Daten sind da. Tom sieht sie nicht.**

`[cmd]` **`plan-eintraege.tsx` und `plan-werkbank-ui.tsx`
existieren** ? **miss, was sie holen und was sie zeigen.**

## Was zu messen ist

    A  welche Abfrage holt die Eintraege?
    B  welchen Tag fragt sie? Heute oder den
       Planbeginn?
    C  zeigt sie nur den AKTIVEN Plan, oder alle?
       Der aktive beginnt erst morgen.
    D  wo im Schirm sollten sie stehen? Tom sieht
       die Stelle -- miss, was dort steht.

`[cmd]` **Punkt C ist der Verdacht: die vier Eintraege von
heute gehoeren vermutlich zu einem ANDEREN, nicht aktiven
Plan.**

`[read]` **Dann waere die Anzeige richtig und die Frage eine
andere: soll ein abgelaufener Plan noch zeigen?**

## Abnahmebedingungen

    A1  welche Abfrage, welcher Tag, welcher Plan?
        Gemessen.
    A2  zu welchem Plan gehoeren die vier Eintraege
        von heute?
    A3  wenn es ein Anzeigefehler ist: behoben, Foto.
    A4  wenn es richtig ist: BENANNT, warum Tom
        nichts sieht.
    A5  Gegenprobe: ein Tag mit Eintraegen zeigt sie.
    A6  vier Module unveraendert.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

