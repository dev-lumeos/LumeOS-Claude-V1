---
nr: C-501
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: [G-451]
kind_von: C-493
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [goals.progress_photos]
zahlen:
  gemessen: 2026-09-08
---

# C-501 - Seed fuer die leeren Module

## Toms Vorgabe

Tom, 2026-09-08:

> ich will nicht hoeren, was an seeddaten fehlen ? das ist dein
> job, dass die da sind, nicht meiner

> und wenn seeddaten fehlen, dann muss man die halt erstellen
> lassen, sehe da nicht das problem

`[read]` **Er hat recht** ? **C-493 hat es vorgemacht: zehn
Sitzungen, 132 Saetze, idempotent, im Testdatenpfad.**

## Gemessen an dev@lumeos.app

    training.workout_sessions      40    voll
    nutrition.meals               733
    nutrition.meal_items        2.302
    recovery.checkins             170
    recovery.scores               170
    goals.body_measurements       181

    medical.user_medications        1    duenn
    goals.progress_photos           0    LEER

## Zu bauen

**1** ? **`goals.progress_photos`**

`[cmd]` **Die Pose-Session braucht sie** (C-494).

`[read]` **Miss, welche Spalten Pflicht sind, und ob ein Bild
im Bucket liegen muss oder ein Verweis reicht.**

`[read]` **Wenn ein Bild noetig ist: MELDEN, nicht erfinden** ?
**ein Platzhalter im privaten Bucket ist etwas anderes als ein
erfundener Messwert.**

`[cmd]` **C-463 hat die Tabelle gebaut, 13 Spalten, Bucket
privat.**

**2** ? **`medical.user_medications` und was daran haengt**

`[read]` **Ein Eintrag ist zu wenig, um die Oberflaeche zu
pruefen.**

`[cmd]` **`medical` hat 31 Tabellen** ? **miss, welche leer sind
UND eine Oberflaeche haben.**

`[read]` **Eine leere Tabelle ohne Leser braucht keinen
Seed.**

## Die Reihenfolge

`[read]` **Erst G-451 (der Testdatenlauf faellt), dann dieser
Punkt.**

`[cmd]` **`testdaten-einspielen.ts` laeuft transaktional** ?
**ein Fehler in Eintrag 3 verhindert Eintrag 24.**

`[read]` **Ein Seed, der nie durchlaeuft, nuetzt nichts.**

## Was nicht zu tun ist

**Nur `dev@lumeos.app`** ? **`tom.seed` und `test-user`
unveraendert.**

**Idempotent** ? **ein zweiter Lauf aendert nichts.**

**In den TESTDATENPFAD, nicht in die Kette** ? **C-493 hat
gezeigt, warum: der Nutzer existiert in der Kette nicht.**

**KEINEN Messwert erfinden** ? **ein Foto ohne Bild ist
moeglich, ein Koerperumfang ohne Messung nicht.**

## Abnahmebedingungen

    A1  welche medical-Tabellen sind leer UND haben
        einen Leser? TABELLE.
    A2  progress_photos: braucht es ein Bild im
        Bucket? Gemessen.
    A3  je Tabelle die Zeilenzahl vorher/nachher.
    A4  zweiter Lauf aendert nichts.
    A5  tom.seed und test-user unveraendert.
    A6  Sicherung, Vollkette, Punktelauf.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

