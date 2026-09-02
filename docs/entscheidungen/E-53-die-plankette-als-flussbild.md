---
nr: E-53
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-379, E-44, E-40]
modul: nutrition
---

# E-53 — die Plankette als Flussbild

## Entscheidung

Tom, 2026-09-02, zu C-379:

> der kern der frage ist wie werden diese plaene ueberhaupt
> gespeichert und dargestellt? ich denke wir brauchen in der ui eine
> grafische abbildung wie ein flowchart mit editierbaren daten wie
> startdatum etc und das muss auch so in die db. dann koennen wir mit
> planpicker arbeiten.

## Die Frage hinter der Frage

`[read]` **C-379 fragte: Planpicker bauen oder `sequence`
entfernen?** `[read]` **Tom dreht sie um:** **erst muss klar sein,
wie eine Kette gespeichert und gezeigt wird** — **dann ist der
Planpicker nur noch ein Feld darin.**

## Was das Schema schon kann

`[cmd]` **`meal_plans` traegt alles fuer eine Kette:**

    next_plan_id      uuid, FK auf meal_plans(id), ON DELETE SET NULL
    lifecycle_type    text
    start_date        date
    days_count        integer
    rollover_count    integer
    status            text NOT NULL
    is_active         boolean NOT NULL

`[cmd]` **Und zwei CHECKs erzwingen die Kette bereits:**

    meal_plans_sequence_not_self_check
      next_plan_id IS NULL OR next_plan_id <> id

    meal_plans_sequence_target_check
      lifecycle_type = 'sequence'  ->  next_plan_id NOT NULL
      lifecycle_type <> 'sequence' ->  next_plan_id IS NULL

`[read]` **Das Schema laesst also keine halbe Kette zu** — **wer
`sequence` waehlt, muss ein Ziel nennen.** `[cmd]` **Genau deshalb
bietet der Aktivierungsdialog `sequence` heute nicht an** (G-309).

## Was fehlt

**Die Darstellung, und mit ihr der Weg zum Setzen.**

`[read]` **Ein Flussbild:** Plan → Plan → Plan, **mit Startdatum und
Dauer an jedem Kasten, beides editierbar.**

`[read]` **Und Tom sagt: *,,das muss auch so in die db"*** — `[read]`
**also nicht nur eine Zeichnung ueber vorhandenen Feldern, sondern
die Kette als eigenes Gebilde, das man lesen und schreiben kann.**

## Zu klaeren, bevor gebaut wird

`[read]` **Reicht `next_plan_id`?** `[cmd]` **Eine einfach
verkettete Liste kann eine Reihe abbilden** — **aber keine Verzweigung
und keinen gemeinsamen Nachfolger.**

`[read]` **Und was geschieht mit `start_date` in der Kette?**
`[cmd]` **Heute setzt das Aktivieren es** (G-306). `[read]` **In
einer Kette waere das zweite Startdatum das Ende des ersten plus
eins** — **abgeleitet, nicht eingegeben.**

`[read]` **E-44 gilt weiter:** die Meldung beim Ablauf ist die
Ausfuehrung. `[cmd]` **Mit einer Kette waere der Vorschlag dort
konkret** — *,,weiter mit Plan B"* statt *,,waehle einen aus der
Bibliothek"*.

## Was daraus folgt

`[read]` **`sequence` bleibt vorerst nicht waehlbar** — **bis die
Kette gebaut ist, waere es ein Versprechen ohne Ausfuehrung.**

`[cmd]` **Der Aktivierungsdialog nennt heute den Grund** (G-309) —
**das bleibt so, bis das Flussbild steht.**
