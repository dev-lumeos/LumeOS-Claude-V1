---
nr: C-485
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-467
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 7f57ac48
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

## Teil 2 ? der Quellenschalter

Tom, 2026-09-08:

> danach will ich waehrend der entwicklung irgendwo einen
> schalter oder filter haben fuer seeddaten oder dsld daten,
> dass ich beide sources ansehen kann. bei dsld daten brauch ich
> die zusaetzlichen daten und filters.

### Was schon da ist

`[cmd]` **`supplements.supplements.source`, fuenf Werte:**

    kimi_supplement             216
    f05_substance_candidate     149
    kimi_performance            124
    kimi_peptide                 79
    lumeos_supplement_catalog    28

`[cmd]` **Und `supplier_products` hat `source` (C-467)** ?
**`dsld` waere der sechste Wert.**

`[cmd]` **`im_katalog`: 412 ja, 184 nein** ? **ein Schalter,
der schon filtert.**

`[read]` **Der Filter braucht also keine neue Spalte** ? **nur
eine Bedienung.**

### Was DSLD zusaetzlich mitbringt

`[cmd]` **Aus `Product Overview`:**

    Product Type [LanguaL]      Vitamin [A1302]
    Supplement Form [LanguaL]   Tablet or Pill [E0155]
    Market Status               On Market
    Date Entered into DSLD      2011-11-25
    Net Contents                100 Easy To Swallow Coated Tablets
    Suggested Use               DIRECTIONS: For adults, take one...

`[cmd]` **Aus `Dietary Supplement Facts`:**

    DSLD Ingredient Categories  16 Werte
    % Daily Value per Serving   5882
    Daily Value Target Group    Adults and children 4+

`[cmd]` **Aus `Company Information`:**

    Company Name, Address, City, State, ZIP, Country
    Manufacturer / Distributor / Packager / Reseller / Other
      je ja oder nein

`[read]` **Die letzte Gruppe beantwortet die Frage aus C-467:**
*,,Hersteller oder Haendler?"* ? **DSLD sagt es je Firma.**

`[cmd]` **Toms Antwort war:** *,,uns egal, fuer uns ein
supplier"* ? **aber das Merkmal kommt gratis mit und kann ein
Filter werden.**

### Die Filter, die daraus folgen

    Quelle           seed | dsld | alle
    Marktstatus      On Market | Off Market | alle
    Produkttyp       Vitamin, Mineral, Botanical, ...
    Darreichung      Tablette, Kapsel, Pulver, Fluessig
    Firmenrolle      Hersteller | Haendler | beide
    Land             US, ... (aus Company Information)
    Zutatenkategorie 16 Werte aus DSLD

`[read]` **Und einer, den nur die Entwicklung braucht:**

    mit Naehrstoffzuordnung | ohne

`[cmd]` **C-466 misst heute 17 von 596** ? **nach DSLD sieht
man sofort, was der Import gebracht hat.**

### Wo der Schalter hingehoert

`[cmd]` **`apps/web/v2/supplements`, Reiter `Katalog`** ?
**er zeigt heute 412.**

`[read]` **Und die Suche im Reiter `Stack`** ? **wer ein
Praeparat hinzufuegt, sucht dort.**

`[read]` **Nicht in `Settings`** ? **es ist kein
Nutzerwunsch, es ist ein Entwicklungswerkzeug.**

`[cmd]` **Vergleich: `tab-foods.tsx` hat die Filterleiste fuer
7.140 Lebensmittel** ? **dieselbe Bauform.**

### Was zu entscheiden ist

`[read]` **Bleibt der Schalter drin, wenn LumeOS ausgeliefert
wird?**

`[read]` **Ein Nutzer will nicht wissen, ob ein Praeparat aus
einem Seed oder aus DSLD kommt** ? **er will es finden.**

`[cmd]` **Aber `Katalog 412` steht heute als Zahl im Reiter** ?
**nach dem Import waeren es 220.000, und dann braucht die Suche
ohnehin Filter.**

## Marke UND Hersteller, 2026-09-08

Tom: *,,hersteller oder brandname natuerlich auch."*

