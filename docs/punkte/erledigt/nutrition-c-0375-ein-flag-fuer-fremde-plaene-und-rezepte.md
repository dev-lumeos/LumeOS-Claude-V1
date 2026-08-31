---
nr: C-375
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: E-41
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 18a4e31b
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

## Ergebnis (Kurzfassung, Einzelheiten in C-372)

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
