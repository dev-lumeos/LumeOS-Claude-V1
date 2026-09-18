---
nr: C-515
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-509
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
  substanzen: 596
---

# C-515 - die Wirkstoffe kuratieren

## Toms Entscheidung

Tom, 2026-09-08, zu C-509:

> c-509 ja machen wir seinen vorschlag

`[cmd]` **Codex Empfehlung:** *,,Wirkstoffe fachlich kuratieren;
Hilfsstoffe fuer Allergien als belegte Textaliase belassen. Eine
Vollkatalogisierung der Hilfsstoffe waere ein separater
Anzeige-/Kurationsauftrag, nicht Voraussetzung fuer Schutz
durch Allergiepruefung."*

## Was C-509 gemessen hat

    verknuepft        639.122 von 3.000.982
    offene Roh-Namen   97.833
    Top 100: 47 Wirkstoff-, 53 Hilfsstoff-Mehrheiten

     100 Namen  ->  190.955 Produkte
     500 Namen  ->  202.589
    1.000 Namen ->  205.146

`[cmd]` **Und die Warnung:** *,,Die Liste enthaelt auch
Naehrwertetiketten und Artefakte (`Calories`, `None`,
`Powder`) ? Top-N blind aufzunehmen waere geraten."*

`[cmd]` **Punkt C ist beantwortet: 60.994 Produkte mit
Magnesiumstearat, 0 mit `supplement_id`, und die
Allergiepruefung trifft sie trotzdem.**

## Abnahmebedingungen

    A1  welche der Top 100 sind WIRKSTOFFE? Je Eintrag
        eine Begruendung.
    A2  Artefakte und Naehrwertetiketten AUSSORTIERT,
        je mit Grund.
    A3  je neuer Substanz eine Quelle und eine
        Evidenzklasse.
    A4  wie viele Zeilen sind nachher verknuepft?
        Vorher 639.122.
    A5  wie viele PRODUKTE haben nachher einen
        auswertbaren Wirkstoff mehr?
    A6  Hilfsstoffe NICHT aufgenommen -- belegt, dass
        die Allergiepruefung weiter trifft.
    A7  KEINE Zuordnung geraten. Wo unsicher: gemeldet.
    A8  Gegenprobe: ein zweiter Lauf aendert nichts.
    A9  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

