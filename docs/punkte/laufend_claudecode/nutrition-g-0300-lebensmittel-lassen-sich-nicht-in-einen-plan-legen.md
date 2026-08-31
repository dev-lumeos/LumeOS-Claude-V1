---
nr: G-300
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-300 — Lebensmittel lassen sich nicht in einen Plan legen

## Befund

Aus G-298, Claude Code, 2026-08-31.

`[cmd]` **Neue Positionen lassen sich nur als Rezept anlegen.**
`[cmd]` **Bestehende BLS-Eintraege sind bearbeitbar** — gemessen:
100 g/dinner auf 275 g/lunch, `food_id` unveraendert.

`[read]` **Der Grund: die Lebensmittelsuche ist ein eigener Weg.**
`[cmd]` **`food_search` liefert ein JSON-Dokument mit 4.970
Lebensmitteln** — **eine Auswahlliste reicht nicht.**

## Was zu bauen ist

**Die Suche im Planformular.**

`[cmd]` **Der `CHECK` unterscheidet drei Typen:** `recipe` mit
`planned_servings`, `bls` und `custom` mit `amount_g`. `[cmd]` **Zwei
davon sind heute nicht anlegbar.**

`[cmd]` **Und die Suche steht:** zehn Sortierwerte, Herkunftsfilter
seit C-355, Treffergrund seit G-281. `[read]` **Es fehlt der
Aufrufer.**

`[read]` **`custom` hat 0 Zeilen** (C-355) — **also zuerst `bls`.**

## Auftrag

**Mitbeauftragt mit G-289 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
