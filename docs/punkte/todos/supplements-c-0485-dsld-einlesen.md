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

### 1 — die Produkte SIND der Wert

Tom, 2026-09-08:

> was denkst du, was in thailand gekauft wird? worldbrands oder
> chinesische billigkopien? also hoer auf mit *wertlos*.

`[read]` **Richtig** ? **mein Schluss war falsch.**

`[cmd]` **Wer in Thailand Supplemente kauft, kauft Now Foods,
Optimum Nutrition, Thorne, Solgar, Nature's Bounty** ? **dieselben
Marken, die in DSLD stehen.**

`[cmd]` **`batch1` fuehrt `Vitamin World`** ? **eine Weltmarke,
kein US-Nischenprodukt.**

`[read]` **Und iHerb liefert nach Thailand** ? **die Lieferkette
ist dieselbe.**

`[read]` **Also: die Produktliste ist NICHT das Nebenprodukt** ?
**sie ist der Katalog, den ein Nutzer durchsucht.**

`[read]` **Und die Zutatenzuordnung kommt gratis mit.**

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

### 3 — Die Produkte einlesen

`[read]` **Alle, die auf dem Markt sind.**

`[cmd]` **`Market Status = On Market`** ? **miss, wie viele das
sind.**

`[read]` **Ein Nutzer sucht nach *Now Foods Zinc Picolinate* und
findet es** ? **statt es von Hand einzutragen.**

`[cmd]` **Und `gtin` ist gebaut** ? **ein Barcode-Scan trifft
direkt.**

`[cmd]` **Zum Vergleich: `nutrition` traegt 1,04 Mio Zeilen** ?
**220.000 Produkte sind keine Groessenordnung, die LumeOS
sprengt.**

`[read]` **Was es braucht, ist ein Einlesen in Etappen** ?
**nicht eine Entscheidung gegen die Menge.**

### 4 — Die Herkunft

`[cmd]` **`supplement_field_sources` traegt je Feld eine
Quelle** ? **`src_dsld_542` waere die Form.**

`[read]` **Und `supplier_products.source = 'dsld'`.**

## Was zu entscheiden ist

**1** ? **Alle oder nur `On Market`?**

`[cmd]` **Messen, wie viele der 220.000 noch im Handel sind.**

`[read]` **Ein Produkt, das es nicht mehr gibt, ist im Katalog
Rauschen** ? **aber jemand koennte es noch im Schrank haben.**

**2** ? **Was mit `blend`?**

`[cmd]` **2.657 von 40.000 Zeilen** ? **eine Mischung ohne
Einzelmengen.**

`[read]` **Als eine Zutat mit Gesamtmenge, oder gar nicht?**

**3** ? **Und die Lizenz.**

`[cmd]` **DSLD ist NIH, oeffentlich** ? **aber messen, unter
welcher Bedingung.**

`[read]` **Die openGym-Analyse hat gezeigt, was passiert, wenn
das niemand prueft.**

## Toms Antworten, 2026-09-08

**1** ? *,,alle, was wir haben, das haben wir und kostet uns ja
nichts."*

`[read]` **Keine Auswahl** ? **auch was nicht mehr im Handel
ist, steht bei jemandem im Schrank.**

`[cmd]` **`Market Status` bleibt als Feld** ? **die Ansicht kann
filtern, der Katalog traegt alles.**

**3** ? *,,ist lizenzfrei."*

`[read]` **Keine Provenienzfrage** ? **anders als bei den
Uebungsbildern (C-477).**

`[cmd]` **`supplement_field_sources` traegt die Herkunft
trotzdem** ? `src_dsld_<id>` ? **damit man weiss, woher eine
Zahl stammt.**

## 2 ? die Loesung fuer `blend`, von DSLD selbst

Tom: *,,find eine loesung, die haben es ja auch geloest."*

`[cmd]` **Gemessen an DSLD ID 554,
*Echinacea With Goldenseal Root*:**

    Echinacea/Goldenseal Blend    450   mg    blend
      Echinacea                   NULL  NULL  botanical
      Goldenseal                  NULL  NULL  botanical
      Burdock                     NULL  NULL  botanical
      Gentian                     NULL  NULL  botanical
      Cayenne Pepper              NULL  NULL  botanical
      Wood Betony                 NULL  NULL  botanical

`[read]` **Die Mischung traegt die GESAMTMENGE, die Zutaten
folgen OHNE Menge** ? **in der Reihenfolge des Etiketts.**

`[read]` **Das ist keine Notloesung, das ist die Wirklichkeit:**
**der Hersteller nennt die Einzelmengen nicht.**

### Wie LumeOS es abbildet

`[cmd]` **`product_contents` hat schon:** `amount_per_serving`,
`unit`, `ist_wirkstoff`.

`[read]` **Es fehlt die Zugehoerigkeit zur Mischung:**

    blend_id      zeigt auf die Mischungszeile
    reihenfolge   die Position auf dem Etikett

`[read]` **Dann gilt:**

    Mischungszeile   amount_per_serving = 450 mg
                     blend_id = NULL
    Zutatenzeile     amount_per_serving = NULL
                     blend_id -> die Mischung
                     reihenfolge = 1, 2, 3 ...

### Was das fuer die Naehrstoffbilanz heisst

`[cmd]` **C-466 rechnet aus `product_contents` die
Naehrstoffmengen.**

`[read]` **Eine Zutat ohne Menge kann nicht rechnen** ? **sie
faellt aus der Bilanz.**

`[cmd]` **Und die Bilanz sagt es:** `unmapped_taken_log_count`
**ist dafuer gebaut.**

`[read]` **Die Reihenfolge traegt trotzdem Information:**
**auf einem Etikett steht die groesste Menge zuerst.**

`[read]` **Das ist keine Zahl, aber es ist mehr als nichts** ?
**wer 450 mg einer Sechsermischung nimmt, weiss, dass Echinacea
den groessten Anteil hat.**

### Und der zweite Fall

`[cmd]` **`Proprietary Blend 5 mg` ohne jede Zutatenzeile.**

`[read]` **Dann ist die Mischung das Einzige, was dasteht** ?
**eine Zeile, keine Kinder.**

`[cmd]` **Miss, wie oft das vorkommt.**
