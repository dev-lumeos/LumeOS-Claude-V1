---
nr: G-509
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: [C-543]
kind_von: null
entscheidung: E-90
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-509 - der Workoutplaner von aussen nach innen

## Toms Bild

Tom, 2026-09-08:

> workoutplanner: wir zeigen einen kompletten body, user waehlt
> region wo er trainieren will, geht tiefer und tiefer, und die
> exercises dafuer werden angezeigt

    Koerper -> Region -> Muskelgruppe -> Einzelmuskel
    und auf jeder Ebene: die Uebungen dazu

## Braucht C-543

`[cmd]` **Heute ist die Kette eine Sackgasse:**

    Legs               Ebene 1      0 Uebungen
    Quadriceps         Ebene 2    356
    Vastus Lateralis   Ebene 3      0

`[read]` **C-543 reicht die Uebungen nach unten und sammelt
sie nach oben.** **Erst danach traegt der Planer.**

## Und die Sortierung braucht C-545

Tom: *,,die sortierung wird dann abhaengig von dem
erfahrungswert"*

`[cmd]` **`difficulty` traegt heute `intermediate` fuer alle
1.416** ? **eine Sortierung danach sortiert nichts.**

`[read]` **Der Planer kann OHNE die Sortierung gebaut werden**
? **sie kommt dazu, wenn C-545 geklaert ist.**

## Was schon da ist

`[cmd]` **112 Muskeln in 4 Ebenen, 1.416 Uebungen, 6.726
Zuordnungen, 51 Koerperflaechen mit `x_pct`/`y_pct`.**

`[read]` **Und Tom hat gesagt, die Grafik wird ersetzt** ?
**der Planer darf sich nicht an die heutige binden.**

## Abnahmebedingungen

    A1  vier Ebenen anklickbar, jede zeigt Uebungen.
        Foto je Ebene.
    A2  eine Ebene ohne eigene Zuordnung zeigt die
        geerbten -- gekennzeichnet als geerbt.
    A3  der Rueckweg nach oben funktioniert.
    A4  ohne C-545: keine Sortierung nach Erfahrung,
        und das steht am Schirm.
    A5  die Grafik ist austauschbar -- keine Kachel
        haengt an ihren Koordinaten. Belegt.
    A6  vier Module unveraendert.

## ZURUECKGESTELLT, 2026-09-08

Tom: *,,der workoutplanner wird eine eigene brainstormsession,
momentan sind mir die grundlagen wichtiger und die exercises
sauber aufgesetzt"*

`[read]` **Der Punkt bleibt als Zielbild stehen** ? **gebaut
wird er nach der eigenen Sitzung.**

`[cmd]` **C-543 (Vererbung) bleibt trotzdem noetig** ? **nicht
fuer den Planer, sondern weil eine Sackgasse in der Hierarchie
jedes Modul trifft.**

