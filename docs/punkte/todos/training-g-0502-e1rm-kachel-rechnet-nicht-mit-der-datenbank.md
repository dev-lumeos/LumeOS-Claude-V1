---
nr: G-502
typ: fehler
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/fehlende-kacheln.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-502 - die e1RM-Kachel rechnet nicht mit der Datenbank

## Die Kachel

`[cmd]` **`training/history`, *„Bench Press - e1RM progression"*
(`fehlende-kacheln.tsx:94`).** **Zwoelf Wochenwerte aus
`E1RM_BENCH`, einer festen Liste.**

## Der Vermerk ist falsch

`[cmd]` **Er lautet:** *,,eine e1RM-Rechnung je Uebung -
`training.sets` haelt Gewicht und Wiederholungen, die
Brzycki-Ableitung fehlt."*

`[cmd]` **Gemessen 2026-09-08 - sie fehlt nicht:**

    Trigger  workout_sets_calc_metrics_trg
    Funktion training.calc_workout_set_metrics
    Formel   weight_kg / (1.0278 - 0.0278 * reps)

`[read]` **Das IST Brzycki** - algebraisch dasselbe wie
`weight * 36/(37 - reps)` aus `OneRepMaxCalculator.tsx` des
Vorgaengerrepos.

`[cmd]` **Und sie ist gerechnet:**

    workout_sets.estimated_1rm        372 von 396   (94 %)
    workout_exercises.best_est._1rm   101 von 153   (66 %)
    verschiedene Uebungen                      23

`[cmd]` **Der Leseweg steht auch:** `auswertung.ts:177`
`kraftverlauf()` liest `best_estimated_1rm` und wird in
`page.tsx:114` aufgerufen.

## Was fehlt wirklich

`[read]` **Nur die Verbindung zwischen beidem.** Die Kachel
kennt `verlauf.kraft` nicht - sie nimmt keine Prop.

`[cmd]` **`<TrainingKraftverlauf d={verlauf} />` steht zwei
Zeilen darueber** (`ansicht.tsx:254`) **und zeigt genau diese
Daten.** `[read]` **Die Entwurfskachel daneben zeigt eine
erfundene Kurve fuer eine Uebung, die der Nutzer vielleicht nie
gemacht hat.**

## Zu klaeren

`[read]` **Soll die Kachel bleiben?** Sie ist die
Mockup-Fassung dessen, was darueber schon echt steht - dann
gehoert sie unter die Linie, nicht darueber.

## Abnahmebedingungen

    A1  der Vermerk nennt den richtigen Grund.
    A2  entweder angebunden (mit Zahl) oder unter die
        Linie verschoben. Foto.
    A3  keine Marke ohne echte Zahl entfernt.
