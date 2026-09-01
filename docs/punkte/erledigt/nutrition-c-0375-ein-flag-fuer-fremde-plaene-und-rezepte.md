---
nr: C-375
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: E-42
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-09-01
commit: aae75918
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-08-31
---

# C-375 — ein Flag fuer fremde Plaene und Rezepte

## Befund

Tom, 2026-08-31: *,,die gekauften Plaene oder vom Coach brauchen ein
Flag das definiert ob es editable sein soll oder nicht."*

`[cmd]` **Es gibt keins** — kein `editable`, `readonly`, `locked`
oder `is_template` in `nutrition` oder `coach`.

## Was es nicht ist

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17 kennt eine andere Sperre:**
ein aktiver Plan hat eingefrorene Positionen, **weil das Log darauf
zeigt.**

`[read]` **Die beiden haben nichts miteinander zu tun:**

    aktiv             jeder Plan, kommt vom Log
    nicht editierbar  fremde Plaene, kommt vom Ersteller

`[read]` **Ein eigener Plan im Entwurf ist voll bearbeitbar. Ein
eigener aktiver ist eingefroren. Ein gekaufter kann beides sein.**

## Was zu bauen ist

**Eine Spalte an `meal_plans` und `recipes`.**

`[read]` **Vorschlag: `darf_bearbeiten boolean NOT NULL DEFAULT
true`** — **Vorgabe wahr, weil eigene Inhalte immer bearbeitbar
sind.**

`[read]` **Wer teilt oder verkauft, setzt sie beim Kopieren.**
`[cmd]` **E-39 und E-40 sagen: Coach und Marketplace vorsehen, nicht
bauen** — **die Spalte gehoert dazu, der Weg nicht.**

`[cmd]` **Und `SPEC_01` Abschnitt 9 fuehrt fuer Rezepte dieselben
vier Quellen wie fuer Plaene** — **also dieselbe Spalte an beiden
Tabellen.**

## Auftrag

**Mitbeauftragt mit C-372 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis vom 2026-08-31 — UEBERHOLT durch E-42

`[read]` **Der Abschnitt bleibt als Stand vom 31.08. stehen.**
**Was daran nicht mehr gilt: `darf_bearbeiten` als Name, und der
Ausweg *Kopie bearbeiten*.** Beides loest E-42 auf; das Ergebnis
vom 01.09. steht weiter unten.

`[cmd]` **Gemessen am 2026-08-31: es gibt kein solches Flag.** Keine
Spalte `darf_bearbeiten`, `editable`, `readonly`, `locked` oder
`is_template` in `nutrition` oder `coach` — der einzige Treffer war
`checkins.template_id`, und der gehoert zu Recovery.

**Die Auswertung ist gebaut, die Spalte gehoert Codex.**

`[cmd]` **`darfBearbeiten(undefined)` ist `true`** — gemessen, nicht
behauptet: heute sind alle Plaene `self_created` oder `NULL`.
**Nur ein ausdrueckliches `false` sperrt.**

### Die zwei Sperren werden unterschieden — E-41

    aktiv             vom Log        Ausweg: Kopie bearbeiten
    nicht editierbar  vom Ersteller  Ausweg: KEINER
    beides            —              Ausweg: keiner

`[read]` **Die fremde Sperre gewinnt.** Bei ihr hilft eine Kopie
nicht — **sie fuehrte um die Entscheidung des Erstellers herum**, und
genau das soll das Flag verhindern. **Deshalb erscheint der
Kopierknopf dort nicht;** `kopieHilft()` ist die eine Stelle, die es
entscheidet, und ein Waechter zaehlt ihre Aufrufe.

`[read]` **Sobald die Spalte kommt, wird aus `undefined` ein
Feldwert** — die Anzeige bleibt, wie sie ist.

## Abnahme

**2026-08-31, mit C-372 abgenommen:** vorbereitet: die Auswertung steht, die Spalte fehlt und kommt von
Codex. Der Kopierknopf erscheint nur bei der Aktiv-Sperre.

## Berichtigt, 2026-08-31 — es ist ein Weiterverkaufsschutz

Tom: *,,wenn ich einen plan kaufe dann ist das mein plan, aber ein
Coach der einen mealplan auf marketplace verkauft, dass der nicht
wiederverkaufbar wird."*

`[read]` **`darf_bearbeiten` war das falsche Flag.** **Gemeint ist
`darf_weiterverkaufen`.**

`[read]` **Der Kaeufer darf seinen Plan aendern** — **E-42: eine
Editiersperre erzeugt unehrliche Daten.**

## Auftrag

**Mitbeauftragt mit G-306 am 2026-08-31.** Bericht dort.

## Ergebnis vom 2026-09-01 — gebaut in G-306

**Roher Bericht in der G-306-Punktdatei.**

`[cmd]` **Die Spalte hat Codex waehrend des Auftrags eingespielt**
(Schritt `371_recipe_source_plan_origin_buddy_resale.sql`). **Live
gemessen, 2026-09-01:**

    nutrition.meal_plans.darf_weiterverkaufen   boolean  NOT NULL  DEFAULT true
    nutrition.recipes.darf_weiterverkaufen      boolean  NOT NULL  DEFAULT true

`[cmd]` **Die Anzeige las bis dahin hart `undefined`** — jetzt liest
sie die Spalte. `darfWeiterverkaufen(flag)` ist `flag !== false`:
**nur ein ausdrueckliches `false` verbietet.**

`[read]` **Und sie sagt es, statt zu sperren:** *,,Dieser Plan darf
nicht weiterverkauft werden. Aendern und verwenden kannst du ihn frei
— er gehoert dir."*

`[cmd]` **Der Bearbeiten-Knopf haengt an keiner Bedingung mehr** —
`sperreVon` und `kopieHilft` sind entfernt (A-59), ein Waechter prueft
ihre Abwesenheit.

`[read]` **Kein Weiterverkauf gebaut** — nur das Flag und der Satz,
wie beauftragt.

## Abnahme

**2026-09-01, mit G-306 abgenommen:** `darf_weiterverkaufen` live an beiden Tabellen, die Anzeige liest
sie statt hart `undefined`.
