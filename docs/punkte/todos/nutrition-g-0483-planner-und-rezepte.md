---
nr: G-483
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519]
kind_von: E-83
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-483 - Planner und Rezepte kennen keine Supplemente

## Toms Beanstandung

Tom, 2026-09-08:

> meal plans sollte das ebenfalls moeglich sein, supplements
> mit einzubinden

> planner muss es ebenfalls funktionieren, falls der plan
> editierbar ist

> rezept ebenfalls

## Gemessen

    plan-eintrag-editor.tsx    kennt supplement NEIN
    plan-werkbank-ui.tsx       kennt supplement NEIN
    rezepte-echt.tsx           kennt supplement NEIN

    meal_plan_entries          KEINE Supplementspalte
    recipe_ingredients         CHECK: nur bls | custom

`[cmd]` **Der Planner IST editierbar** ? **E-83 hat zehn
Schreibarten gemessen, inkl. `eintrag_aendern`,
`eintrag_loeschen`, `woche_kopieren`.**

## Was C-519 liefert

`[cmd]` **`recipe_ingredients` bekommt die Supplementquelle,
`intake_logs.meal_id` die Verbindung.**

`[read]` **Warte darauf** ? **C-519 ist gebaut, aber noch
nicht live.**

`[cmd]` **`meal_plan_entries` braucht sie noch** ? **MISS, ob
C-519 sie mitbringt, und MELDE es, wenn nicht.**

## Und die Regel gilt

`[read]` **Nur untermischbare Formen** ? **Powder, Liquid,
Bar, Gummy (E-83).**

`[cmd]` **G-480 hat den Filter gebaut** ? **er wird hier
wiederverwendet, nicht nachgebaut.**

## Abnahmebedingungen

    A1  ein Supplement in einen Planeintrag. Foto.
    A2  ein Supplement in ein Rezept. Foto.
    A3  Toms Shake-Rezept: Milch, Blaubeeren, Whey.
        Foto mit den Werten.
    A4  der Planner zeigt es beim Bearbeiten. Foto.
    A5  nur untermischbare Formen. Zahl.
    A6  vier Module unveraendert.
