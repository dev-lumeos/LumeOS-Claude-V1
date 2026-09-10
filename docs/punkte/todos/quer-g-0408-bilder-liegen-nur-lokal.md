---
nr: G-408
typ: befund
modul: quer
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-407
entscheidung: null
beruehrt:
  dateien:
    - .gitignore
zahlen:
  gemessen: 2026-09-08
  bilder: 11
---

# G-408 — Bildschirmfotos liegen nur lokal

## Befund

Aus G-407, Claude Code, 2026-09-08:

> *,,`docs/bilder/` steht in `.gitignore` ? die elf Fotos liegen
> nur lokal."*

`[cmd]` **Nachgemessen: elf Bilder in `docs/bilder/g407/`, keines
im Git.**

`[read]` **Wer den Punkt in einem Monat liest, findet den Text und
keine Bilder.**

`[cmd]` **Dasselbe gilt fuer `g398`, `g405` und alle
`backup/*.png`.**

## Die Entscheidung

**a** ? **`docs/bilder/` aus `.gitignore` nehmen.**

`[cmd]` **Elf Bilder sind 2,3 MB** ? **je Abnahme kommen mehr
dazu.**

`[read]` **Der Pre-Commit-Haken lehnt Dateien ueber 10 MB ab** ?
**einzelne Bilder passen, die Summe waechst.**

**b** ? **Nur die Bilder aufnehmen, die zu einer ABNAHME
gehoeren.**

`[read]` **Ein Nachweis gehoert zum Punkt, ein Zwischenstand
nicht.**

**c** ? **So lassen und im Bericht beschreiben, was zu sehen
war.**

`[read]` **Dann ist der Text der Nachweis** ? **und der ist
schwaecher als ein Bild** (G-400: der Orchestrator hat Karten
gezaehlt und nie hingesehen).
