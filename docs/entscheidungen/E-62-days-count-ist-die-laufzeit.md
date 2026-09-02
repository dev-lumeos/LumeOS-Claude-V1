---
nr: E-62
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-400, E-44, E-59]
modul: nutrition
---

# E-62 — `days_count` ist die Laufzeit

## Entscheidung

Tom, 2026-09-02, zu C-400.

**`days_count` sagt, wie lange ein Plan laeuft** — **nicht, wie
viele Tage er beschreibt.**

## Der Befund

`[cmd]` **Gemessen auf `dev@lumeos.app`:**

    Aufbau-Wochenplan   days_count 21, 3 Wochen, 84 Eintraege
    Cut 4-Meal 2200     days_count 28, 1 Woche,  28 Eintraege
    Lean bulk 3100      days_count 84, 1 Woche,  28 Eintraege
    Buddy auto-plan     days_count  7, 1 Woche,  29 Eintraege

`[read]` **Beim Aufbau-Wochenplan stimmt es:** 3 Wochen mal 7 Tage =
21.

`[read]` **Bei Cut und Lean nicht:** **die Zahl beschreibt eine
Laufzeit, die Wochen fehlen.**

## Was gilt

`[read]` **Ein Plan mit `days_count 28` und einer Woche wiederholt
diese Woche viermal** — **er ist nicht falsch, er ist unvollstaendig
gespeichert.**

`[cmd]` **E-44 kennt drei Lebenszyklen:** `once`, `rollover`,
`sequence`.

`[read]` **`rollover` ist genau dieser Fall:** **eine Woche, mehrfach
durchlaufen.** `[read]` **Und dann ist `days_count` die Gesamtdauer,
nicht die Zahl der beschriebenen Tage.**

## Was daraus folgt

`[read]` **Zu messen, nicht anzunehmen:** **tragen Cut und Lean
`lifecycle_type = 'rollover'`?**

`[read]` **Wenn ja, ist nichts falsch** — **die Anzeige muss nur
sagen, dass eine Woche wiederholt wird.**

`[read]` **Wenn nein, fehlen die Wochen** — **und der Seed ist
unvollstaendig.**

## Und der Probe-Eintrag ist freigegeben

Tom, 2026-09-02: **Loeschfreigabe erteilt.**

`[cmd]` **`Buddy auto-plan` traegt 29 statt 28 Eintraege** — **der
einzelne Probe-Eintrag am 02.09.**

`[cmd]` **Er stammt vom Orchestrator**, beim Fuellen der Plaene
entstanden.

`[read]` **Codex darf ihn entfernen** — **und der C-380-Test wird
damit gruen.**
