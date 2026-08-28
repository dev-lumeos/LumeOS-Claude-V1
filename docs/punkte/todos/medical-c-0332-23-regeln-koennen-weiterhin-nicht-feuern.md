---
nr: C-332
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: C-313
entscheidung: null
beruehrt:
  tabellen: [supplements.rule_catalog]
zahlen:
  gemessen: 2026-08-28
  unsupported_operator: 23
  davon_high: 2
  davon_medium: 6
  davon_low: 15
---

# C-332 — 23 Regeln koennen weiterhin nicht feuern

## Befund

`[cmd]` **Nach C-313 Weg 2 gemessen:**

    unsupported_operator    23
      davon high             2   wr_lab_biotin, wr_lab_vitc_glucose
      davon medium           6
      davon low             15

`[read]` **Die zwei `high` brauchen keine Operatoren, sondern
Eingabemodelle** — deshalb hat Codex `lab_above` bewusst nicht
breiter gebaut.

`[cmd]` **`wr_lab_biotin` ist die Regel gegen Biotin-Interferenz bei
Troponin- und TSH-Messungen** — ein bekannter Grund fuer
Fehldiagnosen.

`[read]` **Sie fallen nicht mehr still aus** (C-313b), aber sie fallen
aus.

## Was zuerst zu klaeren ist

`[read]` **Nicht: welcher Operator fehlt. Sondern: welche Eingabe
fehlt.** `[read]` **Bei `wr_lab_biotin` waere die Frage, ob ein
Laborwert samt Messzeitpunkt und eine Supplementeinnahme in derselben
Zeitspanne ueberhaupt zusammengefuehrt werden koennen** — das ist ein
Datenmodell, kein Operator.

`[read]` **Die 21 `medium` und `low` erst danach.** Ein Operator, der
eine `low`-Regel freischaltet, ist Arbeit ohne Wirkung, solange zwei
`high` blockiert sind.