`[cmd]` **DSLD fuehrt BEIDES, und sie unterscheiden sich:**

    Product Overview.Brand Name     Vitamin World
    Company Information.Company     Vitamin World, Inc.
                        Country     U.S.
                        Manufacturer  yes

`[read]` **Die Marke steht auf der Packung, die Firma im
Impressum** ? **oft derselbe Name mit Rechtsform, manchmal
nicht.**

`[cmd]` **Und je Produkt koennen MEHRERE Firmen stehen** ?
Hersteller, Haendler, Packer, Wiederverkaeufer.

### Was C-467 braucht

`[cmd]` **`suppliers` hat heute:** `name`, `land`, `website`,
`notiz`, `is_active`, `source`.

`[read]` **Toms fruehere Antwort war:** *,,uns egal, ob
hersteller oder haendler ? fuer uns ein supplier."*

`[read]` **Das bleibt richtig fuer die TABELLE** ? **eine Firma
ist eine Firma.**

`[read]` **Aber die ROLLE gehoert an die Verbindung:**

    supplier_products
      marke            "Vitamin World"      <- NEU
      supplier_id      -> Vitamin World, Inc.

    product_suppliers  (Verbindungstabelle)  <- NEU?
      product_id, supplier_id, rolle
      rolle: hersteller | haendler | packer |
             wiederverkaeufer | sonst

`[cmd]` **Miss, wie oft ein Produkt mehr als eine Firma hat** ?
**wenn es selten ist, reicht ein `supplier_id` plus `rolle`.**

### Die Filter daraus

    Marke        "Now Foods", "Thorne", ...
    Firma        "Now Foods, Inc."
    Rolle        Hersteller | Haendler
    Land         U.S., ...

`[read]` **Und die Marke ist der Filter, den ein NUTZER
braucht** ? **niemand sucht nach *Vitamin World, Inc.*.**

`[read]` **Die Firma ist der Filter fuer die Entwicklung** ?
**und fuer die Frage, wer wirklich herstellt.**

## Der Auftrag, 2026-09-08

`[read]` **Zwei Teile: die Tabellen anpassen, dann den Import
in Etappen.**

### Was heute steht

`[cmd]` **C-467, alle vier Tabellen LEER:**

    suppliers                  id, user_id, name, land,
                               website, notiz, is_active, source
    supplier_products          supplier_id, name, produktform,
                               packungsgroesse/-einheit, gtin,
                               artikelnummer, portionsgroesse/
                               -einheit, im_katalog, is_active,
                               source
    product_contents           product_id, supplement_id,
                               amount_per_serving, unit,
                               conversion_factor, ist_wirkstoff,
                               source
    product_content_candidates product_id, ingredient_name,
                               amount_per_serving, unit, status,
                               source

`[cmd]` **Und der Bestand:** `supplements` 596,
`supplement_aliases` 2.843.

### Teil 1 ? die Tabellen anpassen

**a** ? **`supplier_products.marke`**

`[cmd]` **DSLD fuehrt beides:** `Brand Name = Vitamin World`,
`Company Name = Vitamin World, Inc.`

`[read]` **Die Marke steht auf der Packung, die Firma im
Impressum.**

`[read]` **Der Nutzer sucht die MARKE.**

**b** ? **die Firmenrolle**

`[cmd]` **`Company Information` traegt je Firma:**
`Manufacturer`, `Distributor`, `Packager`, `Reseller`, `Other`
? **je ja oder nein.**

`[cmd]` **Miss, wie oft ein Produkt MEHR ALS EINE Firma hat.**

`[read]` **Selten -> `supplier_id` plus `rolle` am Produkt.**
`[read]` **Haeufig -> eine Verbindungstabelle.**

**c** ? **`blend`**

`[cmd]` **DSLD ID 554 zeigt die Loesung:**

    Echinacea/Goldenseal Blend   450   mg   blend
      Echinacea                  NULL  NULL botanical
      Goldenseal                 NULL  NULL botanical
      Burdock                    NULL  NULL botanical

`[read]` **Die Mischung traegt die Gesamtmenge, die Zutaten
folgen ohne Menge, in Etikettreihenfolge.**

`[read]` **`product_contents` braucht:**

    blend_id      zeigt auf die Mischungszeile
    reihenfolge   die Position auf dem Etikett

