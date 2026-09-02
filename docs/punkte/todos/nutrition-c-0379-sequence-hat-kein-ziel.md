---
nr: C-379
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-01
braucht: [C-383]
kind_von: C-377
entscheidung: E-54
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-01
  sequence_plaene: 0
---

# C-379 — `sequence` hat kein Ziel

## Befund

Aus G-306 (Claude Code) und B-20 (Codex), 2026-09-01.

`[cmd]` **`next_plan_id` steht live, mit Ziel- und
Selbstreferenz-Constraint.** `[read]` **Die urspruengliche Aussage
*,,die Spalte fehlt"* war ueberholt.**

`[cmd]` **Aber es gibt keinen Schreiber:**

    beide Web-Schreibschemata     lassen next_plan_id nicht zu
    Aktivierungsdialog            bietet nur once und rollover
    Ablaufbehandlung              behandelt sequence wie once
    live                          0 sequence-Plaene

`[cmd]` **Und im Ablaufdialog teilen sich `once` und `sequence` einen
Knopf** — der Vorschlagssatz unterscheidet sie, der Knopf nicht.

## Der Widerspruch

`[cmd]` **Die Spec fordert automatische Uebergabe an den
Folgeplan.** `[cmd]` **C-373 und E-42 haben entschieden: die Meldung
beim Ablauf ist die Ausfuehrung, der Nutzer waehlt.**

`[read]` **Beide koennen nicht gleichzeitig gelten.**

## Zwei Wege

`[read]` **Automatisch:** beim Ablauf wird `next_plan_id` aktiviert,
ohne Frage. `[read]` **Dann braucht der Aktivierungsdialog einen
Planpicker, und der Nutzer bindet zwei Plaene aneinander.**

`[read]` **Manuell:** der Ablaufdialog nennt den Folgeplan als
Vorschlag, der Nutzer bestaetigt. `[cmd]` **Das ist der heutige
Stand, nur ohne die Spalte zu nutzen.**

`[read]` **Der zweite passt zu E-42** — *,,das obliegt dem User und
seiner Verantwortung"*. `[read]` **Der erste ist das, was *sequence*
verspricht.**

## Solange nichts entschieden ist

`[read]` **`sequence` ist waehlbar und tut dasselbe wie `once`.**
`[cmd]` **Bei 0 Plaenen faellt das niemandem auf** — **aber es ist
ein Versprechen ohne Ausfuehrung, wie *Next restart* und *Copy
week*.**

## Entschieden: E-53, 2026-09-02

Tom dreht die Frage um: *,,der kern der frage ist wie werden diese
plaene ueberhaupt gespeichert und dargestellt? wir brauchen ein
flowchart mit editierbaren daten wie startdatum etc und das muss auch
so in die db. dann koennen wir mit planpicker arbeiten."*

`[read]` **Nicht *Planpicker bauen oder `sequence` entfernen*, sondern
*erst die Kette, dann der Picker als Feld darin*.**

### Das Schema kann es bereits

`[cmd]` **Zwei CHECKs erzwingen die Kette:**

    sequence_not_self_check     next_plan_id <> id
    sequence_target_check       lifecycle_type = 'sequence'
                                -> next_plan_id NOT NULL

`[read]` **Das Schema laesst keine halbe Kette zu** — **wer
`sequence` waehlt, muss ein Ziel nennen.** `[cmd]` **Genau deshalb
bietet der Dialog es heute nicht an.**

### Zwei Fragen vor dem Bau

`[read]` **Reicht `next_plan_id`?** `[cmd]` **Eine einfach verkettete
Liste bildet eine Reihe ab** — **keine Verzweigung, keinen
gemeinsamen Nachfolger.**

`[read]` **Und was geschieht mit `start_date` in der Kette?**
`[cmd]` **Heute setzt das Aktivieren es.** `[read]` **In einer Kette
waere das zweite Startdatum abgeleitet, nicht eingegeben.**

`[read]` **Bis dahin bleibt `sequence` nicht waehlbar, mit Grund an
der Kachel.**

## Weitergedacht: E-54, 2026-09-02

Tom: *,,das kann ein komplettes jahr sein mit allen phasen parallel
zu training/supplement etc. also ja das spricht fuer eigene
ausbaubare tables."*

`[read]` **Damit faellt `next_plan_id` als Traeger** — **eine
verkettete Liste bildet eine Reihe ab, kein Jahr mit mehreren
Spuren.**

`[cmd]` **Und das Muster gibt es schon zweimal:**
`goals.goal_phases` (5 Zeilen) und
`supplements.user_supplement_cycles`.

`[read]` **Bevor eine dritte Fassung entsteht, wird gemessen** —
**C-383.**

`[read]` **Die Frage waere dann nicht *welcher Plan folgt auf
welchen*, sondern *welcher Plan gilt in dieser Phase*** — **und die
Kette entsteht aus der Zeitachse, nicht umgekehrt.**
