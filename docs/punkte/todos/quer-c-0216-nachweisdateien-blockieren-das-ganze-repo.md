---
nr: C-216
typ: blocker
modul: quer
schwere: hoch
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["backup/c192/final-nachweis.json", "tools/encoding-pruefen.mjs", "CLAUDE.md"]
zahlen: null
---

# C-216 - Nachweisdateien blockieren das ganze Repo

## Befund

(neu
  2026-08-22).

  `[cmd]` **`backup/c192/final-nachweis.json` und
  `-finaldb.json` waren doppelt kodiert** — je sechsmal die
  Doppelkodierungsmarke (U+00E2 U+20AC), dazu
  CRLF. Ausgabe eines Kettenlaufs durch eine Windows-Konsole.

  `[cmd]` **Das hat jeden Commit im Repo blockiert**, auch die, die
  diese Dateien nicht anfassten: `encoding-pruefen.mjs` laeuft als
  erster Gate-Schritt ueber alle 10.661 Dateien.

  `[cmd]` Zurueckgedreht (`cp1252` → `utf-8`), mit zwei Gegenproben:
  bleibt gueltiges JSON, keine Marken uebrig. Encoding-Pruefung danach
  Exit 0.

  **Zu bauen:** Agenten schreiben Nachweisdateien mit
  `encoding="utf-8", newline="\n"`. `[read]` Die Regel steht in
  `CLAUDE.md` fuer Quelldateien — fuer `backup/` galt sie offenbar als
  nicht gemeint.

  `[cmd]` **Nebenbefund:** fuenf `*_c192_vor_schema.sql` aus 14 Minuten
  (09:05–09:19). Jeder Wegwerf-Lauf legt eine Sicherung an. Bei diesem
  Tempo sammeln sich hundert je Woche.
