---
nr: C-216
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [backup, tools/encoding-pruefen.mjs]
zahlen:
  gemessen: 2026-08-28
  backup_eintraege: 11420
  backup_mb: 5747
  getrackt: 756
  getrackt_mb: 132
  sicherungsdateien: 37
  sicherungen_mb: 394
---

# C-216 — `backup/` waechst ungebremst

## Der urspruengliche Blocker ist weg

`[cmd]` **Gemessen 2026-08-28:** `backup/c192/final-nachweis.json` und
`-finaldb.json` tragen **null Doppelkodierungsmarken und kein CRLF.**
`[cmd]` **Encoding-Pruefung heute mehrfach gruen** ueber 20.500
Dateien.

`[read]` **Damit blockiert nichts mehr.** Die Ursache war ein
Kettenlauf, dessen Ausgabe durch eine Windows-Konsole lief.

## Der Nebenbefund ist eingetreten

`[read]` **Der Punkt sagte am 22.08.:** *,,Jeder Wegwerf-Lauf legt eine
Sicherung an. Bei diesem Tempo sammeln sich hundert je Woche."*

`[cmd]` **Sechs Tage spaeter:**

    backup/ gesamt        11.420 Eintraege, 5.747 MB
    davon getrackt           756 Eintraege,   132 MB
    Sicherungsdateien         37 Stueck,      394 MB

`[cmd]` **Die groessten getrackten sind Datenbanksicherungen** —
`training-vor-plural-merge.sql`, `training-vor-105.sql`,
`training-vor-103-104.sql`, je 2,2 MB, dazu Schema-Abzuege aus C-235
und C-255.

`[read]` **5,6 GB liegen ungetrackt auf der Platte** — Wegwerf-Abzuege
aus jedem Kettenlauf, die niemand mehr braucht, aber auch niemand
loescht.

## Zwei Dinge, die zu klaeren sind

**Wie lange bleibt eine Vollsicherung liegen?** `[read]` Die Regel
*,,Vollsicherung vor jedem Live-Eingriff"* ist richtig — **eine Regel,
wann sie wieder verschwindet, gibt es nicht.**

**Und die Schreibregel aus dem urspruenglichen Befund steht noch
aus:** `[read]` Agenten schreiben Nachweisdateien mit
`encoding="utf-8", newline="\n"`. **`CLAUDE.md` sagt das fuer
Quelldateien; fuer `backup/` galt es offenbar als nicht gemeint.**

`[read]` **Kein untracktes Verzeichnis wird dem Namen nach
geloescht** — die Regel gilt. **Was weg kann, muss einzeln benannt
werden.**

## Auftrag

**Mitbeauftragt mit C-219 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: 11.606 Dateien, 5,959 GiB.

`[cmd]` **Aktuelle Schreibzugriffe vorhanden** — G-329, G-331, G-332
haben ihre Nachweise dort.

`[read]` **Vorgeschlagen: ein spaeterer Manifest- und
Archivierungslauf, keine Loeschung** — **A-39 haelt.**

`[read]` **Sechs Gigabyte in einem Verzeichnis, das nicht geraeumt
werden darf, solange Agenten laufen.**
