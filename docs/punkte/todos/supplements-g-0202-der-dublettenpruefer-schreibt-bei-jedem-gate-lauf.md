---
nr: G-202
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/supplement-kern-dubletten-pruefen.mjs", "backup/c276/supplement-kern-dubletten.json"]
zahlen: null
---

# G-202 - der Dublettenpruefer schreibt bei jedem Gate-Lauf

## Befund

(neu 2026-08-27).

  `[cmd]` **`tools/supplement-kern-dubletten-pruefen.mjs` schreibt
  `backup/c276/supplement-kern-dubletten.json` bei jedem Lauf neu** —
  nur `checked_at` aendert sich, der Inhalt bleibt (412 / 0 / 4
  Gruppen). **Damit erzeugt jeder Commit eine geaenderte Datei im
  Arbeitsverzeichnis**, weil der Pre-Commit-Hook das Gate faehrt.

  `[read]` **Das ist Rauschen, das jeden `git status` verunreinigt** —
  und ein Nachweis, der bei jedem Lauf einen neuen Stichtag traegt,
  belegt nicht mehr, wann er erhoben wurde.

  **Zu tun:** entweder nur bei Aenderung schreiben, oder nur mit
  ausdruecklichem Schalter — nicht bei jedem Gate.
