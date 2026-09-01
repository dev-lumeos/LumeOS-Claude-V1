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
erledigt: 2026-09-01
commit: 6c0b84b1
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

## Bericht — 2026-09-01, Codex

**Eingespielt, ohne neuen Schreibweg:**

- `nutrition.recipes.source text NOT NULL DEFAULT 'user'` mit CHECK
  `user | coach | marketplace | buddy`;
- `nutrition.meal_plans.plan_origin` akzeptiert jetzt zusaetzlich
  `buddy` und bleibt fuer unbekannte Altwerte nullable;
- `darf_weiterverkaufen boolean NOT NULL DEFAULT true` liegt an
  `recipes` und `meal_plans` (E-42), getrennt von einem
  Bearbeitungsrecht.

Die Kettenquelle
`supabase/_pipeline/05_user_tabellen/371_recipe_source_plan_origin_buddy_resale.sql`
und die Live-Migration
`supabase/migrations/20260901090000_c371_recipe_source_plan_origin_buddy.sql`
sind eingespielt; davor entstand eine 25.926.153-Byte-Vollsicherung
ausserhalb des Repos.

`[cmd]` Vormessung: `recipes` hatte 17 Spalten, 6 Reihen und kein
`source`; `meal_plans` hatte 2 Reihen, den Dreiwert-CHECK und beide
Tabellen hatten RLS aktiv. Nach der Migration haben alle **6/6**
Bestandsrezepte `source = user`, alle **2/2** Plaene und **6/6**
Rezepte `darf_weiterverkaufen = true`. Ein schon gesetzter gueltiger
`plan_origin` wurde nicht ueberschrieben; unbekannte bleiben NULL.

`[cmd]` Der neue Test
`nutrition-c371-c374-provenance.test.ts` war vor der Migration rot
(`recipes.source` fehlte) und ist danach gruen. Er sichert Spalten,
Defaults, beide CHECKs, Bestandswerte und unveraendert aktive RLS.
`ladekette-pruefen` meldet unabhaengig weiterhin 14 serielle Abfragen
in `apps/web/src/app/v2/nutrition/page.tsx`; dort wurde nichts
geaendert.

## Abnahme

**2026-09-01, mit G-303 abgenommen:** `recipes.source` mit `user|coach|marketplace|buddy` live.

`[cmd]` **Migration
`20260901090000_c371_recipe_source_plan_origin_buddy.sql`, keine RLS-
und keine Schreibwegaenderung.**
