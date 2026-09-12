---
nr: G-440
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/motor.ts
zahlen:
  gemessen: 2026-09-08
  schluessel: 18
  namen: 105
---

# G-440 — MUSCLE_STATE ist eine Attrappe, die Kachel sagt „echte Daten"

## Toms Befund

Tom, 2026-09-08:

> oben steht echte daten und es korrespondiert von der grafik
> nicht in die liste, und zweidrittel der liste zeigt keine werte

> das ist alles dreck was hier geliefert wird und verarschend
> gegenueber mich. ich rackere mich hier ab und mir wird irgendwas
> serviert aus den haenden gezogen und als echte daten verkauft

`[read]` **Er hat recht.**

## Der Befund

`[cmd]` **`motor.ts:135`, im Code selbst dokumentiert:**

    // [cmd] module-recovery-engine.jsx:135-154
    export const MUSCLE_STATE: Record<string, MuscleState> = {
      chest: { hours: 38, sets: 14, soreness: 1,
               lastSession: 'Push B - Wed' },
      front_deltoids: { hours: 38, sets: 10, ... },
      ...
    }

`[read]` **Achtzehn FESTE Zeilen, abgeschrieben aus dem
Mockup.**

`[cmd]` **`Push B - Wed` ist kein Datum aus der Datenbank.**

`[cmd]` **Und die achtzehn Schluessel sind genau die ALTEN
Kartenflaechen vor G-430:**

    chest, front_deltoids, triceps, upper_back,
    back_deltoids, biceps, forearm, trapezius,
    quadriceps, hamstring, gluteal, calves,
    adductor, abductors, lower_back, abs,
    obliques, neck

`[read]` **`upper_back`, `gluteal`, `hamstring`, `quadriceps`,
`calves`, `adductor` gibt es auf der Karte seit G-430/G-431/G-434
nicht mehr.**

## Warum zwei Drittel leer sind

    Karte             43 Muskeln, einzeln anwaehlbar
    Hierarchie       105 Namen
    MUSCLE_STATE      18 feste Zeilen aus dem Mockup

`[read]` **Jeder Wert in der Liste kommt aus einer dieser 18
Zeilen** ? **direkt oder geliehen (G-438).**

`[read]` **Die restlichen 87 haben nichts, weil die Attrappe sie
nicht kennt.**

## Und das Etikett ist falsch

`[cmd]` **Die Kachel traegt `echte Daten`.**

`[cmd]` **Der Muskelkater kommt wirklich aus `recovery.checkins`**
? **die Stunden und Saetze NICHT.**

`[read]` **Ein gemischter Zustand, der sich als echt
ausgibt.**

`[cmd]` **Der Attrappenwaechter hat es nicht gesehen** ? **er
sucht `ATTRAPPE`-Marken in der Ansicht, nicht Datenquellen in der
Rechnung.**

## Was wirklich dasteht

`[cmd]` **Gemessen:**

    training.workout_sets        258 Saetze
    training.workout_sessions     66 Sitzungen
    training.exercise_muscles  6.588 Zuordnungen
                               auf 95 Muskeln

`[read]` **Daraus laesst sich je Muskel rechnen:**

    hours    Stunden seit der letzten Sitzung, die
             diesen Muskel traf
    sets     Saetze in dieser Sitzung, die auf ihn
             zeigten
    lastSession  die Sitzung selbst

`[cmd]` **Die Erholungsformel steht DARUEBER in derselben
Datei:**

    base(hours) x volume_mod x sleep_mod
                x nutrition_mod x soreness_mod

`[read]` **Sie ist echt. Sie bekommt nur Attrappenzahlen.**

## Was zu bauen ist

**1** ? **`MUSCLE_STATE` wird gerechnet, nicht geschrieben.**

`[read]` **Aus `workout_sets` x `exercise_muscles` je
`muscle_group_id`.**

`[cmd]` **`exercise_muscles` hat `role`:** `primary` **3.053,**
`secondary` **3.535.**

`[read]` **Wie die Rolle in die Saetze eingeht, ist C-487** ?
**bis dahin zaehlt ein Satz fuer jeden zugeordneten Muskel
gleich, UND DIE KACHEL SAGT ES.**

**2** ? **Das Etikett wird ehrlich.**

`[read]` **Solange ein Teil geschaetzt ist, steht das dran** ?
**nicht `echte Daten`.**

`[cmd]` **`C-466` macht es vor:** `unmapped_taken_log_count`
**zaehlt, was fehlt.**

**3** ? **Ein Waechter fuer Datenquellen.**

`[read]` **Eine Kachel, die `echte Daten` traegt, darf keine
feste Tabelle im Rechenweg haben.**

`[cmd]` **Miss, wo es sonst noch so ist** ? **`motor.ts` ist
34 KB, `MUSCLE_STATE` ist vielleicht nicht die einzige.**

## Abnahmebedingungen

    A1  MUSCLE_STATE gerechnet, nicht geschrieben.
        Je Muskel: hours, sets, lastSession aus
        workout_sets.
    A2  wie viele der 105 haben jetzt einen EIGENEN
        Wert? Vorher 18. Gemessen.
    A3  das Etikett sagt die Wahrheit. Foto.
    A4  was noch geschaetzt ist, steht dran.
    A5  ein Waechter: keine feste Datentabelle im
        Rechenweg einer "echte Daten"-Kachel.
        GRUEN.
    A6  wo es sonst noch so ist: Liste.
    A7  Gegenprobe: eine feste Tabelle eingebaut
        -> faellt sie?
    A8  vier Module unveraendert.
    A9  apps/web 1689 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINE Zahl erfinden** ? **wo kein Satz auf einen Muskel zeigt,
hat er keinen Wert.**

**Das Etikett NICHT auf `echte Daten` lassen, solange es nicht
stimmt.**

**Nichts in `supabase/`** ? **Codex arbeitet an C-489.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
