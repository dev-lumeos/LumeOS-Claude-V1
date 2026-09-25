---
nr: C-548
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
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
  uebungen: 1416
---

# C-548 - fuenf Spalten mit einem Wert fuer 1.416 Uebungen

## Toms Vorgabe

Tom, 2026-09-08: *,,die grundlagen und die exercises sauber
aufgesetzt"*

## Gemessen

    Spalte            gefuellt   verschiedene Werte
    name               1.416      1.416
    instructions       1.416      1.357
    media_paths        1.416      1.378
    tips               1.412      1.181
    equipment_id       1.416         58
    discipline         1.416          5
    discipline_rule    1.416          5
    category           1.416          3
    exercise_type      1.416          1   <- strength
    tracking_type      1.416          1   <- weight_reps
    difficulty         1.416          1   <- intermediate
    sort_weight        1.416          1
    source             1.416          1

## Der Widerspruch

`[cmd]` **`discipline` traegt fuenf Werte:**

    Strength    777
    Bodyweight  511
    Stretching  108
    Yoga         11
    Cardio        9

`[read]` **128 Uebungen sind Dehnung, Yoga oder Ausdauer ? und
ALLE tragen `exercise_type: strength` und `tracking_type:
weight_reps`.**

`[read]` **Ein Lauf wird nicht in Gewicht x Wiederholungen
gemessen, eine Dehnung nicht in Saetzen.**

## Warum tracking_type der schwerste ist

`[cmd]` **Er entscheidet, welche Felder beim Erfassen
erscheinen** ? **MISS, wer ihn liest, bevor du ihn
aenderst.**

`[cmd]` **396 Saetze liegen vor** ? **sie sind alle als
`weight_reps` erfasst. Eine Aenderung darf sie nicht
entwerten.**

## Zu messen, je Spalte

    A  wer liest sie? Oberflaeche, Datenbank, Coach.
    B  laesst sich der richtige Wert ABLEITEN?
       discipline und equipment sagen viel:
       Stretching + kein Geraet -> kaum weight_reps.
    C  wie viele lassen sich sicher setzen,
       wie viele nicht?
    D  was passiert mit den 396 bestehenden Saetzen?

`[read]` **`difficulty` ist ausgelagert nach C-545** ? **hier
geht es um die anderen vier.**

`[read]` **MESSEN und EMPFEHLEN je Spalte** ? **eine Spalte,
die niemand liest, braucht keine Kuration, sondern eine
Entscheidung, ob sie bleibt.**

## Abnahmebedingungen

    A1  je Spalte: wer liest sie? TABELLE.
    A2  je Spalte: ableitbar? An einer Stichprobe
        belegt.
    A3  die 128 Nicht-Kraftuebungen: welcher
        tracking_type waere richtig?
    A4  was passiert mit den 396 Saetzen?
    A5  je Spalte eine Empfehlung: setzen, ableiten
        oder streichen.
    A6  KEINE Umsetzung.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
