---
nr: G-350
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-345
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: dd20f24c
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/rezepte-echt.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-350 — ein zweiter Schreibweg fuer `is_checked`

## Befund

Aus G-345, Claude Code, 2026-09-07, selbst gemeldet.

`[cmd]` **`rezepte-echt.tsx` traegt seit G-289 einen eigenen
Schreibweg fuer `is_checked`.**

`[cmd]` **G-345 hat eine Serveraktion gebaut** — **jetzt gibt es
zwei.**

`[read]` **Dasselbe Muster wie bei den Namenslisten (G-335):**
**zwei Wege auf dieselbe Spalte laufen frueher oder spaeter
auseinander.**

## Zu tun

`[read]` **Der alte Weg zieht auf die Serveraktion um** — **damit es
wieder einen gibt.**

## Auftrag

**Mitbeauftragt mit G-348 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-07, mit G-348 abgenommen: ein Schreibweg.**

`[cmd]` **Route, Funktion und Schema entfernt** — **nicht nur der
Aufruf.**

`[read]` **Mehr als beauftragt** — **ich schrieb *der alte zieht
um*, er hat ihn abgebaut.**

`[read]` **Ein Weg, der nur nicht mehr gerufen wird, ist weiter
da.**
