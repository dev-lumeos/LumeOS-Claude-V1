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

### C-397 und C-389 — umgesetzt und auf `dev@lumeos.app` nachgewiesen

`[cmd]` Die drei gelieferten Plaene tragen jetzt je vier eigene Slots.
`Cut 4-Meal 2200` (`coach_created`) hat vier Hauptmahlzeiten mit
`Nachmittagsmahlzeit`; `Lean bulk 3100` (`marketplace`) hat eine
`Pre-Workout-Mahlzeit`; `Buddy auto-plan` (`buddy`) hat eine
`Zwischenmahlzeit`. Alle drei haben `Fruehstueck` 07:30,
`Mittagessen` 12:30 und `Abendessen` 19:30 als weitere Plan-Slots.
Der gezielte Upsert schrieb 12 Zeilen; es wurde nichts geloescht.

`[cmd]` `Aufbau-Wochenplan` blieb unveraendert bei 0 Plan-Slots und
ist weiter der aktive Selbstplan; `test` blieb bei seinen fuenf
Plan-Slots. Der aktive Aufbauplan hat 28 Plantage und sechs verschiedene
`execution_date`-Tage im Protokoll. Sein Raster faellt damit bewusst
weiter auf Nutzer-Slots zurueck; er ist kein vierter gelieferter Plan.

`[read]` Die Wiederholbarkeit liegt in beiden C-380-Seedwegen: der
Dev-Seed schreibt die 12 Slots idempotent mit `ON CONFLICT`, und
`testdaten-einspielen.ts` erzeugt fuer dieselben drei Plaene Herkunft
und Slots. Keine Datenlogik wurde in `migrations/` gelegt.

`[cmd]` C-389 ist auf genau vier BLS-Zeilen begrenzt: `F201600`,
`F603600`, `F603700` und `F310600` stehen jetzt auf
`minimally_processed`; die drei rohen Gegenstuecke bleiben `raw`.
Die drei Smoothies `F032600`, `F033600` und `F034600` bleiben ebenfalls
`raw`. Die registrierte Ableitung 027 kennt nur diese vier Codes, keine
Regel fuer die 53 Obst-600-Zeilen.

`[cmd]` Bei der Suche nach `Aprikose` bleibt `F201600` auf Rang 6 mit
`match_reason = {kind: name_prefix}`. Ein Filter, der
`minimally_processed` ausschliesst, entfernt genau diesen Safttreffer;
der Treffergrund belegt damit weiter den Namensweg, nicht einen Alias.

`[cmd]` Gruen: `nutrition-c397-delivered-plan-slots`,
`nutrition-c389-juice-processing`, C-391, C-396 und der
C-395-Datenlogik-Waechter. Der bestehende C-380-Qualitaetstest bleibt
unabhaengig rot: `Buddy auto-plan` hat am 2026-09-02 fuenf statt vier
Eintraege (29 statt 28 insgesamt). Diese Zeile wurde nicht geloescht
und der Test nicht abgeschwaecht.

## Abnahme

_(vom Orchestrator)_
