---
nr: E-31
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-261, G-250]
modul: nutrition
---

# E-31 — zwei Wahrheiten messen statt anbinden

## Frage

`[cmd]` **Die Ordnung bildet ihren Status aus
`goals.nutrition_targets`, die vier Zustaende stammen aus
`daily_reference_assessment`.** **Sollen beide Achsen sichtbar
werden?**

## Entscheidung

Tom, 2026-08-29, auf Vorschlag: **nicht anbinden, aber messbar
halten.**

## Warum nicht anbinden

`[cmd]` **`goals.nutrition_targets` hat sechs Naehrstoffspalten:**
`kcal`, `protein_g`, `carbs_g`, `fat_g`, `linoleic_acid_g`,
`alpha_linolenic_acid_g`.

`[cmd]` **Drei davon tragen beide Achsen, und genau eine geht
auseinander:** `F18:3CN3` ist gegen das persoenliche Ziel gedeckt
(85,7 %) und gegen EFSA zu wenig (51,6 %).

`[read]` **Nach dem G-218-Massstab ist das *selten*.** `[cmd]` **Dort
waren es 23 Regeln, die auseinandergingen — hier ist es eine.**

`[read]` **Eine zweite Achse in jeder Zeile fuer einen einzigen Fall
macht 138 Zeilen schwerer lesbar.** **Und der Vermerk steht bereits
in der Kopfzeile.**

## Warum nicht loeschen

`[read]` **Sobald mehr persoenliche Ziele gesetzt werden, waechst die
Zahl der Abweichungen** — **und dann faellt es niemandem auf, weil
niemand hinsieht.**

`[cmd]` **Die Vergleichsfunktionen bleiben gebaut und getestet**, an
nichts gehaengt.

## Der Waechter

`[cmd]` **`tools/zwei-wahrheiten-pruefen.mjs`**, im Gate.

**Er zaehlt bei jedem Lauf die Naehrstoffspalten in
`goals.nutrition_targets`.** `[cmd]` **Sollstand 6.** **Kommt eine
dazu, faellt das Gate** — mit dem Verweis auf G-261 und den
G-218-Massstab.

`[read]` **Er misst die Wirkung, nicht das Wort:** er zaehlt Spalten
in der Datenbank, nicht Vorkommen im Quelltext. `[cmd]` **Gegenprobe
belegt: mit einer zusaetzlichen Spalte wird er rot, ohne gruen.**

`[read]` **Derselbe Bau wie `sammelfragen-pruefen.mjs`** — bekannte
Faelle als Sollstand, ein neuer macht rot.

## Was daraus folgt

`[read]` **G-261 ist damit nicht entschieden, sondern
zurueckgestellt** — **und die Zurueckstellung hat ein Ablaufdatum,
das sich selbst meldet.**
