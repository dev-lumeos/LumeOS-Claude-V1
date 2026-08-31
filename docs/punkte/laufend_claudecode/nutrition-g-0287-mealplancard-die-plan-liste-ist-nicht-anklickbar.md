---
nr: G-287
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-287 — MealPlanCard — die Plan-Liste ist nicht anklickbar

## Befund

`[cmd]` **`SPEC_10` nennt zwei Komponenten:** `MealPlanList`
(*,,Liste aller Plaene mit Source-Badge"*) und `MealPlanCard`
(*,,Name, Quelle, Status, Tage, kcal/Tag"*).

`[cmd]` **Gebaut ist die Liste ohne die Karte** — drei Textzeilen,
nicht anklickbar, kein Detail dahinter.

`[read]` **Tom, 2026-08-31:** *,,irgend eine auflistung die gar nichts
sagt, nichtmal anschaubar ist oder editierbar."*

## Was zu bauen ist

**Je Plan eine Karte, die aufs Detail fuehrt.**

`[cmd]` **Die Quelle steht seit dem 30.08.:** `plan_origin` mit
`self_created`, `coach_created`, `marketplace` — **das ist das
Source-Badge aus der Spec.**

`[cmd]` **Und der Status auch:** `status` und `lifecycle_type` am
Plan.

`[read]` **Die zwei Bestandsplaene tragen `plan_origin = NULL`** —
**das gehoert gezeigt, nicht gefuellt.**

## Auftrag

**Mitbeauftragt mit G-286 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
