---
nr: C-374
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: E-40
agent: codex
beauftragt: 2026-08-31
erledigt: 2026-09-01
commit: 6c0b84b1
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-08-31
---

# C-374 — `plan_origin` kennt `buddy` nicht

## Befund

`[cmd]` **Der CHECK an `nutrition.meal_plans`:**

    plan_origin IS NULL OR plan_origin IN
      ('self_created', 'coach_created', 'marketplace')

`[cmd]` **`SPEC_02` fuehrt vier Quellen:** `user | coach |
marketplace | buddy`. `[cmd]` **`SPEC_03` Flow 3 nennt die
Beschriftung *,,Erstellt von Buddy"*.**

`[read]` **Die vierte Quelle hat keinen Wert im Schema.**

## Warum es jetzt zaehlt

Tom, 2026-08-31: *,,oder AI Coach erstellt irgendwann Plaene anhand
Vorgaben seines Kunden."*

`[cmd]` **E-40 fuehrt das als vierten Zweck des Planners.**

`[read]` **Und E-39 sagt: Coach und Marketplace vorsehen, nicht
bauen.** **Dasselbe gilt fuer Buddy** — **der Wert gehoert ins
Schema, bevor er gebraucht wird.**

## Was die Spec dazu sagt

`[cmd]` **`SPEC_02`: *,,`source: 'buddy'` — identisches Schema, User
muss trotzdem aktivieren."***

`[read]` **Ein Buddy-Plan ist also kein Sonderfall** — **er entsteht
wie ein Nutzerplan und wird wie einer aktiviert.**

`[cmd]` **Die Autonomiestufe steht:**
`coach.client_autonomy.nutrition_level`, 1 bis 5.

`[read]` **Ab welcher Stufe Buddy einen Plan anlegen darf, ist eine
eigene Frage.** **Die Spalte gibt es.**

## Dieselbe Luecke bei Rezepten

`[cmd]` **`ADR_RECIPE_SOURCE_BUDDY` verlangt `Recipe.source` mit
`buddy`** — **`recipes` hat keine `source`-Spalte** (C-371).

`[read]` **Beide gehoeren zusammen erledigt.**

## Auftrag

**Mitbeauftragt mit C-371 am 2026-08-31.** Bericht dort.

`[read]` **Dieselbe Luecke wie bei den Rezepten, an der anderen
Tabelle.**

`[cmd]` **`plan_origin` um `buddy` erweitern** — der CHECK kennt
heute drei Werte, `SPEC_02` fuehrt vier.

`[read]` **Kein Bau, nur der Wert:** E-39 und E-40 sagen *vorsehen*.
`[cmd]` **`SPEC_02`: *,,identisches Schema, User muss trotzdem
aktivieren."***

## Bericht — 2026-09-01, Codex

Mit C-371 gemeinsam eingespielt: Der bestehende CHECK von
`nutrition.meal_plans.plan_origin` akzeptiert nun
`self_created | coach_created | marketplace | buddy`. Bestehende
unbekannte Urspruenge bleiben NULL; ein bereits vorhandener gueltiger
Wert wurde nicht geraten oder ersetzt. Die Migration fuegt zudem das
von E-42 verlangte `darf_weiterverkaufen boolean NOT NULL DEFAULT
true` an `meal_plans` und `recipes` an.

Nachweis und Rot-zu-Gruen-Test stehen im Bericht von C-371:
`supabase/_pipeline/_validierung/nutrition-c371-c374-provenance.test.ts`.
Kein Buddy-, Coach- oder Marketplace-Schreibweg wurde gebaut.

## Abnahme

**2026-09-01, mit G-303 abgenommen:** `buddy` steht im `plan_origin`-CHECK.

`[cmd]` **Migration
`20260901090000_c371_recipe_source_plan_origin_buddy.sql`, keine RLS-
und keine Schreibwegaenderung.**
