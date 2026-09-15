---
nr: G-450
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-493
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-450 — der Tageswechsler aendert das Datum, nicht die Rechnung

## Befund

Aus C-493, Codex, 2026-09-08:

> *,,Der Tageswechsler aendert das Datum, aber nicht die
Kartenberechnung; die Bizepsfarbe bleibt gleich. Das ist ein
Lesepfadproblem in `apps/`."*

`[cmd]` **Sieben Bildschirmfotos liegen vor:** `x-c493-tag-1`,
`-3`, `-7`, `-13`, `x-c493-dev-tag-8`, `-12`, `-13`.

`[read]` **Die Kopfzeile aendert sich, die Muskelwerte nicht.**

## Warum das zaehlt

Tom, 2026-09-08: *,,wir koennen ja dayswitcher oben nutzen und
schauen, was sich aendert."*

`[read]` **Das war die PRUEFUNG** ? **ob die Erholung ueber die
Zeit stimmt.**

`[read]` **Solange der Wechsler nicht rechnet, ist sie nicht
pruefbar.**

## Was zu messen ist

`[cmd]` **`base(hours)` = Stunden seit der letzten Belastung** ?
**gegen WELCHEN Zeitpunkt?**

`[read]` **Heute vermutlich gegen `Date.now()`** ? **statt gegen
den gewaehlten Tag.**

`[cmd]` **Miss, wo der gewaehlte Tag steht und wo er in die
Rechnung muesste.**

## Die Gegenprobe ist eingebaut

`[read]` **Ein Muskel, der an Tag 1 rot ist, muss an Tag 7
gelb und an Tag 13 gruen sein** ? **oder er hat zwischendurch
einen neuen Reiz bekommen.**

`[cmd]` **C-493 hat Sitzungen mit Abstaenden von 1, 2, 3 und
7 Tagen gebaut** ? **die Daten liegen vor.**

