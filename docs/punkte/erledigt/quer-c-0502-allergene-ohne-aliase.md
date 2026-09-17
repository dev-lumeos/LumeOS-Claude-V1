---
nr: C-502
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-498
entscheidung: null
erledigt: 2026-09-08
commit: 8ec84645
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

## Bericht

**Erledigt, mit exakten Aliasnamen statt Zutatenmustern.** Der
Katalogcode fuer Baumnuesse lautet `nutrition:contains_nuts` (nicht
`tree_nuts`). C-503 hatte Laktose bereits fuer Lebensmittel
angebunden; C-502 laesst `nutrition:`-Allergien jetzt auch gegen
exakte DSLD-Zutaten treffen.

| Katalogcode | belegte neue DSLD-Namen (Zeilen) | Aliase gesamt | Produkte nachher |
|---|---|---:|---:|
| `nutrition:contains_lactose` | Milk Protein Isolate (447), Lactose (418), Lactose Monohydrate (39) | 6 | 714 |
| `nutrition:contains_nuts` | Black Walnut (461), Almond (23), Cashew (12), Hazelnut (10), Walnut (9), Almonds (6), Cashews (3), Hazelnuts (3), Pistachio (2), Brazil Nut(s), Macadamia Nut, Walnuts (je 1) | 13 | 512 |
| `nutrition:contains_soy` | Soy Lecithin (7.183), Lecithin (Soy) (324), Soy (71), Soy Protein Isolate (67), Soybean (34), Soybeans (7), Soya (1) | 7 | 7.743 |

Alle neuen Aliaszeilen tragen `source_id` und Evidenz: die 13
Baumnussnamen Klasse A aus der FDA-Tree-Nut-Liste, die sieben
Sojanamen Klasse A aus der FDA-Allergeninformation, `Lactose` und
`Lactose Monohydrate` Klasse A aus den exakten DSLD-Zutatwerten;
`Milk Protein Isolate` Klasse B aus der expliziten Aufgaben-Grenze.
Die FDA nennt u. a. Whey als Milchbeispiel und Lecithin als
Sojabeispiel; die Baumnussliste stuetzt die einzelnen Nussnamen.

Nicht aufgenommen: `Whey Protein Isolate`, Sammelmuster wie
`Milk`, hochraffinierte Sojaoele und Coconut. Fuer diese Faelle
belegt der Name keine gleich sichere Produktausschlussregel. Die
Gegenprobe `Coconut` ist nicht als Baumnussalias vorhanden; ein
erfundener Alias wird von der Katalogcode-Validierung abgewiesen.

Auf `dev@lumeos.app` ergeben sich nun Laktose `1.021` Lebensmittel /
`714` Produkte, Soja `60` / `7.743` und Magnesiumstearat `0` /
`56.934`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    nutrition:contains_lactose   6 Aliase
    nutrition:contains_nuts     13
    nutrition:contains_soy       7
    supplements:magnesium_stearate 3

`[cmd]` **Treffer: Laktose 714 Produkte, Baumnuesse 512,
Soja 7.743.**

`[read]` **Vorher trafen `lactose` und `tree_nuts` NULL.**

### Die Grenze gehalten

> *,,Unsichere Faelle wie Whey Protein Isolate, Oele und
Coconut bleiben bewusst offen."*

`[cmd]` **Genau die Grenze aus dem Punkt:** `Milk Protein
Isolate` **enthaelt Laktose,** `Whey Protein Isolate`
**weitgehend nicht.**

`[read]` **Und `Coconut` ist in den USA eine Baumnuss, in
Europa nicht** ? **eine Streitfrage, keine Messung.**

`[cmd]` **Quellen: FDA Food Allergies, Tree-Nut-Guidance.**

**Abgenommen.**
