---
nr: C-489
typ: fehler
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-488
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  zeilen: 214780
---

# C-489 — der Produktname ist englisch und heisst `name`

## Toms Befund

Tom, 2026-09-08:

> ich sehe supplement/supplier_products nur eine spalte name und
> da sind englische begriffe drin. denke diese spalte in name_en
> umbenennen und die anderen sprachspalten zumindest anlegen,
> falls wir spaeter deutsche produkte oder thaiprodukte haben.

> supplement/supplier kann als name bleiben, da es ein firmenname
> ist.

## Der Befund stimmt

`[cmd]` **`supplier_products.name`, drei Beispiele:**

    B-2 100 mg
    B-6 100 mg
    C-1000 mg With Protective Bioflavonoids And Wild Rose Hips

`[read]` **Englisch, aus DSLD** ? **214.780 Zeilen.**

`[cmd]` **C-488 hat gerade 32 Thai-Spalten nachgezogen** ?
**diese hier nicht, weil sie nicht `name_de` heisst.**

`[read]` **Der Waechter sucht `_de$`** ? **eine Spalte, die
einfach `name` heisst, faellt durch.**

## Und die Unterscheidung ist richtig

`[read]` **`suppliers.name` bleibt** ? **ein Firmenname wird
nicht uebersetzt.**

`[cmd]` **`Vitamin World, Inc.` heisst in Thailand auch so.**

`[read]` **Ein Produktname schon** ? **ein thailaendisches
Praeparat traegt einen thailaendischen Namen.**

## Was zu tun ist

**1** ? **`name` -> `name_en`.**

`[cmd]` **58 Treffer im Baum** ? **der groesste Teil in
`485_dsld_import.py`.**

`[read]` **Miss, welche davon die SPALTE meinen und welche etwas
anderes** (`suppliers.name`, `supplement_name_snapshot`).

**2** ? **`name_de` und `name_th` anlegen, LEER.**

Tom: *,,zumindest anlegen, falls wir spaeter deutsche produkte
oder thaiprodukte haben."*

`[read]` **Keine Uebersetzung** ? **wie in C-488.**

**3** ? **Die Leseseite.**

`[cmd]` **`apps/` hat Treffer** ? **Claude Code arbeitet dort an
G-438.**

`[read]` **Miss, welche und melde sie** ? **NICHT anfassen.**

`[read]` **Wenn die Umbenennung die Oberflaeche bricht, ist das
derselbe Fall wie C-484/G-435: du baust, er zieht nach.**

## Und `marke`

`[cmd]` **`marke` ist in allen 214.780 Zeilen gefuellt** ?
`Vitamin World`, `Now Foods`.

`[read]` **Eine Marke wird auch nicht uebersetzt** ? **sie bleibt
wie sie ist.**

## Abnahmebedingungen

    A1  name -> name_en, alle 58 Treffer geprueft.
        Welche meinten die Spalte? TABELLE.
    A2  name_de und name_th angelegt, LEER.
    A3  KEINE Uebersetzung eingefuegt.
    A4  suppliers.name und marke unveraendert.
    A5  was in apps/ bricht: gemeldet, NICHT gebaut.
    A6  der Sprachwaechter bleibt GRUEN.
    A7  Struktur nach migrations/, Daten in _pipeline/.
    A8  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**`suppliers.name` NICHT anfassen** ? **Firmenname.**

**`marke` NICHT anfassen** ? **Markenname.**

**`apps/` nicht anfassen** ? **melden, was bricht.**

Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
