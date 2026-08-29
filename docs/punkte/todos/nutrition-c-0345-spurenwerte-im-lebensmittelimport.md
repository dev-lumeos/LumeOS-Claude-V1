---
nr: C-345
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-08-29
braucht: []
kind_von: C-343
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-29
  quelle_zahlen: 871311
  db_zeilen: 869501
  quelle_spuren: 1800
---

# C-345 — Spurenwerte im Lebensmittelimport

## Befund

`[cmd]` **`BLS_4_0_Daten_2025_DE.xlsx` traegt 871.311 numerische
Werte, `nutrition.food_nutrients` 869.501 Zeilen.**

`[cmd]` **Und die Quelle fuehrt genau 1.800 Werte mit der
Datenherkunft *Spuren*.**

`[read]` **Ob die Spurenwerte bewusst weggelassen wurden, ist offen.**
**Die Antwort steht im Kettenschritt, der `food_nutrients`
befuellt** — nicht in der Quelldatei.

## Kein Auftrag

`[read]` **1.800 von 871.311 sind zwei Promille**, und *Spuren* heisst
laut BLS-Dokumentation ausdruecklich, dass kein gemessener Wert
vorliegt. **Wer den Punkt aufgreift, sieht zuerst im Kettenschritt
nach, ob es eine Entscheidung war.**
