---
nr: C-543
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
---

# C-543 - ein Muskel erbt die Uebungen seiner Eltern

## Die Frage

`[read]` **Wer `Vastus Lateralis` waehlt, soll die Uebungen
sehen, die am `Quadriceps` haengen.**

## Der Befund

`[cmd]` **Gemessen, 2026-09-08:**

    Ebene 1      4 Zuordnungen,  7 Muskeln
    Ebene 2  4.174,             31
    Ebene 3  2.300,             53
    Ebene 4    248,             21

    Legs               Ebene 1      0 Uebungen
    Quadriceps         Ebene 2    356
    Vastus Lateralis   Ebene 3      0   <- Sackgasse
    Pectoralis Major   Ebene 2    211
    Clavicular Head    Ebene 3     46

`[read]` **Nicht weil es keine Uebungen gibt** ? **weil die
Zuordnung eine Ebene hoeher liegt.**

## Warum es keine Kuration braucht

`[read]` **Eine Uebung am `Quadriceps` belastet alle seine
Kinder** ? **die Hierarchie IST die Antwort, sie muss nur nach
unten durchgereicht werden.**

`[cmd]` **Und aufwaerts gilt dasselbe: wer `Legs` waehlt, will
alles darunter.** **Heute: 0 Uebungen.**

## Was zu klaeren ist

    A  der faktor beim Erben: bleibt er, oder sinkt er?
       Eine Kniebeuge belastet den Quadriceps zu 1.00 --
       den Vastus intermedius auch?
    B  die Richtung: nach unten (Kind erbt) UND nach
       oben (Eltern sammeln)?
    C  Aliase: C-531 hat vier Knoten abgeloest -- sie
       duerfen nicht doppelt zaehlen.
    D  Laufzeit: 1.416 Uebungen x 112 Muskeln x 4 Ebenen.

`[read]` **Punkt A ist eine Entscheidung** ? **MESSEN, was
sinnvoll ist, und VORLEGEN.**

## Abnahmebedingungen

    A1  Vastus Lateralis liefert Uebungen. Zahl.
    A2  Legs liefert Uebungen. Zahl.
    A3  keine Uebung doppelt, auch nicht ueber Aliase.
    A4  der geerbte faktor ist gekennzeichnet --
        geerbt ist nicht gemessen.
    A5  Laufzeit gemessen.
    A6  die 6.726 Zuordnungen unveraendert.
    A7  Sicherung, Vollkette, ALLE Waechter.
