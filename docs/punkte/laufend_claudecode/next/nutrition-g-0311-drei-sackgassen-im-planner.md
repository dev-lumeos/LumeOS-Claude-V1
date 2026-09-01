---
nr: G-311
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: G-310
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-311 — drei Sackgassen im Planner

## Befund

Tom, 2026-09-01, am Schirm.

### 1 · *In der Werkbank* tut nichts

`[cmd]` **Der Knopf steht in der Planliste, der Sprung fehlt.**
`[cmd]` **Das ist G-307, halb gebaut.**

### 2 · Ein Rezept im Raster laesst sich nicht oeffnen

Tom: *,,eingetragene recipes sind ja ok, aber mindestens bei klick
drauf will man sehen was darin ist an lebensmittel und details."*

`[cmd]` **`RecipeDetail` ist gebaut — im Rezepte-Reiter.** `[cmd]`
**Im Planner ist sie nicht verdrahtet.**

### 3 · Die Rezepte-Auflistung unter dem Raster

Tom: *,,darunter rezepte auflistung? fuer was ist das zeigt nur
irgendwelche daten an."*

`[cmd]` **Sie steht in keiner Spec und in keinem Mockup.**
`[read]` **Sie stammt aus dem Entwurf, aus der Zeit vor dem
Rezepte-Reiter** — **und ist seit G-289 doppelt.**

## Auftrag

**Vorbereitet mit G-310 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.
