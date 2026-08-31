---
nr: G-299
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
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-299 — der Planner zeigt eine fremde Woche

## Befund

Tom, 2026-08-31: *,,planner ist irgendwas aber noch nicht
brauchbar."*

`[cmd]` **Der Planner oeffnet auf dem 18.6. bis 24.6.** `[cmd]`
**Heute ist der 31.08.**

`[read]` **Er zeigt die erste Woche des Plans, nicht die laufende
Woche** — **und sagt nicht, warum.**

## Was fehlt

**Ein Weg, etwas zu aendern.**

`[cmd]` **Die Knoepfe sind *Copy week* und *New recipe*.** `[cmd]`
**Letzterer ist eine Attrappe** (G-289 baut sie).

`[read]` **Ein Feld anklicken und den Eintrag aendern gibt es
nicht** — **dasselbe wie in G-298, an anderer Stelle.**

## Und die Vorfrage

`[read]` **Was ist der Planner, wenn es den Meal-plans-Reiter
gibt?**

`[cmd]` **Beide zeigen denselben Plan:** der eine als Tagesliste, der
andere als Wochengitter. `[cmd]` **`MealPlanDayView` steht in
`SPEC_10` unter den Plan-Komponenten** — **der Planner ist kein
eigener Bereich der Spec.**

`[read]` **Also entweder ist er die Wochenansicht des Plans und
gehoert dorthin** — **oder er ist etwas anderes und braucht eine
eigene Beschreibung.**

## Auftrag

**Mitbeauftragt mit G-298 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
