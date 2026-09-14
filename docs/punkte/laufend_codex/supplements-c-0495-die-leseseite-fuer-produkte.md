---
nr: C-495
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  produkte: 214780
---

# C-495 — die Leseseite fuer 214.780 Produkte

## Der Anlass

Tom, 2026-09-08, mit Tobias (IFBB-Profi):

> die supplier produkte inklusive details in supplements

`[cmd]` **C-467 hat die Tabelle gebaut, C-485 gefuellt** ?
**kein Leseweg in `apps/`.**

## Gemessen

    supplier_products   214.780
      On Market         121.959
      Off Market         92.821
    6.012 Marken
      BulkSupplements    5.595
      NOW                4.977
      Hawaii Pharm       4.726

    Indizes   marke, market_status: vorhanden
    pg_trgm, fuzzystrmatch: installiert

## Toms Vorgaben

    Marktstatus   nur "On Market" als Standard
    Marke/Firma   filterbar
    Suche         SMARTSUCHE, versteht Fehleingaben
    Sprache       name_en reicht
    Rest          Standard, optimieren spaeter

## Zu bauen

**1** ? **Eine Suchfunktion mit `pg_trgm`.**

`[read]` **`optimum nutriton gold standart` muss `Optimum
Nutrition Gold Standard Whey` finden.**

`[cmd]` **Miss, welche Schwelle (`similarity`) taugt.**

`[read]` **Marke UND Produktname durchsuchen, ein GIN-Index auf
beiden.**

`[cmd]` **MISS die Laufzeit bei 214.780 Zeilen.**

**2** ? **Eine Sicht oder Funktion, die ein Produkt
VOLLSTAENDIG liefert.**

    Kopf     marke, name_en, portionsgroesse,
             portionseinheit, packungsgroesse,
             packungseinheit, market_status, gtin
    Inhalt   product_contents mit ingredient_name,
             amount_per_serving, unit, amount_qualifier,
             ingredient_category, blend_id, reihenfolge
             plus supplements.name_en wo zugeordnet
    Firmen   product_suppliers + suppliers
             (name, land, rolle)

`[cmd]` **BELEG: `Dr. Mercola Miracle Whey`
(`7bd745e2-6822-42d5-bbd9-8e5820b7e36a`) hat 18 Zeilen,
Portion 40 g [2 scoops], Calories 160, Protein 32 g.**

`[cmd]` **Tom hat das Etikett eines Optimum Nutrition Gold
Standard gegen unsere Daten geprueft:** *,,exakt die daten auf
der verpackung, kontrolliert und bestaetigt."*

**3** ? **Eine Markenliste fuer den Filter.**

`[read]` **6.012 sind zu viele fuer ein Pulldown** ? **miss,
wie viele davon On-Market-Produkte haben.**

## Abnahmebedingungen

    A1  die Suche findet "gold standart wey" -> Gold
        Standard Whey. Drei Fehleingaben belegt.
    A2  Laufzeit bei 214.780 Zeilen. Gemessen.
    A3  ein Produkt vollstaendig, mit Dr. Mercola als
        Beleg.
    A4  Marken mit On-Market-Produkten: Zahl.
    A5  RLS und Rechte: authenticated SELECT, anon nichts.
    A6  Gegenprobe: eine Eingabe, die NICHTS finden darf.
    A7  Struktur nach migrations/, Daten in _pipeline/.
    A8  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**`apps/` nicht anfassen** ? **Claude Code baut den Reiter
(G-452).**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen. NICHT anfassen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Zwischenstand 2026-09-08 — die Migration ist nicht live

`[cmd]` **Nachgemessen in der LAUFENDEN Datenbank:**

    search_supplier_products    FEHLT
    supplier_product_detail     FEHLT
    supplier_product_brands     FEHLT
    GIN-Indizes                 keine

`[cmd]` **Die Migration LIEGT vor:**
`20260914080541_c495_supplier_product_catalog_read.sql`, **142
Zeilen, alle drei Funktionen, `gin_trgm_ops`, `word_similarity`,
`0.30`, `authenticated`.**

`[read]` **Er hat gegen `c495_final` gemessen** ? **eine
Wegwerf-Datenbank.**

`[cmd]` **Bei C-485 und C-486 stand *,,live eingespielt"* im
Bericht, hier nicht** ? **er hat es nicht behauptet.**

## Was daran haengt

`[cmd]` **Claude Code hat G-452 gebaut und der Reiter laeuft** ?
**aber ohne die Funktionen.**

`[read]` **Er hat es gemessen und HINGESCHRIEBEN:**

> *,,62 von 4.907 On-Market-Marken ? die vollstaendige Liste
kommt mit C-495."*

> *,,Kein Produktname enthaelt *gold standart wey*. Die
Smartsuche, die Fehleingaben versteht, ist noch nicht
eingespielt (C-495) ? bis dahin wird auf genauen Text
gesucht."*

`[read]` **Die Oberflaeche sagt dem Nutzer, was fehlt und
warum** ? **statt eine leere Liste zu zeigen.**

## Was zu tun ist

`[read]` **Die Migration einspielen.**

`[cmd]` **Danach nachmessen:**

    die drei Funktionen sind da
    die Markenliste zeigt 4.907 statt 62
    "gold standart wey" findet Gold Standard Whey
    die Laufzeit bleibt bei rund 14 ms

`[read]` **Und ein `revoke` fehlt in der Migration** ? **er
schreibt *,,anon hat weder RPC-Execute noch View-Select"*,
aber das Wort steht nicht drin.**

`[cmd]` **Miss, ob `anon` die Rechte ueber die
Vorgabe-Berechtigungen doch bekommt** ? **C-468 hat genau das
als Sicherheitsbefund gemeldet (`pg_default_acl`).**
