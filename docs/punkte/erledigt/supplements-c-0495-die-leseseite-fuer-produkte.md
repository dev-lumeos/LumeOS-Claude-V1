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
erledigt: 2026-09-08
commit: ce10f276
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

**Ergaenzt 2026-09-14 -- jetzt in der laufenden lokalen Supabase-Datenbank eingespielt und nachgemessen.**

Vor dem Einspielen liegt die Sicherung unter
`backup/schema/20260914160018_c495_supplier_product_catalog_read_vor_einspielen.sql`
(1.587.226 Bytes). Danach wurde
`20260914080541_c495_supplier_product_catalog_read.sql` erfolgreich ausgefuehrt
und als angewendet in der lokalen Supabase-Migrationshistorie vermerkt.

### Live-Nachweis

`[cmd]` Alle drei Lesewege existieren jetzt:

    supplements.search_supplier_products(text, text, text, integer)
    supplements.supplier_product_detail(uuid)
    supplements.supplier_product_brands

`[cmd]` Beide erwarteten GIN-Indizes existieren jetzt:

    supplier_products_name_en_trgm_idx
    supplier_products_marke_trgm_idx

`[cmd]` Die Markenansicht liefert **4.907** Marken mit mindestens einem
On-Market-Produkt.

`[cmd]` Die drei Fehlerschreibungen liefern jeweils unter den 50 Treffern ein
Gold Standard Whey:

    gold standart wey                    50 Treffer, hoechste Aehnlichkeit 0.666667
    optimum nutriton gold standart       50 Treffer, hoechste Aehnlichkeit 0.483871
    optimum nutrtion gold standrad whey  50 Treffer, hoechste Aehnlichkeit 0.384615

`[cmd]` Die Gegenprobe `qzvwxjplk` liefert **0** Treffer.

Die gewaehlte Schwelle ist `pg_trgm.word_similarity_threshold = 0.30`.
`word_similarity` ist fuer Wortfehler robuster als eine reine
Gesamtstring-Aehnlichkeit; 0.35 wuerde die dritte Fehlerschreibung nicht mehr
zuverlaessig einschliessen.

`[cmd]` Der Live-Plan fuer `gold standart wey` ueber 214.780 Produkte nutzt
beide GIN-Indizes per `BitmapOr`; `EXPLAIN (ANALYZE, BUFFERS)` misst
**14.104 ms** Ausfuehrungszeit (833 Buffer-Hits, 9 Reads). Damit bleibt die
Laufzeit bei rund 14 ms.

### Vollstaendiger Produktleser

`[cmd]` `supplier_product_detail('7bd745e2-6822-42d5-bbd9-8e5820b7e36a')`
liefert fuer Dr. Mercola **Miracle Whey Protein Powder Original**:

    Portion: 40.0000 Gram(s) [2 scoops]
    Inhaltszeilen: 18
    Calories: 160 {Calories}
    Protein: 32 g

Der JSON-Leser liefert den geforderten Kopf, alle Inhaltsfelder samt optionalem
`supplements.name_en` und die Firmen mit Name, Land und Rolle.

### Rechte- und Default-ACL-Befund

Die Behauptung am Punktende, in der Migration fehle ein `REVOKE`, traf auf die
vorliegende Datei nicht zu: Sie enthaelt fuer beide Funktionen
`REVOKE ALL ... FROM PUBLIC, anon` und fuer die Markenansicht
`REVOKE ALL ... FROM PUBLIC, anon`, anschliessend ausschliesslich die
`authenticated`-Grants.

`[cmd]` Die Live-ACL-Pruefung bestaetigt dies:

    Rolle            Suche Execute   Detail Execute   Marken Select
    anon             nein            nein             nein
    authenticated    ja              ja               ja

Ein echter `SET ROLE anon`-Zugriffsversuch auf Funktion und Ansicht endet
jeweils mit `permission denied for schema supplements`; `authenticated` kann
beide Leser verwenden (4.907 Marken, 50 Suchtreffer).