`[cmd]` **Und miss, wie oft eine Mischung OHNE Zutatenzeilen
dasteht** (`Proprietary Blend 5 mg`).

**d** ? **die DSLD-Felder**

    Product Type [LanguaL]      Vitamin [A1302]
    Supplement Form [LanguaL]   Tablet or Pill [E0155]
    Market Status               On Market
    Date Entered into DSLD
    Suggested Use
    DSLD ID                     542

`[read]` **Miss, welche davon `supplier_products` schon traegt
und welche eine Spalte brauchen.**

`[cmd]` **`artikelnummer` koennte die DSLD-ID aufnehmen** ?
**oder sie bekommt eine eigene Spalte, damit ein Abgleich
moeglich bleibt.**

### Teil 2 ? der Import, in Etappen

**Etappe 1: die Zutaten.**

`[cmd]` **Gemessen an `batch1`: 200.650 Zeilen -> 14.677
EINDEUTIGE Zutaten.**

`[read]` **Ueber elf Dateien vermutlich 30.000 bis 50.000** ?
**nicht 2,2 Mio.**

`[read]` **Gegen `supplements` (596) und `supplement_aliases`
(2.843) abgleichen.**

    trifft        -> supplement_id steht
    trifft nicht  -> product_content_candidates

`[cmd]` **Miss, wie viele treffen** ? **das ist die Zahl, die
zaehlt.**

**Etappe 2: die Firmen.**

`[cmd]` **`Company Information`, 30.505 Zeilen je Datei** ?
**eindeutige Firmen zaehlen.**

**Etappe 3: die Produkte.**

`[cmd]` **20.000 je Datei, 220.000 gesamt.**

Tom: *,,alle, was wir haben, das haben wir und kostet uns ja
nichts."*

`[read]` **Keine Auswahl** ? **`Market Status` bleibt als Feld,
die Ansicht filtert.**

**Etappe 4: die Zutatenzeilen.**

`[cmd]` **2,2 Mio** ? **die groesste Menge.**

`[read]` **Miss, wie lange eine Datei braucht, bevor du alle
elf laeufst.**

`[cmd]` **Zum Vergleich: `nutrition` traegt 1,04 Mio Zeilen** ?
**die Groessenordnung ist bekannt.**

### Wohin die Daten gehoeren

`[cmd]` **D-17, Weg B:** **Struktur nach `migrations/`, Daten
in einen nummerierten Schritt unter `_pipeline/`.**

`[read]` **268 MB XLSX gehoeren NICHT in die Kette** ? **miss,
ob ein Zwischenformat (CSV, COPY) noetig ist.**

`[cmd]` **`nutrition` hat einen CSV-Import** ? **dieselbe
Bauform.**

### Die Lizenz

Tom: *,,ist lizenzfrei."*

`[cmd]` **Trotzdem die Herkunft eintragen:**
`supplement_field_sources` **traegt sie je Feld,
`source = dsld` am Produkt.**

## Abnahmebedingungen

    A1  die Tabellenanpassungen: marke, Firmenrolle,
        blend_id, reihenfolge, DSLD-Felder.
        Je Spalte die Fundstelle aus den Daten.
    A2  wie oft hat ein Produkt mehrere Firmen? Gemessen.
    A3  wie oft steht eine Mischung ohne Zutaten? Gemessen.
    A4  Etappe 1: eindeutige Zutaten gezaehlt, gegen
        supplements und aliases abgeglichen. WIE VIELE
        TREFFEN?
    A5  Etappe 2 bis 4: je Etappe die Zeilenzahl und
        die Laufzeit.
    A6  was NICHT zugeordnet werden konnte, steht als
        Kandidat. Zahl.
    A7  RLS und Rechte: authenticated SELECT, anon nichts.
    A8  Struktur nach migrations/, Daten in _pipeline/.
    A9  Waechter GRUEN -- oder jede rote Zeile mit Grund
        im Sollstand.
    A10 Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINE Zutat erfinden** ? **was nicht trifft, wird ein
Kandidat.**

**KEINE Einzelmenge fuer eine Mischung erfinden** ? **DSLD hat
sie nicht, der Hersteller nennt sie nicht.**

**Keine Oberflaeche** ? **der Quellenschalter ist ein eigener
Auftrag.**

