---
nr: G-439
typ: fehler
modul: nutrition
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: C-464
entscheidung: null
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen:
  gemessen: 2026-09-08
---

# G-439 — der Sollstand kennt fiber_g nicht

## Befund

Aus C-485, Codex, 2026-09-08:

> *,,`pnpm gate` bleibt an der unabhaengigen G-261-Abweichung rot:
> `goals.nutrition_targets` hat 7 statt 6 Sollspalten. Nicht von
> C-485 veraendert."*

`[cmd]` **Gemessen:** **15 Spalten, darunter `fiber_g`,
`linoleic_acid_g`, `alpha_linolenic_acid_g`.**

`[cmd]` **C-464 hat `fiber_g` HEUTE gebaut** ? **abgenommen,
30 g Ziel, 5 Nutzer.**

`[read]` **Der Sollstand wurde nicht nachgezogen.**

## Und die Regel gilt

Tom, 2026-09-08:

> wenn ein waechter gebraucht wird, dass der sauber laeuft und den
> auftrag damit abschliesst

`[cmd]` **C-464 hat `fiber_g` gebaut und den Waechter rot
gelassen** ? **genau der Fall, den die Regel verbietet.**

`[read]` **Der Punkt ist klein, die Lehre nicht.**

## Was zu tun ist

`[read]` **Den Sollstand auf 7 setzen** ? **oder messen, welche
Zahl richtig ist.**

`[cmd]` **`linoleic_acid_g` und `alpha_linolenic_acid_g` kamen
aus einem fruehen Punkt** ? **miss, ob sie im Sollstand stehen.**

`[read]` **Und dann ist `pnpm gate` gruen** ? **das ist der
Zweck.**
