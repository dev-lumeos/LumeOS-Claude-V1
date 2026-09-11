---
nr: C-467
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-466
entscheidung: null
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
  substanzen: 596
  produkte: 0
---

# C-467 — Lieferantenprodukte als eigene Ebene

## Was Tom will

Tom, 2026-09-08:

> wir werden parallel supplierprodukte einpflegen, welche dann
> individuell aktiviert werden fuer user. und/oder einen
> supplierfilter drin haben. ich denke, wir koennen die vorhandenen
> tables nutzen und mit quellen arbeiten ? oder was denkst du?

## Was die Datenbank schon traegt

`[cmd]` **`parent_id`: 101 Substanzen haben einen Elternteil,
alle 101 aufloesbar.**

`[read]` **Die Hierarchie funktioniert.**

`[cmd]` **`source`: fuenf Werte** ? `kimi_supplement` 216,
`f05_substance_candidate` 149, `kimi_performance` 124,
`kimi_peptide` 79, `lumeos_supplement_catalog` 28.

`[read]` **Die Herkunft je Zeile ist vorgesehen** ? **ein
`supplier_xyz` waere ein sechster Wert.**

`[cmd]` **`im_katalog`: 412 ja, 184 nein** ? **der Schalter fuer
*sichtbar oder nicht* existiert.**

`[cmd]` **`supplement_field_sources`, 2.815 Zeilen, JE FELD eine
Quelle:**

    cas_number          src_pubchem_98521      B  2026-08-20
    external_ids.UNII   src_gsrs_ZPZ473F40K    A  2026-08-20
    interaction_traits  substance_groups.json  B  2026-08-20

`[read]` **Das ist *,,mit Quellen arbeiten"*** ? **und feiner als
noetig: nicht je Zeile, sondern je Feld, mit Evidenzklasse und
Stichtag.**

## Warum `parent_id` allein nicht reicht

`[read]` **Ein Produkt ist keine Substanz mit anderem Namen.**

    Substanz   Zinkpicolinat        -> ZN, Faktor 0.21
    Produkt    Now Foods Zinc Pic.  50 mg/Kapsel, 120 Stueck
                                    -> Zinkpicolinat
                                    -> Reismehl
                                    -> Gelatine

`[read]` **Ein Praeparat hat eine ZUTATENLISTE** ? **ein
Multivitamin hat dreissig Positionen.**

`[cmd]` **`parent_id` ist 1:1** ? **das traegt es nicht.**

## Der Vorschlag

`[read]` **Die bestehenden Tabellen bleiben. Drei kommen dazu:**

### 1 · `suppliers`

    id, name, land, website, notiz,
    is_active, source, created_at, updated_at

`[read]` **Marke oder Haendler** ? **messen, ob das dasselbe ist.**

`[read]` **Ein Produkt hat einen Hersteller, wird aber ueber
mehrere Haendler verkauft** ? **entscheiden, was gefuehrt wird.**

### 2 · `supplier_products`

    id, supplier_id, name, produktform,
    packungsgroesse, packungseinheit,
    gtin, artikelnummer,
    portionsgroesse, portionseinheit,
    im_katalog, is_active,
    source, created_at, updated_at

`[cmd]` **`gtin`** ? **der Barcode. Damit koennte ein Nutzer
spaeter ein Etikett scannen.**

`[read]` **`im_katalog` je Produkt** ? **dieselbe Bauform wie bei
den Substanzen.**

### 3 · `product_contents`

    id, product_id, supplement_id,
    amount_per_serving, unit,
    conversion_factor, ist_wirkstoff,
    source, created_at, updated_at

`[cmd]` **Dieselbe Form wie `supplement_nutrients`** ? **die
Bauform ist erprobt.**

`[read]` **`ist_wirkstoff`** ? **Reismehl und Gelatine stehen auf
dem Etikett, zaehlen aber nicht.**

## Wie der Filter laeuft

`[read]` **Zwei Ebenen:**

    supplier_id     der Nutzer waehlt Marken
    im_katalog      LumeOS entscheidet, was ueberhaupt
                    angeboten wird

`[read]` **Und was der Nutzer aktiviert, gehoert in
`user_supplement_settings`** ? **die Tabelle ist leer, aber da.**

## Wie die Naehrstoffe durchkommen

    Produkt -> product_contents -> Substanz
            -> supplement_nutrients -> Naehrstoff

`[read]` **Zwei Spruenge statt einem** ? **aber jeder mit einem
Umrechnungsfaktor.**

