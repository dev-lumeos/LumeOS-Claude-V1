---
nr: G-418
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-417
entscheidung: null
beruehrt:
  tabellen: [nutrition.daily_summary]
zahlen:
  gemessen: 2026-09-08
---

# G-418 — Seed-Tage liegen in der Zukunft

## Befund

Aus G-417, Claude Code, 2026-09-08:

> *,,Die juengste Zeile in `nutrition.daily_summary` fuer `dev`
> ist der 2026-11-16 ? zwei Monate in der Zukunft."*

`[read]` **Wer ueber *,,den letzten Tag"* misst, trifft einen
Tag, den es noch nicht gibt.**

## Warum es heute folgenlos ist

`[read]` **Die Kacheln rechnen ueber Fenster** ? **30 Tage
rueckwaerts ab heute.**

`[cmd]` **Ein Tag in der Zukunft faellt heraus.**

## Wo es zuschlaegt

`[read]` **Jede Abfrage mit `order by tag desc limit 1`.**

`[cmd]` **Und jede Pruefung, die *,,der letzte Eintrag"* sagt** ?
**die Diary-Kachel zeigt `letzter_eintrag`.**

`[read]` **Messen, wie viele Stellen das sind.**

## Was zu entscheiden ist

**a** ? **Die Seed-Daten enden heute.**

`[read]` **Dann ist *,,der letzte Tag"* immer echt.**

**b** ? **Sie bleiben, und jede Abfrage filtert `<= current_date`.**

`[read]` **Verlaesst sich darauf, dass niemand es vergisst.**

**c** ? **Ein Waechter.**

`[cmd]` **`tools/` hat schon `new Date()`-Waechter** ? **dieselbe
Bauform: kein `tag` in der Zukunft.**
