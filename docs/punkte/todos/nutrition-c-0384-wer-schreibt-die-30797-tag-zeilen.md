---
nr: C-384
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-229
entscheidung: E-55
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-02
  zeilen: 30797
---

# C-384 — wer schreibt die 30.797 Tag-Zeilen?

## Befund

Aus E-55, 2026-09-02.

`[cmd]` **`nutrition.food_tags` traegt 30.797 Zeilen.**

`[cmd]` **`auto_tag_food` existiert nicht** — Codex hat es in C-366
gemessen, **`SPEC_06` nennt es als Trigger.**

`[read]` **Wer die Zeilen heute schreibt, ist ungemessen:** der
Import, ein Kettenschritt, oder etwas Drittes.

## Warum es vor E-55 gemessen wird

`[read]` **E-55 entscheidet: Kuration in einer zweiten Tabelle,
`food_tags_kuriert`.**

`[read]` **Sie schuetzt vor einem Schreiber** — **und wenn der
falsche gemeint ist, laeuft der echte weiter.**

`[cmd]` **Codex hat gemessen: der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung.** `[read]` **Zwoelf von vierzehn** —
**welche zwei nicht, und warum?**

## Zu messen

    wer schreibt         Import, Kettenschritt, Trigger?
    wann                 bei jedem Lauf, oder einmalig?
    die zwei Ausnahmen   welche Tag-Codes fasst der Import nicht an
    E-22                 vierzehn Definitionen -- alle vom selben
                         Schreiber?
