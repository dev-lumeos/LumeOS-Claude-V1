---
nr: G-257
typ: feature
modul: medical
schwere: niedrig
angelegt: 2026-08-29
braucht: []
kind_von: G-241
entscheidung: E-26
beruehrt:
  tabellen: [medical.lab_reports]
zahlen: null
---

# G-257 — Termine verwalten

## Befund

**Aus E-26.** Tom: *,,seine arzttermine, lab termine, etc in der
plattform verwalten kann"*.

`[cmd]` **Kein Gegenstueck im Schema** — das ist neu zu bauen, nicht
anzubinden.

## Vor dem Bauen zu klaeren

`[read]` **Ein Termin ist trivial zu speichern und schwer nuetzlich
zu machen.** `[read]` **Die Frage ist, was er kann muss:** nur
notieren, oder erinnern? **Und wenn erinnern — ueber welchen Weg?**

`[read]` **Und ob er mit etwas verbunden ist:** ein Labortermin, aus
dem spaeter ein Befund wird, koennte an `lab_reports` haengen.
**Dann waere er mehr als ein Kalendereintrag.**
