---
nr: C-464
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-415
entscheidung: E-80
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen:
  gemessen: 2026-09-08
---

# C-464 — das Ballaststoffziel fehlt

## Befund

`[cmd]` **`nutrition.daily_summary` traegt `fibt` und
`fibt_missing`** ? **der gemessene Wert ist da.**

`[cmd]` **`goals.nutrition_targets` hat:**

    kcal, protein_g, carbs_g, fat_g,
    linoleic_acid_g, alpha_linolenic_acid_g

`[read]` **Kein `fiber_g`.**

`[cmd]` **Deshalb rechnet der Nutrition-Score 0.85 von 1.00**
(G-412) ? **der Anteil `fiber 0.15` hat keinen Bezugswert.**

## Was zu messen ist

`[cmd]` **Wie werden `linoleic_acid_g` und
`alpha_linolenic_acid_g` gefuellt?**

`[read]` **Von Hand, aus einer Formel, oder aus einem
Referenzwert?**

`[read]` **Die Antwort sagt, wie `fiber_g` gefuellt wird** ?
**dieselbe Bauform.**

`[cmd]` **Und `zielwerte-read`** (die Kachel liest darueber) ?
**messen, ob es die neue Spalte mitnimmt.**

## Was die Spec sagt

`[cmd]` **`docs/specs/Nutrition/` nachsehen** ? **nennt sie einen
Ballaststoffwert?**

`[read]` **Wenn nicht: die DGE nennt 30 g/Tag fuer Erwachsene** ?
**eine feste Zahl, keine Rechnung aus dem Gewicht.**

`[read]` **Aber das ist eine Entscheidung, keine Messung** ?
**melden, nicht setzen.**

## Und E-80 ist entschieden

`[cmd]` **Die vier Faktoren stehen:** `beginner 0.75`,
`advanced 0.90`, `pro 1.00`, `elite 1.10`.

`[read]` **Sie sind eine Rechenregel, keine Nutzereinstellung** ?
**sie gehoeren in den Code.**

`[read]` **Miss, ob `packages/scoring/` der richtige Ort ist**
(`SPEC_09_SCORING.md` legt Coach-Formeln dorthin) ? **oder ob
eine Tabelle im Modul reicht.**

## Auftrag

**Beauftragt am 2026-09-08, als Teil der Kette C-464 -> C-452 ->
C-460.**

`[read]` **Erster von drei: C-464 -> C-465 -> C-460.**

`[read]` **Je Auftrag Sicherung, Vollkette, Punktelauf, eigener
Bericht.** `[read]` **Scheitert einer: STOP.**