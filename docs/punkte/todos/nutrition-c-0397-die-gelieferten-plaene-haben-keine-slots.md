---
nr: C-397
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-336
entscheidung: E-59
beruehrt:
  tabellen: [nutrition.meal_plan_slots]
zahlen:
  gemessen: 2026-09-02
---

# C-397 — die gelieferten Plaene haben keine Slots

## Befund

Aus G-336, Claude Code, 2026-09-02.

`[cmd]` **Nachgemessen auf `dev@lumeos.app`:**

    Aufbau-Wochenplan    0 Slots
    Cut 4-Meal 2200      0
    Lean bulk 3100       0
    Buddy auto-plan      0
    test                 5

`[read]` **`test` ist der einzige nach C-396 angelegte Plan** —
**die Kopie greift beim Anlegen, nicht rueckwirkend.**

`[cmd]` **C-380 fuellte die drei gelieferten Plaene, bevor
`meal_plan_slots` existierte.**

## Was zu tun ist

`[cmd]` **E-59: ein gelieferter Plan bringt seine Struktur mit.**

`[read]` **Coach-, Marketplace- und Buddy-Plan muessen eigene Slots
haben** — **sonst faellt das Raster auf die Nutzervorlieben zurueck
und zeigt fremde Namen.**

`[read]` **Und `Aufbau-Wochenplan` ist ein Selbstplan** — **fuer ihn
greift der Rueckfall auf `meal_slots`, das ist richtig.**

`[read]` **Drei Plaene, nicht vier.**

## Und ein Nachweisproblem haengt daran

`[cmd]` **Claude Code konnte Punkt 4 aus G-336 nicht am Schirm
zeigen** — **der aktive Plan hat selbst 0 Slots, und jeder geplante
Tag ist bereits erfasst.**

`[read]` **Mit Slots an den gelieferten Plaenen waere es
zeigbar.**
