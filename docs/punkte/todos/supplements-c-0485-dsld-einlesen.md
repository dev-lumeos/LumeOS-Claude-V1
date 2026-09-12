---
nr: C-485
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-467
entscheidung: null
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  produkte: 220000
  zutaten: 2200000
---

# C-485 — die DSLD-Datenbank einlesen

## Was dasteht

`[cmd]` **`docs/ssot/daten/DSLD-full-database-XLSX/`** ? **elf
Dateien, 268 MB.**

`[cmd]` **Je Datei fuenf Blaetter, gemessen an `batch1`:**

    Product Overview             20.000 Zeilen
    Dietary Supplement Facts    200.650
    Other Ingredients            20.000
    Label Statements            147.299
    Company Information          30.505

`[read]` **Hochgerechnet auf elf Dateien:** **~220.000 Produkte,
~2,2 Mio Zutatenzeilen.**

## Die Struktur passt auf C-467

`[cmd]` **`Product Overview`:**

    DSLD ID        542
    Product Name   B-2 100 mg
    Brand Name     Vitamin World
    Bar Code       0 74312 70640 0
    Net Contents   100 Easy To Swallow Coated Tablets
    Serving Size   1 Tablet(s)
    Product Type [LanguaL]      Vitamin [A1302]
    Supplement Form [LanguaL]   Tablet or Pill [E0155]
    Date Entered into DSLD      2011-11-25
    Market Status  On Market
    Suggested Use  DIRECTIONS: For adults, take one...

`[cmd]` **C-467 hat gebaut:**

    supplier_products
      supplier_id, name, produktform,
      packungsgroesse, packungseinheit,
      gtin, artikelnummer,
      portionsgroesse, portionseinheit,
      im_katalog, is_active, source

`[read]` **Fast Feld fuer Feld:**

    Brand Name        -> suppliers.name
    Product Name      -> supplier_products.name
    Bar Code          -> gtin
    Net Contents      -> packungsgroesse + packungseinheit
    Serving Size      -> portionsgroesse + portionseinheit
    Supplement Form   -> produktform
    DSLD ID           -> artikelnummer (oder eigene Spalte)
    Market Status     -> is_active

`[cmd]` **`Dietary Supplement Facts`:**

    Ingredient                  Riboflavin
    DSLD Ingredient Categories  vitamin
    Amount Per Serving          100
    Amount Per Serving Unit     mg
    % Daily Value per Serving   5882
    Daily Value Target Group    Adults and children 4+

`[cmd]` **`product_contents` hat:** `supplement_id`,
`amount_per_serving`, `unit`, `conversion_factor`,
`ist_wirkstoff`.

`[read]` **`Other Ingredients` ist die Hilfsstoffliste** ?
**`ist_wirkstoff = false`.**

## Die sechzehn Kategorien

`[cmd]` **Gemessen an 40.000 Zeilen aus `batch1`:**

    vitamin                     7.952
    mineral                     6.732
    botanical                   6.086
    non-nutrient/non-botanical  4.865
    blend                       2.657
    fat                         2.368
    other                       2.147
    amino acid                  2.052
    sugar                       1.461
    fatty acid                  1.010
    protein                       838
    enzyme                        622
    fiber                         551
    bacteria                      387
    animal part or source         114
    complex carbohydrate           85

`[read]` **`blend` ist der schwierige Fall** ? **eine
Mischung ohne Einzelmengen.**

## Der Vorschlag

### 1 — NICHT alles einlesen

`[read]` **220.000 Produkte sind ein US-Katalog.**

`[cmd]` **LumeOS laeuft in Thailand** ? **ein thailaendisches
Praeparat steht dort nicht.**

`[read]` **Was der Katalog WERT ist, ist die
ZUTATENZUORDNUNG** ? **nicht die Produktliste.**

`[cmd]` **C-466 hat gemessen: 17 von 596 Substanzen haben eine
Naehrstoffzuordnung, 579 nicht.**

`[read]` **DSLD kann diese Luecke fuellen** ? **es sagt, welche
Zutat welcher Naehrstoff ist, in welcher Einheit.**

### 2 — Zuerst die Substanzbruecke

`[read]` **Aus `Dietary Supplement Facts` die eindeutigen
Zutaten ziehen:**

    Ingredient + Categories + Unit

`[cmd]` **Miss, wie viele eindeutige Zutatennamen es sind** ?
**vermutlich einige tausend, nicht 2,2 Mio.**

`[read]` **Dann gegen `supplements.supplements` (596) und
`supplement_aliases` (2.843) abgleichen.**

`[read]` **Was trifft, fuellt `supplement_nutrients`.**

`[read]` **Was nicht trifft, wird ein Kandidat** ?
`product_content_candidates` **ist dafuer gebaut.**

### 3 — Dann eine Auswahl an Produkten

`[read]` **Nicht alle 220.000** ? **die, deren Zutaten LumeOS
kennt.**

`[cmd]` **Oder die mit `Market Status = On Market`.**

`[read]` **Oder die, die ein Nutzer sucht** ? **ein Barcode-Scan
holt das Produkt bei Bedarf.**

`[cmd]` **`gtin` ist gebaut** ? **der Weg steht.**

### 4 — Die Herkunft

`[cmd]` **`supplement_field_sources` traegt je Feld eine
Quelle** ? **`src_dsld_542` waere die Form.**

`[read]` **Und `supplier_products.source = 'dsld'`.**

## Was zu entscheiden ist

**1** ? **Wie viele Produkte?**

`[read]` **Alle, eine Auswahl, oder auf Abruf?**

**2** ? **Was mit `blend`?**

`[cmd]` **2.657 von 40.000 Zeilen** ? **eine Mischung ohne
Einzelmengen.**

`[read]` **Als eine Zutat mit Gesamtmenge, oder gar nicht?**

**3** ? **Und die Lizenz.**

`[cmd]` **DSLD ist NIH, oeffentlich** ? **aber messen, unter
welcher Bedingung.**

`[read]` **Die openGym-Analyse hat gezeigt, was passiert, wenn
das niemand prueft.**
