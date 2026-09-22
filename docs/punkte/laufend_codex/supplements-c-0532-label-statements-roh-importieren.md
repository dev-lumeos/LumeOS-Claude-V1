---
nr: C-532
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-527
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# C-532 - die Label Statements roh importieren

## Codex Empfehlung aus C-527

> *,,Statements zuerst ROH in einer eigenen Relation
importieren; `label_url` im Readmodell aus `dsld_id`
berechnen; keine automatische Allergen-Entwarnung aus
Formulation ableiten."*

## Toms Vorgabe

Tom zu G-492: *,,einbauen und ausdokumentieren, sobald daten
da sind einbinden"*

`[cmd]` **Der Reiter *,,Hinweise"* wartet auf Precautions und
Formulation.**

## Die Grenze

`[cmd]` **C-527 hat gemessen: zwei *,,No Soy"*-Claims
widersprechen vorhandenen *Soy Lecithin*-Zutaten.**

`[read]` **Darum: roh importieren, ANZEIGEN, nicht auswerten**
? **keine Entwarnung aus einem Etikettensatz.**

## Abnahmebedingungen

    A1  eine eigene Relation, roh, je Produkt und Art.
    A2  alle elf Arten, Zahl je Art.
    A3  label_url aus dsld_id im Readmodell.
    A4  KEINE Auswertung, keine Entwarnung.
    A5  Gegenprobe: die zwei No-Soy-Widersprueche
        stehen roh drin, die Allergiepruefung warnt
        weiter.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
