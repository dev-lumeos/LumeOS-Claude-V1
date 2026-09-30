---
nr: G-566
typ: entscheidung
modul: goals
schwere: mittel
angelegt: 2026-09-30

braucht: [G-542]
kind_von: G-542

quellen:
  - docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

beruehrt:
  tabellen:
    - goals.goal_strategies
---

# Ist die Katalograte fuer Fortgeschrittene zu hoch?

`[read]` **Abgespalten von G-542**, weil dort die EINHEIT gefragt war und
sie mit E-83 entschieden ist. **Hier bleibt der WERT.**

## Die Frage

`[cmd]` **`goal_strategies.lean_bulk.weight_change_target_percent` steht
auf 0,25 %/Woche.** Bei 83,74 kg sind das nach E-1 **+230 kcal/Tag**.

`[cmd]` **Die Formelsammlung (Dokument B, 2026-09-29) nennt
erfahrungsabhaengige Zuschlaege:**

    Fortgeschrittene   +200 kcal/Tag
    Profis             +150 kcal/Tag

`[read]` **Unser Wert liegt darueber** — und zwar nicht, weil er falsch
gesetzt waere, sondern weil er als Rate gesetzt ist: **derselbe Prozentwert
ergibt bei einem schwereren Nutzer mehr Kilokalorien.** Bei 72 kg waeren es
198 kcal und damit genau der Buchwert.

## Was zu entscheiden ist

**Ist +0,25 %/Woche fuer einen fortgeschrittenen Natural richtig, oder
gehoert die Rate nach Erfahrungsstufe abgestuft?**

`[read]` **Fuer Tobias.** Es ist eine Erfahrungsfrage: die Literatur nennt
0,25–0,5 %/Woche (Iraki 2019) als Spanne fuer alle, die Formelsammlung
nennt Kilokalorien je Stufe. **Beide koennen nicht gleichzeitig gelten,
solange die Rate nicht nach Stufe differenziert.**

## Die Folge fuer den Bau

`[read]` **Bleibt 0,25 fuer alle:** dieser Punkt wird geschlossen, nichts
zu tun.

`[read]` **Wird abgestuft:** der Katalog braucht die Rate je
Erfahrungsstufe, und `requirements.min_experience` ist dann nicht mehr nur
eine Sperre, sondern ein **Rechenparameter**. `[cmd]` Die vier Stufen
stehen in E-80 (`beginner 0,75 · advanced 0,90 · pro 1,00 · elite 1,10`) —
**aber das sind Score-Faktoren, keine Ratenfaktoren.** Sie hier zu
verwenden waere eine Annahme, keine Ableitung.

`[read]` **Und es beruehrt G-561:** wenn die Rate nach Stufe variiert,
variieren die Waechterschwellen mit — ein relativer Waechter haelt das
aus, ein absoluter in Kilogramm nicht.
