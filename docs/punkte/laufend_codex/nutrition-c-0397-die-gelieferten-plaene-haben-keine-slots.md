---
nr: C-397
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-336
entscheidung: E-59
agent: codex
beauftragt: 2026-09-02
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

## Auftrag — die Slots fuer die gelieferten Plaene

**Mitbeauftragt: C-389.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-397 — drei Plaene brauchen ihre Struktur

`[cmd]` **Nachgemessen: `Cut 4-Meal 2200`, `Lean bulk 3100`, `Buddy
auto-plan` tragen je 0 Slots.** `[cmd]` **`test` traegt fuenf** —
**der einzige nach C-396 angelegte.**

`[cmd]` **C-380 fuellte die drei, bevor `meal_plan_slots`
existierte.**

`[read]` **E-59: ein gelieferter Plan bringt seine Struktur mit.**
`[read]` **Ohne Slots faellt das Raster auf die Nutzervorlieben
zurueck und zeigt fremde Namen.**

`[read]` **`Aufbau-Wochenplan` ist ein Selbstplan** — **fuer ihn
greift der Rueckfall auf `meal_slots`.** **Drei Plaene, nicht vier.**

`[read]` **Und die Namen sollen zum Plan passen:** `[cmd]` **ein
Coach-Plan mit 2.200 kcal und vier Hauptmahlzeiten heisst anders als
ein Buddy-Plan mit 2.700.**

### 2 · Ein Nachweisproblem haengt daran

`[cmd]` **Claude Code konnte die Ghost-Eintraege nicht am Schirm
zeigen** — **der aktive Plan hat 0 Slots, und jeder geplante Tag ist
bereits erfasst.**

`[read]` **Mit Slots an den gelieferten Plaenen waere es zeigbar.**

### 3 · C-389 — die drei Saftfamilien

`[cmd]` **Du hast gemessen: `F201`, `F603`, `F310` sind ueber die
BLS-Codes trennbar** — 100 roh, 600 Saft, 700 Nektar.

`[cmd]` **Global geht es nicht: 3 von 53 Obst-600-Zeilen sind
Smoothies.**

`[read]` **Also die drei, nicht die Regel.** `[cmd]` **Und
`processing_level` steht bei Saft auf `raw`** — **das ist die Zeile,
die sich berichtigen laesst.**

`[read]` **Mit `match_reason` aus C-391 laesst sich zeigen, ob es
wirkt.**

### Was nicht zu tun ist

**Keine Regel fuer alle 53.**
**`Aufbau-Wochenplan` nicht anfassen** — Selbstplan, Rueckfall
greift.
**Nichts auf `dev@lumeos.app` loeschen** — der Plan `test` ist Toms
Probe.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    drei Plaene    je Slots, Namen passend zum Plan
    Aufbau-Plan    unveraendert, gezaehlt
    Kette          der Seed traegt sie kuenftig mit
    drei Familien  Saft und Nektar getrennt, mit match_reason
    Smoothies      unberuehrt, gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