**`apps/` nicht anfassen** ? **Claude Code arbeitet an G-435.**

Nicht committen, nicht stagen, nicht pushen.

## Bericht

Stand 2026-09-12: gebaut, vollgekettet und in `postgres` eingespielt.

### A1 — Struktur und Fundstellen

`20260912001800_c485_dsld_import.sql` schreibt keine Daten und ergaenzt:

- `supplier_products.marke` aus `Product Overview.Brand Name`; `dsld_id`
  (eigenstaendige, eindeutige DSLD-Kennung), `product_type` aus `Product
  Type [LanguaL]`, `market_status`, `date_entered`, `suggested_use`.
  Das vorhandene `produktform` wird aus `Supplement Form [LanguaL]` gefuellt.
- `suppliers.name_normalized` dedupliziert technisch, der erste originale
  Firmenname bleibt `name`. `product_suppliers(product_id, supplier_id, rolle)`
  bildet Manufacturer, Distributor, Packager, Reseller und Other aus
  `Company Information` ab.
- `product_contents` erhaelt Etikettentext/-kategorie, `blend_id`,
  `reihenfolge`, Rohwert und Mengenoperator; unbekannte Zutaten duerfen kein
  `supplement_id` haben. Kandidaten zeigen auf die konkrete Inhaltszeile.
- `supplement_field_sources.supplier_product_id` plus `source='dsld'`
  dokumentiert 2.743.617 feldgenaue Produkt-Herkunften.

### A2 — Firmenrolle

253.514 Company-Zeilen, davon 26.009 ohne Name, ergeben nach
Leerraum-/Grosskleinschreibungs-Normalisierung 6.419 Firmen und 235.618
Produkt-Firmenrollen. 13.070 von 214.780 Produkten (6,09 %) haben mehrere
Firmen: 13.007 zwei, 57 drei, 6 vier. Die Verbindungstabelle ist daher
notwendig; `supplier_id + rolle` am Produkt waere nicht verlustfrei.

### A3 — Blends

38.666 `blend`-Zeilen haben keine Kinder und bleiben einzelne mengenbelegte
Blend-Zeilen. Die Messung ist kategorie-bewusst, damit eine nachfolgende,
selbst mengenlose Blend nicht faelschlich als Kind gilt. Importiert sind 0
erfundene Einzelmengen an `blend_id`-Kindern.

### A4 und A6 — Zutaten

2.020.128 Facts-Zeilen enthalten 70.593 normalisierte eindeutige Zutaten.
Gegen 596 `supplements` und 2.843 Aliase treffen 377 Namen eindeutig; 43
sind mehrdeutig, 70.173 treffen nicht. Nur die 302.293 eindeutig gemappten
Zeilen haben `supplement_id`; 1.717.835 Wirkstoffzeilen bleiben als
`product_content_candidates` erhalten. Keine Zutat wurde erfunden.

### A5 — Etappen, Zeilen und Live-Laufzeit

Gesamtlauf auf `postgres`: 399,441 s.

- Firmen: 6.419 Firmen, 235.618 Rollen, 60,913 s.
- Produkte: 214.780, davon 121.959 On Market und 92.821 Off Market,
  57,926 s; nichts wurde nach Marktstatus ausgesiebt.
- Zutaten: 2.020.128 Facts plus 980.854 einzeln erhaltene `Other
  Ingredients` = 3.000.982 Inhaltszeilen, 252,215 s; Feldherkuenfte:
  25,804 s.

Die XLSX bleiben unter `docs/ssot/daten/`; CSV ist nur der gestreamte
`COPY`-Draht, keine zweite Multi-Millionen-Datei.

### A7 — RLS und Rechte

Auf `suppliers`, `supplier_products`, `product_suppliers`,
`product_contents`, `product_content_candidates` und
`supplement_field_sources` hat `authenticated` genau `SELECT`, `anon` kein
`SELECT`. RLS ist auch auf der neuen Verbindungstabelle aktiv.

### A8 — D-17

Struktur: `supabase/migrations/20260912001800_c485_dsld_import.sql`.
Daten: `supabase/_pipeline/13_supplements/485_dsld_import.ts` mit
`485_dsld_import.py` als COPY-Stream; beide stehen in `kette.json`.

