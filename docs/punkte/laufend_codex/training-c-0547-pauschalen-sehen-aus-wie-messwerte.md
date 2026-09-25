---
nr: C-547
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
---

# C-547 - 6.723 Pauschalen sehen aus wie Messwerte

## Toms Vorgabe

Tom, 2026-09-08:

> darunter kennen wir seine einzelnen muskeln, wo wir wissen
> muessen wie prozentual die belastung ist

## Der Befund

`[cmd]` **Gemessen:**

    faktor                        Quelle           Klasse
    primary   1.00   3.155        pelland_2026     C
    secondary 0.50   3.568        pelland_2026     C
    primary   0.95       1        pmc4327372_emg   A
    secondary 0.67       1        pmc4327372_emg   A
    secondary 0.79       1        pmc4327372_emg   A

`[read]` **`faktor`, `source_id` und `evidence_class` sind
genau der Bauplan, den Tom beschreibt ? und DREI Zeilen
beweisen, dass er funktioniert.**

`[cmd]` **6.723 Zeilen tragen ZWEI Konstanten aus EINER Quelle,
Klasse C.**

`[read]` **Das ist keine prozentuale Belastung, das ist eine
Pauschale, die wie Daten aussieht.**

## Warum das zaehlt

`[read]` **Solange die Pauschale steht, sieht LumeOS aus, als
wuesste es die Belastung je Muskel.** **Wird sie ehrlich,
faellt auf, wie wenig belegt ist ? und genau das ist der
Zweck.**

`[cmd]` **`evidence_class` traegt die Unterscheidung schon:
A = gemessen, C = angenommen.**

## Zu messen, VOR dem Bauen

    A  fuer wie viele der 1.416 Uebungen gibt es
       ueberhaupt EMG-Belege?
    B  was sagt pelland_2026 wirklich? Eine Quelle,
       die 6.723 Zeilen traegt, sollte gelesen sein.
    C  reicht evidence_class, oder braucht es eine
       Spanne (0,4 bis 0,6)?
    D  was tut die Oberflaeche heute mit dem faktor?

`[read]` **MESSEN und EMPFEHLEN, keine Zahl erfinden.**

## Abnahmebedingungen

    A1  wie viele Uebungen haben EMG-Belege? Zahl.
    A2  was sagt pelland_2026? Gelesen, nicht zitiert.
    A3  Spanne oder Einzelwert? Empfohlen.
    A4  wer liest den faktor? Gemessen.
    A5  KEINE Umsetzung.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
