---
nr: G-256
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-241
entscheidung: E-26
beruehrt:
  tabellen: [medical.lab_reports]
zahlen: null
---

# G-256 — die Originaldatei zum Laborbericht

## Befund

**Aus E-26.** Tom: *,,seine original pdf/fotos/etc von labresults
verfuegbar hat und nicht nur eingelesen"*.

`[cmd]` **`medical.lab_reports` traegt bereits `file_ref`** — die
Spalte fuer die Originaldatei existiert. `[cmd]` Dazu `lab_name`,
`title`, `source`, `source_detail`, `report_date`.

`[read]` **Was fehlt, ist der Ablageort und die Ansicht.** `[read]`
**Heute liest der Import einen Befund aus, und das Original ist
danach nirgends** — wer seinem Arzt den Befund zeigen will, hat nur
unsere Auslesung.

## Beruehrt E-19 und E-20

`[read]` **Dieselbe Frage wie bei MealCam:** wo liegen Dateien, wer
darf sie sehen, was passiert bei Widerruf.

`[cmd]` **Und E-12 haelt Medical-Daten in der Entwicklungsphase als
Klartext.** `[read]` **Ein hochgeladener Arztbericht ist eine andere
Klasse als ein ausgelesener Laborwert** — er traegt Name, Diagnose
und Briefkopf.
