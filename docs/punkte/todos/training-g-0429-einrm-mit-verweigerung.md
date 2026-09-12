---
nr: G-429
typ: befund
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [training.workout_sets]
zahlen:
  gemessen: 2026-09-08
  mit_wert: 234
---

# G-429 — wer rechnet estimated_1rm, und verweigert er?

## Befund

`[cmd]` **`training.workout_sets.estimated_1rm`: 234 von 258
Zeilen haben einen Wert.**

`[cmd]` **Es gibt KEINE Funktion in `training`, die ihn
rechnet.**

`[read]` **Also rechnet ihn die Oberflaeche oder ein Seed** ?
**miss, welches.**

## Was das Fremdprojekt macht

`[cmd]` **Due Diligence openGym, Abschnitt 07:**

    Formeln    Epley (Default), Brzycki, Lombardi
    bei 1 Rep  das TATSAECHLICHE Gewicht
    ueber 12   VERWEIGERT

`[read]` **Die Verweigerung ist der Punkt.**

`[read]` **Ueber zwoelf Wiederholungen wird jede 1RM-Formel
unzuverlaessig** ? **statt eine Zahl zu liefern, liefert das
Projekt keine.**

`[cmd]` **Dasselbe Muster wie Codex heute dreimal** (C-462,
C-463, C-469) ? **lieber eine Luecke als eine falsche Zahl.**

## Was zu messen ist

**1** ? **Welche Formel rechnet LumeOS heute?**

**2** ? **Verweigert sie ueber 12 Reps?**

`[cmd]` **Miss, ob Zeilen mit `reps > 12` einen
`estimated_1rm` tragen.**

**3** ? **Und die 24 ohne Wert** ? **warum fehlen sie?**

`[read]` **Wenn es die Verweigerung ist: gut.** `[read]` **Wenn
es ein Fehler ist: benennen.**

## Und die Sonderfaelle

`[cmd]` **Das Fremdprojekt nennt:**

    unilaterale Uebungen erhoehen Reps pro Seite
    Deload-/Reha-Routinen aus der Progression ausschliessbar
    Drop-Sets und Rest-Pause volumenwirksam abgebildet

`[cmd]` **LumeOS hat `set_type` mit `dropset` und `failure`** ?
**miss, ob sie in `volume_kg` anders zaehlen.**
