---
nr: G-376
typ: feature
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-431
entscheidung: E-74
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  tabellen: 3
---

# G-376 — die Medical-Oberflaeche fuer Dokumente

## Befund

`[cmd]` **Seit C-431 steht das Schema live:**

    medical.health_events     13 Sp, 3 Zeilen
    medical.health_timeline   12 Sp, 4 Zeilen
    medical.appointments      12 Sp, 1 Zeile
    Bucket medical-originals  privat, 1 Objekt

`[cmd]` **Und die Oberflaeche kennt nichts davon.**

`[read]` **Neunter Fall von A-71** — **der Leseweg steht, niemand
ruft ihn.**

## Was E-74 verlangt

Tom, 2026-09-08: *,,dessen inhalt mit herkunft bei fragen des users
wiedergeben."*

`[read]` **Jede Zeile zeigt, woher sie kommt** — **wer, wann, und
ob ein Dokument dahinterliegt.**

`[read]` **LumeOS sagt nicht *,,du hast X"*, sondern *,,Dr. Y hat am
Z. X festgestellt"*.**

## Was zu bauen ist

    Dokumente     hochladen, ansehen, dem Befund zuordnen
    Termine       anlegen, aendern, absagen
    Ereignisse    Diagnose, Behandlung, Operation erfassen
    Zeitachse     alles in einer Abfolge

`[cmd]` **G-256 wartet darauf** — **die zwei Entscheidungen sind
mit E-75 gefallen.**

## Zu lesen

`[cmd]` **`00-QUELLEN.md`, Abschnitt medical** — **15 Dateien.**

`[cmd]` **Und `E-26`** — **Tom hat beide Reiter begruendet, bevor
sie gebaut wurden.**

`[read]` **Der History-Reiter aus dem Mockup ist der Ort fuer die
Zeitachse** — **C-429 hat gemessen, dass er weder Reiter noch
Tabelle hatte.**
