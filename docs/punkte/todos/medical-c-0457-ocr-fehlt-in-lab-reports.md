---
nr: C-457
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-171
entscheidung: null
beruehrt:
  tabellen: [medical.lab_reports]
zahlen:
  gemessen: 2026-09-08
  felder: 6
---

# C-457 — OCR fehlt in `lab_reports`

## Befund

Aus C-171, Codex, 2026-09-08.

`[cmd]` **`SPEC_02:144` und `SPEC_07:125`: OCR gehoert in
`lab_reports`** ? `ocr_status`, **Rohresultat, extrahierte
Werte.**

`[cmd]` **Live fehlen sechs Felder, jede OCR-Relation und
-Funktion, und es gibt 0 OCR-Zeilen.**

`[cmd]` **Der Bucket `medical-originals` hat ein Original**
(C-429).

## Was dazugehoert

`[read]` **Codex' Nachsatz aus C-171:**

> *,,Der Einheitenpfad bewahrt Einheiten, erfuellt aber keine echte
> UNIT_CONVERSIONS-Normalisierung. Das gehoert ? falls OCR gebaut
> wird ? in dessen eigenen Importauftrag."*

`[cmd]` **280 Laborwerte tragen `unit_snapshot`** ? **ein
Snapshot ist keine Umrechnung.**

`[read]` **Wer einen Befund einliest, bekommt Werte in fremden
Einheiten** ? **ohne Normalisierung sind sie nicht
vergleichbar.**

## Warum es wartet

`[read]` **OCR ist ein Importweg, kein Grundbaustein** ? **die
Ablage steht (C-429/C-431), das Einlesen kann folgen.**
