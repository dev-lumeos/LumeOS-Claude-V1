---
nr: C-371
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-289
entscheidung: E-39
agent: codex
beauftragt: 2026-08-31
beruehrt:
  tabellen: [nutrition.recipes]
zahlen:
  gemessen: 2026-08-31
  spalten: 17
---

# C-371 — `recipes` hat keine Herkunftsspalte

## Befund

Aus G-289, Claude Code, 2026-08-31.

`[cmd]` **`nutrition.recipes` hat 17 Spalten.** `[cmd]`
**`measurement_source` (`manual|seed|…`) und `source_detail` sind da
— aber kein `source`.**

`[read]` **E-39 und der Auftrag behaupten beide, die Werte seien
schon da.** `[cmd]` **Das stimmt fuer `plan_origin` an den Plaenen —
nicht fuer Rezepte.**

`[cmd]` **Und `ADR_RECIPE_SOURCE_BUDDY` verlangt sie ausdruecklich:**
*,,`Recipe.source` wird um `buddy` erweitert: `user | coach |
marketplace | buddy`"*.

`[read]` **Der ADR beschreibt eine Erweiterung einer Spalte, die es
nicht gibt.**

## Was Claude Code getan hat

`[cmd]` **Die Anzeige ist abgeleitet gebaut** — heute alle `user`,
also kein Etikett. `[cmd]` **Und ein Waechter verhindert, dass
`measurement_source` mit Herkunft verwechselt wird.**

`[read]` **Richtig: er hat gebaut, was beauftragt war, und den
Unterschied gesichert.**

## Was zu tun ist

`[read]` **Die Spalte anlegen, damit die Ableitung ein Feldzugriff
wird.**

`[cmd]` **E-39 sagt: Coach und Marketplace vorsehen.** `[read]` **Bei
Plaenen ist das erfuellt, bei Rezepten nicht.**

## Auftrag

**Mitbeauftragt mit C-368 am 2026-08-31.** Bericht dort.

`[cmd]` **`recipes` hat 17 Spalten und kein `source`.** `[cmd]`
**`ADR_RECIPE_SOURCE_BUDDY` beschreibt die Erweiterung einer Spalte,
die es nicht gibt.**

`[cmd]` **E-39 sagt: Coach und Marketplace vorsehen** — **bei Plaenen
ist das ueber `plan_origin` erfuellt, bei Rezepten nicht.**

`[read]` **Die Spalte anlegen mit `user | coach | marketplace |
buddy`, Vorgabe `user`** — **damit die Anzeige ein Feld liest statt
abzuleiten.**

`[cmd]` **Und `measurement_source` bleibt, was es ist:** eine Angabe
zur Messung, keine Herkunft. **Claude Code hat einen Waechter
dagegen gesetzt.**

## Ergaenzt am 2026-08-31 — C-374 dazu

Tom: *,,oder AI Coach erstellt irgendwann Plaene anhand Vorgaben
seines Kunden."*

`[cmd]` **Dieselbe Luecke an `meal_plans`: `plan_origin` kennt
`self_created`, `coach_created`, `marketplace` — kein `buddy`.**

`[cmd]` **`SPEC_02` fuehrt vier Quellen, `SPEC_03` Flow 3 nennt die
Beschriftung *,,Erstellt von Buddy"*.**

`[read]` **Beide Spalten zusammen erledigen** — Rezepte bekommen
`source`, Plaene bekommen den vierten Wert.
