---
nr: G-374
typ: feature
modul: supplements
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-373
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-374 — Zyklen brauchen eine eigene Eingabe

## Befund

Aus G-373, Claude Code, 2026-09-08:

> *,,Zyklen (`{on_weeks, off_weeks}`) sind ein Objekt und brauchen
> eine eigene Eingabe."*

`[read]` **Gemeldet, nicht halb gebaut** — **und die Kachel sagt es
an der Stelle.**

## Was es ist

`[cmd]` **Ashwagandha 8 Wochen an, 2 Wochen aus** — **das steht im
Mockup als `Active cycles`.**

`[read]` **Zwei Zahlen, aber sie gehoeren zusammen** — **eine
Woche-an ohne Woche-aus ist kein Zyklus.**

## Zu klaeren

`[read]` **Wo beginnt der Zyklus?** `[read]` **Das Mockup zeigt
*Wk 5 of 8*** — **also braucht es ein Startdatum, nicht nur die
beiden Zahlen.**

`[cmd]` **`stack_items` traegt 17 Spalten** — **zu messen, ob eine
davon den Beginn haelt.**

## Auftrag

**Mitbeauftragt mit G-152 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.