`[cmd]` Der Befund aus C-468 bleibt fuer **neue Objekte in `public`** relevant:
`pg_default_acl` des Owners `postgres` gibt dort `anon=X`. Diese C-495-Objekte
liegen jedoch in `supplements`; fuer diese Kombination gibt es keine passende
Function-Default-ACL, und die expliziten Revokes verhindern eine geerbte
PUBLIC-Ausfuehrung. Die Ansicht nutzt zusaetzlich `security_invoker = true`.

### Kette und Validierung

Die Migration ist in `supabase/_pipeline/kette.json` eingetragen; der
reproduzierbare Nachweistest liegt unter
`supabase/_pipeline/_validierung/supplements-c495-supplier-product-catalog.test.ts`.

`[cmd]` Vollkette in der Wegwerf-Datenbank `c495_final`: bestanden.
`[cmd]` C-495-Nachweistest: 3/3 bestanden.
`[cmd]` `node tools/migration-kette-pruefen.mjs`: gruen.
`[cmd]` `node tools/punkte-pruefen.mjs`: gruen (681 Punkte; die bekannten
25 `kind_von`-Befunde unveraendert).

`pnpm gate` erreicht die C-495-Pruefungen, bleibt jedoch wegen zwei
vorbestehender A-62-Abwesenheitsmeldungen in Training/SSOT rot. Diese Dateien
wurden nicht angefasst. Ebenso wurden weder `apps/` noch ein Dev-Server
angefasst. Nichts wurde gestaged, committed oder gepusht.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

    search_supplier_products   da
    supplier_product_detail    da
    supplier_product_brands    4.907 Marken
    GIN-Indizes                name_en_trgm, marke_trgm

### Die Suche selbst getestet

`[cmd]` **`gold standart wey`:**

    Optimum Nutrition | 100% Gold Standard Whey Chocolate Malt
    ON Optimum Nutrition | Gold Standard 100% Casein Choc Creme
    Optimum Nutrition | Gold Standard 100% Casein Choc Peanut

`[cmd]` **`optimum nutriton`** ? **findet `Nature's Optimal
Nutrition`, `Maximum Nutrition`** ? **plausible Nachbarn.**

`[cmd]` **`qzvwxjplk`: 0 Treffer.**

`[read]` **Drei Tippfehler, die Schwelle 0,30 traegt.**

`[cmd]` **Live-Plan 14,1 ms, beide GIN-Indizes per `BitmapOr`.**

### Mein revoke-Befund war falsch

> *,,Der vermutete fehlende REVOKE war in der vorliegenden
Migration nicht tatsaechlich fehlend."*

`[cmd]` **Selbst nachgemessen, Zeilen 126, 127, 131:**

    REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon
    REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon
    REVOKE ALL ON supplier_product_brands FROM PUBLIC, anon

`[read]` **Ich habe nach `revoke` in KLEINSCHREIBUNG gesucht,
die Datei schreibt `REVOKE`.**

`[read]` **Achter falscher Befund heute** ? **und wieder
derselbe Fehler: ein Werkzeug gelesen, das Ergebnis nicht
geprueft.**

### Und die Default-ACL

> *,,Die problematische Default-ACL besteht weiter fuer neue
Funktionen in `public`, betrifft diese Objekte in
`supplements` aber nicht."*

`[cmd]` **C-468 hatte sie in `public` gemeldet, C-470 und C-473
haben sie entschaerft** ? **fuer FUNKTIONEN besteht sie noch.**

`[read]` **Er hat die Grenze gemessen, statt sie zu
behaupten.**

### Was daran haengt

`[cmd]` **G-452 ist abgenommen mit offenem A3** ? **die
Smartsuche laeuft jetzt.**

`[read]` **Sein Rueckfall greift ohne Codeaenderung** ?
*,,sobald C-495 da ist, greift der erste Zweig."*

`[cmd]` **Zu pruefen: zeigt der Reiter jetzt 4.907 Marken statt
62, und findet die Suche Tippfehler?**

**Abgenommen.**


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