### A9 — Waechter

`migration-datenlogik-pruefen.mjs` ist gruen: 44 historische Operationen,
exakt Sollstand, keine neue Datenlogik. Der C-485-Strukturtest besteht 5/5.
Die Vollkette `lumeos_c485_vollkette` ist gruen: 202 Schritte,
`KETTE OK: 820,7 s`; neue Mindestzeilen, Rechte und RLS sind ok.

Der Live-Schemacheck hat genau eine C-485-fremde rote Zeile:
`medical.user_medications` hat die bekannte abweichende Spaltenreihenfolge
(C-480, bewusst nicht hier gebaut). Der nicht blockierende
`shopping_lists DELETE`-Hinweis ist ein bestehender C-473-Live-/Kettenstand-
Unterschied; C-485 aendert keine `nutrition`-Rechte. Alle C-485-Pruefungen
sind gruen.

`pnpm gate` erreicht den Punktelauf grün, bricht danach aber an der
bestehenden, C-485-fremden G-261-Sollabweichung ab:
`goals.nutrition_targets` hat 7 Naehrstoffspalten bei Soll 6
(`zwei-wahrheiten-pruefen.mjs`). C-485 beruehrt weder `goals` noch diese
Sollzahl; der Befund wird nicht verdeckt oder in diesem Auftrag umgebaut.

### A10 — Sicherung, Vollkette, Punktelauf

Vor dem Einspielen: `backup/data/20260912110500_c485_vor_live.dump`
(26.533.262 Bytes). Vor dem Kettenaufbau:
`backup/schema/20260912105238_c43_vor_kettenlauf.sql`. Der Punktelauf ist
gruen: 25 Befunde, exakt Sollstand.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    supplier_products            214.780
    suppliers                      6.419
    product_suppliers            (Rollentabelle, gebaut)
    product_contents           3.000.982
    product_content_candidates 1.717.835
    marke                        gebaut
    blend_id, reihenfolge        gebaut
    Rechte                       authenticated SELECT

`[cmd]` **Selbst gemessen: alle acht.**

### Die Wirkung ist groesser als gemeldet

`[cmd]` **Er meldete 377 gemappte Bezeichnungen** ? **gemessen:**

    Zeilen mit supplement_id      302.293
    eindeutige Substanzen             243

`[read]` **C-466 hat 17 von 596 Substanzen mit
Naehrstoffzuordnung gemessen** ? **jetzt haben 243 einen
Produktbezug.**

`[read]` **Das ist die Zahl, die zaehlt.**

### Die Mischungen

`[cmd]` **71.195 Mischungen mit Kindern, 473.803 Zeilen darin.**

`[cmd]` **Und 38.666 Mischungen OHNE Kinder** ? **der Fall
`Proprietary Blend 5 mg`, den ich zu messen verlangt hatte.**

> *,,0 erfundene Blend-Einzelmengen"*

`[read]` **Er hat keine Menge erfunden** ? **wie DSLD selbst.**

### 1,7 Mio Kandidaten

`[cmd]` **`product_content_candidates`: 1.717.835.**

`[read]` **Mehr als die Haelfte aller Inhaltszeilen** ? **das ist
die Luecke, sichtbar gemacht statt gefuellt.**

`[cmd]` **C-467 hat die Tabelle dafuer gebaut:** *,,unbekannte
Zutaten -> Kandidat, nie still angelegt."*

`[read]` **Sie erfuellt jetzt ihren Zweck.**

### Die Rollentabelle

`[cmd]` **`product_suppliers` existiert** ? **235.618
Firmenrollen.**

`[read]` **Er hat gemessen, dass ein Produkt mehrere Firmen hat,
und die Verbindungstabelle gebaut** ? **statt eine Spalte zu
nehmen.**

### G-261 ist nicht seine Abweichung

`[cmd]` **`goals.nutrition_targets` hat 15 Spalten, darunter
`fiber_g`.**

`[cmd]` **C-464 hat sie HEUTE gebaut** ? **der Sollstand wurde
nicht nachgezogen.**

`[read]` **Er hat sie richtig als fremd erkannt** ? **und nicht
angefasst.**

`[cmd]` **Als G-439 festgehalten.**

**Abgenommen.**

