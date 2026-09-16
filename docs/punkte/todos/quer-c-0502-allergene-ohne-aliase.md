---
nr: C-502
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-498
entscheidung: null
beruehrt:
  tabellen: [public.allergen_aliases]
zahlen:
  gemessen: 2026-09-08
  aliase: 3
---

# C-502 - die Allergene ohne Aliase treffen nichts

## Befund

Aus G-455, Claude Code, 2026-09-08:

> *,,`lactose` und `tree_nuts` haben keine Aliase und treffen
deshalb nichts, obwohl 418 Zutatzeilen woertlich `lactose`
heissen. Die Oberflaeche sagt es, aber die Daten gehoeren
ergaenzt."*

`[cmd]` **Selbst nachgemessen:**

    public.allergen_aliases
      magnesium_stearate    3 Aliase
      lactose               KEINE
      tree_nuts             KEINE

    "lactose" woertlich    418 Zutatzeilen

`[read]` **Die Allergie ist eingetragen, der Filter laeuft ins
Leere.**

## Warum es zaehlt

`[read]` **Eine Allergie, die nicht trifft, ist gefaehrlicher
als keine** ? **der Nutzer glaubt, er sei geschuetzt.**

`[cmd]` **C-498 hat drei Aliase fuer Magnesiumstearat gebaut** ?
**der Weg steht, die Daten fehlen.**

## Was zu bauen ist

`[read]` **Aliase je Allergen, mit Quelle.**

    lactose      Lactose, Milk, Whey, Casein,
                 Lactose Monohydrate, Milk Solids ...
    tree_nuts    Almond, Walnut, Cashew, Pecan,
                 Hazelnut, Pistachio, Macadamia ...
    soja         Soy, Soya, Soybean, Soy Lecithin ...

`[read]` **MISS, welche Namen wirklich vorkommen** ? **nicht aus
dieser Liste abschreiben.**

`[cmd]` **`ingredient_name` hat 3,0 Mio Zeilen** ? **die
haeufigsten je Allergen zaehlen.**

## Die Grenze

`[read]` **Ein Alias ist keine Vermutung.**

`[cmd]` **`Milk Protein Isolate` enthaelt Laktose ? `Whey
Protein Isolate` weitgehend nicht.**

`[read]` **Wo es unsicher ist: MELDEN, nicht aufnehmen** ?
**ein falscher Alias entfernt Produkte, die der Nutzer nehmen
koennte.**

## Abnahmebedingungen

    A1  je Allergen: welche Zutatnamen kommen vor?
        TABELLE, nach Haeufigkeit.
    A2  je Alias eine Quelle und eine Evidenzklasse.
    A3  wie viele Produkte trifft jedes Allergen
        NACHHER? Zahl.
    A4  wo unsicher: gemeldet, nicht aufgenommen.
    A5  Gegenprobe: ein erfundener Alias faellt auf.
    A6  Sicherung, Vollkette, ALLE Waechter.