`[cmd]` **Ein Multivitamin rechnet sich aus seinen dreissig
Zutaten** ? **keine eigene Naehrstoffzeile noetig.**

## Toms Antworten, 2026-09-08

### 1 · Ein Supplier ist ein Supplier

Tom:

> supplier kriegt spaeter einen account zum selber pflegen. uns
> egal, ob es der hersteller oder ein haendler ist ? fuer uns ein
> supplier.

`[read]` **Keine Unterscheidung** ? **EINE Tabelle, ein Begriff.**

`[read]` **Und ein `user_id` an `suppliers`** ? **spaeter meldet
sich der Supplier an und pflegt selbst.**

`[cmd]` **Miss, ob das Coach-Muster passt:**
`coach.coach_profiles` **verbindet `user_id` mit einem Profil.**

`[read]` **Heute NULL** ? **Tom pflegt ein, ein Konto gibt es noch
nicht.**

### 2 · Tom pflegt die ersten Daten ein

Tom:

> ich pflege ein, ich organisiere die ersten daten. spaeter wird
> das ein supplier selber machen, das definieren wir noch.

`[read]` **Also: ein Einpflegeweg fuer den Admin, kein
Supplier-Portal.**

`[cmd]` **`apps/admin` hat 25 Dateien und laeuft auf 3210**
(G-411: die Anmeldung war kaputt, ist behoben).

`[read]` **Dort gehoert es hin.**

`[read]` **Und die Form des Einpflegens ist offen** ? **Maske,
Datei-Import, oder beides.**

`[cmd]` **`supplement_field_sources` traegt schon je Feld eine
Quelle** ? **dieselbe Spur fuer Produkte.**

### 3 · Unbekannte Substanz -> Meldung im Admin

Tom:

> wenn wir eine substanz nicht kennen, muss das im admin gemeldet
> werden und wir checken das und reichern daten an.

`[read]` **Kein Ablehnen, kein stilles Anlegen** ? **eine
Meldung.**

`[cmd]` **Der Weg existiert fuer aehnliche Faelle:**

    alias_resolution_candidates    64 Zeilen
    stack_curation_candidates       2
    stack_curation_candidate_items  2
    pubchem_conflict_records       20
    wada_conflict_records           8

`[read]` **Fuenf Kandidaten- und Konflikttabellen** ? **die
Bauform ist da.**

`[read]` **Also: `product_content_candidates`** ? **was ein
Etikett nennt, aber LumeOS nicht kennt.**

`[cmd]` **Mit Status** ? **offen, geprueft, angereichert,
abgelehnt.**

`[read]` **Und wenn eine Substanz angereichert ist, wird der
Kandidat zur Zutat** ? **derselbe Weg wie bei
`stack_curation_decisions`.**

## Was daraus folgt

`[read]` **Vier Tabellen statt drei:**

    suppliers                   Marke/Haendler, spaeter
                                mit user_id
    supplier_products           Produkt, Packung, GTIN
    product_contents            Zutatenliste je Portion
    product_content_candidates  was wir nicht kennen

`[read]` **Und ein Einpflegeweg im Admin.**

## Was noch offen ist

`[read]` **Die FORM des Einpflegens** ? **Maske je Produkt, oder
eine Datei mit vielen?**

`[read]` **Ein Multivitamin hat dreissig Zutaten** ? **die tippt
niemand einzeln.**

`[cmd]` **Messen, ob `apps/admin` schon einen Importweg hat** ?
**die Lebensmitteldatenbank hat einen (`food_curation_*`).**

## Was urspruenglich zu entscheiden war

**1** ? **Hersteller oder Haendler?**

`[read]` **Now Foods ist ein Hersteller. iHerb ist ein Haendler.
Beide sind *,,supplier"*.**

**2** ? **Wer pflegt die Produkte ein?**

`[cmd]` **`supplement_field_sources` traegt schon Quellen** ?
**dieselbe Spur fuer Produkte?**

`[read]` **Von Hand, aus DSLD, aus einem Etikettfoto?**

`[cmd]` **DSLD hat ~150.000 amerikanische Etiketten, frei** ?
**aber nichts aus Thailand.**

**3** ? **Was passiert, wenn ein Produkt eine Substanz enthaelt,
die LumeOS nicht kennt?**

`[cmd]` **596 Substanzen** ? **ein Etikett nennt schnell etwas
Unbekanntes.**

`[read]` **Ablehnen, oder als Kandidat anlegen?**

`[cmd]` **`alias_resolution_candidates` (64 Zeilen) und
`stack_curation_candidates` zeigen, dass es fuer aehnliche Faelle
schon einen Weg gibt.**
